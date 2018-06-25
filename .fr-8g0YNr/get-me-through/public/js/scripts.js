$(document).ready(function () { 
 var socket = io();
 var firstTime = true;
        $('.button-collapse').sideNav(); 
        $('select').material_select();
    $(".ripple-effect").on('click', function() {
var ripple = "<span class='ripple'></span>";
$(this).append(ripple);
setTimeout(function() {
$(".ripple").remove()
}, 800);
});   
      $('#example').dataTable();

 $('#run-button').on('click', function () {
            liveUpdates = true;
            $('#run-button').addClass('disabled');
            $('#stop-button').removeClass('disabled');

            if (firstTime) {
                socket.emit('receive liveUpdates');
                $('#halt-resume').removeClass('disabled');
                firstTime = false;
            } else {
                socket.emit('resume liveUpdates');
            }
});
 $('#stop-button').on('click', function () {
            firstTime = true;
            $(this).addClass('disabled');
            $('#halt-resume').html('Halt<i class="material-icons right">thumbs_up_down</i>');
            $('#halt-resume').addClass('disabled');
            socket.emit('stop liveUpdates');
            $('.collapsible').empty();
            $('.collapsible').hide();
});
$('#halt-resume').on('click', function () {
            if (liveUpdates) {
                // liveUpdates ON so turn it OFF
                liveUpdates = false;
                socket.emit('halt liveUpdates');
                // change text
                $(this).html('<i class="material-icons right">thumbs_up_down</i>Resume');
                var $toastContent = $('<span><i class="material-icons">report_problem</i>Live Updates, halted!</span>');
                Materialize.toast($toastContent, 5000);
            } else {
                liveUpdates = true;
                socket.emit('resume liveUpdates');
                $(this).html('Halt<i class="material-icons right">thumbs_up_down</i>');
                var $toastContent = $('<span><i class="material-icons">done</i>Live Updates, resumed!</span>');
                Materialize.toast($toastContent, 5000);
            }
});

});


