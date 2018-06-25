var mongoose = require('mongoose');
var  Schema = mongoose.Schema;
// Shift Schema
var ShiftschedulerSchema = mongoose.Schema({
        employee_id: {
                type: String,
		index:true
        },
	shift_date_start: {
		type: String
	},
        shift_type: {
		type: String
	}
});
var Shiftscheduler = module.exports = mongoose.model('shiftscheduler', ShiftschedulerSchema);
module.exports.createShift = function(newShiftscheduler, callback){
	        newShiftscheduler.save(callback);	   
}

