(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var a=this||self;var b=function(){this.exit=this.h;this.close=this.close;this.delayCloseButton=this.g};b.prototype.h=function(){window.open("https://displayads-formats.googleusercontent.com/da/b/html5UploadAd.html","_blank")};b.prototype.close=function(){window.console&&window.console.log("Exit API: Close requested.")};b.prototype.g=function(e){e=Math.min(e,5);window.console&&window.console.log("Exit API: Close Button will not appear for "+e+" seconds.")};
if(!window.ExitApi){var c=new b,d=["ExitApi"],f=a;d[0]in f||"undefined"==typeof f.execScript||f.execScript("var "+d[0]);for(var g;d.length&&(g=d.shift());)d.length||void 0===c?f=f[g]&&f[g]!==Object.prototype[g]?f[g]:f[g]={}:f[g]=c};}).call(this);
