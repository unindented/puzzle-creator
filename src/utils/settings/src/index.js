import {getItems, setItems} from 'utils/platform'

export const minRows = 3
export const maxRows = 9
export const defaultRows = 3

export const minCols = 3
export const maxCols = 9
export const defaultCols = 3

const defaults = {
  rows: defaultRows,
  cols: defaultCols
}

export function defaultSettings () {
  return defaults
}

export function loadSettings (callback) {
  getItems(defaultSettings(), callback)
}

export function saveSettings (settings, callback) {
  setItems(settings, callback)
}
