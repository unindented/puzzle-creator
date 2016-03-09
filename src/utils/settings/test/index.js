import {loadSettings, saveSettings} from 'utils/settings'

describe('Settings', function () {
  describe('loadSettings', function () {
    it('invokes callback with settings', function (done) {
      loadSettings(function (settings) {
        expect(settings).toEqual({rows: 3, cols: 3})
        done()
      })
    })
  })

  describe('saveSettings', function () {
    it('invokes callback', function (done) {
      saveSettings({rows: 3, cols: 3}, done)
    })
  })
})
