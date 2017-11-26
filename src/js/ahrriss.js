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
