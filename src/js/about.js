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

  fetchival(api.root + 'about' + '?apikey=' + api.key, { mode: 'cors' }).get().then(function(resp) {
    console.info('/about content returned: resp ...')
    console.info(resp)

    var slideshow = resp && resp.length && resp[0].Gallery;
    if (!slideshow) { return; }

    // initialize gallery
    galleryImageIds = slideshow.map(function(image) {
      return image.Image[0];
    });
    // TEMP
    galleryImageIds = [galleryImageIds[0]];
    galleryInit(galleryImageIds);

    // render bio
    var bio = resp[0].Description;
    if (bioContainer && bio) {
      bioContainer.innerHTML = bio;
    }

    // render video
    var videoLink = resp[0].VideoLink;
    if (videoContainer && videoLink) {
      videoInit(videoLink);
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



/****** YOUTUBE VIDEO ******/

/* Basd on Light YouTube Embeds by @labnol : http://labnol.org/?p=27941 */


function videoInit(videoLink) {
  // videoContainer.innerHTML = '<iframe src="' + videoLink + '" frameborder="0" allowfullscreen></iframe>';

  // https://www.youtube.com/embed/BIHY9NKm6JQ?start=4

  var videoParse = videoLink.match(/embed\/([\d\w]+)(\?start\=)*(\d*)/);
  if (videoParse.length > 1) {
    var embedId = videoParse[1];
    var startPos = videoParse[3] || 0;

    var div = document.createElement("div");
    div.setAttribute("data-id", embedId);
    if (startPos) { div.setAttribute("data-start", startPos); }
    div.innerHTML = labnolThumb(embedId);
    div.onclick = labnolIframe;
    videoContainer.appendChild(div);
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
