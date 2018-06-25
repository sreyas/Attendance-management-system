var mongoose = require('mongoose');
var  Schema = mongoose.Schema;
// Projectsassigned Schema
var projectsassignedSchema = mongoose.Schema({
        employee_id: {
                   type: Schema.ObjectId,
                   ref: 'User',
		  index:true
        },
	shift_date_start: {
		type: String
	},
        main_category: {
		type: Schema.ObjectId,
                ref: 'activicty'
	},
        sub_category: {
		type: Schema.ObjectId,
                ref: 'activicty'
                
	},
        clientid: {
		type: Schema.ObjectId,
                ref: 'clients'
	}
        
});
var Projectsassigned = module.exports = mongoose.model('projectsassigned', projectsassignedSchema);
module.exports.createProjectsassigned = function(newProjectsassigned, callback){
	        newProjectsassigned.save(callback);	   
}

