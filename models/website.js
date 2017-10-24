var mongoose = require('mongoose');
var WebsiteSchema = new mongoose.Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
		name: String,
        domain: {
            type: String,
            unique: true
        },
	    forms: [{
            type: Schema.Types.ObjectId, 
            ref: 'Form' 
        }]
	}
);

var Website = mongoose.model('Website', WebsiteSchema);
module.exports = Website;