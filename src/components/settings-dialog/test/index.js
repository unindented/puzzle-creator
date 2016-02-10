import SettingsDialog from 'components/settings-dialog'
import {minRows, maxRows, defaultRows, minCols, maxCols, defaultCols} from 'utils/settings'
import {render} from 'utils/test'
import fixture from './image.svg'

describe('SettingsDialog', function () {
  describe('without `samplefac` or `netsize`', function () {
    beforeEach(function () {
      this.element = render(<SettingsDialog url={fixture} />)
    })

    it('renders with the correct tag name', function () {
      expect(this.element).toHaveTag('dialog')
    })

    it('renders with the correct class name', function () {
      expect(this.element).toHaveClass('app-settings-dialog')
    })

    it('renders a hidden input with the URL', function () {
      const input = this.element.querySelector('input[type="hidden"][name="url"]')
      expect(input).toHaveAttr('value', btoa(fixture))
    })

    it('renders a slider with the default rows', function () {
      const input = this.element.querySelector('input[type="range"][name="rows"]')
      expect(input).toHaveAttr('min', `${minRows}`)
      expect(input).toHaveAttr('max', `${maxRows}`)
      expect(input.value).toBe(`${defaultRows}`)
    })

    it('renders a slider with the default cols', function () {
      const input = this.element.querySelector('input[type="range"][name="cols"]')
      expect(input).toHaveAttr('min', `${minCols}`)
      expect(input).toHaveAttr('max', `${maxCols}`)
      expect(input.value).toBe(`${defaultCols}`)
    })

    it('renders a submit action', function () {
      expect(this.element).toHaveDescendantWithText('button[type="submit"]', 'msg_settings_dialog_submit')
    })
  })

  describe('with `rows`', function () {
    beforeEach(function () {
      this.element = render(<SettingsDialog url={fixture} rows={5} />)
    })

    it('renders with the correct tag name', function () {
      expect(this.element).toHaveTag('dialog')
    })

    it('renders with the correct class name', function () {
      expect(this.element).toHaveClass('app-settings-dialog')
    })

    it('renders a slider with the default rows', function () {
      const input = this.element.querySelector('input[type="range"][name="rows"]')
      expect(input).toHaveAttr('min', `${minRows}`)
      expect(input).toHaveAttr('max', `${maxRows}`)
      expect(input.value).toBe('5')
    })
  })

  describe('with `cols`', function () {
    beforeEach(function () {
      this.element = render(<SettingsDialog url={fixture} cols={5} />)
    })

    it('renders with the correct tag name', function () {
      expect(this.element).toHaveTag('dialog')
    })

    it('renders with the correct class name', function () {
      expect(this.element).toHaveClass('app-settings-dialog')
    })

    it('renders a slider with the default cols', function () {
      const input = this.element.querySelector('input[type="range"][name="cols"]')
      expect(input).toHaveAttr('min', `${minCols}`)
      expect(input).toHaveAttr('max', `${maxCols}`)
      expect(input.value).toBe('5')
    })
  })
})
