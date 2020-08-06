import _ from 'lodash';


// This service really just tracks a list of $timeout promises to give us a
// method for canceling them all when we need to
export class Timer {
  timers: any= [];


  register(t: any) {
    this.timers.push(t);
    return t;
  }

  cancel(t: any) {
    this.timers = _.without(this.timers, t);
    clearTimeout(t);
  }

  cancelAll() {
    _.each(this.timers, t => {
      clearTimeout(t)
    });
    this.timers = [];
  }
}

export const timer = new Timer()