(function(){var createTab,init,root;root=typeof exports!=="undefined"&&exports!==null?exports:this;init=function(){var items,label,params,_results;items={menu_puzzle_3x3:{rows:3,cols:3},menu_puzzle_4x4:{rows:4,cols:4},menu_puzzle_5x5:{rows:5,cols:5},menu_puzzle_custom:null};_results=[];for(label in items){params=items[label];if(label){_results.push(chrome.contextMenus.create({title:chrome.i18n.getMessage(label),contexts:["image"],onclick:function(params){return function(info,tab){return createTab(info.srcUrl,params)}}(params)}))}else{_results.push(void 0)}}return _results};createTab=function(url,params){var tabUrl;tabUrl="puzzle.html?url="+encodeURIComponent(url);if(params!=null){tabUrl+="&rows="+encodeURIComponent(params.rows)+"&cols="+encodeURIComponent(params.cols)}return chrome.tabs.create({url:chrome.extension.getURL(tabUrl)})};window.addEventListener("load",init,true)}).call(this);