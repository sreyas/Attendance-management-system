var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var RoleSchema = mongoose.Schema({
	rolename: {
		type: String,
		index:true
	}
});
var Role = module.exports = mongoose.model('Role', RoleSchema);
module.exports.createRole = function(newRole, callback){
	        newRole.save(callback);
}

module.exports.getRoleByRolename = function(rolename, callback){
	var query = {rolename: rolename};
	Role.findOne(query, callback);
}
