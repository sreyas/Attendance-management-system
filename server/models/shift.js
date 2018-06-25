var mongoose = require('mongoose');
var  Schema = mongoose.Schema;
// Shift Schema
var ShiftSchema = mongoose.Schema({
        shift_name: {
                type: String,
		index:true
        },
	shift_time_start: {
		type: String
	},
        shift_time_end: {
		type: String
	},
	shift_active: {
		type: String
	}       
        
});
var Shift = module.exports = mongoose.model('shift', ShiftSchema);
module.exports.createShift = function(newShift, callback){
	        newShift.save(callback);	   
}

