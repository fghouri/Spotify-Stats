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
    const url_artists = `https://api.spotify.com/v1/me/top/artists?limit=5`;
    const url_tracks = `https://api.spotify.com/v1/me/top/tracks?limit=5`;
    
    // show header
    $("#stats").show();
    $("#stats-table").show();

    // top artists
    fetch(url_artists, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return response.json(); // Parse the response as json
    })
    .then(data => { 
      data.items.forEach((artist, index) => {
        console.log("Artist Name: ", artist.name);
        console.log("Genre: ", artist.genres.join(", "));
        document.getElementById(`artist${index + 1}`).textContent = `${artist.name}`;
      });
      console.log(data);
    })
    .catch(error => {
      console.log(`Error fetching Spotify Data: `, error);
    })

    // top tracks
    fetch(url_tracks, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return response.json(); // Parse the response as json
    })
    .then(data => { 
      data.items.forEach((track, index) => {
        console.log("Artist Name: ", track.name);
        document.getElementById(`track${index + 1}`).textContent = `${track.name}`;
      });
      console.log(data);
    })
    .catch(error => {
      console.log(`Error fetching Spotify Data: `, error);
    })
  })
})();
