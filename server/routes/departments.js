var express = require('express');
var session = require('express-session');
var socket_io = require( "socket.io" );
var router = express.Router();
var io = socket_io();
router.io = io; 
var passport = require('passport');
var path = require('path');
var multer = require('multer');
var LocalStrategy = require('passport-local').Strategy;
var Handlebars = require('handlebars');
var paginate = require('handlebars-paginate');
Handlebars.registerHelper('date', require('helper-date'));
var train = require('../routes/train');
var fs = require('fs');
var sess;
var User = require('../models/user');
var Department = require('../models/department');
var Activicty =  require('../models/activicty');
var Clients = require('../models/clients');
var Shift =  require('../models/shift');
var Projectsassigned = require('../models/projectsassigned');
var Shiftscheduler =  require('../models/shiftscheduler');
var async = require('async');
const util = require('util');

// Department
router.get('/', function(req, res){
    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Department.find({}).exec(function(err, departments) {   
         if (err) throw err;
           res.render('departments', { "departments": departments});
           
       });
    }
    else{
      res.render('login');
    }
});
router.get('/calendar', function(req, res){
    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
              
       //	var $ = require('jquery')((require("jsdom").jsdom().defaultView));
      //  var fullcalendar = require('fullcalendar');
        var eventData = [{
			title: 'event3',
			start: '2014-03-03 12:30:00',
			end: '2014-03-03 16:30:00',
			allDay: false
		},
		{
			title: 'event4',
			start: '2014-03-04 12:30:00',
			end: '2014-03-04 16:30:00',
			allDay: false
		}
        ];
        res.render('calendar',{ data: JSON.stringify(eventData) });
    }
    else{
      res.render('login');
    }
});
router.get('/add', function(req, res){
    sess = req.session;     
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
        res.render('adddepartment');
    }
    else{
      res.render('login');
    }
});
router.get('/projectsassigned', function(req, res,next){
    sess = req.session;     
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
      User.find({}).exec(function(err, users) {  
         if (err) throw err;
         Activicty.find({"parent_id":0}).exec(function(err, activicty) {  
           Clients.find({}).exec(function(err, clients) {  
              res.render('projectsassigned', { "users": users,"activicty":activicty,"clients":clients});
           
           });
          });
       });
    }
    else{
      res.render('login');
    }
});
//projectsassigned Add
router.post('/projectsassigned',function(req, res){
   var employees_schedule = req.body.employees_schedule;
   var employee_shift_date_start = req.body.employee_shift_date_start;
   var activity_category = req.body.activity_category;
   var activity_subcategory = req.body.activity_subcategory;
   var activity_clients = req.body.activity_clients;
   var date = new Date(employee_shift_date_start);  
   var newdate = new Date(date);
   newdate.setDate(newdate.getDate());
   var dd = newdate.getDate();
   var mm = newdate.getMonth();
   var y = newdate.getFullYear();
   var someFormattedDate = mm + '/' + dd + '/' + y;
   req.checkBody('employees_schedule', ' Choose your Employees').notEmpty();
   var errors = req.validationErrors();
   if(errors){   
       User.find({}).exec(function(err, users) { 
         if (err) throw err;
           res.render('projectsassigned', { errors:errors ,"users": users});
       });  
   } 
   else{
        var newProjectsassigned = new Projectsassigned({
            		employee_id: employees_schedule,
            		shift_date_start:someFormattedDate,
                        main_category:activity_category,
                        sub_category:activity_subcategory,
                        clientid:activity_clients
            		
           });
           Projectsassigned.createProjectsassigned(newProjectsassigned, function(err, projectsassigned){
              if(err) throw err;
               res.redirect('/departments/listprojectsassigned');
              return req.flash('success_msg', 'Projects assigned successfully');
           });  
   }
});

