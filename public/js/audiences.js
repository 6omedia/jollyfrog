(function(Popup, Form){

	function Model(){
		
	}

	Model.prototype.saveAudience = function() {
		
	};

	function View() {
		this.name_input = $('#q_name');
	}

	function getDomains() {

		var domains = [];
		var checkBoxes = $('.domain_list .checkBox');

		checkBoxes.each(function(){
			if($(this).hasClass('ticked')){
				domains.push($(this).data('value'));
			}
		});

		return domains;

	}

	function getBrowsers() {

		var browsers = [];
		var checkBoxes = $('.browser_list .checkBox');

		checkBoxes.each(function(){
			if($(this).hasClass('ticked')){
				browsers.push($(this).data('value'));
			}
		});

		return browsers;

	}

	function refreshAudiences(audiences) {

		var list = $('#audiences');
		list.empty();

		for(var i=0; i<audiences.length; i++){

			var audience = audiences[i];

			var str = '';
			str += '<li>';
				str += '<div class="actions" data-audiencesid="' + audience._id + '">';
					str += '<a href="/audiences?id=' + audience._id + '" class="emails"></a>';
					str += '<a href="/audiences/edit/' + audience._id + '" class="edit"></a>';
					str += '<span class="remove"></span>';
				str += '</div>';
				str += '<p>' + audience.name + '</p>';
			str += '</li>';

			list.append(str);

		}

	}

	function deleteAudience(id, callback) {

		$.ajax({
			url: '/api/audiences/' + id,
			type: 'DELETE',
			dataType: 'json',
			success: function(data){

				console.log('audiences ', data);

				if(data.error){
					callback(data.error);
				}else{
					callback(null, data.audiences);
				}
			},
			error: function(xhr, desc, err){
				console.log(xhr, desc, err);
				callback({error: xhr.responseJSON});
			}
		});

	}

	// function updateAudience(id, callback) {

	// 	$.ajax({
	// 		url: '/api/audiences/update/' + id,
	// 		type: 'POST',
	// 		dataType: 'json',
	// 		data: {
	// 			name: String,
	// 	        domains: Array,
	// 	        browser: Array,
	// 	        category: Array,
	// 	        funnel_position: String
	// 		},
	// 		success: function(data){

	// 			console.log('audiences ', data);

	// 			if(data.error){
	// 				callback(data.error);
	// 			}else{
	// 				callback(null, data.audiences);
	// 			}
	// 		},
	// 		error: function(xhr, desc, err){
	// 			console.log(xhr, desc, err);
	// 			callback({error: xhr.responseJSON});
	// 		}
	// 	});

	// }

	var view = new View();

	var domainSelect = $('#domains + .multiple_select');
	var categorySelect = $('#cats + .multiple_select');
	var theError = $('#theError');

	var formFields = [
		{
			id: 'q_name',
			validation: ''
		},
		{
			id: 'domains',
			validation: function(){

				if(getDomains().length > 0){
					return true;
				}else{
					return false;
				}

			},
			message: 'No Domains Selected'
		},
		{
			id: 'q_cats',
			validation: 'none'
		},
		{
			id: 'browsers',
			validation: 'none'
		},
		{
			id: 'funnel_position',
			validation: 'none'
		}
	];

	var saveForm = new Form('/api/audiences/add', formFields);
	var updateForm = new Form('/api/audiences/update', formFields);

	$('body').on('click', function(e){

		if($(e.target).closest('.multiple_select').length == 0 && !$(e.target).hasClass('like_input')){
			$('#domains').removeClass('open');
			$('#browsers').removeClass('open');
		}

	});

	$('#domains').on('click', function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
		}else{
			$(this).addClass('open');
		}
	});

	$('#browsers').on('click', function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
		}else{
			$(this).addClass('open');
		}
	});

	$('.checkBox').on('click', function(){
		
		if($(this).hasClass('ticked')){
			$(this).removeClass('ticked');
		}else{
			$(this).addClass('ticked');
		}

		var likeInput = $(this).closest('.multiple_select').prev('.like_input');

		if(likeInput.hasClass('domains')){
			likeInput.children('span').text(getDomains().length + ' ');
		}else{
			likeInput.children('span').text(getBrowsers().length + ' ');
		}

	});

	$('#save').on('click', function(){

		if(saveForm.isValid()){

			$('#spin').addClass('spinning');

			var data = {
				name: $('#' + saveForm.fields[0].id).val(),
				domains: getDomains(),
				cats: $('#q_cats').val().split(','),
				browsers: getBrowsers(),
				funnel_position: $('#' + saveForm.fields[4].id).val()
			};

			saveForm.send(data, function(data){

				$('#spin').removeClass('spinning');

				if(data.audiences){
					
					refreshAudiences(data.audiences);
					var msg = new Message('Audience created', false, $('#theMessage'));
					msg.display();

				}else{
					var theMsg = data.error || data.responseJSON.error || 'Something went wrong';
					var msg = new Message(theMsg, true, $('#theMessage'));
					msg.display();
				}

			});

		}else{
			var theMsg = 'Fill out missing fields';
			var msg = new Message(theMsg, true, $('#theMessage'));
			msg.display();
		}

	});

	$('#update').on('click', function() {

		var audienceid = $(this).data('audienceid');

		if(updateForm.isValid()){

			$('#spin').addClass('spinning');

			var data = {
				audienceid: audienceid, 
				name: $('#' + updateForm.fields[0].id).val(),
				domains: getDomains(),
				cats: $('#q_cats').val().split(','),
				browsers: getBrowsers(),
				funnel_position: $('#' + updateForm.fields[4].id).val()
			};

			updateForm.send(data, function(data){

				$('#spin').removeClass('spinning');

				if(data.audiences){
					refreshAudiences(data.audiences);
					var msg = new Message('Audience created', false, $('#theMessage'));
					msg.display();
				}else{
					var theMsg = data.error || data.responseJSON.error || 'Something went wrong';
					var msg = new Message(theMsg, true, $('#theMessage'));
					msg.display();
				}

			});

		}else{
			var theMsg = 'Fill out missing fields';
			var msg = new Message(theMsg, true, $('#theMessage'));
			msg.display();
		}

	});

	// delete

	$('.audiences').on('click', '.remove', function(){

		var audienceId = $(this).closest('.actions').data('audiencesid');

		var popUp = new Popup(
			function(){
				deleteAudience(audienceId, function(err, audiences){
					if(!err){
						refreshAudiences(audiences);
						var msg = new Message('Audience Removed', false, $('#theMessage'));
						msg.display();
					}else{
						var msg = new Message(err || 'Something went wrong', true, $('#theMessage'));
						msg.display();
					}
					popUp.popDown();
				});
			},
			function(){
				popUp.popDown();
			}
		);

		popUp.popUp('Are you sure you want to delete this audience?');

	});

})(PopUp, form.Form);