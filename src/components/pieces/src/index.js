import React, {Component, PropTypes} from 'react'
import {Card, CardTitle, CardText, CardActions, Spinner, Button, Switch} from 'react-mdl'
import {SlidingPuzzle} from 'react-puzzle'
import {autobind} from 'core-decorators'
import classNames from 'classnames'
import {parse} from 'url'
import {t} from 'utils/i18n'
import {validateProps} from 'utils/validate'

import Timer from './timer'
import _styles from './index.scss'

export default class Pieces extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired
  }

  constructor () {
    super()

    this.state = {moves: 0, seconds: 0}
    this._timer = new Timer(1000, this.handleTimerTick)
  }

  @autobind
  handlePuzzleRef (puzzle) {
    this._puzzle = puzzle
  }

  @autobind
  handlePuzzleLoad () {
    this.setState({loaded: true})
  }

  @autobind
  handlePuzzleMove () {
    this._timer.start()
    this.setState({moves: this.state.moves + 1})
  }

  @autobind
  handlePuzzleSolve () {
    this._timer.stop()
    this.setState({showOriginal: true, solved: true})
  }

  @autobind
  handlePuzzleError () {
    this.setState({error: true})
  }

  @autobind
  handleClickShuffle () {
    this._puzzle.shuffle()
    this._timer.stop()
    this.setState({showOriginal: false, moves: 0, seconds: 0, solved: false})
  }

  @autobind
  handleChangeNumbers (evt) {
    const {checked} = evt.target
    this.setState({showNumbers: checked})
  }

  @autobind
  handleChangeOriginal (evt) {
    const {checked} = evt.target
    this._timer[checked ? 'pause' : 'resume']()
    this.setState({showOriginal: checked})
  }

  @autobind
  handleTimerTick (milliseconds) {
    this.setState({seconds: Math.round(milliseconds / 1000)})
  }

  componentWillUnmount () {
    this._timer.stop()
  }

  render () {
    const {showNumbers, showOriginal, moves, seconds, loaded, solved, error} = this.state
    const {url, rows, cols} = this.props
    const host = url && parse(url).host
    const isReady = validateProps(this.props)

    const puzzleProps = {
      src: url,
      rows: rows,
      cols: cols,
      color: '#90CAF9',
      margin: 1,
      minWidth: 240,
      maxWidth: 900,
      minHeight: 0,
      maxHeight: Math.max(window.innerHeight - 300, 240),
      showNumbers,
      showOriginal
    }

    return (
      <Card className={classNames('app-pieces', {hidden: !isReady})} shadow={2}>
        <CardTitle>
          <span className="visuallyhidden">
            {t('msg_pieces_title')}
          </span>
        </CardTitle>
        <CardText>
          {!loaded && !error && (
            <div className="app-pieces__spinner">
              <Spinner />
            </div>
          )}
          {!loaded && !!error && (
            <p className="app-pieces__error">
              {t('msg_pieces_error', host)}
            </p>
          )}
          <SlidingPuzzle {...puzzleProps}
            ref={this.handlePuzzleRef}
            onLoad={this.handlePuzzleLoad}
            onMove={this.handlePuzzleMove}
            onSolve={this.handlePuzzleSolve}
            onError={this.handlePuzzleError}
          />
        </CardText>
        <CardActions>
          <div>
            <Button className="app-pieces__button" colored ripple
              disabled={!loaded || !!error}
              onClick={this.handleClickShuffle}
            >
              {t('msg_pieces_shuffle_button')}
            </Button>
            <Switch className="app-pieces__switch"
              checked={showNumbers}
              disabled={!loaded || !!solved || !!error}
              onChange={this.handleChangeNumbers}
            >
              {t('msg_pieces_numbers_switch')}
            </Switch>
            <Switch className="app-pieces__switch"
              checked={showOriginal}
              disabled={!loaded || !!solved || !!error}
              onChange={this.handleChangeOriginal}
            >
              {t('msg_pieces_original_switch')}
            </Switch>
          </div>
          <div>
            <span className="app-pieces__label">
              {t('msg_pieces_moves_label', moves)}
            </span>
            <span className="app-pieces__label">
              {t('msg_pieces_seconds_label', seconds)}
            </span>
          </div>
        </CardActions>
      </Card>
    )
  }
}