router.get('/listprojectsassigned', function(req, res,next){
	
	   User.find({}).exec(function(err, users) {   
       req.allemployess = users;
   })

    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){               
       Projectsassigned.find().exec(function(err, projects) { 
          if (err) throw err;
           res.render('listprojectsassigned', {"projects": projects});
        });
    }
    else{
      res.render('login');
    }
});
// edit Projectassignment
router.param('id', function(req, res, next, id){
       Projectsassigned.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.projectsassignedId = docs;
                next();
            }
      }); 
        User.find({}, function(err, profdoc) {
          if(err) res.json(err);
          else
            {   
               req.projectusers = profdoc

               return 
            }
      });    
      
      
});
router.get('/projectsassigned/:id/edit', function(req, res){
     sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Projectsassigned.find({}).exec(function(err, projectsassigned) {  
           Activicty.find({"parent_id":0}).exec(function(err, activicty) {  
           Clients.find({}).exec(function(err, clients) {  
           
         if(err) throw err;          
          res.render('edit-projectsassigned', { "projectsassigned": req.projectsassignedId,users:req.projectusers,"activicty":activicty,"clients":clients});
       });});
    });
     }
     else{
       res.redirect('/users/login');
     }
      

});
//Delete Projectassignment


router.get('/projectsassigned/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Projectsassigned.remove({_id: req.projectsassignedId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/departments/listprojectsassigned');
       });
    }
    else{
      res.redirect('/users/login');
    }
});
//Shift scheduler add
/*router.post('/shiftscheduler',function(req, res){
   var employees_schedule = req.body.employees_schedule;
   //var employee_shift_date_start = req.body.employee_shift_date_start;
  // v;ar shift_type = req.body.shift_type;
  // var employees_weeeks = req.body.employees_weeeks;
   //var password2 = req.body.password2;
   // Validation
   req.checkBody('employees_schedule', ' Choose your Employees').notEmpty();
   //req.checkBody('shift_type', 'Choose your Shift Type').notEmpty();
  // req.checkBody('employees_weeeks', 'Choose your weeeks').notEmpty(); 
   var errors = req.validationErrors();
   Shift.find({}).exec(function(err, shiftstype) { 
           if (err) throw err;
             else{
                req.shiftstype = shiftstype;
                 return; 
             }
       });     
      
    if(errors){   
       User.find({}).exec(function(err, users) {   

         if (err) throw err;
           res.render('shiftscheduler', { errors:errors ,"users": users,"shiftstype" : req.shiftstype});
           
       });  
        	
   } 
   else {      
     var weekslot =7;
     var employee_week_slot = employees_weeeks * weekslot;
       employees_schedule.forEach(function(entry) {
        for( var k=1;k<=employee_week_slot;k++){
               var date = new Date(employee_shift_date_start);  
                var newdate = new Date(date);
                newdate.setDate(newdate.getDate() + k);
                var dd = newdate.getDate();
                var mm = newdate.getMonth() + 1;
                var y = newdate.getFullYear();
             var someFormattedDate = mm + '/' + dd + '/' + y;
               var newShiftscheduler = new Shiftscheduler({
            		employee_id: entry,
            		shift_date_start:someFormattedDate,
                        shift_type:shift_type
            		
           });
           Shiftscheduler.createShift(newShiftscheduler, function(err, shiftscheduler){
              if(err) throw err;
               res.redirect('/departments/shiftscheduler');
              return req.flash('success_msg', 'Shift schedule added successfully');
           });  

        } 
      
   });  
    
   }
});*/
router.post('/subcategory', function(req, res){
        Activicty.find({'parent_id': req.body.activity_category}).exec(function(err, activicty){
           if(err){
            console.log(err);
           } 
           else {
              res.send(activicty);
            }
        });
});
router.post('/add', function(req, res){
    var dep_name = req.body.department_name;
    var dep_type = "department_type";
    req.checkBody('department_name', 'Department Name is required').notEmpty();
    //req.checkBody('department_type', 'Department type is required').notEmpty();
    var errors = req.validationErrors();
    if(errors){     
        	res.render('adddepartment',{
            		errors:errors,
               });
      
   } 
   else {
      var newDepartment = new Department({
            		dept_name: dep_name,
            		dept_type:dep_type
            		
      });
      Department.createDepartment(newDepartment, function(err, department){
          if(err) throw err;
          res.redirect('/departments');
          return req.flash('success_msg', 'Department added successfully');
      });
       
      
   }

});

