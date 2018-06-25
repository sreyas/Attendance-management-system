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
var train = require('../routes/train');
var fs = require('fs');
var sess;
var User = require('../models/user');
var Role = require('../models/role');
var UserCategory = require('../models/user_category');
var Attendance =  require('../models/attendance');
var Department = require('../models/department');
var Configuration = require('../models/addConfiguration');
var Activicty =  require('../models/activicty');
var Clients = require('../models/clients');
var Shift =  require('../models/shift');
var Projectsassigned = require('../models/projectsassigned');
var Shiftscheduler =  require('../models/shiftscheduler');
var Profile = require('../models/profile');
var Q = require('q');
var async = require('async');
const util = require('util')
Handlebars.registerHelper('paginate', paginate);
Handlebars.registerHelper("equal", require("handlebars-helper-equal"));

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('ifAdminCheck', function(elem, options) {
           var currentrole = []; 
            
        User.find({"_id": elem}, function(err, listarray) {
             if(listarray && listarray.length >=1){
                      
                     listarray.forEach(function(item) {                          
                      currentrole.push(item.role);       
                });
             } 
              var length = currentrole.length;
              for(var i = 0; i < length; i++) {
                  if(currentrole[i].includes("admin")){
                           return options.fn(this);
                  }
                  else{
                     return options.inverse(this);
                  }
              }
       });



           
         
       /*if(listarray && listarray.length >=1){
         listarray.forEach(function(item) {
               console.log(item);
         });
       }

  
      /*if(list.indexOf("admin") > -1) {
        return options.fn(this);
      }
      return options.inverse(this);*/
});


Handlebars.registerHelper('ifIn', function(elem, list, options) {
      if(list.indexOf(elem) > -1) {
        return options.fn(this);
      }
      return options.inverse(this);
 });
Handlebars.registerHelper('trimString', function(passedString) {
    if(passedString.includes("admin")){
      theString = "admin";
    }
    else{
      theString = "nonadmin";
    }
     return new Handlebars.SafeString(theString)
});

//Add Role
router.get('/role', function(req, res){
   sess = req.session;
  if(sess.passport){
    res.render('role');
  }
  else{
       res.render('login');
  }
    
});
// JavaScript Document// Register
router.get('/register', function(req, res){
    res.render('register');
});





// Login
router.get('/login', function(req, res){
    res.render('login');
});
// Add user
router.get('/adduser', function(req, res){
    sess = req.session;     
      if(sess.passport && req.user.role.indexOf("admin") !== -1){       
       UserCategory.find({}).exec(function(err, usercategories) {
           if(err) res.json(err);
           else
               res.render('adduser' ,{usercategories:usercategories});
       });      
     }
     else{
        res.render('login');
     }
});
// Add Categoiry
router.get('/addcategory', function(req, res){
    sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){       
       res.render('addcategory');
     }
     else{
        res.render('login');
     }
});
//Add Configuration
router.get('/addConfiguration', function(req, res){
    sess = req.session;
     if(sess.passport && req.user.role.indexOf("admin") !== -1){       
       res.render('addConfiguration');
     }
     else{
        res.render('login');
     }
});
// Edit users
router.param('id', function(req, res, next, id){
    User.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                 
                req.userId = docs;
                next();
            }
      });   

      Profile.find({"user": id}, function(err, profdoc) {
          if(err) res.json(err);
          else
            {   
               req.userprofile = profdoc

               return 
            }
      });    
      UserCategory.find({}).exec(function(err, usercategories) {
           if(err) res.json(err);
          else
            {
                req.usercategories = usercategories
               return 
            }
    });   
    Role.find({}).exec(function(err, roles) { 
             if(err) res.json(err);
         else{
            req.userroles = roles
         }
   });

     Department.find({}).exec(function(err,departments) { 
             if(err) res.json(err);
         else{
            req.userdepartments = departments
         }
   });

});
router.post('/user/:id', function(req, res){
     sess = req.session;

     if(sess.passport){
	User.update({_id: req.userId},
	                   {
			   	  name: req.body.name,
				  email   : req.body.email,
                                  username   : req.body.username,
                                  role   :req.body.userroles
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/listusers');
			 });

   /*  Profile.update({user: req.userId},
	                   {
			   	  category: req.body.category,
				
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/listusers');return;
			 });*/
//console.log(req.body.category);
Profile.update(
    {user: req.userId},
    {category: req.body.category},
    {upsert: true, safe: false},
    function(err,data){
        if (err){
            console.log(err);
        }else{
            console.log("Profile Updated");
        }
    }
);
Profile.update(
    {user: req.userId},
    {department: req.body.department},
    {upsert: true, safe: false},
    function(err,data){
        if (err){
            console.log(err);
        }else{
            console.log("Profile Updated");
        }
    }
);
}
else{
  res.redirect('/users/login');
}


});
 
