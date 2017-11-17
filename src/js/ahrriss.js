
require('lie/polyfill');
require('fetchival');


var imageIds = ['dlg-image-0', 'dlg-image-1', 'dlg-image-2'];

var galleryTimeout;
var currentGalleryIndex = 0;
var galleryAnchor;

function galleryStart() {
  galleryAnchor = document.getElementById('dlg-about-images');

  // var currentImage = document.getElementById('dlg-image-' + currentGalleryIndex);
  // currentImage.classList.add('active');


  galleryTimeout = window.setInterval(galleryShift, 10000);
}

function galleryShift() {
  var currentImage = document.getElementById('dlg-image-' + currentGalleryIndex);
  var nextGalleryIndex = currentGalleryIndex == imageIds.length - 1 ? 0 : currentGalleryIndex + 1;

  var nextImage = document.getElementById('dlg-image-' + nextGalleryIndex);
  // console.info({
  //   currentImage: currentImage,
  //   nextGalleryIndex: nextGalleryIndex,
  //   nextImage: nextImage
  // })

  currentImage.classList.remove('active');
  nextImage.classList.add('active');

  currentGalleryIndex = Number(nextGalleryIndex);
}

function launchImage() {
  var imageSrc = document.getElementById(imageIds[currentGalleryIndex]).getAttribute('src');
  window.open(imageSrc);
}


/****************************/
/****** AUDIO PLAYLIST ******/
/****************************/

var playlistContainer, audioElement, playlistElement, trackElements, currentTrackNumber;

/**
  expected playlist format:
  [{ src: 'path/to/file', title: 'title', artist: 'artist' }, {}, {}]
*/
function embedAudioPlaylist(targetId, audioPlaylist, height, width) {
  playlistContainer = document.getElementById(targetId);
  if (!playlistContainer) { return; }
  // playlistContainer.className = 'audio-playlist-container';

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