// Edit department
router.param('id', function(req, res, next, id){
       Department.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.departmentId = docs;
                next();
            }
      }); 



});
// Edit Shift
router.param('id', function(req, res, next, id){       
Shift.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.shiftId = docs;
                next();
            }
      }); 



});

router.post('/department/:id', function(req, res){
   sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
   	Department.update({_id: req.departmentId},
		{
			   	  dept_name: req.body.dept_name,
				  dept_type: "department_type",                                 
	        }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/departments');
	        });
   }
   else{
      res.redirect('/users/login');
   }
});
router.post('/shift/:id', function(req, res){
   sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
   	Shift.update({_id: req.shiftId},
		{
			   	  shift_name:req.body.shift_name,
				  shift_time_start: req.body.shift_time_start,       
                                  shift_time_end: req.body.shift_time_end, 
                                  shift_active :req.body.shift_active
	        }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/departments/listshifts');
	        });
   }
   else{
      res.redirect('/users/login');
   }
});
router.get('/department/:id/edit', function(req, res){
     sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       res.render('edit-departmentform', {department: req.departmentId});
     }
     else{
       res.redirect('/users/login');
     }
      

});
router.get('/shift/:id/edit', function(req, res){
     sess = req.session;
      if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       res.render('edit-shift', {shift: req.shiftId});
     }
     else{
       res.redirect('/users/login');
     }
      

});

//Delete Department
router.get('/department/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Department.remove({_id: req.departmentId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/departments');
       });
    }
    else{
      res.redirect('/users/login');
    }
});
//Delete Shift
router.get('/shift/:id/delete', function(req, res){
   console.log(req.shiftId);
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Shift.remove({_id: req.shiftId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/departments/listshifts');
       });
    }
    else{
      res.redirect('/users/login');
    }
});
//Shift Management
router.get('/listshifts', function(req, res){
    User.find({}).exec(function(err, users) {   
       req.allemployess = users;
   })

    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Shift.find({}).exec(function(err, shifts) {   
         if (err) throw err;
           res.render('listshifts', {"shifts": shifts});
           
       });
    }
    else{
      res.render('login');
    }
});

router.get('/addshift', function(req, res,next){
    sess = req.session;    
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
        res.render('addshift');
    }
    else{
      res.render('login');
    }
   
});
router.post('/addshift', function(req, res){
    var shift_name = req.body.shift_name;
    var shift_time_start = req.body.shift_time_start;
    var shift_time_end = req.body.shift_time_end;
    var shift_active = req.body.shift_active;
    req.checkBody('shift_name', 'Shift Name is required').notEmpty();
    req.checkBody('shift_time_start', 'Shift Time start is required').notEmpty();
    req.checkBody('shift_time_end', 'Shift Time end is required').notEmpty();
    req.checkBody('shift_active', 'Shift Active is required').notEmpty();  
    var errors = req.validationErrors();
    if(errors){     
        	res.render('addshift',{
            		errors:errors,
               });
    } 
     else {
      var newshift = new Shift({
            		shift_name: shift_name,
            		shift_time_start:shift_time_start,
                        shift_time_end:shift_time_end,
                        shift_active:shift_active
            		
      });
      Shift.createShift(newshift, function(err, shift){
          if(err) throw err;
          res.redirect('/departments/listshifts');
          return req.flash('success_msg', 'Shift added successfully');
      });
       
      
   }
   
});


module.exports = router;
