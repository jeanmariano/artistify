var selectGenres = [];
var queue = [];
var audio = new Audio();

function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        $('.clock').text(h + ":" + m + ":" + s);
        var t = setTimeout(startTime, 500);
    }
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

function toggleView(id) {
    if ($('#'+id+'View').css('display') === 'none') {
       $('#'+id+'View').css('display','block');
    }
    else
        $('#'+id+'View').css('display','none');
}

function goToView(from,to) {
    toggleView(from);
    toggleView(to);
}

function toggleActive(obj) {
    if ($(obj).hasClass('active'))
        $(obj).removeClass('active');
    else
        $(obj).addClass('active');
}

function sleepNow() {
    getWakeySongs(queuePlaylist,selectGenres);
    goToView('alarmMusic','main');
    $('#genreList .list-group-item').removeClass('active');
    selectGenres = [];
    playMusic();
}

function wakeUp() {
    goToView('playlist','alarmMusic');
    initializeAlarmView();
    audio.pause();    
}

function alarmGo() {
  audio.play();
  goToView('alarm','sleep');
}

function snoozeAlarm() {
  goToView('snooze','alarm');
  audio.pause();
  setTimeout(function() {
    audio.play();
    goToView('alarm','snooze');
  },500);
}

function cancelAlarm() {
    goToView('main','sleep');
    audio.pause();
    queue = [];
    getSleepySongs(queueSongs);
}

function newAlarm() {
  goToView('main','playlist');
  audio.pause();
  queue = [];  
}

function queuePlaylist(list) {
    renderPlaylist(list);
    queueSongs(list);
}

function queueSongs(list) {
    queue = queue.concat(list);
    console.log(queue);
}

function renderPlaylist(list) {    
    var html = '';
    for (var i=0; i < list.length; i++) {
        var cur = list[i];
        var albumCover =cur.album_image,
            song = cur.track_name,
            artist = cur.artist_name,
            artistId = cur.artist_id,
            albumName = cur.album_name,
            previewUrl = cur.preview_url,
            trackId = cur.track_id;
        html = html+renderPlaylistEntry(albumCover, song, artist, artistId, albumName, previewUrl, trackId);
    }
    $('#playlist').empty();
    $('#playlist').append(html);
    listenForPlays();
}

function renderPlaylistEntry(albumCover, song, artist, artistId, albumName, previewUrl, trackId) {
    var html = '<li class="musicplayer list-group-item text-left">'+
      '<div class="albumcover">'+
        '<img src="'+albumCover+'">'+
      '</div>'+
      '<div class="info">'+
        '<span class="title">'+song+'</span><br>'+
        '<i>'+albumName+'</i><br>'+ 
        '<b style="display:inline-block; height:25px;">'+artist+'</b>'+
        '<div style="display:table; width:100%">'+
          '<div style="width:50%; vertical-align:top;">'+
            '<iframe src="https://embed.spotify.com/follow/1/?uri=spotify:artist:'+artistId+'&size=basic&theme=light&show-count=0" width="200" height="25" scrolling="no" frameborder="0" style="border:none; overflow:hidden; display:inline-block;" allowtransparency="true"></iframe>'+
          '</div>'+
          '<div style="width:50%; text-align:right;">'+
            '<button class="play btn btn-primary">'+
              '<span class="glyphicon glyphicon-play" aria-hidden="true"></span>'+
              ' Preview Track'+
              '<audio class="audioDemo" controls="" preload="none">'+
              '<source src="'+previewUrl+'" type="audio/mpeg">'+
              '</audio>'+
            '</button><br/>'+
            '<a class="openinspotify btn btn-default" href="https://play.spotify.com/track/'+trackId+'" target="_blank">'+
              '<span class="glyphicon glyphicon-link" aria-hidden="true"></span>'+
              ' Open in Spotify'+
            '</a>'+
          '</div>'+
        '</div>'+                      
      '</div>'+
    '</li>';
    return html;
}
   
function playMusic() {
    $('#albumCover').attr('src',queue[0].album_image);
    $('#albumName').text(queue[0].album_name)
    $('#artistName').text(queue[0].artist_name)
    $('#songName').text(queue[0].track_name);    
    audio = new Audio(queue[0].preview_url);
    audio.play();
    audio.addEventListener('ended',function(){
        queue.splice(0,1);
        audio.src = queue[0].preview_url;
        audio.pause();
        audio.load();
        audio.play();
        $('#albumCover').attr('src',queue[0].album_image);
        $('#albumName').text(queue[0].album_name)
        $('#artistName').text(queue[0].artist_name)
        $('#songName').text(queue[0].track_name);
    }); 
}

function listenForPlays() {
  $('.play').click(function() {
    clicked = $(this).children('audio')[0];
    if (clicked.paused) {
      clicked.play();
      button = $(this).children('span');
      button.removeClass('glyphicon-play');
      button.addClass('glyphicon-pause');
    }
    else {
      clicked.pause();
      button = $(this).children('span');
      button.removeClass('glyphicon-pause');
      button.addClass('glyphicon-play');
    }
  })
}

function initializeAlarmView() {
    $('#sleepView').css('display','block');
    $('#alarmView').css('display','none');
    $('#snoozeView').css('display','none');
}

getSleepySongs(queueSongs);

$(document).ready(function() {
    startTime()
    checkTime()
    $('#alarmMusicView').css('display','none');
    initializeAlarmView();
    $('#playlistView').css('display','none');

    $('#genreList').on('click','.list-group-item',function(e) {
        selectGenres.push(e.target.text);
        toggleActive(e.target);
    });

});
