(function(Popup){

	function Model(){
		
	}

	Model.prototype.saveAudience = function() {
		
	};

	function View() {
		this.name_input = $('#q_name');
	}

	var view = new View();

	var domainSelect = $('#domains + .multiple_select');
	var categorySelect = $('#cats + .multiple_select');

	$('body').on('click', function(e){

		if($(e.target).closest('.multiple_select').length > 0){
			$('#domains').removeClass('open');
			$('#cats').removeClass('open');
		}

	});

	$('#domains').on('click', function(){
		if($(this).hasClass('open')){
			$(this).removeClass('open');
		}else{
			$(this).addClass('open');
		}
	});

	// View.prototype.toggleDate = function() {

	// 	var from = $('#from_dateBox');
	// 	var to = $('#to_dateBox');

	// 	if($(from).hasClass('disable')){
	// 		$(from).removeClass('disable');
	// 		$(to).removeClass('disable');
	// 	}else{
	// 		$(from).addClass('disable');
	// 		$(to).addClass('disable');
	// 	}
	// }

	// $('#q_from').datepicker();

	// var view = new View();

	// $('#date_toggle').on('change', function(){
	// 	view.toggleDate();
	// });

})(PopUp);