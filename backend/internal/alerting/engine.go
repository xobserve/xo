package alerting

import (
	"context"
	"time"

	"github.com/CodeCreatively/datav/backend/internal/registry"
	"github.com/CodeCreatively/datav/backend/pkg/config"
	"github.com/CodeCreatively/datav/backend/pkg/log"
	"github.com/CodeCreatively/datav/backend/pkg/models"
	"github.com/benbjohnson/clock"
	"golang.org/x/sync/errgroup"
	"golang.org/x/xerrors"
)

// AlertEngine is the background process that
// schedules alert evaluations and makes sure notifications
// are sent.
type AlertEngine struct {
	execQueue     chan *models.Job
	ticker        *Ticker
	scheduler     scheduler
	evalHandler   evalHandler
	ruleReader    ruleReader
	resultHandler resultHandler
}

func init() {
	registry.RegisterService(&AlertEngine{})
}

// IsDisabled returns true if the alerting service is disable for this instance.
func (e *AlertEngine) IsDisabled() bool {
	return !config.Data.Alerting.Enabled || !config.Data.Alerting.ExecuteAlerts
}

// Init initializes the AlertingService.
func (e *AlertEngine) Init() error {
	e.ticker = NewTicker(time.Now(), time.Second*0, clock.New())
	e.execQueue = make(chan *models.Job, 1000)
	e.scheduler = newScheduler()
	e.evalHandler = NewEvalHandler()
	e.ruleReader = newRuleReader()
	e.resultHandler = newResultHandler()
	return nil
}

// Run starts the alerting service background process.
func (e *AlertEngine) Run(ctx context.Context) error {
	alertGroup, ctx := errgroup.WithContext(ctx)
	alertGroup.Go(func() error { return e.alertingTicker(ctx) })
	alertGroup.Go(func() error { return e.runJobDispatcher(ctx) })

	err := alertGroup.Wait()
	return err
}

func (e *AlertEngine) alertingTicker(grafanaCtx context.Context) error {
	defer func() {
		if err := recover(); err != nil {
			logger.Error("Scheduler Panic: stopping alertingTicker", "error", err, "stack", log.Stack(1))
		}
	}()

	tickIndex := 0

	for {
		select {
		case <-grafanaCtx.Done():
			return grafanaCtx.Err()
		case tick := <-e.ticker.C:
			// TEMP SOLUTION update rules ever tenth tick
			if tickIndex%10 == 0 {
				e.scheduler.Update(e.ruleReader.fetch())
			}

			e.scheduler.Tick(tick, e.execQueue)
			tickIndex++
		}
	}
}

func (e *AlertEngine) runJobDispatcher(grafanaCtx context.Context) error {
	dispatcherGroup, alertCtx := errgroup.WithContext(grafanaCtx)

	for {
		select {
		case <-grafanaCtx.Done():
			return dispatcherGroup.Wait()
		case job := <-e.execQueue:
			dispatcherGroup.Go(func() error { return e.processJobWithRetry(alertCtx, job) })
		}
	}
}

var (
	unfinishedWorkTimeout = time.Second * 5
)

func (e *AlertEngine) processJobWithRetry(grafanaCtx context.Context, job *models.Job) error {
	defer func() {
		if err := recover(); err != nil {
			logger.Error("Alert Panic", "error", err, "stack", log.Stack(1))
		}
	}()

	cancelChan := make(chan context.CancelFunc, config.Data.Alerting.MaxAttempts*2)
	attemptChan := make(chan int, 1)

	// Initialize with first attemptID=1
	attemptChan <- 1
	job.SetRunning(true)

	for {
		select {
		case <-grafanaCtx.Done():
			// In case grafana server context is cancel, let a chance to job processing
			// to finish gracefully - by waiting a timeout duration - before forcing its end.
			unfinishedWorkTimer := time.NewTimer(unfinishedWorkTimeout)
			select {
			case <-unfinishedWorkTimer.C:
				return e.endJob(grafanaCtx.Err(), cancelChan, job)
			case <-attemptChan:
				return e.endJob(nil, cancelChan, job)
			}
		case attemptID, more := <-attemptChan:
			if !more {
				return e.endJob(nil, cancelChan, job)
			}
			go e.processJob(attemptID, attemptChan, cancelChan, job)
		}
	}
}

func (e *AlertEngine) endJob(err error, cancelChan chan context.CancelFunc, job *models.Job) error {
	job.SetRunning(false)
	close(cancelChan)
	for cancelFn := range cancelChan {
		cancelFn()
	}
	return err
}

func (e *AlertEngine) processJob(attemptID int, attemptChan chan int, cancelChan chan context.CancelFunc, job *models.Job) {
	defer func() {
		if err := recover(); err != nil {
			logger.Error("Alert Panic", "error", err, "stack", log.Stack(1))
		}
	}()

	alertCtx, cancelFn := context.WithTimeout(context.Background(), time.Duration(config.Data.Alerting.EvaluationTimeout)*time.Second)
	cancelChan <- cancelFn

	evalContext := models.NewEvalContext(alertCtx, job.Rule, logger)
	evalContext.Ctx = alertCtx

	go func() {
		defer func() {
			if err := recover(); err != nil {
				close(attemptChan)
			}
		}()

		e.evalHandler.Eval(evalContext)

		if evalContext.Error != nil {
			if attemptID < config.Data.Alerting.MaxAttempts {
				attemptChan <- (attemptID + 1)
				return
			}
		}

		// create new context with timeout for notifications
		resultHandleCtx, resultHandleCancelFn := context.WithTimeout(context.Background(), time.Duration(config.Data.Alerting.NotificationTimeout)*time.Second)
		cancelChan <- resultHandleCancelFn

		// override the context used for evaluation with a new context for notifications.
		// This makes it possible for notifiers to execute when datasources
		// don't respond within the timeout limit. We should rewrite this so notifications
		// don't reuse the evalContext and get its own context.
		evalContext.Ctx = resultHandleCtx
		evalContext.Rule.State = evalContext.GetNewState()
		if err := e.resultHandler.handle(evalContext); err != nil {
			if xerrors.Is(err, context.Canceled) {
				logger.Debug("Result handler returned context.Canceled")
			} else if xerrors.Is(err, context.DeadlineExceeded) {
				logger.Debug("Result handler returned context.DeadlineExceeded")
			} else {
				logger.Error("Failed to handle result", "err", err)
			}
		}

		close(attemptChan)
	}()
}
