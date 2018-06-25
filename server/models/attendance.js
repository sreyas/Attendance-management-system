var mongoose = require('mongoose');
var  Schema = mongoose.Schema;
var AttendanceSchema = mongoose.Schema({
        date_time: {
        	type:String        	
        },
        user: {
		type: Schema.ObjectId,
                ref: 'User' 
	}
});
var Attendance = module.exports = mongoose.model('attendance', AttendanceSchema);

module.exports.createAttendance= function(newAttendance, callback){
	        newAttendance.save(callback);
}

module.exports.getAttendanceById = function(id, callback){
	Attendance.findById(id, callback);
}
