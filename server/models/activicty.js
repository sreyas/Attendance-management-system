var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');// User Schema
var ActivictySchema = mongoose.Schema({
	activicty_name: {
		type: String,
		index:true
	},
	parent_id: {
		type: String
	}	
});
var Activicty = module.exports = mongoose.model('activicty', ActivictySchema);

module.exports.createActivicty = function(newActivicty, callback){
	        newActivicty.save(callback);	   
}
