(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';
var immediate = require('immediate');

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"immediate":1}],3:[function(require,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = require('./lib');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib":2}],4:[function(require,module,exports){
var ahrriss=require("./ahrriss"),aboutContainer=document.getElementById("dlg-about"),galleryContainer=document.getElementById("dlg-about-images"),galleryImageNames=[],durationMs=9e3,currentGalleryIndex=-1,imagePrefix="dlg-image-",bioContainer=document.getElementById("dlg-about-bio");if(galleryContainer){var Gallery=ahrriss.firebaseDatabase.ref("Gallery");Gallery.on("value",function(e){var a=e.val();galleryImageNames=a.map(function(e){return e.imageName}),renderNextImage()})}if(bioContainer){var Description=ahrriss.firebaseDatabase.ref("Description");Description.on("value",function(e){var a=e.val();a&&(bioContainer.innerHTML=a)})}function renderNextImage(){var e=currentGalleryIndex+1;if(galleryImageNames[e]){var a=galleryImageNames[e];ahrriss.firebaseStorage.ref().child("gallery/"+a).getDownloadURL().then(function(a){var r=document.createElement("img");r.src=a,r.id=imagePrefix+e,r.addEventListener("load",function(){galleryShift()}),r.addEventListener("click",function(){window.open(a)}),galleryContainer.appendChild(r)})}}function galleryShift(){var e=currentGalleryIndex==galleryImageNames.length-1?0:currentGalleryIndex+1,a=document.getElementById(imagePrefix+e);if(a){var r=document.getElementById(imagePrefix+currentGalleryIndex);r&&r.classList.remove("active"),a.classList.add("active"),currentGalleryIndex=Number(e),ahrriss.revealSection(aboutContainer),window.setTimeout(galleryShift,durationMs)}else renderNextImage()}

},{"./ahrriss":5}],5:[function(require,module,exports){
var firebaseConfig={apiKey:"AIzaSyB4KLSd8Dsrero40lcsZh35Ok9VRnQdriY",authDomain:"die-like-gentlemen.firebaseapp.com",databaseURL:"https://die-like-gentlemen.firebaseio.com",projectId:"die-like-gentlemen",storageBucket:"gs://die-like-gentlemen.appspot.com",messagingSenderId:"1090916658810"};firebase.initializeApp(firebaseConfig);var loadingMsgAttr,loadingInterval,sections=["dlg-about","dlg-aloud","dlg-alive","dlg-contact"],revealedSections=[],queuedSections=[],loadingText="Loading",aposiopesis=" . . .";function loadingTicker(){aposiopesis=aposiopesis.length<6?aposiopesis+" .":"",document.getElementById("dlg-header").dataset.msg=loadingText+aposiopesis}function revealSection(e){var i=e.id;if(-1===revealedSections.indexOf(i)){"dlg-about"==i&&(document.body.classList.add("loaded"),window.clearInterval(loadingInterval));var n=sections.indexOf(i),t=n>0?sections[n-1]:null;t?-1!==revealedSections.indexOf(t)?_revealSection(i):-1!==queuedSections.indexOf(t)?queuedSections.push(i):queuedSections.indexOf(i)&&queuedSections.push(i):_revealSection(i);var a=n+1<sections.length?sections[n+1]:null;a&&-1!==queuedSections.indexOf(a)&&revealSection(document.getElementById(a))}}function _revealSection(e){var i=document.getElementById(e);i&&(i.classList.add("loaded"),window.setTimeout(function(){i.classList.add("revealed")},100),queuedSections=queuedSections.filter(function(i){return i!==e}),revealedSections.push(i.id))}document.addEventListener("DOMContentLoaded",function(){loadingInterval=window.setInterval(loadingTicker,500);var e=document.getElementById("dlg-contact");module.exports={firebaseDatabase:firebase.database(),firebaseStorage:firebase.storage(),revealSection:revealSection};require("./about"),require("./aloud"),require("./alive");revealSection(e)});

},{"./about":4,"./alive":6,"./aloud":7}],6:[function(require,module,exports){
var ahrriss=require("./ahrriss"),aliveContainer=document.getElementById("dlg-alive"),monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"],videoContainer=document.getElementById("dlg-alive-video"),gigContainer=document.getElementById("gig-container");if(videoContainer){var VideoLinks=ahrriss.firebaseDatabase.ref("VideoLinks");VideoLinks.on("value",function(e){e.val().forEach(function(e,t){videoInit(e)})})}if(gigContainer){var Gigs=ahrriss.firebaseDatabase.ref("Gigs");Gigs.on("value",function(e){var t=e.val(),i=function(e){return e<10?"0"+e:String(e)},a=new Date;a=a.getFullYear()+"-"+i(a.getMonth()+1)+"-"+i(a.getDate());var r=t.filter(function(e){return e.Date.substring(0,10)>=a});r.sort(function(e,t){return e.Date>t.Date?1:-1}),gigContainer.innerHTML="";for(var n=0;n<r.length;n++){var s=r[n],o='<div class="gig"><div class="gig-date">'+formatDate(s.Date)+'</div><div class="gig-details"><div class="gig-city">'+s.City_State+'</div><div class="gig-venue">'+s.Venue+"</div>"+(s.Notes?'<div class="gig-notes">'+s.Notes+"</div>":"")+(s.OtherBands?'<div class="gig-bands">with '+formatOtherBands(s.OtherBands)+"</div>":"")+'</div><div class="gig-link">'+(s.Link?'<a href="'+s.Link+'" target="_blank">details</a>':"")+"</div></div>";gigContainer.innerHTML+=o}ahrriss.revealSection(aliveContainer)})}function formatDate(e){var t=Number(e.substring(5,7)),i=Number(e.substring(8,10));return monthNames[t-1].substring(0,3)+" "+i}function formatOtherBands(e){if(e){for(var t=e.split(", "),i=0;i<t.length;i++)t[i]="<span>"+t[i].trim()+"</span>";return t.join(", ")}}function videoInit(e){if(e&&"string"==typeof e){var t=e.match(/embed\/([\d\w]+)(\?start\=)*(\d*)/);if(t.length>1){var i=t[1],a=t[3]||0,r=document.createElement("div");r.setAttribute("class","media-container youtube-player");var n=document.createElement("div");n.setAttribute("data-id",i),a&&n.setAttribute("data-start",a),n.innerHTML=labnolThumb(i),n.onclick=labnolIframe,r.appendChild(n),videoContainer.appendChild(r)}}}function labnolThumb(e){return'<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">'.replace("ID",e)+'<div class="play"></div>'}function labnolIframe(){var e=document.createElement("iframe"),t="https://www.youtube.com/embed/ID?autoplay=1",i=this.dataset.id;t=t.replace("ID",i);var a=this.dataset.start;a&&(t+="&start="+a),e.setAttribute("src",t),e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen","1"),this.parentNode.replaceChild(e,this)}

},{"./ahrriss":5}],7:[function(require,module,exports){
var audioElement,playlistElement,trackElements,currentTrackNumber,ahrriss=require("./ahrriss"),lie=require("lie/polyfill"),aloudContainer=document.getElementById("dlg-aloud"),playlistContainer=document.getElementById("dlg-aloud-player"),mediaPath="/media/",dlgPlaylist=[];if(playlistContainer){var Songs=ahrriss.firebaseDatabase.ref("Songs");Songs.on("value",function(e){var t=e.val();ahrriss.firebaseDatabase.ref("Playlist").on("value",function(e){var a=e.val();if(a){for(var l=[],n=0;n<a.length;n++)for(var i=n,r=a[i],s=0;s<t.length;s++)if(t[s].Name==r.Name){var o=t[s],d="discography/"+o.Album+"/Die Like Gentlemen - "+o.Album+" - "+o.TrackNumber+" - "+o.Name+".mp3",m=ahrriss.firebaseStorage.ref().child(d);l.push(m.getDownloadURL().then(function(e){console.info({this:this,songSrc:e}),dlgPlaylist[this.playlistIndex]={src:e,title:this.songName,album:this.songAlbum}}.bind({playlistIndex:i,songName:o.Name,songAlbum:o.Album})));break}Promise.all(l).then(function(){console.info({arguments:arguments}),console.info({dlgPlaylist:dlgPlaylist}),embedAudioPlaylist(dlgPlaylist,350),ahrriss.revealSection(aloudContainer)})}})})}function embedAudioPlaylist(e,t,a){if(playlistContainer){for(;playlistContainer.firstChild;)playlistContainer.removeChild(playlistContainer.firstChild);var l=document.createElement("audio");if(l.play){l.src=e[0].src,l.controls="controls",l.controlsList="nodownload",l.preload="none",playlistContainer.appendChild(l);var n=document.createElement("ol");n.className="media-playlist";for(var i=0;i<e.length;i++){var r=document.createElement("li");0===i&&(r.className="active");var s=document.createElement("a");if(s.href=e[i].src,e[i].title){var o=document.createElement("span");o.className="media-title",o.appendChild(document.createTextNode(e[i].title)),s.appendChild(o)}if(e[i].album){var d=document.createElement("span");d.className="media-album",d.appendChild(document.createTextNode(e[i].album)),s.appendChild(d)}r.appendChild(s),n.appendChild(r)}playlistContainer.appendChild(l),playlistContainer.appendChild(n),initPlaylist(),l.volume=1}else{var m="/post_tunes/player_mp3_multi.swf",c=t||"100",u=a||"300",p=e.map(function(e){return e.src}).join("|"),h=e.map(function(e){return'"'+e.title+'"'+(e.artist?" - "+e.artist:"")}).join("|"),y={mp3:encodeURI(p),title:h,width:u,height:c,showstop:1,showvolume:0,bgcolor1:"666666",bgcolor2:"dddddd",showloading:"always"},b=[];for(var v in y)b.push(v+"="+y[v]);var f=b.join("&"),E=document.createElement("object");E.setAttribute("data",m),E.setAttribute("type","application/x-shockwave-flash"),E.setAttribute("width",u),E.setAttribute("height",c);var g=document.createElement("param");g.setAttribute("name","movie"),g.setAttribute("value",m),E.appendChild(g);var C=document.createElement("param");C.setAttribute("name","wmode"),C.setAttribute("value","transparent"),E.appendChild(C);var k=document.createElement("param");k.setAttribute("name","FlashVars"),k.setAttribute("value",f),E.appendChild(k);var A=document.createElement("embed");A.setAttribute("flashvars",f),A.setAttribute("src",m),A.setAttribute("type","application/x-shockwave-flash"),A.setAttribute("wmode","transparent"),E.setAttribute("width",u),E.setAttribute("height",c),E.appendChild(A),playlistContainer.appendChild(E)}}}function initPlaylist(){if(playlistContainer){audioElement=playlistContainer.getElementsByTagName("audio")[0],playlistElement=playlistContainer.getElementsByClassName("media-playlist")[0];var e=(trackElements=playlistElement.getElementsByTagName("a")).length;currentTrackNumber=1,audioElement.volume=.1;for(var t=0;t<trackElements.length;t++)trackElements[t].setAttribute("track",t+1),trackElements[t].addEventListener("click",function(e){e.preventDefault(),currentTrackNumber=this.getAttribute("track"),playPlaylistTrack(this)});audioElement.addEventListener("ended",function(t){currentTrackNumber<e?playPlaylistTrack(trackElements[++currentTrackNumber-1]):loadPlaylistTrack(trackElements[(currentTrackNumber=1)-1])})}}function loadPlaylistTrack(e){audioElement.src=e.getAttribute("href");e.parentElement;for(var t=0;t<trackElements.length;t++)trackElements[t]==e?e.parentElement.classList.add("active"):trackElements[t].parentElement.classList.remove("active");audioElement.load()}function playPlaylistTrack(e){loadPlaylistTrack(e),audioElement.play()}

},{"./ahrriss":5,"lie/polyfill":3}]},{},[5]);
