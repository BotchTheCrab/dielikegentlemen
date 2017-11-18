(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function (window) {

  function defaults (target, obj) {
    for (var prop in obj) target[prop] = target[prop] || obj[prop]
  }

  function getQuery (queryParams) {
    var arr = Object.keys(queryParams).map(function (k) {
      return k + '=' + encodeURIComponent(queryParams[k])
    })
    return '?' + arr.join('&')
  }

  function _fetch (method, url, opts, data, queryParams) {
    opts.method = method
    opts.headers = opts.headers || {}
    opts.responseAs = (opts.responseAs && ['json', 'text', 'response'].indexOf(opts.responseAs) >= 0) ? opts.responseAs : 'json'

    defaults(opts.headers, {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })

    if (queryParams) {
      url += getQuery(queryParams)
    }

    if (data) {
        opts.body = JSON.stringify(data);
    } else {
        delete opts.body;
    }

    return fetchival.fetch(url, opts)
      .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
          if(opts.responseAs=="response")
            return response
          if (response.status == 204)
            return null;
          return response[opts.responseAs]();
        }
        var err = new Error(response.statusText)
        err.response = response
        throw err
      })
  }

  function fetchival (url, opts) {
    opts = opts || {}

    var _ = function (u, o) {
      // Extend parameters with previous ones
      u = url + '/' + u
      o = o || {}
      defaults(o, opts)
      return fetchival(u, o)
    }

    _.get = function (queryParams) {
      return _fetch('GET', url, opts, null, queryParams)
    }

    _.post = function (data) {
      return _fetch('POST', url, opts, data)
    }

    _.put = function (data) {
      return _fetch('PUT', url, opts, data)
    }

    _.patch = function (data) {
      return _fetch('PATCH', url, opts, data)
    }

    _.delete = function () {
      return _fetch('DELETE', url, opts)
    }

    return _
  }

  // Expose fetch so that other polyfills can be used
  // Bind fetch to window to avoid TypeError: Illegal invocation
  fetchival.fetch = typeof fetch !== 'undefined' ? fetch.bind(window) : null

  // Support CommonJS, AMD & browser
  if (typeof exports === 'object')
    module.exports = fetchival
  else if (typeof define === 'function' && define.amd)
    define(function() { return fetchival })
  else
    window.fetchival = fetchival

})(typeof window != 'undefined' ? window : undefined);

},{}],2:[function(require,module,exports){
/****** IMAGE SLIDESHOW ******/

var fetchival = require('fetchival');
var api = require('./api');

var aboutContainer = document.getElementById('dlg-about');

var galleryContainer = document.getElementById('dlg-about-images'),
    galleryImageIds = [],
    durationMs = 9000,
    currentGalleryIndex = 0;

var bioContainer = document.getElementById('dlg-about-bio');
var videoContainer = document.getElementById('dlg-alive-video');


if (galleryContainer) {

  fetchival(api.root + 'about' + '?apikey=' + api.key).get().then(function(resp) {
    var slideshow = resp && resp.length && resp[0].Gallery;
    if (!slideshow) { return; }

    // initialize gallery
    galleryImageIds = slideshow.map(function(image) {
      return image.Image[0];
    });
    galleryInit(galleryImageIds);

    // render bio
    var bio = resp[0].Description;
    if (bioContainer && bio) {
      bioContainer.innerHTML = bio;
    }

    // render video
    var videoLink = resp[0].VideoLink;
    if (videoContainer && videoLink) {
      videoContainer.innerHTML = '<iframe src="' + videoLink + '" frameborder="0" allowfullscreen></iframe>';
    }

    revealSection(aboutContainer);
  });
}

function galleryInit(galleryImageIds) {

  for (var x = 0; x < galleryImageIds.length; x++) {
    var image = document.createElement('img');
    image.src = api.mediaRoot + galleryImageIds[x];
    image.id = 'dlg-image-' + x;
    if (x === 0) {
      image.className = 'active';
    }
    galleryContainer.appendChild(image);
  }

  window.setInterval(galleryShift, durationMs);

  galleryContainer.addEventListener('click', launchImage);
}

function galleryShift() {
  var currentImage = document.getElementById('dlg-image-' + currentGalleryIndex);
  var nextGalleryIndex = currentGalleryIndex == galleryImageIds.length - 1 ? 0 : currentGalleryIndex + 1;

  var nextImage = document.getElementById('dlg-image-' + nextGalleryIndex);
  currentImage.classList.remove('active');
  nextImage.classList.add('active');

  currentGalleryIndex = Number(nextGalleryIndex);
}

function launchImage() {
  var imageSrc = api.mediaRoot + galleryImageIds[currentGalleryIndex];
  window.open(imageSrc);
}

},{"./api":6,"fetchival":1}],3:[function(require,module,exports){
(function (global){

document.addEventListener('DOMContentLoaded', function() {

  var about = require('./about');
  var aloud = require('./aloud');
  var aloud = require('./alive');


  var revealedSectionsTally = 0;
  var contactContainer = document.getElementById('dlg-contact');

  global.revealSection = function(section){
    section.classList.add('loaded');
    window.setTimeout(function(){
      section.classList.add('revealed');
    }, 250);

    revealedSectionsTally++;

    // reveal contact when all others are loaded
    if (revealedSectionsTally == 3) {
      revealSection(contactContainer);
    }
  };

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./about":2,"./alive":4,"./aloud":5}],4:[function(require,module,exports){
/****** GIG LISTINGS ******/

var fetchival = require('fetchival');
var api = require('./api');

var aliveContainer = document.getElementById('dlg-alive');

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var gigContainer = document.getElementById('gig-container');

if (gigContainer) {

  fetchival(api.root + 'gigs' + '?apikey=' + api.key).get().then(function(resp) {
    var today = new Date();
    today.setHours(0, 0, 0);

    // filter out past gigs
    var upcomingGigs = resp.filter(function(gig) {
      var gigDate = new Date(gig.Date);
      return gigDate >= today;
    });

    // sort by date
    upcomingGigs.sort(function(a, b) {
      return a.Date > b.Date;
    });

    for (var x = 0; x < upcomingGigs.length; x++) {
      var gig = upcomingGigs[x];

      var gigHtml = '' +
        '<div class="gig">' +
          '<div class="gig-date">' + formatDate(gig.Date) + '</div>' +
          '<div class="gig-details">' +
            '<div class="gig-city">' + gig.City_State + '</div>' +
            '<div class="gig-venue">' + gig.Venue + '</div>' +
            (gig.OtherBands ? '<div class="gig-bands">with ' + formatOtherBands(gig.OtherBands) + '</div>' : '') +
          '</div>' +
          '<div class="gig-link">' + (gig.Link ? '<a href="' + gig.Link + '" target="_blank">details</a>' : '') + '</div>' +
        '</div>';

        gigContainer.innerHTML += gigHtml;
    }

    revealSection(aliveContainer);
  });

}

function formatDate(date) {
  var oDate = new Date(date);
  return monthNames[oDate.getMonth()].substring(0,3) + ' ' + oDate.getDate();
}

function formatOtherBands(sBands) {
  if (!sBands) { return; }

  var aBands = sBands.split(', ');
  for (var c = 0; c < aBands.length; c++) {
    aBands[c] = '<span>' + aBands[c].trim() + '</span>';
  }

  return aBands.join(', ');
}

},{"./api":6,"fetchival":1}],5:[function(require,module,exports){
/****** AUDIO PLAYLIST ******/

var fetchival = require('fetchival');
var api = require('./api');

var aloudContainer = document.getElementById('dlg-aloud');

var playlistContainer = document.getElementById('dlg-aloud-player'),
    mediaPath = '/media/',
    audioElement,
    playlistElement,
    trackElements,
    currentTrackNumber;

if (playlistContainer) {

  fetchival(api.root + 'playlist' + '?apikey=' + api.key).get().then(function(resp) {
    var rawPlaylist = resp && resp.length && resp[0].Songs;
    if (!rawPlaylist) { return; }

    var dlgPlaylist = rawPlaylist.map(function(song) {
      return {
        src: mediaPath + song.Album + '/' + 'Die Like Gentlemen' + ' - ' + song.Album + ' - ' + song.TrackNumber + ' - ' + song.Name + '.mp3',
        title: song.Name,
        album: song.Album
      };
    });

    embedAudioPlaylist(dlgPlaylist, 350);

    revealSection(aloudContainer);
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
      console.info('ended: currentTrackNumber = ' + currentTrackNumber)

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

},{"./api":6,"fetchival":1}],6:[function(require,module,exports){
module.exports = {
  root: 'https://gentlemen-3355.restdb.io/rest/',
  mediaRoot: 'https://gentlemen-3355.restdb.io/media/',
  key: '5a0f7c0e1ef3dc24313a7d3c'
};

},{}]},{},[3]);
