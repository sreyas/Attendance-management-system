var mongoose = require('mongoose');
var UserCategorySchema = mongoose.Schema({
	Category: {
		type: String,
		index:true
	},
        color: {
		type: String
	},
});
var UserCategory = module.exports = mongoose.model('user_category', UserCategorySchema);
module.exports.createCategory = function(newUserCategory, callback){
	        newUserCategory.save(callback);
}

module.exports.getUserCategoryByname = function(usercategoryname, callback){
	var query = {Category: usercategoryname};
	UserCategory.findOne(query, callback);
}
