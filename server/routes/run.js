var express = require('express');
var socket_io = require( "socket.io" );
var router = express.Router();
var io = socket_io();
var pid = -1;
var sendUpdates = false;
var liveUpdates = true;
var entryIn = true;
router.io = io; 
var sess;
router.get('/', function(req, res){
   sess = req.session;
   if(sess.passport){
      res.render('run');   
   }
   else{
     res.render('login');   
   }
   
});
module.exports = router;
