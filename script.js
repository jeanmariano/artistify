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
    // getWakeySongs(display,selectGenres)
    goToView('sleep','main');
    $('#genreList .list-group-item').removeClass('active');
    selectGenres = [];
    playMusic();
}

function cancelAlarm() {
    goToView('main','sleep');
    audio.pause();
}

function display(list) {
    console.log(list)
}

function queueSongs(list) {
    queue = queue.concat(list);
}
    
// }
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

getSleepySongs(queueSongs);

$(document).ready(function() {
    startTime()
    checkTime()
    $('#sleepView').css('display','none');
    $('#alarmView').css('display','none');
    $('#snoozeView').css('display','none');
    $('#playlistView').css('display','none');

    $('#genreList').on('click','.list-group-item',function(e) {
        selectGenres.push(e.target.text);
        toggleActive(e.target);
    });

});
