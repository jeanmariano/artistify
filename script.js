var selectGenres = [],
    sleepyQueue = [],
    wakeyQueue = [],
    sleepyAudio = new Audio(),
    wakeyAudio = new Audio(),
    samplerAudio = new Audio(),
    alarmTime = {'hour': 0, 'minute': 0, 'seconds': 0, 'string': '', 'dateObj': undefined},
    timeLeft = {'hour': 0, 'minute': 0, 'seconds': 0},
    snoozeTime = 1,
    endtime = new Date(),
    sleepyList = [];
    wakeyList = [];

var counter = 1;

// time display
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
  h = checkTime(h);
  $('#clock').text(h + ":" + m + "" + p);
  var t = setTimeout(startTime, 500);
}

// adds a leading zero
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

// countdown handler
function initializeClock(id) {
  var clock = document.getElementById(id);
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');
  var ended = false
  
  function updateClock(ended) {
    var t = getTimeRemaining(endtime);

    if (t.total > 0) {
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      if (t.minutes === 15 && t.seconds === 0) {
        playWakeyMusic();
      }            
    }
    else {
      clearInterval(timeinterval);
      alarmGo();
      ended = true;
    }    
  }
  if (!ended) {
    updateClock(ended);
  }
  var timeinterval = setInterval(updateClock, 1000);
}

