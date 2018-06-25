var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');// User Schema
var DepartmentSchema = mongoose.Schema({
	dept_name: {
		type: String,
		index:true
	},
	dept_type: {
		type: String
	}	
});
var Department = module.exports = mongoose.model('department', DepartmentSchema);

module.exports.createDepartment = function(newDepartment, callback){
	        newDepartment.save(callback);	   
}
