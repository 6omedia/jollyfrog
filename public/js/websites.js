(function(Popup){

	function Model(obj){
		this.domain = '';
		this.websites = [];
		this.currentFpFiler = 'All';
		this.form = {};
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
	Model.prototype.removeWebsite = function(websiteId, callback){
		var thisModel = this;
		$.ajax({
			url: '/api/websites/' + websiteId,
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
	Model.prototype.updateStats = function(fp, domain, callback){

		$.ajax({
			url: '/api/websites/' + domain + '/stats',
			method: 'GET',
			data: {
				funnelposition: fp
			},
			success: function(data){
				callback(data.page_views, data.unique_devices);
			},
			error: function(a, b, c){
				console.log(a, b, c);
				callback();
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
		this.filterLi = $('.filters li');
		this.tables = {
			pageviews: $('.pageviews table'),
			devices: $('.uniquedevices table')
		}
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
			string += '<li data-domain="' + website.domain + '" data-websiteid="' + website._id + '">';
			string += '<div class="actions">';
				string += '<a href="/websites/' + website.domain + '" class="stats"></a>';
				string += '<a href="/websites/forms/' + website.domain + '" class="forms"></a>';
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

	View.prototype.updatePageviews = function(pageViews){

		$('.pageviews table tr:not(:first)').remove();
		var table = $('.pageviews table');

		for(i=0; i<pageViews.length; i++){
			var pageView = pageViews[i];
			var tr = '';
			tr += '<tr>';
			tr += '<td class="thUrl">' + pageView.data_point.value + '</td>';
			tr += '<td>' + pageView.display_date + '</td>';
			tr += '<td>' + pageView.ip + '</td>';
			tr += '<td>' + pageView.browser + '</td>';
			tr += '<td>' + pageView.timezone + '</td>';
			tr += '</tr>';
			table.append(tr);
		}

	};

	View.prototype.updateDevices = function(devices){

		$('.uniquedevices table tr:not(:first)').remove();
		var table = $('.uniquedevices table');

		for(i=0; i<devices.length; i++){
			var device = devices[i];
			var type = device.type || '';
			var vendor = device.vendor || '';
			var tr = '';
			tr += '<tr>';
			tr += '<td>' + device.fingerprint + '</td>';
			tr += '<td>' + type + '</td>';
			tr += '<td>' + vendor + '</td>';
			tr += '<td>' + device.os + '</td>';
			tr += '</tr>';
			table.append(tr);
		}

	};

	function Websites(Model, View){

		var thisWebsites = this;

		var view = new View();
		var model = new Model({});

		this.updateModelFromView();

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

			var websiteId = $(this).parent().parent().data('websiteid');

			var areYouSure = new Popup(
				function(){

					$('.theSide .websites').addClass('spinning');
					this.popDown();

					model.removeWebsite(websiteId, function(error){
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

		view.filterLi.on('click', function(){
			thisWebsites.filterPageViews(this, view, model);
		});

	}

	Websites.prototype.filterPageViews = function(fpli, view, model){
		view.filterLi.removeClass('current');
		$(view.filterLi.get($(fpli).index())).addClass('current');

		view.tables.pageviews.addClass('spinning');
		view.tables.devices.addClass('spinning');
		model.updateStats($(fpli).text(), $('#theDomain').text(), function(pageviews, devices){
			view.updatePageviews(pageviews);
			view.updateDevices(devices);
			view.tables.pageviews.removeClass('spinning');
			view.tables.devices.removeClass('spinning');
		});
	};

	Websites.prototype.updateModelFromView = function() {
		
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

	var websites = new Websites(Model, View);

}(PopUp));