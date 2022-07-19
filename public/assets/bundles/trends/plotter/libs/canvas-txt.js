/*!
 * 
 *   canvas-txt v3.0.0
 *   https://github.com/geongeorge/Canvas-Txt
 * 
 *   Copyright (c) Geon George (https://geongeorge.com)
 * 
 *   This source code is licensed under the MIT license found in the
 *   LICENSE file in the root directory of this source tree.
 * 
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("canvasTxt",[],e):"object"==typeof exports?exports.canvasTxt=e():t.canvasTxt=e()}("undefined"!=typeof self?self:this,(function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";function r(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){i=!0,o=t}finally{try{r||null==u.return||u.return()}finally{if(i)throw o}}return n}}(t,e)||function(t,e){if(t){if("string"==typeof t)return i(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}n.r(e);var o={debug:!1,align:"center",vAlign:"middle",fontSize:14,fontWeight:"",fontStyle:"",fontVariant:"",font:"Arial",lineHeight:null,justify:!1,drawText:function(t,e,n,i,o,a){var u=this,f=r([n,i,o,a].map((function(t){return parseInt(t)})),4);if(n=f[0],i=f[1],o=f[2],a=f[3],!(0>=o||0>=a||0>=this.fontSize)){var s=n+o,l=i+a;this.textSize&&console.error("%cCanvas-Txt:","font-weight: bold;","textSize is depricated and has been renamed to fontSize");var c=this.fontStyle,h=this.fontVariant,d=this.fontWeight,p=this.fontSize,y=this.font,b="".concat(c," ").concat(h," ").concat(d," ").concat(p,"px ").concat(y);t.font=b;var g,v=i+a/2+parseInt(this.fontSize)/2;"right"===this.align?(g=s,t.textAlign="right"):"left"===this.align?(g=n,t.textAlign="left"):(g=n+o/2,t.textAlign="center");var m=[],x=e.split("\n"),S=this.justify?t.measureText(" ").width:0;x.forEach((function(e){var n=t.measureText(e).width;if(n<=o)m.push(e);else{var r,i,a,f=e,s=o;for(n=t.measureText(f).width;n>s;){for(r=0,i=0,a="";i<s;)r++,a=f.substr(0,r),i=t.measureText(f.substr(0,r)).width;r--,a=a.substr(0,r);var l=r;if(" "!=f.substr(r,1)){for(;" "!=f.substr(r,1)&&0!=r;)r--;0==r&&(r=l),a=f.substr(0,r)}a=u.justify?u.justifyLine(t,a,S," ",o):a,f=f.substr(r),n=t.measureText(f).width,m.push(a)}0<n&&m.push(f)}}));var T=this.lineHeight?this.lineHeight:this.getTextHeight(t,e,b),j=T*(m.length-1),A=i;return"top"===this.vAlign?v=i+this.fontSize:"bottom"===this.vAlign?(v=l-j,A=l):(A=i+a/2,v-=j/2),m.forEach((function(e){e=e.trim(),t.fillText(e,g,v),v+=T})),this.debug&&(t.lineWidth=3,t.strokeStyle="#00909e",t.strokeRect(n,i,o,a),t.lineWidth=2,t.strokeStyle="#f6d743",t.beginPath(),t.moveTo(g,i),t.lineTo(g,l),t.stroke(),t.strokeStyle="#ff6363",t.beginPath(),t.moveTo(n,A),t.lineTo(s,A),t.stroke()),{height:j+T}}},getTextHeight:function(t,e,n){var r=t.textBaseline,i=t.font;t.textBaseline="bottom",t.font=n;var o=t.measureText(e).actualBoundingBoxAscent;return t.textBaseline=r,t.font=i,o},justifyLine:function(t,e,n,r,i){var o=Math.floor,a=e.trim(),u=t.measureText(a).width,f=a.split(/\s+/).length-1,s=o((i-u)/n);if(0>=f||0>=s)return a;for(var l=o(s/f),c=s-f*l,h=[],d=0;d<l;d++)h.push(r);return h=h.join(""),a.replace(/\s+/g,(function(t){var e=0<c?h+r:h;return c--,t+e}))}};e.default=o}])}));