router.get('/user/:id/edit', function(req, res){
     sess = req.session;
     if(sess.passport){
       res.render('edit-userform', {currentuser:req.user ,user: req.userId ,profile: req.userprofile ,categories:req.usercategories,roles:req.userroles ,departments:req.userdepartments});
     }
     else{
       res.redirect('/users/login');
     }
      

});
//Manage Projects

router.get('/myprojects', function(req, res){
    sess = req.session;
   if(sess.passport){
   	var currentuserid = req.session.passport.user;
    	if(sess.passport.user){
        	Projectsassigned.find({"employee_id":currentuserid}).exec(function(err, projectsassigned) {
                	res.render('myprojects', { "myprojects": projectsassigned});
        	});
    	}
    	else{
     		res.render('login');
    	}
  }
  else{
    res.render('login');
  }
});

//  Manage  users
router.get('/listusers', function(req, res){
 sess = req.session;
if(sess.passport && req.user.role.indexOf("admin") !== -1){
    
    UserCategory.find({}).exec(function(err, usercategories) {
           if(err) res.json(err);
          else
            {
                req.usercategories = usercategories
               return 
            }
    }); 
    Profile.find()
    .populate('user')
    .populate('category')
    .populate('department')
    .exec(function (err, listprofiles) {
       if (err) throw err;
       res.render('listusers', { "users": listprofiles ,usercategories : req.usercategories });
    });
    /*User.find({}).exec(function(err, users) {   
        if (err) throw err;
        res.render('listusers', { "users": users ,usercategories : req.usercategories });
    });*/


}
else{
   res.redirect('/');
}
   
});

//Manage Attendances


router.get('/listattendances', function(req, res){
sess = req.session;
var profiledetails =[];

if(sess.passport && req.user.role.indexOf("admin") !== -1){       
	Attendance.find({}).populate('user').exec(function(err, attendances) { 
                
                var userprofildetails = get_attendancedetails(attendances)       
                getSpeedAccelData(attendances).then(function success(result) {									
    			result.map(function (profitem) {
                           profiledetails.push(profitem.show.profileitems);
                        });
                        var newArr = [];
								for(var k = 0; k < profiledetails.length; k++){
    										newArr = newArr.concat(profiledetails[k]);
								}
							 /* var rows = [];
                                                          var temp =[];
							 for(var l=0;l<attendances.length;l++){
                                                                temp = attendances[l];
							 	var username = attendances[l].user.name;
                        					var categoryusername = newArr[l].username;
                        					var userdepartment = newArr[l].department;
                        					var usercategory = newArr[l].category;
                                                                var category = "category";
							 	if(username == categoryusername ){
                                                                        var pushitems = {"category": usercategory, "department": userdepartment};
                                                                        attendances[l]['user_section'] = pushitems;
                                                                        
                                                                }
                                                                	
							 }*/

					 console.log(newArr);
                     res.render ('listattendances' ,{"attendances":attendances,"profiledetails":newArr});
                }); 
                
		
        });	
}
else{
   res.redirect('/');
}
   
});

