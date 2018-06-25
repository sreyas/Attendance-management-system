var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() ;

    return str;
}
function getFormattedTime() {
        var date = new Date();
	var str = date.getHours() + ":" + date.getMinutes()  + ":" + date.getSeconds() ;
   	return str;
}
var VisitorSchema = mongoose.Schema({
	imagepath: {
		type: String,
               
	},
        date: {
        	type:String,
        	default: getFormattedDate()
        },
        time: {
        	type:String,
        	default: getFormattedTime()
        }
},
});
var Visitor = module.exports = mongoose.model('Visitor', VisitorSchema);
module.exports.createVisitor = function(newVisitor, callback){
	        newVisitor.save(callback);
}
