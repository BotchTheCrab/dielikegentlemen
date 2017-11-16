
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




/**
  expected playlist format:
  [{ src: 'path/to/file', title: 'title', artist: 'artist' }, {}, {}]
*/
function embedAudioPlaylist(targetId, audioPlaylist, height, width) {
  var targetElm = document.getElementById(targetId);
  if (!targetElm) { return; }
  // targetElm.className = 'audio-playlist-container';

  var audio = document.createElement('audio');
  if (audio.play) {
    // HTML5 <audio> element is supported
    audio.src = audioPlaylist[0].src;	// load initial entry
    audio.controls = 'controls';

    targetElm.appendChild(audio);

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

    targetElm.appendChild(audio);
    targetElm.appendChild(playlist);

    initPlaylist(targetId);
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

    targetElm.appendChild(objectNode);
  }

}

function initPlaylist(targetId) {
    var currentIndex = 0;
    var audio = $('#' + targetId + ' audio')[0];
    var playlist = $('#' + targetId + ' .media-playlist');
    var tracks = playlist.find('li a');
    var playlistLength = tracks.length;
    audio.volume = .10;
    playlist.find('a').click(function(e) {
        e.preventDefault();
        var link = $(this);
        currentIndex = link.parent().index();
        playPlaylistTrack(link, audio);
    });
    audio.addEventListener('ended', function(e) {
        // play next track (if exists)
        if (currentIndex < playlistLength - 1) {
          currentIndex++;
          var link = playlist.find('a')[currentIndex];
          playPlaylistTrack($(link), audio);
        } else {
          currentIndex = 0;
          var link = playlist.find('a')[currentIndex];
          loadPlaylistTrack($(link), audio);
        }
    });
}

function loadPlaylistTrack(link, player) {
    player.src = link.attr('href');
    var item = link.parent();
    item.addClass('active').siblings().removeClass('active');
    player.load();

    // scroll to loaded item
    var playlist = item.parent();
    playlist.scrollTop(playlist.scrollTop() + item.position().top)
}

function playPlaylistTrack(link, player){
  loadPlaylistTrack(link, player);
  player.play();
}
