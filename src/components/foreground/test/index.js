import Foreground from 'components/foreground'
import {render} from 'utils/test'

describe('Foreground', function () {
  beforeEach(function () {
    const location = {query: {url: 'Zm9v', rows: '3', cols: '3'}}
    this.element = render(<Foreground location={location} />)
  })

  it('renders with the correct class name', function () {
    expect(this.element).toHaveClass('app-layout')
  })
})
