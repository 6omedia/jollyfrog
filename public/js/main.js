function Message(msg, isError, elem){

	this.msg = msg;
	this.elem = elem;
	this.elem.find('p').html(msg);

	this.elem.removeClass('error_msg');

	if(isError){
		this.elem.addClass('error_msg');
	}

	var thisMsg = this;

	this.elem.find('.x').on('click', function(){
		thisMsg.hideMsg();
	});

}

Message.prototype.display = function(persist){

	this.elem.addClass("slideup");

	thisMsg = this;

	if(persist != true){
		setTimeout(function() {
	    	thisMsg.hideMsg();
	    }, 6000);
	}

};

Message.prototype.hideMsg = function(){

	$(this.elem).removeClass("slideup");

};