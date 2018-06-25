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
var Activicty =  require('../models/activicty');
var Clients = require('../models/clients');
var async = require('async');
const util = require('util');
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
// Activicty
router.get('/', function(req, res){
    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Activicty.find({}).exec(function(err, activicty) {   
         if (err) throw err;
          
           res.render('activicty', { "activicty": activicty});
           
       });
    }
    else{
      res.render('login');
    }
});
// Add Activicty
router.get('/add', function(req, res){
    sess = req.session;     
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
        Activicty.find({}).exec(function(err, activicty) {   
          if (err) throw err;
           res.render('addactivicty', { "activicty": activicty});

       });
    }
    else{
      res.render('login');
    }
});
router.post('/add', function(req, res){
    var activicty_name = req.body.activicty_name;
    var activictysub = req.body.activictysub;
    req.checkBody('activicty_name', 'Activicty Name is required').notEmpty();   ;
    var errors = req.validationErrors();
    if(errors){     
        	res.render('addactivicty',{
            		errors:errors,
               });
      
   } 
   else {
      var newActivicty = new Activicty({
            		activicty_name: activicty_name,
            		parent_id:activictysub
            		
      });
      Activicty.createActivicty(newActivicty, function(err,  activicty){
          if(err) throw err;
          res.redirect('/activities');
          return req.flash('success_msg', 'Activicty added successfully');
      });
       
      
   }
});
// edit Activicty
router.param('id', function(req, res, next, id){
       Activicty.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.activictytId = docs;
                next();
            }
      }); 
});
router.get('/activicty/:id/edit', function(req, res){
     sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Activicty.find({}).exec(function(err, activicty) {  
         if(err) throw err;          
          res.render('edit-activictyform', { "activicty": req.activictytId,"allacticties" : activicty,"parent":0});
       });
     }
     else{
       res.redirect('/users/login');
     }
      

});
router.post('/activicty/:id', function(req, res){
   sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
   	Activicty.update({_id: req.activictytId},
		{
			   	  activicty_name: req.body.activicty_name,
				  parent_id: req.body.activictysub,                                 
	        }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/activities');
	        });
   }
   else{
      res.redirect('/users/login');
   }
});
// Delete Activicty
router.get('/activicty/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Activicty.remove({_id: req.activictytId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/activities');
       });
    }
    else{
      res.redirect('/users/login');
    }
});
// Manage clients
router.get('/clients', function(req, res){
    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Clients.find({}).exec(function(err, clients) {   
         if (err) throw err;
          
           res.render('clients', { "clients": clients});
           
       });
    }
    else{
      res.render('login');
    }
});
// Add clients
router.get('/clients/add', function(req, res){
    sess = req.session;     
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
          res.render('addclients');           
       
    }
    else{
      res.render('login');
    }
});
router.post('/clients/add', function(req, res){
    var client_name = req.body.client_name;  
    req.checkBody('client_name', 'Client Name is required').notEmpty();   ;
    var errors = req.validationErrors();
    if(errors){     
        	res.render('addclients',{
            		errors:errors,
               });
      
   } 
   else {
      var newClients = new Clients({
            		clients_name: client_name            		
            		
      });
      Clients.createClients(newClients, function(err,  clients){
          if(err) throw err;
          res.redirect('/activities/clients');
          return req.flash('success_msg', 'Clients added successfully');
      });
       
      
   }
});
// Edit  clients
router.param('id', function(req, res, next, id){
       Clients.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.clienttId = docs;
                next();
            }
      }); 
});
router.get('/clients/:id/edit', function(req, res){
     sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Clients.find({}).exec(function(err, clients) {  
         if(err) throw err;    
           res.render('edit-clientform', {clients: req.clienttId});    
       });
     }
     else{
       res.redirect('/users/login');
     }      

});
router.post('/clients/:id', function(req, res){
        sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
   	Clients.update({_id: req.clienttId},		{
			   	  clients_name: req.body.client_name				                        
	        }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/activities/clients');
	        });
   }
   else{
      res.redirect('/users/login');
   }
});
// Delete  clients
router.get('/clients/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){ 
       Clients.remove({_id: req.clienttId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/activities/clients');
       });
    }
    else{
      res.redirect('/users/login');
    }
});


module.exports = router;
