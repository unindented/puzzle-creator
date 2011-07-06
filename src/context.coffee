################################################################################
#
# Context menu creation.
#
################################################################################

root = exports ? this

################################################################################

init = ->
  items = {
    'menu_puzzle_3x3':    { rows: 3, cols: 3 }
    'menu_puzzle_4x4':    { rows: 4, cols: 4 }
    'menu_puzzle_5x5':    { rows: 5, cols: 5 }
    'menu_puzzle_custom': null
  }

  for label, params of items
    chrome.contextMenus.create({
      'title':    chrome.i18n.getMessage(label)
      'contexts': ['image']
      'onclick':  (info, tab) -> createTab(info.srcUrl, params)
    }) if label

createTab = (url, params) ->
  tabUrl  = "puzzle.html?url=#{encodeURIComponent(url)}"
  tabUrl += "&rows=#{encodeURIComponent(params.rows)}&cols=#{encodeURIComponent(params.cols)}" if params?

  chrome.tabs.create({
    'url': chrome.extension.getURL(tabUrl)
  })

################################################################################

window.addEventListener('load', init, true)

