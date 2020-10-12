package alerting

import (
	"math"
	"time"

	"github.com/apm-ai/datav/backend/pkg/config"
	"github.com/apm-ai/datav/backend/pkg/models"
)

type scheduler interface {
	Tick(time time.Time, execQueue chan *models.Job)
	Update(rules []*models.Rule)
}

type schedulerImpl struct {
	jobs map[int64]*models.Job
}

func newScheduler() scheduler {
	return &schedulerImpl{
		jobs: make(map[int64]*models.Job),
	}
}

func (s *schedulerImpl) Update(rules []*models.Rule) {
	logger.Debug("Scheduling update", "ruleCount", len(rules))

	jobs := make(map[int64]*models.Job)

	for i, rule := range rules {
		var job *models.Job
		if s.jobs[rule.ID] != nil {
			job = s.jobs[rule.ID]
		} else {
			job = &models.Job{}
			job.SetRunning(false)
		}

		job.Rule = rule

		offset := ((rule.Frequency * 1000) / int64(len(rules))) * int64(i)
		job.Offset = int64(math.Floor(float64(offset) / 1000))
		if job.Offset == 0 { //zero offset causes division with 0 panics.
			job.Offset = 1
		}
		jobs[rule.ID] = job
	}

	s.jobs = jobs
}

func (s *schedulerImpl) Tick(tickTime time.Time, execQueue chan *models.Job) {
	now := tickTime.Unix()

	for _, job := range s.jobs {
		if job.GetRunning() || job.Rule.State == models.AlertStatePaused {
			continue
		}

		if job.OffsetWait && now%job.Offset == 0 {
			job.OffsetWait = false
			s.enqueue(job, execQueue)
			continue
		}

		// Check the job frequency against the minimum interval required
		interval := job.Rule.Frequency
		if interval < config.Data.Alerting.MinInterval {
			interval = config.Data.Alerting.MinInterval
		}

		if now%interval == 0 {
			if job.Offset > 0 {
				job.OffsetWait = true
			} else {
				s.enqueue(job, execQueue)
			}
		}
	}
}

func (s *schedulerImpl) enqueue(job *models.Job, execQueue chan *models.Job) {
	logger.Debug("Scheduler: Putting job on to exec queue", "name", job.Rule.Name, "id", job.Rule.ID)
	execQueue <- job
}
