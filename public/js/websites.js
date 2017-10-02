(function(Popup){

	function Model(obj){
		this.websites = [];
	}
	Model.prototype.addWebsite = function(name, domain, callback){
		var thisModel = this;
		$.ajax({
			url: '/api/websites/add',
			method: 'POST',
			data: {
				name: name,
				domain: domain
			},
			success: function(data){
				if(data.error){
					return callback(data.error);
				}else{
					thisModel.websites = data.websites;
					return callback();
				}
			},
			error: function(a, b, c){
				console.log(a, b, c);
				callback(c);
			}
		});
	};
	Model.prototype.removeWebsite = function(domain, callback){
		var thisModel = this;
		$.ajax({
			url: '/api/websites/' + domain,
			method: 'DELETE',
			success: function(data){
				if(data.error){
					return callback(data.error);
				}else{
					thisModel.websites = data.websites;
					return callback();
				}
			},
			error: function(a, b, c){
				console.log(a, b, c);
				callback(c);
			}
		});
	};

	function View(){
		this.addNewForm = $('#new_website_form');
		this.addNewBtn = $('#add_new');
		this.addWebsiteForm = {
			name: $('#q_name'),
			domain: $('#q_domain')
		}
		this.websiteList = $('.websiteList');
	}
	View.prototype.toggleAddwebsite = function(btn){
		if($(btn).hasClass('open')){
			$(btn).removeClass('open');
			this.addNewForm.slideUp(200);
		}else{
			$(btn).addClass('open');
			this.addNewForm.slideDown(200);
		}
	};
	View.prototype.updateWebsites = function(websites){

		$('.websiteList').empty();

		for(i=0; i<websites.length; i++){
			var website = websites[i];
			var string = '';
			string += '<li data-domain="' + website.domain + '">';
			string += '<div class="actions">';
				string += '<a href="/websites/' + website.domain + '" class="stats"></a>';
				string += '<span class="edit"></span>';
				string += '<span class="remove"></span>';
			string += '</div>';
			string += '<label>Name</label>';
			string += '<input type="text" value="' + website.name + '" disabled="disabled" class="websiteName_input">';
			string += '<label>URL</label>';
			string += '<input type="text" value="' + website.domain + '" disabled="disabled" class="websiteDomain_input">';
			string += '<div class="btn save">Save</div>';
			string += '</li>';
			$('.websiteList').append(string);
		}

	};

	function Websites(Model, View){

		var view = new View();
		var model = new Model({});

		/*** events ***/

		$('.btn_openform').on('click', function(){
			view.toggleAddwebsite(this);
		});

		view.addNewBtn.on('click', function(){

			var name = view.addWebsiteForm.name.val();
			var domain = view.addWebsiteForm.domain.val();

			model.addWebsite(name, domain, function(error){
				if(!error){
					view.updateWebsites(model.websites);
					view.toggleAddwebsite($('.btn_openform'));
				}else{
					alert('Error: ', error);
				}
			});
		});

		view.websiteList.on('click', '.remove', function(){

			var domain = $(this).parent().parent().data('domain');

			var areYouSure = new Popup(
				function(){

					$('.theSide .websites').addClass('spinning');
					this.popDown();

					model.removeWebsite(domain, function(error){
						if(!error){
							view.updateWebsites(model.websites);
						}else{
							alert('Error: ', error);
						}
						$('.theSide .websites').removeClass('spinning');
					});

				},
				function(){
					this.popDown();
				}	
			);

			areYouSure.popUp('Are you sure you want to remove this website?');

		});

	}

	Websites.prototype.updateModelFromView = function() {
		
	};

	var websites = new Websites(Model, View);

}(PopUp));