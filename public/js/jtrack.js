var jTask = {
	showArchived: false,
	showCompleted: false,
	intervals: [],
	timer: [],
	bind: function () {
                $(".jtrack-power").live("click", function (e) {
			e.preventDefault();
			jTask.toggleTimer($(this), $(this).attr("rel"));
		})
                $('#myprojects tr.myprojectslist').each(function() {
                         var namespace = $(this).find(".jtrack-task-name").data("cli");  
                          if ($.DOMCached.get('estimate', namespace) === null) {
                          	$.DOMCached.set('estimate', "estimate", false, namespace);    
                          	$.DOMCached.set('timer', 0, false, namespace);
			  	$.DOMCached.set('started', false, false, namespace);
		 	  	$.DOMCached.set('completed', false, false, namespace);
                          	var d = new Date();
		          	var created = [d.getDate(), d.getMonth() + 1, d.getFullYear()]; 
		          	$.DOMCached.set('created', created.join("."), false, namespace);
                          	jTask.index();     
			 }
                });
		//var namespace = $(".jtrack-task-name").data("cli");                
               
                
	},
	index: function () {
		var p = '',
                        anchor ='',
			conditions = [],
			created,
			archived,
			completed,
			namespace,
			started = [],
			storage = $.DOMCached.getStorage();
                
		conditions.push('true');
                if (!this.showArchived) {
			conditions.push('!archived');
		}
		if (!this.showCompleted) {
			conditions.push('!completed');
		}
		for (namespace in storage) {
                   completed = $.DOMCached.get("completed", namespace);
                    
                   if (eval(conditions.join(' && '))) {        

			created = $.DOMCached.get("created", namespace);							
			started[namespace] = $.DOMCached.get("started", namespace);
			jTask.timer[namespace] = $.DOMCached.get("timer", namespace);	
                        $('#myprojects tr.myprojectslist td.starttimer-'+namespace).append('<span class="jtrack-timer-'+namespace+'">' 
                                                                                  + this.hms(jTask.timer[namespace]) + '</span>');
                        $('#myprojects tr.myprojectslist td.starttimertext-'+namespace).append('<a href="#" class="jtrack-power' + (started   [namespace] ? 
                                                                           ' jtrack-power-on' : '') + '" title="Timer on/off" rel="' + namespace + '"></a>');
 			//p += '<span class="jtrack-timer-'+namespace+'">' + this.hms(jTask.timer[namespace]) + '</span>'; 
                        //anchor += '<a href="#" class="jtrack-power' + (started[namespace] ? ' jtrack-power-on' : '') + '" title="Timer on/off" rel="' + namespace + '"></a>';
                       if (started[namespace]) {
					this.timerScheduler(namespace);
		       }
 		   }
                    
                }
 		//console.log(p);
                
                             
	},
	init: function () {
		this.bind();
		this.index();
	},
	timerScheduler: function (namespace) {
                
		clearInterval(this.intervals[namespace]);
		this.intervals[namespace] = setInterval(function () {
			if ($.DOMCached.get("started", namespace)) {
				jTask.timer[namespace]++;
				$.DOMCached.set("timer", jTask.timer[namespace], false, namespace);
                                var stringname = ".starttimertext-"+namespace+".jtrack-timer-"+namespace;                               
                                $(".jtrack-power[rel='" + namespace + "']").closest('td').prev('td').text(jTask.hms(jTask.timer[namespace]));
                                // console.log(pn);
                               //$(".starttimertext-"+namespace+" .jtrack-timer-"+namespace+"").text(jTask.hms(jTask.timer[namespace]));
			   
			}
		}, 1000);
	},
	toggleTimer: function (jQ, namespace) {
		if (!$.DOMCached.get("started", namespace)) {
			$.DOMCached.set("started", true, false, namespace);
			this.timer[namespace] = $.DOMCached.get("timer", namespace);
			this.timerScheduler(namespace);
			jQ.addClass("jtrack-power-on");
		} else {
			$.DOMCached.set("started", false, false, namespace);
			jQ.removeClass("jtrack-power-on");
		}
	},
	hms: function (secs) {
		secs = secs % 86400;
		var time = [0, 0, secs], i;
		for (i = 2; i > 0; i--) {
			time[i - 1] = Math.floor(time[i] / 60);
			time[i] = time[i] % 60;
			if (time[i] < 10) {
				time[i] = '0' + time[i];
			}
		}
		return time.join(':');
	}
};
