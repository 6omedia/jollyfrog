var mongoose = require('mongoose');

var AudienceSchema = new mongoose.Schema(
	{
		name: String,
        domains: Array,
        browser: Array,
        category: Array,
        funnel_position: String
	}
);

var Audience = mongoose.model('Audience', AudienceSchema);
module.exports = Audience;