function JFrogForm(name, sBtn, fields, trackObj, url){

	var thisFrogForm = this;

	this.name = name;
	this.submitBtn = sBtn;
	this.fields = fields;

	if(document.getElementById(this.submitBtn)){
		document.getElementById(this.submitBtn).addEventListener('click', function(){
			
			console.log('Clicked!');

			thisFrogForm.submitForm(thisFrogForm, trackObj, url);

		});
	}

}
JFrogForm.prototype.getValues = function(fields){

	for(i=0; i<fields.length; i++){

		var field = fields[i];

		if(field.required){
			if(document.getElementById(field.field_id)){
				if(document.getElementById(field.field_id).value == ''){
					return false;
				}else{
					field.value = document.getElementById(field.field_id).value; 
				}
			}
		}

	}

	return fields;

};
JFrogForm.prototype.submitForm = function(form, trackObj, url){

	var values = this.getValues(form.fields);

	if(values != false){

		var dps = [];

		console.log('form.fields ', form.fields);

		for(i=0; i<form.fields.length; i++){

			var value = '';
            
			var element = document.getElementById(form.fields[i].input_id);
			
			if(element){
				var value = element.value;
			}

            dps.push({
                name: form.fields[i].data_point,
                value: value
            });

		}

		trackObj.form_name = form.name;
        trackObj.datapoints = dps;

        console.log('TrackObj ', trackObj.datapoints);

		var url = url + '/api/log_formsubmission';

		var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function(data){
	        
	    	console.log('Ghjk ', data);

	        if(this.readyState == 4){
	        	console.log('Yeah');
	        }
	    };
	    xhttp.open("POST", url, true);
	    xhttp.setRequestHeader("Content-Type", "application/json");
	    xhttp.send(JSON.stringify(trackObj));

	}

};

/********* The Main Frog **********/

function JFrog(url){
	this.forms = [];
	this.url = url;
	this.device = {};
} 
JFrog.prototype.doIt = function(apiKey, c){

    this.trackObj = {
        apikey: apiKey,
        domain: window.location.hostname,
        url: window.location.href,
        fingerprint: c.getFingerprint(),
        type: c.getDeviceType() || '',
        vendor: c.getDeviceVendor() || '',
        browser: c.getBrowser(),
        os: c.getOS(),
        screen: {
            res: c.getAvailableResolution(),
            colorDepth: c.getColorDepth()
        },
        timezone: c.getTimeZone(),
        language: c.getLanguage(),
        meta: {
            funnel_position: document.getElementById('tracking_info').dataset.funnel_position || ''
        },
        referer: document.referrer
    };

	// add page view
	this.trackPageView(this.trackObj);

	// check for forms under this domain to setup
	this.findForms(apiKey);

};
JFrog.prototype.trackPageView = function(trackObj){

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4){
        	console.log('track page ', this.response);
        }
    };
    var url = this.url + '/api/log_page_view';
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(trackObj));

};
JFrog.prototype.findForms = function(apiKey){

	var thisFrog = this;

	var url = this.url + '/api/forms/' + window.location.hostname + '?apikey=' + apiKey;
	var formTrackObj = thisFrog.trackObj;

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4){

        	var forms = JSON.parse(this.response).forms;

        	console.log(forms);

        	for(i=0; i<forms.length; i++){

				var aForm = new JFrogForm(
						forms[i].name,
						forms[i].submit_id,
						forms[i].fields,
						formTrackObj,
						thisFrog.url
					);

				thisFrog.forms.push(aForm);

			}

			console.log('FORMS ', thisFrog.forms);

        }
    };
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();

};