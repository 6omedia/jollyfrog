/*

Form(url, fields)

Description: provides validation and methods for an ajax form

Funtions:
	
	Contructor(url, fields)

		~~| url = string of the url the form is being sent to

		~~| fields = an array of objects. each object contains...
					 id: 'q_email',       (string: of the form elements id)  
					 validation: 'none'   (string: of the type of validation. This could be...
					 						'', 'email', 'password' or 'none')

	send(data, callback)

		~~| data = data object for ajax call or '' for it to use buildSimpleFormData()

		~~| callback = function to call when ajax returns a response

	buildSimpleFormData()
	
		-- returns a data object with values from the Forms fields.

*/

var form = (function(){

	var exports = {};

	var Form = function(url, fields){
		this.url = url;
		this.fields = fields;
		this.message = 'Required fields missing';
		// this.emailFormat = "/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/";
	};

	Form.prototype.isValid = function(){

		this.resetValidation();

		var valid = true;

		for(i = this.fields.length-1; i >= 0; i--){

			var field = this.fields[i];

			var fieldElem = $('#' + this.fields[i].id);
			var fieldValue = fieldElem.val();

			if(field.validation != 'none'){

				if(field.validation == 'email'){

					if(fieldValue == ''){
						this.invalidate(fieldElem);
						valid = false;
					}else if(!(fieldValue.indexOf('@') > -1 && fieldValue.indexOf('.') > -1)){
						this.invalidate(fieldElem, 'Enter a valid email');
						valid = false;
					}

				}else if(field.validation == 'password'){

					if(fieldValue == ''){
						this.invalidate(fieldElem);
						valid = false;
					}

					if(fieldValue != $('#' + this.fields[i-1].id).val()){
						this.invalidate(fieldElem, 'Passwords do not match');
						valid = false;
					}

				}else if(typeof(field.validation) == 'function'){

					if(!field.validation()){
						this.invalidate(fieldElem, '');
						valid = false;
					}					

				}else{
					if(fieldValue == ''){
						this.invalidate(fieldElem);
						valid = false;
					}
				}

			}

		}

		return valid;

	};

	Form.prototype.invalidate = function(elem, message){

		elem.addClass('invalid');

		if(message != undefined){
			this.message = message;
		}

	};

	Form.prototype.send = function(data, callback){

		if(data == ''){
			data = this.buildSimpleFormData();
		}
		var url = this.url;

		$.ajax({
			url: url,
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				callback(data);
			},
			error: function(xhr, desc, err){
				console.log(xhr, desc, err);
				callback(xhr);
			}
		});

	};

	Form.prototype.resetValidation = function(){

		for(i=0; i<this.fields.length; i++){
			var elem = $('#' + this.fields[i].id);
			elem.removeClass('invalid');
		}

	};

	Form.prototype.buildSimpleFormData = function(){

		var data = {};

		for(i=0; i<this.fields.length; i++){
			data[this.fields[i].id] = $('#' + this.fields[i].id).val();
		} 

		return data;

	};

	exports.Form = Form;

	return exports;

}());