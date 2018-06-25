var mongoose = require('mongoose');
var  Schema = mongoose.Schema;
// Profile Schema
var ProfileSchema = mongoose.Schema({
        user: {
          type: Schema.ObjectId,
          ref: 'User'
        },
	imagepath: {
		type: String
	},
	category: {
		type: String
	}
        
});
var Profile = module.exports = mongoose.model('profile', ProfileSchema);
module.exports.createProfile = function(newProfile, callback){
	        newProfile.save(callback);	   
}


module.exports.getProfileById = function(id, callback){
	Profile.findById(id, callback);
}
module.exports.getImages = function(callback, limit) { 
    Profile.find(callback).limit(limit);
}
module.exports.getImages = function(callback, limit) { 
    Profile.find(callback).limit(limit);
}
module.exports.addImage = function(image, callback) {
 Profile.create(image, callback);
}