var getSpeedAccelData = function() {
    var users=[];
    var resp =[];
    return Attendance.find().populate('user')
    .then(result => 
        Promise.all(result.map(
            users =>  
               Profile.find({
                    user: users.user
                }).populate('user').populate('category').populate('department')
                .then(resp =>  ({                     
                    show: {
                        profileitems: resp.map(function (item) { 
                            return {category: item.category.Category ,department:item.department.dept_name,username:item.user.name,date_time:users.date_time};
                        })
                    }
                  
                }))
            )
        )
    );
};
function get_attendancedetails(attendances){
	if(attendances && attendances.length >=1){
		 var attoutput =[];var userdetails =[]; var userprofile =[];  
		 attendances.forEach(function(item) {
                     var userid =  item.user._id; 
                     Profile.find({"user": userid})
                      	.populate('user')
                      	.populate('category')
                      	.populate('department')
                       	.exec(function (err, listprofiles) {
                        	if (err) throw err;
                           		listprofiles.forEach(function(item) {
                               userdetails[item.user._id] = {'category':item.category.Category,'department':item.department.dept_name}                             
                        }); 
                        return ("HI");
                   
                    });
              });
        }
}
// Delete users
router.get('/user/:id/delete', function(req, res){
     sess = req.session;
if(sess.passport && req.user.role.indexOf("admin") !== -1){         console.log(req.userId);     
       Profile.find({"user": req.userId}, function(err, doc) {   
              console.log(doc);         
              if(doc && doc.length >=1){
                doc.forEach(function(item) {
                     console.log(item.imagepath);
                     fs.unlink("./public/"+item.imagepath,function(err){
                       if(err) return console.log(err);
                        console.log('file deleted successfully');
                        Profile.remove({user: req.userId},
           function(err, docs){
             if(err) res.json(err);
             
       });
                     });
                });
              }             
          
       });
       User.remove({_id: req.userId},
        function(err, docs){
			if(err) res.json(err);
			
       });
       res.redirect('/users/listusers');
       
}
else{
     res.redirect('/');
}
});
// Add role
router.post('/role', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){       
       var rolename = req.body.rolename;
        req.checkBody('rolename', 'rolename is required').notEmpty();
        var errors = req.validationErrors();
        if(errors){
          res.render('role',{errors:errors});
       } 
       else {
          var newRole = new Role({rolename: rolename,});
          Role.createRole(newRole, function(err, role){
             if(err) throw err;
              console.log(role);
          });
          req.flash('success_msg', 'Roles added');
          res.redirect('/users/listroles');
      }
    }
    else{
       res.redirect('/');
    }
  
});
// Add configuration
router.post('/configuration', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){       
       var configuration = req.body.configuration;
        req.checkBody('configuration', 'configuration is required').notEmpty();
        var errors = req.validationErrors();
        if(errors){
          res.render('addConfiguration',{errors:errors});
       } 
       else {
          var newConfiguration = new Configuration({configuration: configuration,});
          Configuration.createConfiguration(newConfiguration, function(err, configuration){
             if(err) throw err;
              console.log(configuration);
          });
          req.flash('success_msg', 'Configuration added');
          res.redirect('/users/listconfiguration');
      }
    }
    else{
       res.redirect('/');
    }
  
});

// Manage Configuration
 router.get('/listconfiguration', function(req, res){
   sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
     
      Configuration.find({}).exec(function(err, configuration) {   
         if (err) throw err;
        res.render('listconfiguration', { "configurations": configuration});
      });
   }
   else{
         res.redirect('/');
   }
    
});
// Manage roles
 router.get('/listroles', function(req, res){
   sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
     
      Role.find({}).exec(function(err, roles) {   
         if (err) throw err;
        res.render('listroles', { "roles": roles});
      });
   }
   else{
         res.redirect('/');
   }
    
});


//Edit configuration

router.param('id', function(req, res, next, id){
    Configuration.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                req.configurationId = docs;
                next();
            }
        });    
});
router.get('/configuration/:id/edit', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
           res.render('edit-configform', {configuration: req.configurationId});
    }
    else{
       res.redirect('/');
    }
});

router.post('/configuration/:id', function(req, res){
	Configuration.update({_id: req.configurationId},
	                   {
			   	  configuration: req.body.configuration,
				  
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/listconfiguration');
			 });
});

// Edit  roles
router.param('id', function(req, res, next, id){
    Role.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                req.roleId = docs;
                next();
            }
        });    
});
router.post('/role/:id', function(req, res){
	Role.update({_id: req.roleId},
	                   {
			   	  rolename: req.body.rolename,
				  
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/listroles');
			 });
});
 
router.get('/role/:id/edit', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
           res.render('edit-roleform', {role: req.roleId});
    }
    else{
       res.redirect('/');
    }
});

// Delete roles
router.get('/role/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
        Role.remove({_id: req.roleId},
          function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/users/listroles');
       }); 
    }
    else{
       res.redirect('/');
    }
});
// Delete Configuration
router.get('/configuration/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
        Configuration.remove({_id: req.configurationId},
          function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/users/listconfiguration');
       }); 
    }
    else{
       res.redirect('/');
    }
});
//  Manage  User Category
router.get('/listusercategory', function(req, res){
     sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
       UserCategory.find({}).exec(function(err, usercategories) {   
          if (err) throw err;
          res.render('listusercategory', { "usercategories": usercategories});
        });
     }
    else{
      res.redirect('/');
    }
    
});
//Add Category
router.post('/addcategory', function(req, res){
    var name = req.body.categoryname; 
    var color = req.body.categorycolor; 
    // Validation
    req.checkBody('categoryname', 'Name is required').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        res.render('addcategory',{
            errors:errors
        });
    } else {
        var newCategory = new UserCategory({
            Category: name,
            color: color,    
       
        });
        UserCategory.createCategory(newCategory, function(err, category){
            if(err) throw err;
            console.log(category);
        });

        req.flash('success_msg', 'Category Added');

        res.redirect('/users/listusercategory');
    }
});
//Edit Category
   router.param('id', function(req, res, next, id){
    UserCategory.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                req.categoryId = docs;
                next();
            }
        });    
});
router.post('/category/:id', function(req, res){
	UserCategory.update({_id: req.categoryId},
	                   {
			   	  Category: req.body.categoryname,
                                  color: req.body.categorycolor,
				  
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/listusercategory');
			 });
});
 
