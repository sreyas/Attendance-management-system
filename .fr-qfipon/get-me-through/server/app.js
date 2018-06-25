var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/GetMeThrough');
var db = mongoose.connection;
var train = require('./routes/train');
var routes = require('./routes/index');
var socket_io = require("socket.io" );
var io = socket_io();
var users = require('./routes/users');
var app = express();
var pid = -1;
app.io = io; 
var run= require('./routes/run');
app.set('views', path.join(__dirname,'../', 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public'))
app.use('/train',train);
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); 
  res.locals.user = req.user || null;
    res.locals.session = req.session.passport || null;
  next();
});
//const { verify, verifyQR } = require(path.join(__dirname, './../auth/auth'));
app.io.on('connection', function (socket) {
        console.log('a user connected', socket.id);

        function sendLiveUpdates() {
            var spawn = require('child_process').spawn,
                py = spawn('python', [String(__dirname) + '/py/run.py']);

            // Store pid of py to kill if client needs
            pid = py.pid;

            py.stdout.on('data', function (data1) {
                // pre-processing, as data1 in binary buffer
                data = data1.toString();
                var a = data, arr = [];
                for (var i = 0; i < a.length - 1; i++) {
                    var s = '';
                    // console.log(' cur ' + i);
                    if (a[i] === "'") {
                        i++;
                        // console.log(i);
                        while (i < a.length - 1 && a[i] != "'") {
                            s += a[i];
                            i++;
                        }
                    }
                    if (s != '')
                        arr.push(s);
                }
                if (arr.length == 0) {
                    arr.push('Unknown');
                }
                data = JSON.stringify(arr);
                console.log(" got from py " + data);
                if (sendUpdates) {
                    io.emit('new liveUpdates', data);                   
                }

            });
            py.stdout.on('end', function () {
                console.log(' byyee ');
            });
            py.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
                io.emit('start error');
            });

            // When python process stops without error
            function exitHandler(data, signal) {
                console.log('run.js -> success code:' + data + ' ' + signal);
                if (data != 0 && data != null) {
                    io.emit('stop error', "Stopping process faced an error, but operation completed.");
                } else {
                    io.emit('stop success');
                }
            }
            /*
            * TODO: check if it collides with socketIO error or not.
            */
            function errorHandler(err) {
                console.log('run.js -> error code:' + err);
                io.emit('stop error', "Internal Server Error. Try again if process not stopped.");
            }
            py.addListener('close', exitHandler);
            py.addListener('error', errorHandler);
        }

        // Receive liveUpdates -> Get update for the first time.
        socket.on('receive liveUpdates', function () {
            sendUpdates = true;
            sendLiveUpdates();
        });

        // halt liveUpdates -> Halt (temporarily) liveUpdates until resumed.
        socket.on('halt liveUpdates', function () {
            sendUpdates = false;
        });

        // Resume liveUpdates -> Resume the process of sendig live Updates halted previously
        socket.on('resume liveUpdates', function () {
            sendUpdates = true;
        });

        // stop liveUpdates -> Stop liveUpdates, Stop/Kill the python process, Stop camera
        socket.on('stop liveUpdates', function () {
            sendUpdates = false;
            if (pid != -1) {
                try {
                    process.kill(pid);
                } catch (e) {
                    console.log(e);
                    io.emit('stop error', "Internal Server Error. Try again.");
                }
                pid = -1;
            } else {
                io.emit('stop error', "No Child Process found to kill");
            }
        });

        
        socket.on('mode change', function (val) {
            entryIn = val;
        });



        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });





app.use('/run',run);
app.use('/', routes);
app.use('/users', users);
module.exports = app;

