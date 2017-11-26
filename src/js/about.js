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
