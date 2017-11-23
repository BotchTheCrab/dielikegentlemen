
var fetchival = require('fetchival');
var api = require('./api');

var sections = ['dlg-about', 'dlg-aloud', 'dlg-alive', 'dlg-contact'];

var revealedSections = [];
var queuedSections = [];

function revealSection(section){
  var sectionId = section.id;
  if (revealedSections.indexOf(sectionId) !== -1) {
    return;
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


var _revealSection = function(sectionId) {
  // console.info('_revealSection: sectionId = ' + sectionId);
  var section = document.getElementById(sectionId);
  if (!section) { return; }

  section.classList.add('loaded');
  window.setTimeout(function(){
    section.classList.add('revealed');
  }, 250);

  queuedSections = queuedSections.filter(function(queuedSectionId) {
    return queuedSectionId !== sectionId;
  });

  revealedSections.push(section.id)
}




document.addEventListener('DOMContentLoaded', function() {
  var contactContainer = document.getElementById('dlg-contact');

  fetchival(api.root + 'about' + '?apikey=' + api.key).get().then(function(resp) {
    module.exports = {
      apiResponse: resp,
      revealSection: revealSection
    };

    var about = require('./about');
    var aloud = require('./aloud');
    var alive = require('./alive');

    revealSection(contactContainer);
  });

});
