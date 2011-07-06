(function() {
  var DEFAULT_COLS, DEFAULT_ROWS, INVALID_COLS, INVALID_ROWS, INVALID_URL, MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS, STATE_INITIAL, STATE_WAITING, STEP_COLS, STEP_ROWS, colsElem, colsParam, colsValueElem, imageElem, init, initControls, initDialog, initImage, initParams, rowsElem, rowsParam, rowsValueElem, setMessage, setState, urlElem, urlParam, wrapperElem;
  STATE_INITIAL = 'initial';
  STATE_WAITING = 'waiting';
  INVALID_URL = '';
  INVALID_ROWS = 0;
  DEFAULT_ROWS = 4;
  MIN_ROWS = 3;
  MAX_ROWS = 9;
  STEP_ROWS = 1;
  INVALID_COLS = 0;
  DEFAULT_COLS = 4;
  MIN_COLS = 3;
  MAX_COLS = 9;
  STEP_COLS = 1;
  wrapperElem = null;
  imageElem = null;
  urlElem = null;
  rowsElem = null;
  rowsValueElem = null;
  colsElem = null;
  colsValueElem = null;
  urlParam = INVALID_URL;
  rowsParam = INVALID_ROWS;
  colsParam = INVALID_COLS;
  init = function() {
    initParams();
    initControls();
    if (rowsParam !== INVALID_ROWS && colsParam !== INVALID_COLS) {
      initImage(urlParam, true);
      return setState(STATE_INITIAL);
    } else {
      initDialog(urlParam, true);
      initImage(urlParam, false);
      return setState(STATE_WAITING);
    }
  };
  initControls = function() {
    wrapperElem = document.getElementById('wrapper');
    imageElem = document.getElementById('image');
    urlElem = document.getElementById('url');
    rowsElem = document.getElementById('rows');
    rowsValueElem = document.getElementById('rowsvalue');
    colsElem = document.getElementById('cols');
    return (colsValueElem = document.getElementById('colsvalue'));
  };
  initParams = function() {
    urlParam = decodeURIComponent(Query.url || ("" + (INVALID_URL)));
    rowsParam = parseInt(decodeURIComponent(Query.rows || ("" + (INVALID_ROWS))));
    colsParam = parseInt(decodeURIComponent(Query.cols || ("" + (INVALID_COLS))));
    if (rowsParam === INVALID_ROWS || rowsParam < MIN_ROWS || rowsParam > MAX_ROWS) {
      rowsParam = INVALID_ROWS;
    }
    return colsParam === INVALID_COLS || colsParam < MIN_COLS || colsParam > MAX_COLS ? (colsParam = INVALID_COLS) : undefined;
  };
  initDialog = function(url, listen) {
    urlElem.value = url;
    rowsElem.min = MIN_ROWS;
    rowsElem.max = MAX_ROWS;
    rowsElem.step = STEP_ROWS;
    rowsElem.value = DEFAULT_ROWS;
    colsElem.min = MIN_COLS;
    colsElem.max = MAX_COLS;
    colsElem.step = STEP_COLS;
    colsElem.value = DEFAULT_COLS;
    if (listen) {
      rowsElem.addEventListener('change', function(event) {
        return (rowsValueElem.textContent = event.target.value);
      }, true);
    }
    Utils.fireEvent(rowsElem, 'change');
    if (listen) {
      colsElem.addEventListener('change', function(event) {
        return (colsValueElem.textContent = event.target.value);
      }, true);
    }
    return Utils.fireEvent(colsElem, 'change');
  };
  initImage = function(url, listen) {
    if (listen) {
      imageElem.addEventListener('load', function(event) {
        return $(event.target).puzzle({
          rows: rowsParam,
          cols: colsParam
        });
      }, true);
    }
    return (imageElem.src = url);
  };
  setState = function(state) {
    var msg;
    wrapperElem.className = state;
    msg = chrome.i18n.getMessage("msg_" + (state));
    return (msg != null) ? setMessage(msg) : undefined;
  };
  setMessage = function(msg) {
    return (imageElem.alt = msg);
  };
  window.addEventListener('load', init, true);
}).call(this);
