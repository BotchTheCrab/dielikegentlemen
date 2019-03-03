/****** GIG LISTINGS ******/

var ahrriss = require('./ahrriss');

var aliveContainer = document.getElementById('dlg-alive');

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var videoContainer = document.getElementById('dlg-alive-video');
var gigContainer = document.getElementById('gig-container');

if (videoContainer) {
  var VideoLink = ahrriss.firebaseDatabase.ref('VideoLink');
  VideoLink.on('value', function(resp) {
    // console.info(resp.val())

    var videoLink = resp.val();
    if (videoLink) {
      videoInit(videoLink);
    }
  });
}

if (gigContainer) {
  var Gigs = ahrriss.firebaseDatabase.ref('Gigs');
  Gigs.on('value', function(resp) {
    var allGigs = resp.val();
    // console.info({ allGigs: allGigs })

    var _zeroPad = function(n) {
      return n < 10 ? "0" + n : String(n);
    };

    // filter out past gigs
    // format: YYYY-MM-DD ...
    var today = new Date();
    today = today.getFullYear() + "-" + _zeroPad(today.getMonth() + 1) + "-" + _zeroPad(today.getDate());
    var upcomingGigs = allGigs.filter(function(gig) {
      var gigDate = gig.Date.substring(0,10);
      return gigDate >= today;
    });

    // sort by date
    upcomingGigs.sort(function(a, b) {
      return a.Date > b.Date ? 1 : -1;
    });
    // console.info({ upcomingGigs: upcomingGigs })

    gigContainer.innerHTML = '';

    // render upcoming gigs
    for (var x = 0; x < upcomingGigs.length; x++) {
      var gig = upcomingGigs[x];

      var gigHtml = '' +
        '<div class="gig">' +
          '<div class="gig-date">' + formatDate(gig.Date) + '</div>' +
          '<div class="gig-details">' +
            '<div class="gig-city">' + gig.City_State + '</div>' +
            '<div class="gig-venue">' + gig.Venue + '</div>' +
            (gig.Notes ? '<div class="gig-notes">' + gig.Notes + '</div>' : '') +
            (gig.OtherBands ? '<div class="gig-bands">with ' + formatOtherBands(gig.OtherBands) + '</div>' : '') +
          '</div>' +
          '<div class="gig-link">' + (gig.Link ? '<a href="' + gig.Link + '" target="_blank">details</a>' : '') + '</div>' +
        '</div>';

        gigContainer.innerHTML += gigHtml;
    }

    ahrriss.revealSection(aliveContainer);
  });

}

function formatDate(timestamp) {
  var month = Number(timestamp.substring(5,7));
  var date = Number(timestamp.substring(8,10));
  return monthNames[month - 1].substring(0,3) + ' ' + date;
}

function formatOtherBands(sBands) {
  if (!sBands) { return; }

  var aBands = sBands.split(', ');
  for (var c = 0; c < aBands.length; c++) {
    aBands[c] = '<span>' + aBands[c].trim() + '</span>';
  }

  return aBands.join(', ');
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
