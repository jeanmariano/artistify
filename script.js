var selectGenres = [],
    sleepyQueue = [],
    wakeyQueue = [],
    sleepyAudio = new Audio(),
    wakeyAudio = new Audio(),
    samplerAudio = new Audio(),
    alarmTime = {'hour': 0, 'minute': 0, 'seconds': 0, 'string': '', 'dateObj': undefined},
    timeLeft = {'hour': 0, 'minute': 0, 'seconds': 0}
    snoozeTime = 1;
    endtime = new Date();

var counter = 1;

function startTime() {
  var today = new Date();
  var h = today.getHours(),
      m = today.getMinutes(),
      s = today.getSeconds(),
      p = '';
  m = checkTime(m);
  s = checkTime(s);
  if (h <= 12) {
    p = 'AM';
  }
  else {
    p = 'PM'
  }
  if (h > 12) {
    h = h - 12;
  }
  $('#clock').text(h + ":" + m + "" + p);
  var t = setTimeout(startTime, 500);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function toggleView(id) {
  toggleDisplay(id+'View');
}

function toggleDisplay(id) {
  if ($('#'+id).css('display') === 'none') {
    $('#'+id).css('display','block');
  }
  else
    $('#'+id).css('display','none');
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

function calculateEndTime(time) {
  var h = time.hour - endtime.getHours();
  var m = time.minute - endtime.getMinutes();
  var s = time.seconds - endtime.getSeconds();
  if (h < 0) {
    h = h + 24;
  }
  endtime.setSeconds(endtime.getSeconds() + s);
  endtime.setMinutes(endtime.getMinutes() + m);
  endtime.setHours(endtime.getHours() + h);
  console.log(endtime)
  console.log(Date.parse(endtime) - Date.now())
  $('#alarmTime').text(alarmTime.string);
  initializeClock('countdown')
}

function sleepNow() {
  initializeMainView()
  getWakeySongs(queuePlaylist,selectGenres);
  goToView('alarmMusic','main');
  console.log(selectGenres);
  playSleepyMusic();
  startTime()
  checkTime()
  alarmTime.dateObj = calculateEndTime(alarmTime);
  $('#alarmTime').text(alarmTime.string);
}

function wakeUp() {
  sleepyAudio.pause() // should be redundant in final
  wakeyAudio.pause();
  goToView('playlist','alarmMusic');
  initializeAlarmView();
}

function save() {
  saveAlarm(alarmTime.string,selectGenres);
}

function alarmGo() {
  // playWakeyMusic();
  goToView('alarm','sleep');
}

function snoozeAlarm() {
  goToView('snooze','alarm');
  wakeyAudio.pause();
  setTimeout(function() {
    wakeyAudio.play();
    goToView('alarm','snooze');
  },2500);
}

function cancelAlarm(to,from) {
  goToView('menu',from);
  initializeGenres();
  sleepyAudio.pause();
  wakeyAudio.pause();
  // for testing purposes only-- there won't be a point that will a user will want to cancel during an alarm
  sleepyQueue = [];
  wakeyQueue = [];
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
      // setTimeout(function() {
      //   playWakeyMusic()
      // },5000);// time should be fifteen min before alarm
      // alarm - current time - 15min
    }
  });
}

function playWakeyMusic() {
  sleepyAudio.pause();
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

function initializeMainView() {
  $('#page1').css('display','block');
  $('#page2').css('display','none');
}

function initializeGenres() {
  $('#genreList').css('display','none');
  $('#specifyNo').addClass('btn-primary');
  $('#specifyYes').removeClass('btn-primary');
  $('#genreList .list-group-item').removeClass('active');
  selectGenres = [];
}

function next() {
  toggleDisplay('page1');
  toggleDisplay('page2');

  var p = $('#selectPeriod').val(),
      h = parseInt($('#selectHours').val(),10),
      m = parseInt($('#selectMin').val());

  if (p === 'PM' && h < 12) { // 1PM - 11PM
    h = h +12;
  }
  else if (p === 'AM' && h === 12) {
    h = 0;
  }
  alarmTime.hour = h;
  alarmTime.minute = m;
  // var today = new Date();
  // alarmTime.seconds = today.getSeconds();
  alarmTime.string = $('#selectHours').val() + ":" + $('#selectMin').val() + p;
  console.log(alarmTime);
}

function back() {
  toggleDisplay('page1');
  toggleDisplay('page2');
}

function showGenres(bool) {
  if (bool) {
    $('#genreList').css('display','block');
    $('#specifyYes').addClass('btn-primary');
    $('#specifyNo').removeClass('btn-primary');
  }
  else {
    $('#genreList').css('display','none');
    selectGenres = [];
    $('a', $('#genreList')).each(function () {
      $(this).removeClass('active');
    });
    $('#specifyNo').addClass('btn-primary');
    $('#specifyYes').removeClass('btn-primary');
  }
}

function createAlarm() {
  goToView('main','menu');
}

// countdown
function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.now();
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  return {
    'total': t,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id) {
  var clock = document.getElementById(id);
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var t = getTimeRemaining(endtime);

    if (t.total > 0) {
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
    }
    else {
      clearInterval(timeinterval);
      alarmGo();
    }
    if (t.minutes === 15 && t.seconds === 0) {
      playWakeyMusic();
    }
  }
  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}
