export default class Timer {
  constructor (interval, callback) {
    this.interval = interval
    this.callback = callback

    this.timeout = undefined
    this.startTime = undefined
    this.startPauseTime = undefined
    this.totalPause = 0
  }

  run () {
    this.update(Date.now())
    this.timeout = setTimeout(this.run.bind(this), this.interval)
  }

  update (now) {
    this.callback(now - this.totalPause - this.startTime)
  }

  start () {
    if (this.startTime != null) {
      return
    }

    this.startTime = Date.now()
    this.run()
  }

  stop () {
    if (this.startTime == null) {
      return
    }

    clearTimeout(this.timeout)

    const now = Date.now()
    if (this.startPauseTime) {
      this.totalPause += now - this.startPauseTime
    }
    this.update(now)
    this.startTime = undefined
    this.startPauseTime = undefined
    this.totalPause = 0
  }

  pause () {
    if (this.startTime == null || this.startPauseTime != null) {
      return
    }

    clearTimeout(this.timeout)

    this.startPauseTime = Date.now()
  }

  resume () {
    if (this.startPauseTime == null) {
      return
    }

    this.totalPause += Date.now() - this.startPauseTime
    this.startPauseTime = undefined
    this.run()
  }
}
