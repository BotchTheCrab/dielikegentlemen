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
/****** IMAGE SLIDESHOW & BIO ******/

var ahrriss = require('./ahrriss');

var aboutContainer = document.getElementById('dlg-about');

var galleryContainer = document.getElementById('dlg-about-images'),
    galleryImageNames = [],
    durationMs = 9000,
    currentGalleryIndex = -1,
    imagePrefix = 'dlg-image-';

var bioContainer = document.getElementById('dlg-about-bio');

// initialize gallery
if (galleryContainer) {
  var Gallery = ahrriss.firebaseDatabase.ref('Gallery');
  Gallery.on('value', function(resp) {
    var galleryImages = resp.val();
    galleryImageNames = galleryImages.map(function(galleryImage) {
      return galleryImage.imageName;
    });
    // console.info('galleryImageNames ...')
    // console.info(galleryImageNames);
    renderNextImage();
  });
}

// render bio
if (bioContainer) {
  var Description = ahrriss.firebaseDatabase.ref('Description');
  Description.on('value', function(resp) {
    // console.info(resp.val())

    var bio = resp.val();
    if (bio) {
      bioContainer.innerHTML = bio;
    }
  });
}


/** render next image; once loaded, trigger galleryShift **/
function renderNextImage() {
  var nextGalleryIndex = currentGalleryIndex + 1;
  // console.info('renderNextImage: nextGalleryIndex = ' + nextGalleryIndex);
  if (!galleryImageNames[nextGalleryIndex]) { return; }

  var galleryImageName = galleryImageNames[nextGalleryIndex];

  // console.info('renderNextImage ... ')
  // console.info({
  //   nextGalleryIndex: nextGalleryIndex,
  //   galleryImageName: galleryImageName
  // });

  var storageRef = ahrriss.firebaseStorage.ref();
  storageRef.child('gallery/' + galleryImageName).getDownloadURL().then(function(imageSrc){
    // console.info({ imageSrc: imageSrc });

    var imageElement = document.createElement('img');
    imageElement.src = imageSrc;
    imageElement.id = imagePrefix + nextGalleryIndex;
    imageElement.addEventListener('load', function() {
      galleryShift();
    });
    imageElement.addEventListener('click', function() {
      window.open(imageSrc);
    });
    galleryContainer.appendChild(imageElement);

  });
}

