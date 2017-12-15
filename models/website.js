const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var WebsiteSchema = new Schema(
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
        }],
        campaigns: [{
            type: Schema.Types.ObjectId,
            ref: 'Campaign'
        }]
	}
);

var Website = mongoose.model('Website', WebsiteSchema);
module.exports = Website;