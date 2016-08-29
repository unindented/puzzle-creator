import React, {Component, PropTypes} from 'react'
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, Slider} from 'react-mdl'
import {autobind} from 'core-decorators'
import dialogPolyfill from 'dialog-polyfill'
import {t} from 'utils/i18n'
import {minRows, maxRows, defaultRows, minCols, maxCols, defaultCols} from 'utils/settings'

import _styles from './index.scss'

export default class SettingsDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
    url: PropTypes.string.isRequired,
    rows: PropTypes.number,
    cols: PropTypes.number,
    onChangeRows: PropTypes.func,
    onChangeCols: PropTypes.func
  }

  state = {}

  @autobind
  handleDialogRef (dialog) {
    this._dialog = dialog
  }

  @autobind
  handleChangeRows (evt) {
    const {onChangeRows} = this.props
    onChangeRows && onChangeRows(parseInt(evt.target.value, 10))
  }

  @autobind
  handleChangeCols (evt) {
    const {onChangeCols} = this.props
    onChangeCols && onChangeCols(parseInt(evt.target.value, 10))
  }

  hasDialog () {
    const dialog = this._dialog && this._dialog.refs.dialog
    return (dialog instanceof Node) && document.contains(dialog)
  }

  componentDidMount () {
    dialogPolyfill.registerDialog(this._dialog.refs.dialog)
  }

  render () {
    const {open, url, rows: propsRows, cols: propsCols} = this.props
    const {rows: stateRows, cols: stateCols} = this.state
    const currentRows = stateRows || propsRows || defaultRows
    const currentCols = stateCols || propsCols || defaultCols
    const isOpen = this.hasDialog() && !!open

    return (
      <Dialog className='app-settings-dialog' open={isOpen}
        ref={this.handleDialogRef}
      >
        <form method='get'>
          <DialogTitle>
            {t('msg_settings_dialog_title', currentRows, currentCols)}
          </DialogTitle>
          <DialogContent>
            <input type='hidden' name='url' value={btoa(url)} />
            <div className='app-settings-dialog__field'>
              <label htmlFor='app-settings-dialog-rows'>
                {t('msg_settings_dialog_rows_label')}:
              </label>
              <Slider id='app-settings-dialog-rows' name='rows'
                min={minRows} max={maxRows} value={currentRows}
                onChange={this.handleChangeRows}
              />
            </div>
            <div className='app-settings-dialog__field'>
              <label htmlFor='app-settings-dialog-rows'>
                {t('msg_settings_dialog_cols_label')}:
              </label>
              <Slider id='app-settings-dialog-cols' name='cols'
                min={minCols} max={maxCols} value={currentCols}
                onChange={this.handleChangeCols}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button type='submit' colored raised ripple>
              {t('msg_settings_dialog_submit_button')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    )
  }
}
