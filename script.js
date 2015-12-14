var selectGenres = [],
    sleepyQueue = [],
    wakeyQueue = [],
    sleepyAudio = new Audio(),
    wakeyAudio = new Audio(),
    samplerAudio = new Audio(),
    alarmTime = '',
    timeLeft = '';

var counter = 1;

function startTime() {
    var today = new Date();
    var h = today.getHours(),
        m = today.getMinutes(),
        s = today.getSeconds(),
        p = '';
    m = checkTime(m);
    s = checkTime(s);
    if (h > 12) {
      h = h - 12;
    }
    if (h <= 12) {
      p = 'AM';
    }
    else {
      p = 'PM'
    }
    $('.clock').text(h + ":" + m + " " + p);
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
    playSleepyMusic();
    startTime()
    checkTime()
    // get current time
    // timeLeft = alarmTime - timeOut
}

function wakeUp() {
  sleepyAudio.pause() // should be redundant in final
  wakeyAudio.pause();
  goToView('playlist','alarmMusic');
  initializeAlarmView();  
}

function alarmGo() {
  wakeyAudio.play();
  goToView('alarm','sleep');
}

function snoozeAlarm() {
  goToView('snooze','alarm');
  wakeyAudio.pause();
  setTimeout(function() {
    wakeyAudio.play();
    goToView('alarm','snooze');
  },500);
}

function cancelAlarm() {
  goToView('main','alarmMusic');
  sleepyAudio.pause();
  // there won't be a point that will a user will want to cancel during an alarm  
  sleepyQueue = [];
  getSleepySongs(queueSleepylist);  
  sleepyAudio.volume = 1;
  wakeyAudio.volume = 0.1;
  counter =1;
}

function newAlarm() {
  goToView('main','playlist');
  // sleepyAudio.pause();
  sleepyQueue = [];
  wakeyQueue = [];
  sleepyAudio.volume = 1;
  wakeyAudio.volume = 0.1;
  counter =1;
}

function queuePlaylist(list) {
  renderPlaylist(list);
  wakeyQueue = list;
  console.log(list.length);
}

function queueSleepylist(list) {
  sleepyQueue = list;
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

function playSleepyMusic() {    
  sleepyAudio = new Audio('point1sec.mp3'); // buffer track
  sleepyAudio.play();
  sleepyAudio.addEventListener('ended',function(){      
    // if (sleepyQueue.length > 0) {
    if (counter < 2) { // test
      sleepyAudio.src = sleepyQueue[0].preview_url;
      sleepyAudio.pause();
      sleepyAudio.load();
      sleepyAudio.play();
      $('#albumCover').attr('src',sleepyQueue[0].album_image);
      $('#albumName').text(sleepyQueue[0].album_name)
      $('#artistName').text(sleepyQueue[0].artist_name)
      $('#songName').text(sleepyQueue[0].track_name);        
      sleepyQueue.splice(0,1);
      counter++;
      if (sleepyAudio.volume - 0.5 >= 0)
        sleepyAudio.volume = sleepyAudio.volume - 0.5;
    }
    else { // out of sleepy music
      sleepyAudio.pause();
      setTimeout(function() {
        playWakeyMusic()
      },5000);// time should be fifteen min before alarm
      // alarm - current time - 15min
    }
  });
}

function playWakeyMusic() {
  wakeyAudio = new Audio('point1sec.mp3');
  wakeyAudio.play();
  wakeyAudio.addEventListener('ended',function(){ 
    if (wakeyQueue.length > 0) {
      wakeyAudio.src = wakeyQueue[0].preview_url;
      wakeyAudio.pause();
      wakeyAudio.load();
      wakeyAudio.play();
      $('#albumCover').attr('src',wakeyQueue[0].album_image);
      $('#albumName').text(wakeyQueue[0].album_name)
      $('#artistName').text(wakeyQueue[0].artist_name)
      $('#songName').text(wakeyQueue[0].track_name);
      wakeyQueue.splice(0,1);
      if (wakeyAudio.volume + 0.025 <= 1)
        wakeyAudio.volume = wakeyAudio.volume + 0.025;
    }
    else {
      wakeyAudio.pause();
    }
  });
}

function listenForPlays() {
  $('.play').click(function() {    
    src = $($(this).children('audio')[0]).children('source').attr('src');    
    if (samplerAudio.src === src) {
      console.log('playing')
      samplerAudio.pause();
      button = $(this).children('span');
      button.removeClass('glyphicon-pause');
      button.addClass('glyphicon-play');
    }
    else {
      console.log('else');
      stopAllTracks();
      samplerAudio.pause();
      samplerAudio.src = src;
      samplerAudio.load();
      samplerAudio.play();
      button = $(this).children('span');
      button.removeClass('glyphicon-play');
      button.addClass('glyphicon-pause');
    }
  })
  samplerAudio.addEventListener('ended',function() {
    stopAllTracks();
  });
}

function stopAllTracks() {
  $('.play').children('span').each(function() {
    $(this).removeClass('glyphicon-pause');
    $(this).addClass('glyphicon-play');
  });
}

function initializeAlarmView() {
    $('#sleepView').css('display','block');
    $('#alarmView').css('display','none');
    $('#snoozeView').css('display','none');
}

getSleepySongs(queueSleepylist);

$(document).ready(function() {    
    $('#alarmMusicView').css('display','none');
    initializeAlarmView();
    $('#playlistView').css('display','none');

    $('#genreList').on('click','.list-group-item',function(e) {
        selectGenres.push(e.target.text);
        toggleActive(e.target);
    });

});
