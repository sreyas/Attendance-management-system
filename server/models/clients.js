var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var ClientsSchema = mongoose.Schema({
	clients_name: {
		type: String,
		index:true
	}
		
});
var Clients = module.exports = mongoose.model('clients', ClientsSchema);

module.exports.createClients = function(newClients, callback){
	        newClients.save(callback);	   
}
