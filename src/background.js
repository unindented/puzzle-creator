import {stringify} from 'querystring'
import {t} from 'utils/i18n'
import {createContextMenu, createTab, getExtensionUrl} from 'utils/platform'

import _template from './background.html'

const createCustomTab = (params, url) => {
  params = Object.assign({url: btoa(url)}, params)

  createTab({
    url: getExtensionUrl(`foreground.html?${stringify(params)}`)
  })
}

const createCustomContextMenu = (params, label) => {
  createContextMenu({
    'title': t(label),
    'contexts': ['image'],
    'onclick': (info) => createCustomTab(params, info.srcUrl)
  })
}

const init = () => {
  const items = {
    'menu_puzzle_3x3': {rows: 3, cols: 3},
    'menu_puzzle_4x4': {rows: 4, cols: 4},
    'menu_puzzle_5x5': {rows: 5, cols: 5},
    'menu_puzzle_custom': {custom: true}
  }

  Object.keys(items).forEach((key) => (
    createCustomContextMenu(items[key], key)
  ))
}

/* ************************************************************************** */

window.addEventListener('load', init, true)
