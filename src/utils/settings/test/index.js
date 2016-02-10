import {removeSettings, loadSettings, saveSettings} from 'utils/settings'

describe('Settings', function () {
  beforeEach(function () {
    spyOn(localStorage, 'setItem')
    spyOn(localStorage, 'removeItem')
  })

  describe('removeSettings', function () {
    it('removes the settings', function () {
      removeSettings()
      expect(localStorage.removeItem).toHaveBeenCalledWith('settings')
    })
  })

  describe('loadSettings', function () {
    describe('with no previous settings', function () {
      beforeEach(function () {
        spyOn(localStorage, 'getItem').and.returnValue(null)
      })

      it('returns the defaults', function () {
        expect(loadSettings()).toEqual({})
      })
    })

    describe('with valid previous settings', function () {
      beforeEach(function () {
        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({rows: 5}))
      })

      it('returns the previous settings', function () {
        expect(loadSettings()).toEqual({rows: 5})
      })
    })

    describe('with invalid previous settings', function () {
      beforeEach(function () {
        spyOn(localStorage, 'getItem').and.returnValue('!')
      })

      it('returns the defaults', function () {
        expect(loadSettings()).toEqual({})
      })
    })
  })

  describe('saveSettings', function () {
    describe('with valid new settings', function () {
      beforeEach(function () {
        const obj = {rows: 4, cols: 4}
        saveSettings(obj)
      })

      describe('with valid previous settings', function () {
        beforeEach(function () {
          spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({rows: 5}))
        })

        it('saves the settings', function () {
          expect(localStorage.setItem).toHaveBeenCalledWith('settings',
            JSON.stringify({rows: 4, cols: 4}))
        })
      })

      describe('with invalid previous settings', function () {
        beforeEach(function () {
          spyOn(localStorage, 'getItem').and.returnValue('!')
        })

        it('saves the settings', function () {
          expect(localStorage.setItem).toHaveBeenCalledWith('settings',
            JSON.stringify({rows: 4, cols: 4}))
        })
      })
    })

    describe('with invalid new settings', function () {
      beforeEach(function () {
        const obj = {}
        obj.a = {b: obj}
        saveSettings(obj)
      })

      describe('with valid previous settings', function () {
        beforeEach(function () {
          spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({rows: 5}))
        })

        it('does not save the settings', function () {
          expect(localStorage.setItem).not.toHaveBeenCalled()
        })

        it('removes previous settings', function () {
          expect(localStorage.removeItem).toHaveBeenCalledWith('settings')
        })
      })

      describe('with invalid previous settings', function () {
        beforeEach(function () {
          spyOn(localStorage, 'getItem').and.returnValue('!')
        })

        it('does not save the settings', function () {
          expect(localStorage.setItem).not.toHaveBeenCalled()
        })

        it('removes previous settings', function () {
          expect(localStorage.removeItem).toHaveBeenCalledWith('settings')
        })
      })
    })
  })
})
