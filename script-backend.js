  var BASE_SPOTIFY_URL = "https://api.spotify.com/v1/tracks?market=US&ids=";
  var SLEEPY_PLAYLIST = "https://api.spotify.com/v1/users/spotify/playlists/5UMleIsaNDK5LzZRbrbcXr/tracks";
  var SPOTIFY_CLIENT_ID = "74a75faf8e044e9193c2c385dabde32f";
  var SPOTIFY_CLIENT_SECRET = "56ff8540a44a4a42b0c611a7cfc05331";
  var SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
  var AUTH = "Basic NzRhNzVmYWY4ZTA0NGU5MTkzYzJjMzg1ZGFiZGUzMmY6NTZmZjg1NDBhNDRhNGE0MmIwYzYxMWE3Y2ZjMDUzMzE=";

  // sends a list of previews to the callback
  // max 10 songs at a time ?
  function getPreviewsFromSpotifyIds(ids, callback) {
    var url = BASE_SPOTIFY_URL + ids.join(",");
    $.ajax(ajaxObj(url)).done(function(data) {
      callback(
        data.tracks.map(function(track) {
          return track.preview_url;
        })
      );
    });
  }

  // for making ajax obj w any url
  function ajaxObj(url) {
    return {
        type: 'GET',
        headers: {Accept: 'application/json'},
        url: url,
        dataType: "json"
    }
  }

  function ajaxTokenObj(url) {
    return {
        type: 'POST',
        async: true,
        headers: {
          Accept: "application/json",
          Authorization: AUTH,
        },
        url: url,
        dataType: "json",
        form: {
          grant_type: 'client_credentials'
        },
        success:function(data)
        {
          console.log(data);
        }
      }
    }

  // get access token - returns string
  function getAccessToken(callback) {
    $.ajax(ajaxTokenObj(SPOTIFY_TOKEN_URL)).done(function(data) {
      callback(data.access_token);
    });
  }


  // from playlist
  function getSleepySongs() {

  }

  function getWakeUpSongs(genre) {

  }

  // your application requests authorization
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': AUTH
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };
/*
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/users/jmperezperez',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        console.log(body);
      });
    }
  });
*/
