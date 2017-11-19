/****** GIG LISTINGS ******/

var fetchival = require('fetchival');
var api = require('./api');

var aliveContainer = document.getElementById('dlg-alive');

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var gigContainer = document.getElementById('gig-container');

if (gigContainer) {

  fetchival(api.root + 'gigs' + '?apikey=' + api.key).get().then(function(resp) {
    console.info('/gigs content returned')

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

    // render upcoming gigs
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
