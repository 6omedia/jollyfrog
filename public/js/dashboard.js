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

	var dashboard = new Dashboard(Model, View);

}(PopUp));