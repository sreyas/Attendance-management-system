var express = require('express');
var socket_io = require( "socket.io" );
var router = express.Router();
var io = socket_io();
var pid = -1;
var sendUpdates = false;
var liveUpdates = true;
var entryIn = true;
router.io = io; 
router.get('/', function(req, res){
    res.render('run');   
   
});
module.exports = router;
