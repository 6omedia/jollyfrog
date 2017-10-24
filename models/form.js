var mongoose = require('mongoose');

var FormFields = new mongoose.Schema(
	{
		data_point: String,
        input_id: String
	}
);

var FormSchema = new mongoose.Schema(
    {
    	websiteId: {
			type: Schema.Types.ObjectId,
            ref: 'Website',
            required: true
        },
        name: String,
        fields: [FormFields]
    }
);

var Form = mongoose.model('Form', FormSchema);
module.exports = Form;