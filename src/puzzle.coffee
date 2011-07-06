################################################################################
#
# Puzzle generator.
#
################################################################################

STATE_INITIAL  = 'initial'
STATE_WAITING  = 'waiting'

INVALID_URL    = ''

INVALID_ROWS = 0
DEFAULT_ROWS = 4
MIN_ROWS     = 3
MAX_ROWS     = 9
STEP_ROWS    = 1

INVALID_COLS = 0
DEFAULT_COLS = 4
MIN_COLS     = 3
MAX_COLS     = 9
STEP_COLS    = 1

################################################################################

wrapperElem   = null      # content wrapper
imageElem     = null      # image to process

urlElem       = null      # hidden input for url
rowsElem      = null      # range input for rows
rowsValueElem = null      # actual value for rows
colsElem      = null      # range input for cols
colsValueElem = null      # actual value for cols

urlParam  = INVALID_URL   # image url
rowsParam = INVALID_ROWS  # puzzle rows
colsParam = INVALID_COLS  # puzzle cols


init = ->
  # init query parameters
  initParams()

   # init controls
  initControls()

 # if we have all the necessary parameters
  if rowsParam != INVALID_ROWS and colsParam != INVALID_COLS
    # init frame and image, and add event listener
    initImage(urlParam, true)
    # hide parameters dialog
    setState(STATE_INITIAL)
  # if not
  else
    # setup dialog
    initDialog(urlParam, true)
    # init frame and image, but don't add event listener
    initImage(urlParam, false)
    # show parameters dialog
    setState(STATE_WAITING)

initControls = ->
  # main elements
  wrapperElem   = document.getElementById('wrapper')
  imageElem     = document.getElementById('image')

  # dialog elements
  urlElem       = document.getElementById('url')
  rowsElem      = document.getElementById('rows')
  rowsValueElem = document.getElementById('rowsvalue')
  colsElem      = document.getElementById('cols')
  colsValueElem = document.getElementById('colsvalue')

initParams = ->
  # query parameters
  urlParam    = decodeURIComponent(Query.url or "#{INVALID_URL}")
  rowsParam   = parseInt(decodeURIComponent(Query.rows or "#{INVALID_ROWS}"))
  colsParam   = parseInt(decodeURIComponent(Query.cols or "#{INVALID_COLS}"))
  # validations
  rowsParam = INVALID_ROWS if rowsParam == INVALID_ROWS or rowsParam < MIN_ROWS or rowsParam > MAX_ROWS
  colsParam = INVALID_COLS if colsParam == INVALID_COLS or colsParam < MIN_COLS or colsParam > MAX_COLS

initDialog = (url, listen) ->
  # initialize url input
  urlElem.value  = url
  # initialize rows input
  rowsElem.min   = MIN_ROWS
  rowsElem.max   = MAX_ROWS
  rowsElem.step  = STEP_ROWS
  rowsElem.value = DEFAULT_ROWS
  # initialize cols input
  colsElem.min   = MIN_COLS
  colsElem.max   = MAX_COLS
  colsElem.step  = STEP_COLS
  colsElem.value = DEFAULT_COLS

  # add event listener to rows
  rowsElem.addEventListener('change', ((event) -> rowsValueElem.textContent = event.target.value), true) if listen
  Utils.fireEvent(rowsElem, 'change')
  # add event listener to cols
  colsElem.addEventListener('change', ((event) -> colsValueElem.textContent = event.target.value), true) if listen
  Utils.fireEvent(colsElem, 'change')

initImage = (url, listen) ->
  # add event listener to image
  imageElem.addEventListener('load', ((event) -> $(event.target).puzzle({ rows: rowsParam, cols: colsParam })), true) if listen
  # and set its url
  imageElem.src = url


setState = (state) ->
  wrapperElem.className = state
  msg = chrome.i18n.getMessage("msg_#{state}")
  setMessage(msg) if msg?

setMessage = (msg) ->
  imageElem.alt = msg

################################################################################

window.addEventListener('load', init, true)