/** reveal next image; if next image isn't loaded, redirect to renderNextImage **/
function galleryShift() {
  // console.info('galleryShift')
  var nextGalleryIndex = currentGalleryIndex == galleryImageNames.length - 1 ? 0 : currentGalleryIndex + 1;
  // console.info('galleryShift: nextGalleryIndex = ' + nextGalleryIndex);
  var nextImage = document.getElementById(imagePrefix + nextGalleryIndex);

  if (!nextImage) {
    // console.info('galleryShift: image not loaded, trigger renderNextImage');
    renderNextImage();
    return;
  }

  var currentImage = document.getElementById(imagePrefix + currentGalleryIndex);
  if (currentImage) {
    currentImage.classList.remove('active');
  }
  nextImage.classList.add('active');

  currentGalleryIndex = Number(nextGalleryIndex);

  // make sure area is revealed
  ahrriss.revealSection(aboutContainer);

  window.setTimeout(galleryShift, durationMs);
}

},{"./ahrriss":5}],5:[function(require,module,exports){
// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyB4KLSd8Dsrero40lcsZh35Ok9VRnQdriY",
  authDomain: "die-like-gentlemen.firebaseapp.com",
  databaseURL: "https://die-like-gentlemen.firebaseio.com",
  projectId: "die-like-gentlemen",
  storageBucket: "gs://die-like-gentlemen.appspot.com",
  messagingSenderId: "1090916658810"
};
firebase.initializeApp(firebaseConfig);

var sections = ['dlg-about', 'dlg-aloud', 'dlg-alive', 'dlg-contact'],
    revealedSections = [],
    queuedSections = [];

var loadingMsgAttr,
    loadingText = "Loading",
    aposiopesis = " . . .",
    loadingInterval;

document.addEventListener('DOMContentLoaded', function() {

  // loadingTicker();
  
  loadingInterval = window.setInterval(loadingTicker, 500);

  var contactContainer = document.getElementById('dlg-contact');

  module.exports = {
    firebaseDatabase: firebase.database(),
    firebaseStorage: firebase.storage(),
    revealSection: revealSection
  };

  var about = require('./about');
  var aloud = require('./aloud');
  var alive = require('./alive');

  revealSection(contactContainer);
});


function loadingTicker() {
  aposiopesis = aposiopesis.length < 6 ? aposiopesis + " ." : "";
  document.getElementById('dlg-header').dataset.msg = loadingText + aposiopesis;
}

function revealSection(section) {
  var sectionId = section.id;
  if (revealedSections.indexOf(sectionId) !== -1) {
    return;
  }

  if (sectionId == 'dlg-about') {
    document.body.classList.add('loaded');
    // console.info('loaded class added');
    window.clearInterval(loadingInterval);
  }

  var sectionIndex = sections.indexOf(sectionId);
  var previousSectionId = sectionIndex > 0 ? sections[sectionIndex - 1] : null;
  // console.info('### revealSection ...');
  // console.info({
  //   // section: section,
  //   sectionId: sectionId,
  //   sectionIndex: sectionIndex,
  //   previousSectionId: previousSectionId
  // });

  if (!previousSectionId) {
    // console.info('there is no previous section, reveal current one');
    _revealSection(sectionId);
  }
  else if (revealedSections.indexOf(previousSectionId) !== -1) {
    // console.info('the previous section is revealed, reveal current one')
    _revealSection(sectionId);
  }
  else if (queuedSections.indexOf(previousSectionId) !== -1) {
    // console.info('the previous section is queued, cue this one')
    queuedSections.push(sectionId);
  } else {
    // console.info('the previous section is neither revealed, nor queued, so queue this one')
    if (queuedSections.indexOf(sectionId)) {
      queuedSections.push(sectionId);
    }
  }

  var nextSectionId = sectionIndex + 1 < sections.length ? sections[sectionIndex + 1] : null;
  if (!nextSectionId) {
    // console.info('there is no next section')
  } else if (queuedSections.indexOf(nextSectionId) !== -1) {
    // console.info('the next section is queued, reveal it')
    revealSection(document.getElementById(nextSectionId));
  }
};

function _revealSection(sectionId) {
  // console.info('_revealSection: sectionId = ' + sectionId);
  var section = document.getElementById(sectionId);
  if (!section) { return; }

  section.classList.add('loaded');
  window.setTimeout(function(){
    section.classList.add('revealed');
  }, 100);

  queuedSections = queuedSections.filter(function(queuedSectionId) {
    return queuedSectionId !== sectionId;
  });

  revealedSections.push(section.id)
}

},{"./about":4,"./alive":6,"./aloud":7}],6:[function(require,module,exports){
/****** GIG LISTINGS ******/

var ahrriss = require('./ahrriss');

var aliveContainer = document.getElementById('dlg-alive');

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var videoContainer = document.getElementById('dlg-alive-video');
var gigContainer = document.getElementById('gig-container');

if (videoContainer) {
  var VideoLinks = ahrriss.firebaseDatabase.ref('VideoLinks');
  VideoLinks.on('value', function(resp) {
    var videoLinks = resp.val();
    videoLinks.forEach(function(videoLink, index) {
      videoInit(videoLink);
    });
  });
}

if (gigContainer) {
  var Gigs = ahrriss.firebaseDatabase.ref('Gigs');
  Gigs.on('value', function(resp) {
    var allGigs = resp.val();
    // console.info({ allGigs: allGigs })

    var _zeroPad = function(n) {
      return n < 10 ? "0" + n : String(n);
    };

    // filter out past gigs
    // format: YYYY-MM-DD ...
    var today = new Date();
    today = today.getFullYear() + "-" + _zeroPad(today.getMonth() + 1) + "-" + _zeroPad(today.getDate());
    var upcomingGigs = allGigs.filter(function(gig) {
      var gigDate = gig.Date.substring(0,10);
      return gigDate >= today;
    });

    // sort by date
    upcomingGigs.sort(function(a, b) {
      return a.Date > b.Date ? 1 : -1;
    });
    // console.info({ upcomingGigs: upcomingGigs })

    gigContainer.innerHTML = '';

    // render upcoming gigs
    for (var x = 0; x < upcomingGigs.length; x++) {
      var gig = upcomingGigs[x];

      var gigHtml = '' +
        '<div class="gig">' +
          '<div class="gig-date">' + formatDate(gig.Date) + '</div>' +
          '<div class="gig-details">' +
            '<div class="gig-city">' + gig.City_State + '</div>' +
            '<div class="gig-venue">' + gig.Venue + '</div>' +
            (gig.Notes ? '<div class="gig-notes">' + gig.Notes + '</div>' : '') +
            (gig.OtherBands ? '<div class="gig-bands">with ' + formatOtherBands(gig.OtherBands) + '</div>' : '') +
          '</div>' +
          '<div class="gig-link">' + (gig.Link ? '<a href="' + gig.Link + '" target="_blank">details</a>' : '') + '</div>' +
        '</div>';

        gigContainer.innerHTML += gigHtml;
    }

    ahrriss.revealSection(aliveContainer);
  });

}

function formatDate(timestamp) {
  var month = Number(timestamp.substring(5,7));
  var date = Number(timestamp.substring(8,10));
  return monthNames[month - 1].substring(0,3) + ' ' + date;
}

function formatOtherBands(sBands) {
  if (!sBands) { return; }

  var aBands = sBands.split(', ');
  for (var c = 0; c < aBands.length; c++) {
    aBands[c] = '<span>' + aBands[c].trim() + '</span>';
  }

  return aBands.join(', ');
}




/****** YOUTUBE VIDEO ******/

/* Basd on Light YouTube Embeds by @labnol : http://labnol.org/?p=27941 */


function videoInit(videoLink) {
  // NOTE: use embed version of YouTube link in DB:
  // example: https://www.youtube.com/embed/BIHY9NKm6JQ?start=4

  if (!videoLink || typeof videoLink !== 'string') { return; }

  var videoParse = videoLink.match(/embed\/([\d\w]+)(\?start\=)*(\d*)/);
  if (videoParse.length > 1) {
    var embedId = videoParse[1];
    var startPos = videoParse[3] || 0;

    var mediaContainer = document.createElement('div');
    mediaContainer.setAttribute('class', 'media-container youtube-player');

    var div = document.createElement('div');
    div.setAttribute("data-id", embedId);
    if (startPos) { div.setAttribute("data-start", startPos); }
    div.innerHTML = labnolThumb(embedId);
    div.onclick = labnolIframe;

    mediaContainer.appendChild(div);
    videoContainer.appendChild(mediaContainer)
  }
}

function labnolThumb(id) {
  var thumb = '<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">',
      play = '<div class="play"></div>';
  return thumb.replace("ID", id) + play;
}

function labnolIframe() {
  var iframe = document.createElement("iframe");
  var embedSrc = "https://www.youtube.com/embed/ID?autoplay=1";
  var embedId = this.dataset.id;
  embedSrc = embedSrc.replace("ID", embedId);
  var startPos = this.dataset.start;
  if (startPos) { embedSrc += '&start=' + startPos; }

  iframe.setAttribute("src", embedSrc);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "1");
  this.parentNode.replaceChild(iframe, this);
}

},{"./ahrriss":5}],7:[function(require,module,exports){
/****** AUDIO PLAYLIST ******/

var ahrriss = require('./ahrriss');
var lie = require('lie/polyfill');

var aloudContainer = document.getElementById('dlg-aloud');

var playlistContainer = document.getElementById('dlg-aloud-player'),
    mediaPath = '/media/',
    audioElement,
    playlistElement,
    trackElements,
    currentTrackNumber,
    dlgPlaylist = [];

if (playlistContainer) {

  var Songs = ahrriss.firebaseDatabase.ref('Songs');
  Songs.on('value', function(songsResp) {
    var songList = songsResp.val();
    // console.info({ songList: songList })

    var Playlist = ahrriss.firebaseDatabase.ref('Playlist');
    Playlist.on('value', function(playlistResp){
      var rawPlaylist = playlistResp.val();
      // console.info({ rawPlaylist: rawPlaylist })

      if (!rawPlaylist) { return; }

      var dlgPlaylistPromiseArray = [];

      for (var i = 0; i < rawPlaylist.length; i++) {    // looping through playlist array of song titles
        var playlistIndex = i;
        var playlistSong = rawPlaylist[playlistIndex];

        for (var x = 0; x < songList.length; x++) {     // looping through song collection to match to playlist title
          if (songList[x].Name == playlistSong.Name) {
            var song = songList[x];
            var storagePath = 'discography/' + song.Album + '/' + 'Die Like Gentlemen' + ' - ' + song.Album + ' - ' + song.TrackNumber + ' - ' + song.Name + '.mp3';
            // console.info(storagePath);

            var storageRef = ahrriss.firebaseStorage.ref();
            var storageChild = storageRef.child(storagePath);

            // create collection of promises that fetch the song URLs
            dlgPlaylistPromiseArray.push(
              storageChild.getDownloadURL()
              .then(
                function(songSrc) {
                  console.info({ this: this, songSrc: songSrc });

                  // create final playlist with all necessary values at correct index
                  dlgPlaylist[this.playlistIndex] = {
                    src: songSrc,
                    title: this.songName,
                    album: this.songAlbum
                  };

                }.bind({    // fun!
                  playlistIndex: playlistIndex,
                  songName: song.Name,
                  songAlbum: song.Album
                })
              )
            );

            break;
          }
        }
      }

      // now that all playlist song URLs have been fetched, embed the audio and reveal the section
      Promise.all(dlgPlaylistPromiseArray).then(function() {
        console.info({ arguments: arguments })
        console.info({ dlgPlaylist: dlgPlaylist })

        embedAudioPlaylist(dlgPlaylist, 350);

        ahrriss.revealSection(aloudContainer);
      });

    });

  });

}

function embedAudioPlaylist(audioPlaylist, height, width) {
  if (!playlistContainer) { return; }

  var audio = document.createElement('audio');
  if (audio.play) {
    // HTML5 <audio> element is supported
    audio.src = audioPlaylist[0].src;	// load initial entry
    audio.controls = 'controls';
    audio.controlsList = 'nodownload';
    audio.preload = 'none';

    playlistContainer.appendChild(audio);

    // create playlist display
    var playlist = document.createElement('ol');
    playlist.className = 'media-playlist';
    for (var m = 0; m < audioPlaylist.length; m++) {
      var listItem = document.createElement('li');
      if (m === 0) { listItem.className = 'active'; }
      var anchor = document.createElement('a');
      anchor.href = audioPlaylist[m].src;

      if (audioPlaylist[m].title) {
        var attributeTitle = document.createElement('span');
        attributeTitle.className = 'media-title';
        attributeTitle.appendChild(document.createTextNode(audioPlaylist[m].title));
        anchor.appendChild(attributeTitle);
      }

      if (audioPlaylist[m].album) {
        var attributeAlbum = document.createElement('span');
        attributeAlbum.className = 'media-album';
        attributeAlbum.appendChild(document.createTextNode(audioPlaylist[m].album));
        anchor.appendChild(attributeAlbum);
      }

      listItem.appendChild(anchor);
      playlist.appendChild(listItem);
    }

    playlistContainer.appendChild(audio);
    playlistContainer.appendChild(playlist);

    initPlaylist();
    audio.volume = 1;
  }
  else
  {
    // fallback to Flash player
    var swfPath = '/post_tunes/player_mp3_multi.swf';
    var playerHeight = height || '100';
    var playerWidth = width || '300';
    var playerMode = 'transparent';
    var showPlaylistNumbers = 0;
    var applicationType = 'application/x-shockwave-flash';

    var files = audioPlaylist.map(function(item) {
      return item.src;
    }).join('|');

    var titles = audioPlaylist.map(function(item) {
      return '"' + item.title + '"' + (item.artist ? ' - ' + item.artist : '');
    }).join('|');

    var flashVars = {
      mp3: encodeURI(files),
      title: titles,
      width: playerWidth,
      height: playerHeight,
      showstop: 1,
      showvolume: 0,
      bgcolor1: '666666',
      bgcolor2: 'dddddd',
      showloading: 'always'
    };

    var flashVarsArray = [];
    for (var param in flashVars) {
      flashVarsArray.push(param + '=' + flashVars[param]);
    }
    var flashVarsString = flashVarsArray.join('&');

    var objectNode = document.createElement('object');
    objectNode.setAttribute('data', swfPath);
    objectNode.setAttribute('type', applicationType);
    objectNode.setAttribute('width', playerWidth);
    objectNode.setAttribute('height', playerHeight);

    var paramMovie = document.createElement('param');
    paramMovie.setAttribute('name', 'movie');
    paramMovie.setAttribute('value', swfPath);
    objectNode.appendChild(paramMovie);

    var paramMode = document.createElement('param');
    paramMode.setAttribute('name', 'wmode');
    paramMode.setAttribute('value', playerMode);
    objectNode.appendChild(paramMode);

    var paramVars = document.createElement('param');
    paramVars.setAttribute('name', 'FlashVars');
    paramVars.setAttribute('value', flashVarsString);
    objectNode.appendChild(paramVars);

    var embedNode = document.createElement('embed');
    embedNode.setAttribute('flashvars', flashVarsString);
    embedNode.setAttribute('src', swfPath);
    embedNode.setAttribute('type', applicationType);
    embedNode.setAttribute('wmode', playerMode);
    objectNode.setAttribute('width', playerWidth);
    objectNode.setAttribute('height', playerHeight);
    objectNode.appendChild(embedNode);

    playlistContainer.appendChild(objectNode);
  }

}

function initPlaylist() {
    if (!playlistContainer) { return; }

    // initialize global player variables
    audioElement = playlistContainer.getElementsByTagName('audio')[0];
    playlistElement = playlistContainer.getElementsByClassName('media-playlist')[0];
    trackElements = playlistElement.getElementsByTagName('a');

    var playlistLength = trackElements.length;
    currentTrackNumber = 1;

    audioElement.volume = .10;

    for (var x = 0; x < trackElements.length; x++) {
      trackElements[x].setAttribute('track', x + 1);

      trackElements[x].addEventListener('click', function(e) {
        e.preventDefault();
        currentTrackNumber = this.getAttribute('track');
        playPlaylistTrack(this);
      })
    }

    audioElement.addEventListener('ended', function(e) {
      // console.info('ended: currentTrackNumber = ' + currentTrackNumber)

      // play next track (if exists)
      if (currentTrackNumber < playlistLength) {
        currentTrackNumber++;
        playPlaylistTrack(trackElements[currentTrackNumber - 1]);
      } else {
        currentTrackNumber = 1;
        loadPlaylistTrack(trackElements[currentTrackNumber - 1]);
      }
    });
}

function loadPlaylistTrack(link) {
  audioElement.src = link.getAttribute('href');

  var item = link.parentElement;

  for (var x = 0; x < trackElements.length; x++) {
    if (trackElements[x] == link) {
      link.parentElement.classList.add('active');
    } else {
      trackElements[x].parentElement.classList.remove('active');
    }
  }
  audioElement.load();

  // scroll to loaded item
  // var playlist = item.parent();
  // playlist.scrollTop(playlist.scrollTop() + item.position().top)
}

function playPlaylistTrack(link){
  loadPlaylistTrack(link);
  audioElement.play();
}

},{"./ahrriss":5,"lie/polyfill":3}]},{},[5]);
