import {Component, PropTypes} from 'react'
import {Card, CardTitle, CardText, CardActions} from 'react-mdl'
import {autobind} from 'core-decorators'
import {t} from 'utils/i18n'

import _styles from './index.scss'

export default class CustomImage extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([
      PropTypes.instanceOf(Node),
      PropTypes.instanceOf(Error)
    ]),
    onLoad: PropTypes.func,
    onError: PropTypes.func
  }

  @autobind
  handleLoad (evt) {
    const {onLoad} = this.props
    onLoad && onLoad(evt.target)
  }

  @autobind
  handleError (evt) {
    const {onError} = this.props
    onError && onError(evt.target)
  }

  render () {
    const {url, image} = this.props
    const state = (image ? 'finished' : 'loading')

    return (
      <Card className='app-image hidden' shadow={2}
        style={{backgroundImage: 'url(' + url + ')'}}
      >
        <CardTitle expand>
          <span className='visuallyhidden'>
            {t('msg_image_title')}
          </span>
        </CardTitle>
        <CardText>
          <img src={url}
            onLoad={this.handleLoad}
            onError={this.handleError}
          />
        </CardText>
        <CardActions>
          <span className='app-image__message'>
            {t(`msg_image_state_${state}`)}
          </span>
        </CardActions>
      </Card>
    )
  }
}
