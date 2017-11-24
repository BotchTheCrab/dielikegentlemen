/****** IMAGE SLIDESHOW & BIO ******/

var ahrriss = require('./ahrriss');
var api = require('./api');

var aboutContainer = document.getElementById('dlg-about');

var galleryContainer = document.getElementById('dlg-about-images'),
    galleryImageIds = [],
    durationMs = 9000,
    currentGalleryIndex = -1,
    imagePrefix = 'dlg-image-';

var bioContainer = document.getElementById('dlg-about-bio');

var resp = ahrriss.apiResponse;

// initialize gallery
if (galleryContainer) {
  var slideshow = resp && resp.length && resp[0].Gallery;
  if (!slideshow) { return; }
  galleryImageIds = slideshow.map(function(image) {
    return image.Image[0];
  });
  renderNextImage();
}

// render bio
if (bioContainer) {
  var bio = resp[0].Description;
  if (bioContainer && bio) {
    bioContainer.innerHTML = bio;
  }
}


/** render next image; once loaded, trigger galleryShift **/
function renderNextImage() {
  var nextGalleryIndex = currentGalleryIndex + 1;
  // console.info('renderNextImage: nextGalleryIndex = ' + nextGalleryIndex);
  if (!galleryImageIds[nextGalleryIndex]) { return; }

  var imageElement = document.createElement('img');
  var imageSrc = api.mediaRoot + galleryImageIds[nextGalleryIndex];
  imageElement.src = imageSrc;
  imageElement.id = imagePrefix + nextGalleryIndex;
  imageElement.addEventListener('load', function() {
    galleryShift();
  });
  imageElement.addEventListener('click', function() {
    window.open(imageSrc);
  });
  galleryContainer.appendChild(imageElement);
}

/** reveal next image; if next image isn't loaded, redirect to renderNextImage **/
function galleryShift() {
  // console.info('galleryShift')
  var nextGalleryIndex = currentGalleryIndex == galleryImageIds.length - 1 ? 0 : currentGalleryIndex + 1;
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
