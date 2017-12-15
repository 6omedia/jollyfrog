(function(Popup){

	function Model(){
		this.allforms = [];
		this.domain = '';
		this.form = {
			name: '',
			submit_id: '',
			fields: []
		};
	}
	Model.prototype.removeForm = function(formId, callback){

		var thisForm = this;

		$.ajax({
			url: '/api/forms/' + thisForm.domain + '/' + formId,
			method: 'DELETE',
			data: {
				name: thisForm.form.name,
				fields: thisForm.form.fields
			},
			success: function(data){

				$('.webForms').removeClass('spinning');
				if(data.success){
					callback(null, data.forms);
				}else{
					callback(data.error, null);
				}

			},
			error: function(a, b, c){
				$('.webForms').removeClass('spinning');
				callback('Something went wrong', null);
			}
		});

	};
	Model.prototype.getForm = function(formId, callback){

		var thisForm = this;

		$.ajax({
			url: '/api/forms/' + thisForm.domain + '/' + formId,
			method: 'GET',
			success: function(data){
				
				if(!data.error){
					callback(data.err);
				}

				thisForm.model.form.name = data.form.name;
				thisForm.model.form.submit_id = data.form.submit_id;
				thisForm.model.form.fields = data.form.fields;

				callback();

			},
			error: function(){
				callback('Something went wrong');
			}
		});

	};

	function View(){
		this.fieldList = $('#formFields');
		this.fieldListLis = $('#formFields li');
		this.inputFormName = $('#q_formname');
		this.inputSubmitId = $('#q_submit_id');
	}
	View.prototype.addField = function(){

		li = '<li>';
		li += '<div class="x">x</div>';
		li += '<label>Field Name (Data Point)</label>';
		li += '<input type="text" class="input_datapoint">';
		li += '<br>';
		li += '<label>Input ID</label>';
		li += '<input type="text" class="input_id">';
		li += '<br>';
		li += '<label>Required</label>';
		li += '<input type="checkbox" class="input_required">';
		li += '</li>';

		this.fieldList.append(li);

	}
	View.prototype.displayMessage = function(isError, message){

		var string = '<div class="messageBox';

		if(isError){
			string += ' error';
		}

		string += '">';
		string += message;
		string += '</div>';

		$('.aFormBox').append(string);

	};
	View.prototype.updateForms = function(forms, domain){

		var theFormsBox = $('.webForms');

		theFormsBox.empty();
		theFormsBox.append('<a class="aForm new" href="/websites/forms/' + domain + '/new"></a>');

		for(i=0; i<forms.length; i++){

			var form = forms[i];

			var aForm = '<div class="aForm" data-formid="' + form._id + '">';
				aForm += '<h3>' + form.name + '</h3>';
				aForm += '<p>Submit Button ID: ' + form.submit_id + '</p>';
				aForm += '<ul class="list">';

					for(j=0; j<form.fields.length; j++){

						var field = form.fields[j];

						aForm += '<li>';
							aForm += '<p>' + field.data_point + '</p>';
							aForm += '<p class="id">ID: ' + field.input_id + '</p>';
						aForm += '</li>';

					}

				aForm += '</ul>';
				aForm += '<ul class="actions">';
				aForm += '<li><a href="/websites/forms/' + domain + '/edit" class="more">Edit Form</a></li>';
				aForm += '<li><span class="code">Generate Code</span></li>';
				aForm += '</ul>';
				aForm += '<div class="x">x</div>';
			aForm += '</div>';

			theFormsBox.append(aForm);

		}

	};

	function FormTracking(Model, View){

		var thisForm = this;

		this.view = new View();
		this.model = new Model({});

		this.updateModelFromView();

		/*** events ***/

		// add field
		$('.addField').on('click', function(){
			thisForm.view.addField();
		});

		// remove field
		thisForm.view.fieldList.on('click', '.x', function(){
			$(this).parent().remove();
		});

		$('#add_form').on('click', function(){
			thisForm.addForm();
		});

		/*** All Forms ***/

		$('.webForms').on('click', '.aForm .x', function(){

			var formId = $(this).parent().data('formid');

			var popUp = new Popup(
				function(){

					thisForm.model.removeForm(formId, function(err, forms){
						if(!err){
							thisForm.view.updateForms(forms, thisForm.model.domain);
							popUp.popDown();
						}
					});

				},
				function(){
					this.popDown();
				}
			);

			popUp.popUp('Are you sure you want to delete this form?');

		});

		$('.webForms').on('click', '.code', function(){

			var formId = $(this).closest('.aForm').data('formid');

			thisForm.model.getForm(formId, function(err){

				if(err){
					return alert('Something went wrong');
				}

				var popUp = new Popup(
					function(){
						console.log('vdsvsd');
					},
					function(){
						this.popDown();
					}
				);

				var form = thisForm.model.form;

				popUp.popUp('Code', '<div class="codeGen"><code>' + thisForm.genCode(
					form.apikey, form.submit_id, form.name, form.fields) + '</code></div>');

			});

		});

	}

	FormTracking.prototype.genCode = function(apikey, clickId, formName, dps){

		var code = '';

		code += "(function(fn,c){";
        code += "var d=document;";
        code += "(d.readyState=='loading')?d.addEventListener('DOMContentLoaded',fn):fn(c);";
        code += "})(function(c){";
        code += "var d=document;";
        code += "var c=new ClientJS();";
        code += "d.getElementById('" + clickId + "').addEventListener('click', function(){";
        code += "var jsonObj = {";
        code += "apikey: " + apikey + ",";
        code += "domain: window.location.hostname,";
        code += "url: window.location.href,";
        code += "fingerprint: c.getFingerprint(),";
        code += "type: c.getDeviceType(),";
        code += "vendor: c.getDeviceVendor(),";
        code += "browser: c.getBrowser(),";
        code += "os: c.getOS(),";
        code += "screen: {";
        code += "res: c.getAvailableResolution(),";
        code += "colorDepth: c.getColorDepth()";
        code += "},";
        code += "timezone: c.getTimeZone(),";
        code += "language: c.getLanguage(),";
        code += "meta: {";
        code += "funnel_position: d.getElementById('tracking_info').dataset.funnel_position || ''";
        code += "},";
        code += "form_name: '" + formName + "',";
        code += "datapoints: [";

        for(i=0; i<dps.length; i++){

        	var dp = dps[i];

        	code += "{";
	        code += "name: '" + dp.name + "',";
	        code += "value: d.getElementById('" + dp.field_id + "').value";

	        if(i == dps.length - 1){
	        	code += "}";
	        }else{
	        	code += "},";
	        }

        }

        code += "]";
        code += "};";
        code += "var x = new XMLHttpRequest();";
        code += "x.onreadystatechange = function(){";
        code += "if(this.readyState == 4){";
        code += "}";
        code += "};";
        code += "x.open('POST', 'http://localhost:20100/api/log_formsubmission', true);";
        code += "x.setRequestHeader('Content-Type', 'application/json');";
        code += "x.send(JSON.stringify(jsonObj));";
        code += "});";
        code += "});";

		return code;

	};

	FormTracking.prototype.isValid = function(){

		var valid = true;

		var fieldListLis = $('#formFields li');

		if(this.view.inputFormName.val() == ''){
			this.view.inputFormName.addClass('invalid');
			valid = false;
		}else{
			this.model.form.name = this.view.inputFormName.val();
		}

		if(this.view.inputSubmitId.val() == ''){
			this.view.inputSubmitId.addClass('invalid');
			valid = false;
		}else{
			this.model.form.submit_id = this.view.inputSubmitId.val();
		}

		this.model.form.fields = [];

		for(i=0; i<fieldListLis.length; i++){

			var li = fieldListLis[i];
			var input_datapoint = $(li).find('.input_datapoint');
			var input_id = $(li).find('.input_id');
			var input_req = $(li).find('.input_required');

			var fieldObj = {};

			if(input_datapoint.val() == ''){
				input_datapoint.addClass('invalid');
				valid = false;
			}else{
				fieldObj.name = input_datapoint.val();
			}

			if(input_id.val() == ''){
				input_id.addClass('invalid');
				valid = false;
			}else{
				fieldObj.field_id = input_id.val();
			}

			fieldObj.required = input_req.prop('checked');

			this.model.form.fields.push(fieldObj);

		}

		return valid;

	};

	FormTracking.prototype.addForm = function(){

		var thisForm = this;

		this.view.inputFormName.removeClass('invalid');
		this.view.inputSubmitId.removeClass('invalid');
		$('.input_datapoint').removeClass('invalid');
		$('.input_id').removeClass('invalid');

		if(this.isValid()){
			
			$('.aFormBox').addClass('spinning');

			console.log(thisForm.model);

			$.ajax({
				url: '/api/forms/' + thisForm.model.domain + '/add',
				method: 'POST',
				data: {
					name: thisForm.model.form.name,
					submit_id: thisForm.model.form.submit_id,
					fields: thisForm.model.form.fields
				},
				success: function(data){

					$('.aFormBox').removeClass('spinning');
					if(data.success){
						thisForm.view.displayMessage(false, data.success);
					}else{
						thisForm.view.displayMessage(true, data.error);
					}

				},
				error: function(a, b, c){
					thisForm.view.displayMessage(true, 'Something went wrong');
					$('.aFormBox').removeClass('spinning');
				}
			});

		}

	};

	FormTracking.prototype.updateModelFromView = function() {
		
		this.model.domain = $('.aFormBox').data('domain') || $('.webForms').data('domain');

		// var modelForm = this.model.form;

		// if($('.aFormBox').length){
		// 	var formFieldLis = $('#formFields li');
		// 	this.model.form.name = $('#q_formname').val();
			
		// 	for(i=0; i<formFieldLis.length; i++){

		// 		var li = formFieldLis[i];
		// 		modelForm.fields.push();
		// 	}
		// }

	};

	var formTracking = new FormTracking(Model, View);

}(PopUp));