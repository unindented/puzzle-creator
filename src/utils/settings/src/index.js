export const minRows = 3
export const maxRows = 9
export const defaultRows = 3

export const minCols = 3
export const maxCols = 9
export const defaultCols = 3

const defaults = {}

export function removeSettings () {
  try {
    localStorage.removeItem('settings')
  } catch (e) {
  }
}

export function loadSettings () {
  let settings

  try {
    settings = JSON.parse(localStorage.getItem('settings'))
  } catch (e) {
    removeSettings()
  }

  return Object.assign({}, defaults, settings)
}

export function saveSettings (settings) {
  try {
    localStorage.setItem('settings', JSON.stringify(Object.assign(loadSettings(), settings)))
  } catch (e) {
    removeSettings()
  }
}