// countdown
function getTimeRemaining(time) {
  var t = Date.parse(time) - Date.now();
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

// calculates the alarm time as a Date object
function calculateEndTime(time) {
  var date = new Date();

  date.setHours(time.hour);
  date.setMinutes(time.minute);
  date.setSeconds(time.seconds);

  if (endtime >= date) {
    date.setHours(date.getHours() + 24);
  }  
  endtime = date;
  initializeClock('countdown');
}

// toggles div views
function toggleView(id) {
  toggleDisplay(id+'View');
}

// toggles element display
function toggleDisplay(id) {
  if ($('#'+id).css('display') === 'none') {
    $('#'+id).css('display','block');
  }
  else
    $('#'+id).css('display','none');
}

// toggles element to have active class
function toggleActive(obj) {
  if ($(obj).hasClass('active'))
    $(obj).removeClass('active');
  else
    $(obj).addClass('active');
}

// switches from one div view to another
function goToView(from,to) {
  toggleView(from);
  toggleView(to);
  window.scrollTo(0,0);
}

// starts sleep mode
function sleepNow(from) {
  initializeMainView()
  if (wakeyQueue.length === 0) {
    getWakeySongs(queuePlaylist,selectGenres);
  }
  else {
    renderPlaylist();
  }
  goToView('alarmMusic',from);
  playSleepyMusic();
  startTime()
  checkTime()  
  alarmTime.dateObj = calculateEndTime(alarmTime);
  $('#alarmTime').text(alarmTime.string);
}

// starts alarm mode
function alarmGo() {
  playWakeyMusic();
  goToView('alarm','sleep');
}

function snoozeAlarm() {
  goToView('snooze','alarm');
  wakeyAudio.pause();
  // var snoozeTo = new Date(Date.now()+snoozeTime*60*1000);
  $('#snoozeTime').text(snoozeTime);
  setTimeout(function() {
    wakeyAudio.play();
    goToView('alarm','snooze');
  },snoozeTime*60*1000);
}

// ends alarm mode
function wakeUp() {
  sleepyAudio.pause() // should be redundant in final
  wakeyAudio.pause();
  goToView('playlist','alarmMusic');
  initializeAlarmView();
}

// save alarm session
function save() {
  saveAlarm(alarmTime.string,selectGenres);
}

// cancel alarm session
function cancelAlarm(to,from) {
  var c = confirm("Do you really want to cancel this alarm?");
  if (c === true) {
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
}

// create alarm view
function createAlarm() {
  goToView('main','menu');
  getSleepySongs(queueSleepylist);
}

// new alarm session
function newAlarm() {
  goToView('main','playlist');
  // sleepyAudio.pause();
  sleepyQueue = [];
  wakeyQueue = [];  
  wakeyList = [];
  sleepyAudio.volume = 1;
  wakeyAudio.volume = 0.1;
  counter =1;  
  getSleepySongs(queueSleepylist);
}

//
function goHome() {
  goToView('menu','playlist');
  // sleepyAudio.pause();
  sleepyQueue = [];
  wakeyQueue = [];
  wakeyList = [];
  sleepyAudio.volume = 1;
  wakeyAudio.volume = 0.1;
  counter =1;
}

// plays sleepy music
function playSleepyMusic() {
  sleepyAudio = new Audio('point1sec.mp3'); // buffer track
  sleepyAudio.play();
  sleepyAudio.addEventListener('ended',function(){
    if (sleepyQueue.length > 0) { // uncomment this for test
    // if (counter < 2) { // test
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
      if (sleepyAudio.volume - 0.05 >= 0)
        sleepyAudio.volume = sleepyAudio.volume - 0.05;
    }
    else { // out of sleepy music
      sleepyAudio.pause();
      $('#albumCover').attr('src','');
      $('#albumName').text('');
      $('#artistName').text('');
      $('#songName').text('Nothing playing.');
    }
  });
}

// plays wakey music
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

// queues alarm music
function queuePlaylist(list) {
  wakeyQueue = list;
  wakeyList = list;
  renderPlaylist();
}

// queues sleepy music
function queueSleepylist(list) {
  sleepyQueue = list;
  sleepyList = list;
}

// event listener for playlist mode
function listenForPlays() {
  $('.play').click(function() {
    src = $($(this).children('audio')[0]).children('source').attr('src');
    if (samplerAudio.src === src) {
      samplerAudio.pause();
      button = $(this).children('span');
      button.removeClass('glyphicon-pause');
      button.addClass('glyphicon-play');
    }
    else {
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

// pauses all tracks
function stopAllTracks() {
  $('.play').children('span').each(function() {
    $(this).removeClass('glyphicon-pause');
    $(this).addClass('glyphicon-play');
  });
}

// renders all the songs in the alarm playlist into the DOM
function renderPlaylist() {
  $('#alarmtester').css('display','block');
  list = wakeyQueue;
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

// renders a song in the playlist as an html element
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

// renders an alarm object as an html element
function renderAlarm(id,name,genres,alarm,snooze) {
  var genrehtml = '';
  if (genres.length === 0) {
    genrehtml = 'All  ';
  }
  else {
    for (var i=0; i< genres.length; i++) {
      genrehtml = genrehtml + genres[i] + ', ';
    }
  }
  genrehtml = genrehtml.substring(0,genrehtml.length-2);
  var html = '<a class="list-group-item alarmItem">'+
    '<div class="pull-right">'+
    '<button onclick="deleteSavedAlarm('+id+')" class="btn btn-sm btn-danger">Delete</button> '+
    '<button data-dismiss="modal" onclick="loadSavedAlarm('+id+')" class="btn btn-sm btn-primary">Load Alarm</button>'+
    '</div>'+
    '<h3>'+name+'</h3>'+
    '<b>Alarm Time: </b>'+alarm+'<br>'+
    '<b>Snooze Time: </b>'+snooze+'<br>'+
    '<b>Genres: </b>'+genrehtml+'<br>'+
    '</a>';
  return html 
}

// renders all the alarms into the DOM
function displayAlarms() {
  $("#alarmsModalBody").empty();
  alarms = getAlarms();
  var html = '';
  for (var i=0; i < alarms.length; i++) {
    var a=alarms[i];
    html = html + renderAlarm(a.id,a.name,a.genres, a.time,a.snooze_time);
  }
  $("#alarmsModalBody").append(html);
}

// set edit to alarm params
function setEditModal() {
  setGenreButtons();
  $("#editHours").get(0).selectedIndex = $('#selectHours option:selected').index();
  $("#editPeriod").get(0).selectedIndex = $('#selectPeriod option:selected').index();
  $("#editMin").get(0).selectedIndex = $('#selectMin option:selected').index();
  $("#editSnoozeDrop").get(0).selectedIndex = $('#snoozeDrop option:selected').index();
  $("#editSleepyTime").get(0).selectedIndex = $('#sleepyTime option:selected').index();
}

// save edits
function saveModalChanges() {
  setSelectFields();
  // alarmTime.hour = parseInt($('#editHours option:selected').text());
  // alarmTime.minute = parseInt($('#editMin option:selected').text());
  var p = $('#editPeriod').val(),
      h = parseInt($('#editHours').val(),10),
      m = parseInt($('#editMin').val(),10);
  if (p === 'PM' && h < 12) { // 1PM - 11PM
    h = h+12;
  }
  else if (p === 'AM' && h === 12) {
    h = 0;
  }
  snoozeTime = parseInt($('#editSnoozeDrop').val(),10);
  alarmTime.hour = h;
  alarmTime.minute = m;
  alarmTime.string = $('#selectHours').val() + ":" + $('#selectMin').val() + p;
  $('#alarmTime').text(alarmTime.string);
  alarmTime.dateObj = calculateEndTime(alarmTime);
  getWakeySongs(queuePlaylist,selectGenres);
}

// set select for edit
function setSelectFields() {
  $("#selectHours").get(0).selectedIndex = $('#editHours option:selected').index();
  $("#selectPeriod").get(0).selectedIndex = $('#editPeriod option:selected').index();
  $("#selectMin").get(0).selectedIndex = $('#editMin option:selected').index();
  $("#snoozeDrop").get(0).selectedIndex = $('#editSnoozeDrop option:selected').index();
  $("#sleepyTime").get(0).selectedIndex = $('#editSleepyTime option:selected').index();
}

// set genre buttons for edit
function setGenreButtons() {
  $('a', $('#genreListModal')).each(function () {
    if (selectGenres.indexOf($(this).text()) > -1) {
      $(this).addClass('active');
    }
  });
}

// save
function saveAlarmModal() {
  var name = $("#alarm-name").val();
  if (name === "") {
    console.log("noname");
  } else {
    saveAlarm(name, alarmTime.string, selectGenres, wakeyList, sleepyList, $("#snoozeDrop").val())
    $("#alarmSaveModal").modal('hide');
    alert('Alarm saved.');
  }
  displayAlarms();
}

// load a saved alarm
function loadSavedAlarm(id) {
  alarm = loadAlarm(id);
  selectGenres = alarm.genres;
  sleepyQueue = alarm.sleepy_music;
  wakeyQueue = alarm.songs;
  wakeyList = wakeyQueue;
  alarmTime.string = alarm.time;
  alarmTime.hour = parseInt(alarm.time.substring(0,2),10);
  alarmTime.minute = parseInt(alarm.time.substring(3,5),10);
  alarmTime.p = alarm.time.substring(5,7);
  sleepNow('menu');
}

// delete a saved alarm
function deleteSavedAlarm(id) {
  var c = confirm('Do you really want to delete this alarm?');
  if (c === true) {
    deleteAlarm(id);
    displayAlarms();
  }
}

// initializes view for alarm
function initializeAlarmView() {
  $('#sleepView').css('display','block');
  $('#alarmView').css('display','none');
  $('#snoozeView').css('display','none');
}

// initialize create alarm view
function initializeMainView() {
  $('#page1').css('display','block');
  $('#page2').css('display','none');
}

// initialize genres
function initializeGenres() {
  $('#genreList').css('display','none');
  $('#specifyNo').addClass('btn-primary');
  $('#specifyYes').removeClass('btn-primary');
  $('#genreList .list-group-item').removeClass('active');
  selectGenres = [];
}

// page 1 --> page two of create alarm
function next() {
  toggleDisplay('page1');
  toggleDisplay('page2');
  var p = $('#selectPeriod').val(),
      h = parseInt($('#selectHours').val(),10),
      m = parseInt($('#selectMin').val(),10);
  if (p === 'PM' && h < 12) { // 1PM - 11PM
    h = h+12;
  }
  else if (p === 'AM' && h === 12) {
    h = 0;
  }
  snoozeTime = parseInt($('#snoozeDrop').val(),10);
  alarmTime.hour = h;
  alarmTime.minute = m;
  alarmTime.string = $('#selectHours').val() + ":" + $('#selectMin').val() + p;  
}

// page 1 <-- page 2 of create alarm
function back() {
  toggleDisplay('page1');
  toggleDisplay('page2');
}

// style handler for genre list
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

// dom events and renders
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

  displayAlarms();

  var p = $('#selectPeriod').val(),
      h = parseInt($('#selectHours').val(),10),
      m = parseInt($('#selectMin').val());

  if (p === 'PM' && h < 12) { // 1PM - 11PM
    h = h +12;
  }
  else if (p === 'AM' && h === 12) {
    h = 0;
  }

  for (i=1;i<=12;i++) {
    var j = i;
    if (i < 10) {
      j = '0'+i;
    }
    $('#selectHours').append($('<option></option>').val(j).html(j));
    $('#editHours').append($('<option></option>').val(j).html(j));

  }
  for (i=0;i<60;i++) {
    var j = i;
    if (i < 10) {
      j = '0'+i;
    }
    $('#selectMin').append($('<option></option>').val(j).html(j));
    $('#editMin').append($('<option></option>').val(j).html(j));

  }
  for (i=1;i<=20;i++) {
    if (i !== 5) {
      $('#snoozeDrop').append($('<option></option>').val(i+' min').html(i+' min'));
      $('#editSnoozeDrop').append($('<option></option>').val(i+' min').html(i+' min'));
    }
    else {
      $('#snoozeDrop').append($('<option selected="selected"></option>').val(i).html(i+' min'));
      $('#editSnoozeDrop').append($('<option selected="selected"></option>').val(i).html(i+' min'));
    }
  }

  $('#alarmtester').css('display','none');
});