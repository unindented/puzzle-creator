import React, {Component, PropTypes} from 'react'
import {Header, Icon, Navigation, Content, Snackbar} from 'react-mdl'
import {autobind} from 'core-decorators'
import defaults from 'lodash/defaults'
import Image from 'components/image'
import Pieces from 'components/pieces'
import SettingsDialog from 'components/settings-dialog'
import AboutDialog from 'components/about-dialog'
import {t} from 'utils/i18n'
import {trackEvent, trackTiming, trackException} from 'utils/analytics'
import {defaultSettings, loadSettings, saveSettings} from 'utils/settings'
import {validateProps} from 'utils/validate'

import _styles from './index.scss'

export default class Foreground extends Component {
  static propTypes = {
    location: PropTypes.any
  }

  constructor () {
    super()

    this.state = defaultSettings()

    loadSettings(function (settings) {
      this.setState(settings)
    }.bind(this))
  }

  @autobind
  handleAboutClick () {
    trackEvent('About', 'Open')

    this.setState({about: true})
  }

  @autobind
  handleAboutClose () {
    trackEvent('About', 'Close')

    this.setState({about: false})
  }

  @autobind
  handleImageLoad (image, timing) {
    timing && trackTiming('Image', 'Load', timing)

    this.setState({image})
  }

  @autobind
  handleImageError () {
    trackException(new Error('Could not load image'), false)

    this.setState({image: new Error()})
  }

  @autobind
  handleChangeRows (rows) {
    this.setState({rows})
    saveSettings({rows})
  }

  @autobind
  handleChangeCols (cols) {
    this.setState({cols})
    saveSettings({cols})
  }

  @autobind
  handleSnackbarTimeout () {
    this.setState({snackbar: null})
  }

  render () {
    const {location} = this.props
    const {snackbar, about, ...state} = this.state
    const {url, rows, cols, custom} = location.query
    const childProps = defaults({}, {
      url: atob(url),
      rows: parseInt(rows, 10) || undefined,
      cols: parseInt(cols, 10) || undefined,
      custom
    }, state)

    const showSettings = !validateProps(childProps)
    const showAbout = !!about

    const title = (
      <span>
        <Icon name='extension' />
        {t('ext_name')}
      </span>
    )

    return (
      <div className='app-layout'>
        <div className='app-layout__container'>
          <Header title={title}>
            <Navigation>
              <a href='#'
                onClick={this.handleAboutClick}
              >
                {t('msg_header_about')}
              </a>
            </Navigation>
          </Header>

          <Content>
            <Image {...childProps}
              onLoad={this.handleImageLoad}
              onError={this.handleImageError}
            />
            <Pieces {...childProps} />

            <Snackbar active={!!snackbar}
              onTimeout={this.handleSnackbarTimeout}
            >
              {snackbar}
            </Snackbar>
          </Content>
        </div>

        <SettingsDialog {...childProps}
          open={showSettings}
          onChangeRows={this.handleChangeRows}
          onChangeCols={this.handleChangeCols}
        />
        <AboutDialog {...childProps}
          open={showAbout}
          onClose={this.handleAboutClose}
        />
      </div>
    )
  }
}
