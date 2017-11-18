
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
