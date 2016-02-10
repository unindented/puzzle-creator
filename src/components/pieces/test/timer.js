import Timer from 'components/pieces/src/timer'

describe('Timer', function () {
  beforeEach(function () {
    jasmine.clock().install()
    spyOn(Date, 'now').and.returnValue(0)

    this.spy = jasmine.createSpy()
    this.timer = new Timer(1000, this.spy)
  })

  afterEach(function () {
    this.timer.stop()

    jasmine.clock().uninstall()
  })

  describe('#start', function () {
    it('invokes the callback right after starting', function () {
      this.timer.start()
      expect(this.spy).toHaveBeenCalledTimes(1)
    })

    it('invokes the callback after each interval', function () {
      this.timer.start()
      jasmine.clock().tick(2000)
      expect(this.spy).toHaveBeenCalledTimes(3)
    })

    it('invokes the callback with the start time', function () {
      this.timer.start()
      expect(this.spy.calls.argsFor(0)).toBeCloseTo(0)
    })

    it('invokes the callback with the interval time', function () {
      this.timer.start()
      Date.now.and.returnValue(2000)
      jasmine.clock().tick(2000)
      expect(this.spy.calls.argsFor(2)).toBeCloseTo(2000)
    })
  })

  describe('#stop', function () {
    it('invokes the callback right after stopping', function () {
      this.timer.start()
      jasmine.clock().tick(2000)
      this.timer.stop()
      expect(this.spy).toHaveBeenCalledTimes(4)
    })

    it('invokes the callback with the stop time', function () {
      this.timer.start()
      Date.now.and.returnValue(2000)
      jasmine.clock().tick(2000)
      Date.now.and.returnValue(2500)
      this.timer.stop()
      expect(this.spy.calls.argsFor(3)).toBeCloseTo(2500)
    })
  })

  describe('#pause', function () {
    it('pauses callback invocations', function () {
      this.timer.start()
      this.timer.pause()
      jasmine.clock().tick(2000)
      expect(this.spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#resume', function () {
    it('invokes the callback right after resuming', function () {
      this.timer.start()
      this.timer.pause()
      this.timer.resume()
      expect(this.spy).toHaveBeenCalledTimes(2)
    })

    it('resumes callback invocations', function () {
      this.timer.start()
      this.timer.pause()
      jasmine.clock().tick(2000)
      this.timer.resume()
      jasmine.clock().tick(1000)
      expect(this.spy).toHaveBeenCalledTimes(3)
    })

    it('causes the paused time to be subtracted', function () {
      this.timer.start()
      this.timer.pause()
      Date.now.and.returnValue(2000)
      jasmine.clock().tick(2000)
      this.timer.resume()
      Date.now.and.returnValue(3000)
      jasmine.clock().tick(1000)
      expect(this.spy.calls.argsFor(2)).toBeCloseTo(1000)
    })
  })
})
