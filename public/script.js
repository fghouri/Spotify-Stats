/* ** Client ** */

// global variable
var access_token;

(function() {
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var userProfileSource = document.getElementById("user-profile-template").innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById("user-profile");

  var oauthSource = document.getElementById("oauth-template").innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById("oauth");

  var params = getHashParams();

  access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

  if (error) {
    alert("There was an error during the authentication");
  } else {
    if (access_token) {
      // Render OAuth info
      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token,
      });

      $.ajax({
        url: "https://api.spotify.com/v1/me",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        success: function (data) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(data);

          // Render after login screen
          $("#login").hide();
          $("#loggedin").show();
          $("#user-stats-btn").show();
        },
      });
    } else {
      // Render initial screen
      $("#login").show();
      $("#user-stats-btn").hide();
      $("#loggedin").hide();
      $("#stats").hide();
      $("#stats-table").hide();
    }

    document.getElementById("obtain-new-token").addEventListener(
      "click",
      function () {
        $.ajax({
          url: "/refresh_token",
          data: {
            refresh_token: refresh_token,
          },
        }).done(function (data) {
          access_token = data.access_token;
          oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: access_token,
            refresh_token: refresh_token,
          });
        });
      },
      false
    );
  }

  // stats button
  document.getElementById("obtain-stats").addEventListener("click", function( ) {
    
    // show header
    $("#stats").show();
    $("#stats-table").show();

    getStats("artists");
    getStats("tracks");

  // make fetch requests for artists and tracks
  async function getStats(type){

    const url_artists = `https://api.spotify.com/v1/me/top/artists?limit=5`;
    const url_tracks = `https://api.spotify.com/v1/me/top/tracks?limit=5`;

    // artists
    if (type == 'artists') {
        try {
        const response = await fetch(url_artists, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
        const data = await response.json(); 
        data.items.forEach((artist, index) => {
          document.getElementById(`artist${index + 1}`).textContent = `${artist.name}`;
          });
      } catch (error) {
        console.log(error);
      }
    }
    // tracks
   else if (type == 'tracks') {
      try {
        const response = await fetch(url_tracks, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
        const data = await response.json(); 
        data.items.forEach((track, index) => {
          document.getElementById(`track${index + 1}`).textContent = `${track.name}`;
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
})}());

