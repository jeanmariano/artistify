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

$(document).ready(function() {
    startTime()
    checkTime()        
    $('#sleepView').css('display','none');    
    $('#alarmView').css('display','none'); 
    $('#snoozeView').css('display','none');    
    $('#playlistView').css('display','none'); 
});