router.get('/category/:id/edit', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
        res.render('edit-categoryform', { category: req.categoryId});
    }
    else{
      res.redirect('/');
    }
   
});
//Delete Category
router.get('/category/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport && req.user.role.indexOf("admin") !== -1){
       UserCategory.remove({_id: req.categoryId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/users/listusercategory');
       });
    }
    else{
      res.redirect('/');
    }
});
// Register User
router.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } 
    else {
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/known_people')
	},
	filename: function(req, file, cb) {
		cb(null,file.originalname);
	}
});
var upload = multer({
		storage: storage
});
// Add User from admin side
router.post('/adduser', upload.any(),function(req, res){
   var name = req.body.name;
   var email = req.body.email;
   var username = req.body.username;
   var password = req.body.password;
   var password2 = req.body.password2;
   var category =  req.body.category;
   // Validation
   req.checkBody('name', 'Name is required').notEmpty();
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Email is not valid').isEmail();
   req.checkBody('username', 'Username is required').notEmpty();
   req.checkBody('password', 'Password is required').notEmpty();
   req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
   req.checkBody('category', 'Category is required').notEmpty();
   var errors = req.validationErrors();
   if(req.files && req.files.length >=1){
       var path = req.files[0].path;
       var replacepath =path.replace('public/known_people/','known_people/');    
       var imageName = req.files[0].originalname;
   }
   if(errors){
      UserCategory.find({}).exec(function(err, usercategories) {
        	res.render('adduser',{
            		errors:errors,
                       usercategories:usercategories
        	});
      });
   } 
   else {
      var newUser = new User({
            		name: name,
            		email:email,
            		username: username,
            		password: password
      });       
      User.createUser(newUser, function(err, user){			
   			
                         var imagepath = {};
              		 imagepath['imagepath'] = replacepath;     
              		 imagepath['category'] = category;     
               		 imagepath['user'] = user._id;                            
                         Profile.addImage(imagepath, function(err,imagepath) {
                            if(err) throw err;
                         });
 			 //res.redirect('/train');
		         res.redirect('/users/listusers');
                         return req.flash('success_msg', 'User added successfully');
	});
      
   }

});



//Add profile image
  var storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, './public/known_people')
        },
        filename: function(req, file, cb) {
          cb(null, req.params.imageid +"-"+file.originalname);
        }
    });
    var upload = multer({
        storage: storage
    });
router.post('/profileimage/:imageid/',upload.any(), function(req, res,next){
      Profile.find({"user": req.params.imageid}, function(err, doc) {
            if(doc && doc.length >=1){
              
                 var path = req.files[0].path;
                 var replacepath =path.replace('public/known_people/','known_people/');  
                 var imageName = req.files[0].originalname;
                 var imagepath = {};
                 imagepath['imagepath'] = path;     
                 imagepath['user'] = req.params.imageid;       
                 Profile.update({user: req.params.imageid},
	                   {
			   	  imagepath: replacepath,
				
			   }, function(err, docs){
			 	if(err) res.json(err);
				else    res.redirect('/users/user/'+req.params.imageid+'/edit');
			 });

            }
            else{    
               var path = req.files[0].path;
                 var imageName = req.files[0].originalname;
                 var imagepath = {};
                 imagepath['imagepath'] = path;     
                 imagepath['user'] = req.params.imageid;                   
                Profile.addImage(imagepath, function(err,imagepath) {
                         if(err) throw err;
                 });
                 res.redirect('/users/user/'+req.params.imageid+'/edit');
            }
      });
});
router.param('imageid', function(req, res, next, id){
    Profile.findById(id, function(err, docs){
            if(err) res.json(err);
            else
            {
                req.profuserId = docs;
                next();
            }
        });    
});



passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
       if(err) throw err;
       if(!user){
           return done(null, false, {message: 'Unknown User'});
       }

       User.comparePassword(password, user.password, function(err, isMatch){
           if(err) throw err;
           if(isMatch){
               return done(null, user);
           } else {
               return done(null, false, {message: 'Invalid password'});
           }
       });
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});



module.exports = router;
