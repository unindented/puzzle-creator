((function(){var a,b;b=typeof exports!="undefined"&&exports!==null?exports:this,String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/,"$1")}),a={showElement:function(b){return a.displayElem(b,!0)},hideElement:function(b){return a.displayElem(b,!1)},displayElement:function(a,b){return a.style.cssText=b?"opacity: 1":"opacity: 0"},createElement:function(b){var c,d,e,f,g,h;if(b==null)return;e=document.createElement(b.tagName),delete b.tagName;for(c in b){f=b[c];switch(c){case"childNodes":for(g=0,h=f.length;g<h;g++)d=f[g],e.appendChild(a.createElement(d));break;case"cssText":e.style.cssText=f;break;default:e[c]=f}}return e},clearElement:function(a){while(a.firstChild)a.removeChild(a.firstChild);return a},fireEvent:function(a,b){var c;if(a==null||b==null)return;return c=document.createEvent("HTMLEvents"),c.initEvent(b,!0,!0),a.dispatchEvent(c),c},reload:function(){return window.location=window.location}},b.Utils=a})).call(this);