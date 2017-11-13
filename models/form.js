var mongoose = require('mongoose');

var FormFields = new mongoose.Schema(
	{
		data_point: String,
        input_id: String
	}
);

var FormSchema = new mongoose.Schema(
    {
    	websiteId: String,
        name: String,
        fields: [FormFields],
        submit_id: {
            type: String,
            default: 'none'
        }
    }
);

var Form = mongoose.model('Form', FormSchema);
module.exports = Form;