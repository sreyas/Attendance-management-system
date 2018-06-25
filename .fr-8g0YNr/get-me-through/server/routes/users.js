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
var Profile = require('../models/profile');
var async = require('async');
const util = require('util')
Handlebars.registerHelper('paginate', paginate);
Handlebars.registerHelper('ifCond', function(v1, v2, options) {
console.log("v1 ="+v1);
console.log("v2 ="+v2);
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
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
     if(sess.passport){
       res.render('adduser');
     }
     else{
        res.render('login');
     }
});
// Add Categoiry
router.get('/addcategory', function(req, res){
    sess = req.session;
     if(sess.passport){
       res.render('addcategory');
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
            console.log("Category Updated");
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
       res.render('edit-userform', {user: req.userId ,profile: req.userprofile ,categories:req.usercategories,roles:req.userroles });
     }
     else{
       res.redirect('/users/login');
     }
      

});
//  Manage  users
router.get('/listusers', function(req, res){
 sess = req.session;
if(sess.passport){
    
    UserCategory.find({}).exec(function(err, usercategories) {
           if(err) res.json(err);
          else
            {
                req.usercategories = usercategories
               return 
            }
    });   
    User.find({}).exec(function(err, users) {   
        if (err) throw err;
        res.render('listusers', { "users": users ,usercategories : req.usercategories });
    });


}
else{
   res.redirect('/users/login');
}
   
});
// Delete users
router.get('/user/:id/delete', function(req, res){
     sess = req.session;
if(sess.passport){   console.log(req.userId);     
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
     res.redirect('/users/login');
}
});
// Add role
router.post('/role', function(req, res){
    sess = req.session;
    if(sess.passport){
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
       res.redirect('/users/login');
    }
  
});
// Manage roles
 router.get('/listroles', function(req, res){
   sess = req.session;
   if(sess.passport){
     
      Role.find({}).exec(function(err, roles) {   
         if (err) throw err;
        res.render('listroles', { "roles": roles});
      });
   }
   else{
         res.redirect('/users/login');
   }
    
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
    if(sess.passport){
           res.render('edit-roleform', {role: req.roleId});
    }
    else{
       res.redirect('/users/login');
    }
});

// Delete roles
router.get('/role/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport){
        Role.remove({_id: req.roleId},
          function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/users/listroles');
       }); 
    }
    else{
       res.redirect('/users/login');
    }
});

//  Manage  User Category
router.get('/listusercategory', function(req, res){
     sess = req.session;
     if(sess.passport){   
       UserCategory.find({}).exec(function(err, usercategories) {   
          if (err) throw err;
          res.render('listusercategory', { "usercategories": usercategories});
        });
     }
    else{
      res.redirect('/users/login');
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
    if(sess.passport){
        res.render('edit-categoryform', { category: req.categoryId});
    }
    else{
      res.redirect('/users/login');
    }
   
});
//Delete Category
router.get('/category/:id/delete', function(req, res){
    sess = req.session;
    if(sess.passport){
       UserCategory.remove({_id: req.categoryId},
        function(err, docs){
			if(err) res.json(err);
			else    res.redirect('/users/listusercategory');
       });
    }
    else{
      res.redirect('/users/login');
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
    } else {
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
 var storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, './public/known_people')
        },
        filename: function(req, file, cb) {
          cb(null, file.originalname);
        }
    });
    var upload = multer({
        storage: storage
    });
// Add User from admin side
router.post('/add',upload.any(), function(req, res,next){
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
    req.checkBody('category', 'Category is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    console.log(req.files)   
    if(req.files && req.files.length >=1){
       var path = req.files[0].path;
       var replacepath =path.replace('public/known_people/','known_people/');    
       var imageName = req.files[0].originalname;
    }
    if(errors){
        res.render('adduser',{
            errors:errors
        });
    } else {
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password
        });
    
      User.createUser(newUser, function(err, user){
            if(err) throw err;
             var imagepath = {};
              imagepath['imagepath'] = replacepath;     
              imagepath['category'] = category;     
              imagepath['user'] = user._id;  
                          
              Profile.addImage(imagepath, function(err,imagepath) {
                         if(err) throw err;
                 });
        });
           res.redirect('/train');
         //  req.flash('success_msg', 'User added successfully');
           res.redirect('/users/listusers');
            return
        req.flash('success_msg', 'User added successfully');

       // res.redirect('/users/listusers');
    }
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
