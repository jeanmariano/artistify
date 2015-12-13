  var BASE_SPOTIFY_URL = "https://api.spotify.com/v1/tracks?market=US&ids=";
  var SLEEPY_PLAYLIST = "https://api.spotify.com/v1/users/spotify/playlists/5UMleIsaNDK5LzZRbrbcXr/tracks";
  var SPOTIFY_CLIENT_ID = "74a75faf8e044e9193c2c385dabde32f";
  var SPOTIFY_CLIENT_SECRET = "56ff8540a44a4a42b0c611a7cfc05331";
  var SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
  var AUTH = "Basic NzRhNzVmYWY4ZTA0NGU5MTkzYzJjMzg1ZGFiZGUzMmY6NTZmZjg1NDBhNDRhNGE0MmIwYzYxMWE3Y2ZjMDUzMzE=";
  var SPOTIFY_ALBUM = "https://api.spotify.com/v1/albums/";
  var ECHONEST_URL = "http://developer.echonest.com/api/v4/song/search?api_key=WVDL4YATREDEMFPC1&format=json&bucket=id:spotify&bucket=tracks";
  var TEMP = "&min_energy=0.6&min_danceability=0.6";
  var TEMP2 = "&style=rock";
  var ENERGY_ASC = "&sort=energy-asc"

  // sends a list of previews to the callback
  // max 10 songs at a time ?
  function getPreviewsFromSpotifyIds(ids, callback) {
    var url = BASE_SPOTIFY_URL + ids.join(",");
    $.ajax(ajaxObj(url)).done(function(data) {
      callback(
        data.tracks.map(function(track) {
          return {
            preview_url: track.preview_url,
            track_name: track.name,
            artist_name: track.artists[0].name,
            album_image: track.album.images[1].url,
            album_name: track.album.name,
            album_url: track.album.href
          };
        })
      );
    });
  }

  // return array of preview urls to callback
  function getTracksFromAlbumId(id, callback) {
    var url =  SPOTIFY_ALBUM + id + "/tracks?market=US";
    $.ajax(ajaxObj(url)).done(function(data) {
      var ids = data.items.map(function(item) {
        return item.id;
      });
      getPreviewsFromSpotifyIds(ids, callback);
    });

  }

  // from playlist
  function getSleepySongs(callback) {
    getTracksFromAlbumId("76GPenASUzBpitFNplLJKI", callback);
  }

  function getWakeySongs(callback, genre) {
    var base_url = ECHONEST_URL + ENERGY_ASC;
    if (genre !== "") {
      base_url = base_url + "&style=" + genre;
    }


    $.when(songGroup(0.6, genre), songGroup(0.65, genre), songGroup(0.7, genre), songGroup(0.75, genre), songGroup(0.8, genre), songGroup(0.85, genre))
    .done(function(a1, a2, a3, a4, a5, a6){
      var ids = ([a1,a2,a3,a4,a5,a6].map(function(data) {
        return getForeignIdsEchonest(data[0]);
      }));
      getPreviewsFromSpotifyIds(ids, callback);

    });
  }

  function getForeignIdsEchonest(data) {
    return data.response.songs
    .filter(function(song, index) { return (song.tracks.length > 0 && index < 10) })
    .map(function(song) {
      return song.tracks[0].foreign_id.split(":")[2];
    });
  }

  function songGroup(level, genre) {
    var base_url = ECHONEST_URL + ENERGY_ASC;
    if (genre !== "") {
      base_url = base_url + "&style=" + genre;
    }
    var url = base_url + "&min_danceability=" + level;
    url = url + "&min_energy=" + level;
    return $.ajax(ajaxObj(url));
  }

  // for making ajax obj w any url
  function ajaxObj(url) {
    return {
        type: 'GET',
        headers: {Accept: 'application/json'},
        url: url,
        dataType: "json",
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
