var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var ConfigurationSchema = mongoose.Schema({
	configuration: {
		type: String,
		index:true
	}
});
var Configuration = module.exports = mongoose.model('addConfiguration', ConfigurationSchema);
module.exports.createConfiguration = function(newConfiguration, callback){
	        newConfiguration.save(callback);
}


