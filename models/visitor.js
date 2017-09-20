const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//book schema definition
let VisitorSchema = new Schema(
    {
        fullname: String,
		ip: Array,
		email: String,
		phone: String,
		birthday: Date,
		sex: String,
		address: String,
		postcode: String,
		relationship_status: String,
		education_level: String,
		work_industry: String,
		income: Number,
		home_type: String,
		home_composition: String
		consents: [{
			website: String,
			consent: String
		}]
    }
);

var Visitor = mongoose.model("Visitor", VisitorSchema);
module.exports = Visitor;