// end countdown

getSleepySongs(queueSleepylist);

$(document).ready(function() {
  $('#alarmMusicView').css('display','none');
  $('#playlistView').css('display','none');
  initializeAlarmView();
  initializeMainView();
  initializeGenres();
  $('#mainView').css('display','none');

  $('#genreList').on('click','.list-group-item',function(e) {
    var index = selectGenres.indexOf(e.target.text);
    if (index > -1) {
      selectGenres.splice(index, 1);
    } else {
      selectGenres.push(e.target.text);
    }
    toggleActive(e.target);
  });

  $('#genreListModal').on('click','.list-group-item',function(e) {
    var index = selectGenres.indexOf(e.target.text);
    if (index > -1) {
      selectGenres.splice(index, 1);
    } else {
      selectGenres.push(e.target.text);
    }
    toggleActive(e.target);
  });

  for (i=1;i<=12;i++) {
    var j = i;
    if (i < 10) {
      j = '0'+i;
    }
    $('#selectHours').append($('<option></option>').val(j).html(j));
    $('#editHours').append($('<option></option>').val(j).html(j));

  }
  for (i=1;i<=60;i++) {
    var j = i;
    if (i < 10) {
      j = '0'+i;
    }
    $('#selectMin').append($('<option></option>').val(j).html(j));
    $('#editMin').append($('<option></option>').val(j).html(j));

  }
  for (i=1;i<=20;i++) {
    $('#snoozeDrop').append($('<option></option>').val(i+' min').html(i+' min'));
    $('#editSnoozeDrop').append($('<option></option>').val(i+' min').html(i+' min'));

  }
});

function setEditModal() {
  setGenreButtons();
  $("#editHours").get(0).selectedIndex = $('#selectHours option:selected').index();
  $("#editPeriod").get(0).selectedIndex = $('#selectPeriod option:selected').index();
  $("#editMin").get(0).selectedIndex = $('#selectMin option:selected').index();
  $("#editSnoozeDrop").get(0).selectedIndex = $('#snoozeDrop option:selected').index();
  $("#editSleepyTime").get(0).selectedIndex = $('#sleepyTime option:selected').index();
}

function saveModalChanges() {
  setSelectFields();
  alarmTime.hour = parseInt($('#editHours option:selected').text());
  alarmTime.minute = parseInt($('#editMin option:selected').text());
  var p = $('#selectPeriod').val();
  snoozeTime = $("#snoozeDrop").val();
  alarmTime.string = $('#selectHours').val() + ":" + $('#selectMin').val() + p;
  alarmTime.dateObj = calculateEndTime(alarmTime);
  getWakeySongs(queuePlaylist,selectGenres);

}

function setSelectFields() {
  $("#selectHours").get(0).selectedIndex = $('#editHours option:selected').index();
  $("#selectPeriod").get(0).selectedIndex = $('#editPeriod option:selected').index();
  $("#selectMin").get(0).selectedIndex = $('#editMin option:selected').index();
  $("#snoozeDrop").get(0).selectedIndex = $('#editSnoozeDrop option:selected').index();
  $("#sleepyTime").get(0).selectedIndex = $('#editSleepyTime option:selected').index();
}

function setGenreButtons() {

  $('a', $('#genreListModal')).each(function () {
    if (selectGenres.indexOf($(this).text()) > -1) {
      $(this).addClass('active');
    }
  });
}
