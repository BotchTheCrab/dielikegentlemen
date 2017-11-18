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
