!function e(t,n,a){function i(o,l){if(!n[o]){if(!t[o]){var s="function"==typeof require&&require;if(!l&&s)return s(o,!0);if(r)return r(o,!0);var u=new Error("Cannot find module '"+o+"'");throw u.code="MODULE_NOT_FOUND",u}var c=n[o]={exports:{}};t[o][0].call(c.exports,function(e){var n=t[o][1][e];return i(n||e)},c,c.exports,e,t,n,a)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<a.length;o++)i(a[o]);return i}({1:[function(e,t,n){(function(e){"use strict";function n(){u=!0;for(var e,t,n=c.length;n;){for(t=c,c=[],e=-1;++e<n;)t[e]();n=c.length}u=!1}var a,i=e.MutationObserver||e.WebKitMutationObserver;if(i){var r=0,o=new i(n),l=e.document.createTextNode("");o.observe(l,{characterData:!0}),a=function(){l.data=r=++r%2}}else if(e.setImmediate||void 0===e.MessageChannel)a="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){n(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(n,0)};else{var s=new e.MessageChannel;s.port1.onmessage=n,a=function(){s.port2.postMessage(0)}}var u,c=[];t.exports=function(e){1!==c.push(e)||u||a()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(e,t,n){"use strict";function a(){}function i(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=v,this.queue=[],this.outcome=void 0,e!==a&&s(this,e)}function r(e,t,n){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof n&&(this.onRejected=n,this.callRejected=this.otherCallRejected)}function o(e,t,n){c(function(){var a;try{a=t(n)}catch(t){return d.reject(e,t)}a===e?d.reject(e,new TypeError("Cannot resolve promise with itself")):d.resolve(e,a)})}function l(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function s(e,t){function n(t){i||(i=!0,d.reject(e,t))}function a(t){i||(i=!0,d.resolve(e,t))}var i=!1,r=u(function(){t(a,n)});"error"===r.status&&n(r.value)}function u(e,t){var n={};try{n.value=e(t),n.status="success"}catch(e){n.status="error",n.value=e}return n}var c=e("immediate"),d={},f=["REJECTED"],m=["FULFILLED"],v=["PENDING"];t.exports=i,i.prototype.catch=function(e){return this.then(null,e)},i.prototype.then=function(e,t){if("function"!=typeof e&&this.state===m||"function"!=typeof t&&this.state===f)return this;var n=new this.constructor(a);if(this.state!==v){o(n,this.state===m?e:t,this.outcome)}else this.queue.push(new r(n,e,t));return n},r.prototype.callFulfilled=function(e){d.resolve(this.promise,e)},r.prototype.otherCallFulfilled=function(e){o(this.promise,this.onFulfilled,e)},r.prototype.callRejected=function(e){d.reject(this.promise,e)},r.prototype.otherCallRejected=function(e){o(this.promise,this.onRejected,e)},d.resolve=function(e,t){var n=u(l,t);if("error"===n.status)return d.reject(e,n.value);var a=n.value;if(a)s(e,a);else{e.state=m,e.outcome=t;for(var i=-1,r=e.queue.length;++i<r;)e.queue[i].callFulfilled(t)}return e},d.reject=function(e,t){e.state=f,e.outcome=t;for(var n=-1,a=e.queue.length;++n<a;)e.queue[n].callRejected(t);return e},i.resolve=function(e){return e instanceof this?e:d.resolve(new this(a),e)},i.reject=function(e){var t=new this(a);return d.reject(t,e)},i.all=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);for(var r=new Array(n),o=0,l=-1,s=new this(a);++l<n;)!function(e,a){t.resolve(e).then(function(e){r[a]=e,++o!==n||i||(i=!0,d.resolve(s,r))},function(e){i||(i=!0,d.reject(s,e))})}(e[l],l);return s},i.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);for(var r=-1,o=new this(a);++r<n;)!function(e){t.resolve(e).then(function(e){i||(i=!0,d.resolve(o,e))},function(e){i||(i=!0,d.reject(o,e))})}(e[r]);return o}},{immediate:1}],3:[function(e,t,n){(function(t){"use strict";"function"!=typeof t.Promise&&(t.Promise=e("./lib"))}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./lib":2}],4:[function(e,t,n){function a(){var e=c+1;if(s[e]){var t=s[e];r.firebaseStorage.ref().child("gallery/"+t).getDownloadURL().then(function(t){var n=document.createElement("img");n.src=t,n.id=d+e,n.addEventListener("load",function(){i()}),n.addEventListener("click",function(){window.open(t)}),l.appendChild(n)})}}function i(){var e=c==s.length-1?0:c+1,t=document.getElementById(d+e);if(t){var n=document.getElementById(d+c);n&&n.classList.remove("active"),t.classList.add("active"),c=Number(e),r.revealSection(o),window.setTimeout(i,u)}else a()}var r=e("./ahrriss"),o=document.getElementById("dlg-about"),l=document.getElementById("dlg-about-images"),s=[],u=9e3,c=-1,d="dlg-image-",f=document.getElementById("dlg-about-bio");if(l){r.firebaseDatabase.ref("Gallery").on("value",function(e){var t=e.val();s=t.map(function(e){return e.imageName}),a()})}if(f){r.firebaseDatabase.ref("Description").on("value",function(e){var t=e.val();t&&(f.innerHTML=t)})}},{"./ahrriss":5}],5:[function(e,t,n){function a(){d=d.length<6?d+" .":"",document.getElementById("dlg-header").dataset.msg=c+d}function i(e){var t=e.id;if(-1===s.indexOf(t)){"dlg-about"==t&&(document.body.classList.add("loaded"),window.clearInterval(o));var n=l.indexOf(t),a=n>0?l[n-1]:null;a?-1!==s.indexOf(a)?r(t):-1!==u.indexOf(a)?u.push(t):u.indexOf(t)&&u.push(t):r(t);var c=n+1<l.length?l[n+1]:null;c&&-1!==u.indexOf(c)&&i(document.getElementById(c))}}function r(e){var t=document.getElementById(e);t&&(t.classList.add("loaded"),window.setTimeout(function(){t.classList.add("revealed")},100),u=u.filter(function(t){return t!==e}),s.push(t.id))}firebase.initializeApp({apiKey:"AIzaSyB4KLSd8Dsrero40lcsZh35Ok9VRnQdriY",authDomain:"die-like-gentlemen.firebaseapp.com",databaseURL:"https://die-like-gentlemen.firebaseio.com",projectId:"die-like-gentlemen",storageBucket:"gs://die-like-gentlemen.appspot.com",messagingSenderId:"1090916658810"});var o,l=["dlg-about","dlg-aloud","dlg-alive","dlg-contact"],s=[],u=[],c="Loading",d=" . . .";document.addEventListener("DOMContentLoaded",function(){o=window.setInterval(a,500);var n=document.getElementById("dlg-contact");t.exports={firebaseDatabase:firebase.database(),firebaseStorage:firebase.storage(),revealSection:i};e("./about"),e("./aloud"),e("./alive");i(n)})},{"./about":4,"./alive":6,"./aloud":7}],6:[function(e,t,n){function a(){var e=document.createElement("iframe"),t="https://www.youtube.com/embed/ID?autoplay=1",n=this.dataset.id;t=t.replace("ID",n);var a=this.dataset.start;a&&(t+="&start="+a),e.setAttribute("src",t),e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen","1"),this.parentNode.replaceChild(e,this)}var i=e("./ahrriss"),r=document.getElementById("dlg-alive"),o=["January","February","March","April","May","June","July","August","September","October","November","December"],l=document.getElementById("dlg-alive-video"),s=document.getElementById("gig-container");if(l){i.firebaseDatabase.ref("VideoLink").on("value",function(e){var t=e.val();t&&function(e){var t=e.match(/embed\/([\d\w]+)(\?start\=)*(\d*)/);if(t.length>1){var n=t[1],i=t[3]||0,r=document.createElement("div");r.setAttribute("data-id",n),i&&r.setAttribute("data-start",i),r.innerHTML='<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">'.replace("ID",n)+'<div class="play"></div>',r.onclick=a,l.appendChild(r)}}(t)})}if(s){i.firebaseDatabase.ref("Gigs").on("value",function(e){var t=e.val(),n=function(e){return e<10?"0"+e:String(e)},a=new Date;a=a.getFullYear()+"-"+n(a.getMonth()+1)+"-"+n(a.getDate());var l=t.filter(function(e){return e.Date.substring(0,10)>=a});l.sort(function(e,t){return e.Date>t.Date});for(var u=0;u<l.length;u++){var c=l[u],d='<div class="gig"><div class="gig-date">'+function(e){var t=Number(e.substring(5,7)),n=Number(e.substring(8,10));return o[t-1].substring(0,3)+" "+n}(c.Date)+'</div><div class="gig-details"><div class="gig-city">'+c.City_State+'</div><div class="gig-venue">'+c.Venue+"</div>"+(c.OtherBands?'<div class="gig-bands">with '+function(e){if(e){for(var t=e.split(", "),n=0;n<t.length;n++)t[n]="<span>"+t[n].trim()+"</span>";return t.join(", ")}}(c.OtherBands)+"</div>":"")+'</div><div class="gig-link">'+(c.Link?'<a href="'+c.Link+'" target="_blank">details</a>':"")+"</div></div>";s.innerHTML+=d}i.revealSection(r)})}},{"./ahrriss":5}],7:[function(e,t,n){function a(e,t,n){if(f){var a=document.createElement("audio");if(a.play){a.src=e[0].src,a.controls="controls",a.controlsList="nodownload",a.preload="none",f.appendChild(a);var c=document.createElement("ol");c.className="media-playlist";for(var d=0;d<e.length;d++){var m=document.createElement("li");0===d&&(m.className="active");var v=document.createElement("a");if(v.href=e[d].src,e[d].title){var h=document.createElement("span");h.className="media-title",h.appendChild(document.createTextNode(e[d].title)),v.appendChild(h)}if(e[d].album){var p=document.createElement("span");p.className="media-album",p.appendChild(document.createTextNode(e[d].album)),v.appendChild(p)}m.appendChild(v),c.appendChild(m)}f.appendChild(a),f.appendChild(c),function(){if(!f)return;o=f.getElementsByTagName("audio")[0],l=f.getElementsByClassName("media-playlist")[0];var e=(s=l.getElementsByTagName("a")).length;u=1,o.volume=.1;for(var t=0;t<s.length;t++)s[t].setAttribute("track",t+1),s[t].addEventListener("click",function(e){e.preventDefault(),u=this.getAttribute("track"),r(this)});o.addEventListener("ended",function(t){u<e?r(s[++u-1]):i(s[(u=1)-1])})}(),a.volume=1}else{var g="/post_tunes/player_mp3_multi.swf",b=t||"100",y=n||"300",w="application/x-shockwave-flash",E=e.map(function(e){return e.src}).join("|"),A=e.map(function(e){return'"'+e.title+'"'+(e.artist?" - "+e.artist:"")}).join("|"),D={mp3:encodeURI(E),title:A,width:y,height:b,showstop:1,showvolume:0,bgcolor1:"666666",bgcolor2:"dddddd",showloading:"always"},j=[];for(var C in D)j.push(C+"="+D[C]);var L=j.join("&"),I=document.createElement("object");I.setAttribute("data",g),I.setAttribute("type",w),I.setAttribute("width",y),I.setAttribute("height",b);var N=document.createElement("param");N.setAttribute("name","movie"),N.setAttribute("value",g),I.appendChild(N);var B=document.createElement("param");B.setAttribute("name","wmode"),B.setAttribute("value","transparent"),I.appendChild(B);var k=document.createElement("param");k.setAttribute("name","FlashVars"),k.setAttribute("value",L),I.appendChild(k);var x=document.createElement("embed");x.setAttribute("flashvars",L),x.setAttribute("src",g),x.setAttribute("type",w),x.setAttribute("wmode","transparent"),I.setAttribute("width",y),I.setAttribute("height",b),I.appendChild(x),f.appendChild(I)}}}function i(e){o.src=e.getAttribute("href");e.parentElement;for(var t=0;t<s.length;t++)s[t]==e?e.parentElement.classList.add("active"):s[t].parentElement.classList.remove("active");o.load()}function r(e){i(e),o.play()}var o,l,s,u,c=e("./ahrriss"),d=(e("lie/polyfill"),document.getElementById("dlg-aloud")),f=document.getElementById("dlg-aloud-player"),m=[];if(f){c.firebaseDatabase.ref("Songs").on("value",function(e){var t=e.val();c.firebaseDatabase.ref("Playlist").on("value",function(e){var n=e.val();if(n){for(var i=[],r=0;r<n.length;r++)for(var o=r,l=n[o],s=0;s<t.length;s++)if(t[s].Name==l.Name){var u=t[s],f="discography/"+u.Album+"/Die Like Gentlemen - "+u.Album+" - "+u.TrackNumber+" - "+u.Name+".mp3",v=c.firebaseStorage.ref().child(f);i.push(v.getDownloadURL().then(function(e){console.info({this:this,songSrc:e}),m[this.playlistIndex]={src:e,title:this.songName,album:this.songAlbum}}.bind({playlistIndex:o,songName:u.Name,songAlbum:u.Album})));break}Promise.all(i).then(function(){console.info({arguments:arguments}),console.info({dlgPlaylist:m}),a(m,350),c.revealSection(d)})}})})}},{"./ahrriss":5,"lie/polyfill":3}]},{},[5]);