(function() {
  var createTab, init, root;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = (typeof exports !== "undefined" && exports !== null) ? exports : this;
  init = function() {
    var _i, _result, items, label;
    items = {
      'menu_puzzle_3x3': {
        rows: 3,
        cols: 3
      },
      'menu_puzzle_4x4': {
        rows: 4,
        cols: 4
      },
      'menu_puzzle_5x5': {
        rows: 5,
        cols: 5
      },
      'menu_puzzle_custom': null
    };
    _result = [];
    for (_i in items) {
      if (!__hasProp.call(items, _i)) continue;
      (function() {
        var label = _i;
        var params = items[_i];
        return _result.push(label ? chrome.contextMenus.create({
          'title': chrome.i18n.getMessage(label),
          'contexts': ['image'],
          'onclick': function(info, tab) {
            return createTab(info.srcUrl, params);
          }
        }) : undefined);
      })();
    }
    return _result;
  };
  createTab = function(url, params) {
    var tabUrl;
    tabUrl = ("puzzle.html?url=" + (encodeURIComponent(url)));
    if (params != null) {
      tabUrl += ("&rows=" + (encodeURIComponent(params.rows)) + "&cols=" + (encodeURIComponent(params.cols)));
    }
    return chrome.tabs.create({
      'url': chrome.extension.getURL(tabUrl)
    });
  };
  window.addEventListener('load', init, true);
}).call(this);
