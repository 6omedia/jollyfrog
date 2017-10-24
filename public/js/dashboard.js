(function(Popup){

	function Model(obj){
		this.apikey = obj.apikey;
	}
	Model.prototype.genApiKey = function(callback){
		$.ajax({
			url: '/api/dashboard/generateapikey',
			method: 'POST',
			success: function(data){
				callback(data);
			},
			error: function(a, b, c){
				console.log(a, b, c);
				callback({});
			}
		});
	};

	function View(){
		this.apikey = $('#apikey'),
		this.genApiKey = $('#genApiKey'),
		this.genNewApiKey = $('#genNewApiKey')
	}
	View.prototype.startPanelSpin = function(btn){
		$(btn).closest('.panel').addClass('panspin');
	};
	View.prototype.stopPanelSpin = function(btn){
		$(btn).closest('.panel').removeClass('panspin');
	};

	function Dashboard(Model, View){

		var view = new View();
		var model = new Model({});

		/*** events ***/

		view.genApiKey.on('click', function(){

			var thisBtn = this;
			view.startPanelSpin(thisBtn);
			model.genApiKey(function(data){
				if(!data.success){
					alert('There was a problem');
				}
				view.stopPanelSpin(thisBtn);
			});

		});

		view.genNewApiKey.on('click', function(){

			var thisBtn = this;

			var areYouSure = new Popup(
				function(){

					view.startPanelSpin(thisBtn);
					areYouSure.popDown();
					model.genApiKey(function(data){
						if(!data.success){
							alert('There was a problem');
						}
						console.log(data);
						view.stopPanelSpin(thisBtn);
						view.apikey.text(data.apiKey);
					});

				},
				function(){
					this.popDown();
				}	
			);

			areYouSure.popUp('Are you sure you want to generate a new API key? Any websites being tracked with your old API key, will stop being tracked');

		});

	}

	Dashboard.prototype.updateModelFromView = function() {
		this.model.apikey = this.view.apikey.text();
	};

	Dashboard.prototype.genCode = function(apikey, clickId, formName, dps){

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

	var dashboard = new Dashboard(Model, View);

}(PopUp));