import Pieces from 'components/pieces'
import {render} from 'utils/test'

describe('Pieces', function () {
  describe('without the necessary properties', function () {
    beforeEach(function () {
      const props = {
        url: 'foo'
      }
      this.element = render(<Pieces {...props} />)
    })

    it('is hidden', function () {
      expect(this.element).toHaveClass('hidden')
    })
  })

  describe('when custom', function () {
    beforeEach(function () {
      const props = {
        url: 'foo',
        rows: 3,
        cols: 3,
        custom: true
      }
      this.element = render(<Pieces {...props} />)
    })

    it('is hidden', function () {
      expect(this.element).toHaveClass('hidden')
    })
  })

  describe('with a loading image', function () {
    beforeEach(function () {
      const image = new Image()
      const props = {
        load: true,
        url: 'foo',
        rows: 3,
        cols: 3,
        image
      }
      this.element = render(<Pieces {...props} />)
    })

    it('is not hidden', function () {
      expect(this.element).not.toHaveClass('hidden')
    })

    it('renders with the correct class name', function () {
      expect(this.element).toHaveClass('app-pieces')
    })

    it('renders a spinner', function () {
      expect(this.element).toHaveDescendant('.app-pieces__spinner')
    })
  })
})
