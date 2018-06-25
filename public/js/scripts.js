$(document).ready(function () {
 var next = 1;
    $(".add-more").click(function(e){
      var fieldHTML = '<div class="row fieldgroup">'+$(".fieldGroupCopy").html()+'</div>';
      $('body').find('.row:last').after(fieldHTML);
      $('select').material_select();  
      $(document.body).on('change', '#activity_category' ,function(){ 
         var  aid = $(this).val();
          if(aid){
            appendajax(aid);
          }
      });
    }); 
    $(document.body).on('click', '.btn-remove' ,function(){
                $(this).parents(".fieldgroup").remove();
    });
  $('#activity_category').change(function(){
        var  id = $(this).val();
        if(id){
          theAjax(id);
        }
        
    });

function appendajax(id){
   $.ajax({
        type: 'POST',
        url: '/departments/subcategory',
        data: {
          activity_category: id,
        },
      success: function(data){
           $('#activity_subcategory').find('option').remove().end(); 
           if (data.length == 0){   
             $('#activity_subcategory').find('option').remove().end(); 
             $('#activity_subcategory').append('<option value=""disabled selected>Select Sub Category</option>');
             $('select').material_select(); 
           } 
           else{
              
              $.each(data, function(index, el) {
                  // $(document.body).attr('id', 'activity_subcategory').appendTo('<option value="'+ el._id +'">'+ el.activicty_name +'</option>');
                  //$('#activity_subcategory').append('<option value="'+ el._id +'">'+ el.activicty_name +'</option>');
                  $('select').material_select(); 
              });
           }
      },
      error: function(){
      }
   });
}
function theAjax(id){
     $.ajax({
        type: 'POST',
        url: '/departments/subcategory',
        data: {
          activity_category: id,
        },
        success: function(data){
          $('#activity_subcategory').find('option').remove().end();         
          if (data.length == 0){   
             $('#activity_subcategory').find('option').remove().end(); 
             $('#activity_subcategory').append('<option value=""disabled selected>Select Sub Category</option>');
             $('select').material_select(); 
          }
          else{
            $.each(data, function(index, el) {
                  $('#activity_subcategory').append('<option value="'+ el._id +'">'+ el.activicty_name +'</option>');
                  $('select').material_select(); 
              });
          }
            
        },
        error: function(){
              $('#activity_subcategory').empty(); 
              $('select').material_select();  
        }
    });

}
$('.timepicker').pickatime({
    default: 'now',
    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
    donetext: 'OK',
  autoclose: false,
  vibrate: true // vibrate the device when dragging clock hand
});
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false // Close upon selecting a date,
  });

      
$('.tabs').tabs();
 var socket = io();
 var firstTime = true;
$('.button-collapse').sideNav(); 
$('select').material_select();        
$('#categorycolor').colorpicker({ });
$(".ripple-effect").on('click', function() {
var ripple = "<span class='ripple'></span>";
$(this).append(ripple);
setTimeout(function() {
$(".ripple").remove()
}, 800);
});   

 $('.modal').modal({
      dismissible: true, 
      ready: function(modal, trigger) { 
         $('body').addClass("filter-popup");
         $( ".daterange" ).trigger( "click" );

      },
      complete: function() {     $('body').removeClass("filter-popup");} 
    }
  );
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
 $('#shiftstable').DataTable( {
        initComplete: function () {
            this.api().columns('.select-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="shift-search-input-shiftname"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter_shiftlist .inner")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".shift-search-input-shiftname option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });
           
       }
});

 $('#userstable').DataTable( {
        initComplete: function () {
            this.api().columns('.select-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="user-search-input-name"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter_userlist .inner")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".user-search-input-name option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });
            this.api().columns('.category-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="user-search-input-category"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter_userlist .inner")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".user-search-input-category option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });
            this.api().columns('.department-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="user-search-input-department"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter_userlist .inner")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".user-search-input-department option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });
       }
});



 $('#attendance').DataTable( {
        initComplete: function () {
            this.api().columns('.select-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var select = $('<select class="employee-search-input-name"><option value="">'+datatitle +'</option></select>')   
                    .appendTo($("#expand_filter .inner .attendancename"))            
                     save.click(function() {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(".employee-search-input-name option:selected").val()
                        );
                        
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                     });
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
                $('select').material_select();        
            } );
            this.api().columns('.select-category-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="user-search-input-category"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter .inner .attendancecategory")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".user-search-input-category option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });
             this.api().columns('.select-department-filter').every( function (index) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var save = $(".modal-filter-save");  
                var userselect = $('<select class="user-search-input-department"><option value="">'+datatitle +'</option></select>')   
                .appendTo($("#expand_filter .inner .attendancedepartment")) 
                 save.click(function() {
                    var val = $.fn.dataTable.util.escapeRegex(
                            $(".user-search-input-department option:selected").val()
                        );
                    column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                 });        
                column.data().unique().sort().each( function ( d, j ) {
                    userselect.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            });

            this.api().columns('.select-datepicker').every( function (index ) {
                var column = this; 
                var colheader = this.header();
                var datatitle = $(colheader).text().trim();
                var datepickertext = $('<div class="input-prepend input-group"><span class="add-on input-group-addon"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i></span><input type="text" style="width: 200px" name="' + datatitle.replace(/ /g, '') + '"  placeholder="Search ' +datatitle + '" class="form-control daterange"/></div> <div id="filier_date"> </div>')
                .appendTo($("#expand_filter .inner .attendancedate"))                
           });
        }
    });
      
   
   
    $('.daterange').daterangepicker({
        ranges: {
            "Today": [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 last days': [moment().subtract(6, 'days'), moment()],
            '30 last days': [moment().subtract(29, 'days'), moment()],
            'This month': [moment().startOf('month'), moment().endOf('month')],
            'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Blank date': [moment("0001-01-01"), moment("0001-01-01")]
        }
        ,   
        parentEl:'#filier_date',
        autoUpdateInput: false,
        opens: "right",
         //timePicker: true,
       // timePicker24Hour: true,
        timePickerIncrement: 10,
        locale: {
            cancelLabel: 'Clear',
            format: 'DD-MMM-YYYY'
        }
    });
     $('select').material_select();    
    var startDate;
    var endDate;
    var dataIdx; 
    $("#attendance thead").on("mousedown", "th", function (event) {
        var visIdx = $(this).parent().children().index($(this));
        dataIdx = table.column.index('fromVisible', visIdx);  console.log(dataIdx)        
    });
     function parseDateValue(rawDate) {

        var d = moment(rawDate, "DD-MMM-YYYY").format('DD-MM-YYYY');
        var dateArray = d.split("-");
        var parsedDate = dateArray[2] + dateArray[1] + dateArray[0];
        return parsedDate;
    }
    
    //filter Date range
   var table = $('#attendance').DataTable();
});
