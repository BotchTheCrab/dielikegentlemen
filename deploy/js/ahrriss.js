!function e(t,n,a){function r(o,l){if(!n[o]){if(!t[o]){var s="function"==typeof require&&require;if(!l&&s)return s(o,!0);if(i)return i(o,!0);var u=new Error("Cannot find module '"+o+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[o]={exports:{}};t[o][0].call(c.exports,function(e){var n=t[o][1][e];return r(n||e)},c,c.exports,e,t,n,a)}return n[o].exports}for(var i="function"==typeof require&&require,o=0;o<a.length;o++)r(a[o]);return r}({1:[function(e,t,n){(function(e){"use strict";var n,a,r=e.MutationObserver||e.WebKitMutationObserver;if(r){var i=0,o=new r(c),l=e.document.createTextNode("");o.observe(l,{characterData:!0}),n=function(){l.data=i=++i%2}}else if(e.setImmediate||void 0===e.MessageChannel)n="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){c(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(c,0)};else{var s=new e.MessageChannel;s.port1.onmessage=c,n=function(){s.port2.postMessage(0)}}var u=[];function c(){var e,t;a=!0;for(var n=u.length;n;){for(t=u,u=[],e=-1;++e<n;)t[e]();n=u.length}a=!1}t.exports=function(e){1!==u.push(e)||a||n()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(e,t,n){"use strict";var a=e("immediate");function r(){}var i={},o=["REJECTED"],l=["FULFILLED"],s=["PENDING"];function u(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=s,this.queue=[],this.outcome=void 0,e!==r&&m(this,e)}function c(e,t,n){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof n&&(this.onRejected=n,this.callRejected=this.otherCallRejected)}function d(e,t,n){a(function(){var a;try{a=t(n)}catch(t){return i.reject(e,t)}a===e?i.reject(e,new TypeError("Cannot resolve promise with itself")):i.resolve(e,a)})}function f(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function m(e,t){var n=!1;function a(t){n||(n=!0,i.reject(e,t))}function r(t){n||(n=!0,i.resolve(e,t))}var o=v(function(){t(r,a)});"error"===o.status&&a(o.value)}function v(e,t){var n={};try{n.value=e(t),n.status="success"}catch(e){n.status="error",n.value=e}return n}t.exports=u,u.prototype.catch=function(e){return this.then(null,e)},u.prototype.then=function(e,t){if("function"!=typeof e&&this.state===l||"function"!=typeof t&&this.state===o)return this;var n=new this.constructor(r);this.state!==s?d(n,this.state===l?e:t,this.outcome):this.queue.push(new c(n,e,t));return n},c.prototype.callFulfilled=function(e){i.resolve(this.promise,e)},c.prototype.otherCallFulfilled=function(e){d(this.promise,this.onFulfilled,e)},c.prototype.callRejected=function(e){i.reject(this.promise,e)},c.prototype.otherCallRejected=function(e){d(this.promise,this.onRejected,e)},i.resolve=function(e,t){var n=v(f,t);if("error"===n.status)return i.reject(e,n.value);var a=n.value;if(a)m(e,a);else{e.state=l,e.outcome=t;for(var r=-1,o=e.queue.length;++r<o;)e.queue[r].callFulfilled(t)}return e},i.reject=function(e,t){e.state=o,e.outcome=t;for(var n=-1,a=e.queue.length;++n<a;)e.queue[n].callRejected(t);return e},u.resolve=function(e){if(e instanceof this)return e;return i.resolve(new this(r),e)},u.reject=function(e){var t=new this(r);return i.reject(t,e)},u.all=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,a=!1;if(!n)return this.resolve([]);var o=new Array(n),l=0,s=-1,u=new this(r);for(;++s<n;)c(e[s],s);return u;function c(e,r){t.resolve(e).then(function(e){o[r]=e,++l!==n||a||(a=!0,i.resolve(u,o))},function(e){a||(a=!0,i.reject(u,e))})}},u.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,a=!1;if(!n)return this.resolve([]);var o=-1,l=new this(r);for(;++o<n;)s=e[o],t.resolve(s).then(function(e){a||(a=!0,i.resolve(l,e))},function(e){a||(a=!0,i.reject(l,e))});var s;return l}},{immediate:1}],3:[function(e,t,n){(function(t){"use strict";"function"!=typeof t.Promise&&(t.Promise=e("./lib"))}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./lib":2}],4:[function(e,t,n){var a=e("./ahrriss"),r=document.getElementById("dlg-about"),i=document.getElementById("dlg-about-images"),o=[],l=9e3,s=-1,u="dlg-image-",c=document.getElementById("dlg-about-bio");i&&a.firebaseDatabase.ref("Gallery").on("value",function(e){var t=e.val();o=t.map(function(e){return e.imageName}),d()});c&&a.firebaseDatabase.ref("Description").on("value",function(e){var t=e.val();t&&(c.innerHTML=t)});function d(){var e=s+1;if(o[e]){var t=o[e];a.firebaseStorage.ref().child("gallery/"+t).getDownloadURL().then(function(t){var n=document.createElement("img");n.src=t,n.id=u+e,n.addEventListener("load",function(){f()}),n.addEventListener("click",function(){window.open(t)}),i.appendChild(n)})}}function f(){var e=s==o.length-1?0:s+1,t=document.getElementById(u+e);if(t){var n=document.getElementById(u+s);n&&n.classList.remove("active"),t.classList.add("active"),s=Number(e),a.revealSection(r),window.setTimeout(f,l)}else d()}},{"./ahrriss":5}],5:[function(e,t,n){firebase.initializeApp({apiKey:"AIzaSyB4KLSd8Dsrero40lcsZh35Ok9VRnQdriY",authDomain:"die-like-gentlemen.firebaseapp.com",databaseURL:"https://die-like-gentlemen.firebaseio.com",projectId:"die-like-gentlemen",storageBucket:"gs://die-like-gentlemen.appspot.com",messagingSenderId:"1090916658810"});var a,r=["dlg-about","dlg-aloud","dlg-alive","dlg-contact"],i=[],o=[],l="Loading",s=" . . .";function u(){s=s.length<6?s+" .":"",document.getElementById("dlg-header").dataset.msg=l+s}function c(e){var t=e.id;if(-1===i.indexOf(t)){"dlg-about"==t&&(document.body.classList.add("loaded"),window.clearInterval(a));var n=r.indexOf(t),l=n>0?r[n-1]:null;l?-1!==i.indexOf(l)?d(t):-1!==o.indexOf(l)?o.push(t):o.indexOf(t)&&o.push(t):d(t);var s=n+1<r.length?r[n+1]:null;s&&-1!==o.indexOf(s)&&c(document.getElementById(s))}}function d(e){var t=document.getElementById(e);t&&(t.classList.add("loaded"),window.setTimeout(function(){t.classList.add("revealed")},100),o=o.filter(function(t){return t!==e}),i.push(t.id))}document.addEventListener("DOMContentLoaded",function(){a=window.setInterval(u,500);var n=document.getElementById("dlg-contact");t.exports={firebaseDatabase:firebase.database(),firebaseStorage:firebase.storage(),revealSection:c};e("./about"),e("./aloud"),e("./alive");c(n)})},{"./about":4,"./alive":6,"./aloud":7}],6:[function(e,t,n){var a=e("./ahrriss"),r=document.getElementById("dlg-alive"),i=["January","February","March","April","May","June","July","August","September","October","November","December"],o=document.getElementById("dlg-alive-video"),l=document.getElementById("gig-container");o&&a.firebaseDatabase.ref("VideoLink").on("value",function(e){var t=e.val();t&&function(e){var t=e.match(/embed\/([\d\w]+)(\?start\=)*(\d*)/);if(t.length>1){var n=t[1],a=t[3]||0,r=document.createElement("div");r.setAttribute("data-id",n),a&&r.setAttribute("data-start",a),r.innerHTML='<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">'.replace("ID",n)+'<div class="play"></div>',r.onclick=u,o.appendChild(r)}}(t)});l&&a.firebaseDatabase.ref("Gigs").on("value",function(e){var t=e.val(),n=function(e){return e<10?"0"+e:String(e)},o=new Date;o=o.getFullYear()+"-"+n(o.getMonth()+1)+"-"+n(o.getDate());var u,c,d,f=t.filter(function(e){return e.Date.substring(0,10)>=o});f.sort(function(e,t){return e.Date>t.Date}),l.innerHTML="";for(var m=0;m<f.length;m++){var v=f[m],h='<div class="gig"><div class="gig-date">'+(u=v.Date,void 0,void 0,c=Number(u.substring(5,7)),d=Number(u.substring(8,10)),i[c-1].substring(0,3)+" "+d)+'</div><div class="gig-details"><div class="gig-city">'+v.City_State+'</div><div class="gig-venue">'+v.Venue+"</div>"+(v.Notes?'<div class="gig-notes">'+v.Notes+"</div>":"")+(v.OtherBands?'<div class="gig-bands">with '+s(v.OtherBands)+"</div>":"")+'</div><div class="gig-link">'+(v.Link?'<a href="'+v.Link+'" target="_blank">details</a>':"")+"</div></div>";l.innerHTML+=h}a.revealSection(r)});function s(e){if(e){for(var t=e.split(", "),n=0;n<t.length;n++)t[n]="<span>"+t[n].trim()+"</span>";return t.join(", ")}}function u(){var e=document.createElement("iframe"),t="https://www.youtube.com/embed/ID?autoplay=1",n=this.dataset.id;t=t.replace("ID",n);var a=this.dataset.start;a&&(t+="&start="+a),e.setAttribute("src",t),e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen","1"),this.parentNode.replaceChild(e,this)}},{"./ahrriss":5}],7:[function(e,t,n){var a,r,i,o,l=e("./ahrriss"),s=(e("lie/polyfill"),document.getElementById("dlg-aloud")),u=document.getElementById("dlg-aloud-player"),c=[];u&&l.firebaseDatabase.ref("Songs").on("value",function(e){var t=e.val();l.firebaseDatabase.ref("Playlist").on("value",function(e){var n=e.val();if(n){for(var m=[],v=0;v<n.length;v++)for(var h=v,p=n[h],g=0;g<t.length;g++)if(t[g].Name==p.Name){var b=t[g],y="discography/"+b.Album+"/Die Like Gentlemen - "+b.Album+" - "+b.TrackNumber+" - "+b.Name+".mp3",w=l.firebaseStorage.ref().child(y);m.push(w.getDownloadURL().then(function(e){console.info({this:this,songSrc:e}),c[this.playlistIndex]={src:e,title:this.songName,album:this.songAlbum}}.bind({playlistIndex:h,songName:b.Name,songAlbum:b.Album})));break}Promise.all(m).then(function(){console.info({arguments:arguments}),console.info({dlgPlaylist:c}),function(e,t,n){if(!u)return;var l=document.createElement("audio");if(l.play){l.src=e[0].src,l.controls="controls",l.controlsList="nodownload",l.preload="none",u.appendChild(l);var s=document.createElement("ol");s.className="media-playlist";for(var c=0;c<e.length;c++){var m=document.createElement("li");0===c&&(m.className="active");var v=document.createElement("a");if(v.href=e[c].src,e[c].title){var h=document.createElement("span");h.className="media-title",h.appendChild(document.createTextNode(e[c].title)),v.appendChild(h)}if(e[c].album){var p=document.createElement("span");p.className="media-album",p.appendChild(document.createTextNode(e[c].album)),v.appendChild(p)}m.appendChild(v),s.appendChild(m)}u.appendChild(l),u.appendChild(s),function(){if(!u)return;a=u.getElementsByTagName("audio")[0],r=u.getElementsByClassName("media-playlist")[0];var e=(i=r.getElementsByTagName("a")).length;o=1,a.volume=.1;for(var t=0;t<i.length;t++)i[t].setAttribute("track",t+1),i[t].addEventListener("click",function(e){e.preventDefault(),o=this.getAttribute("track"),f(this)});a.addEventListener("ended",function(t){o<e?f(i[++o-1]):d(i[(o=1)-1])})}(),l.volume=1}else{var g="/post_tunes/player_mp3_multi.swf",b=t||"100",y=n||"300",w="transparent",E="application/x-shockwave-flash",A=e.map(function(e){return e.src}).join("|"),D=e.map(function(e){return'"'+e.title+'"'+(e.artist?" - "+e.artist:"")}).join("|"),j={mp3:encodeURI(A),title:D,width:y,height:b,showstop:1,showvolume:0,bgcolor1:"666666",bgcolor2:"dddddd",showloading:"always"},C=[];for(var L in j)C.push(L+"="+j[L]);var N=C.join("&"),I=document.createElement("object");I.setAttribute("data",g),I.setAttribute("type",E),I.setAttribute("width",y),I.setAttribute("height",b);var B=document.createElement("param");B.setAttribute("name","movie"),B.setAttribute("value",g),I.appendChild(B);var k=document.createElement("param");k.setAttribute("name","wmode"),k.setAttribute("value",w),I.appendChild(k);var x=document.createElement("param");x.setAttribute("name","FlashVars"),x.setAttribute("value",N),I.appendChild(x);var T=document.createElement("embed");T.setAttribute("flashvars",N),T.setAttribute("src",g),T.setAttribute("type",E),T.setAttribute("wmode",w),I.setAttribute("width",y),I.setAttribute("height",b),I.appendChild(T),u.appendChild(I)}}(c,350),l.revealSection(s)})}})});function d(e){a.src=e.getAttribute("href");e.parentElement;for(var t=0;t<i.length;t++)i[t]==e?e.parentElement.classList.add("active"):i[t].parentElement.classList.remove("active");a.load()}function f(e){d(e),a.play()}},{"./ahrriss":5,"lie/polyfill":3}]},{},[5]);