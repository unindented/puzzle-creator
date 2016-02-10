import {validateProps} from 'utils/validate'

describe('Validate', function () {
  describe('validateProps', function () {
    it('returns `true` if all properties are valid', function () {
      const props = {
        rows: 5,
        cols: 5
      }
      expect(validateProps(props)).toBe(true)
    })

    it('returns `false` if the rows are missing', function () {
      expect(validateProps({rows: NaN, cols: 5})).toBe(false)
    })

    it('returns `false` if the rows are below the minimum', function () {
      expect(validateProps({rows: 2, cols: 5})).toBe(false)
    })

    it('returns `false` if the rows are above the maximum', function () {
      expect(validateProps({rows: 10, cols: 5})).toBe(false)
    })

    it('returns `false` if the cols are missing', function () {
      expect(validateProps({rows: 5, cols: NaN})).toBe(false)
    })

    it('returns `false` if the cols are below the minimum', function () {
      expect(validateProps({rows: 5, cols: 2})).toBe(false)
    })

    it('returns `false` if the cols are above the maximum', function () {
      expect(validateProps({rows: 5, cols: 10})).toBe(false)
    })

    it('returns `false` if the `custom` flag is present', function () {
      expect(validateProps({rows: 5, cols: 5, custom: true})).toBe(false)
    })
  })
})
