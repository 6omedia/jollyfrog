/*

	CSS to add...

	.c_modal {
	    position: fixed;
	    width: 100%;
	    height: 100%;
	    background: rgba(0,0,0,0.8);
	    top: 0px;
	}

	.c_modal .box {
	    background: #fff;
	    padding: 25px;
	    width: 365px;
	    text-align: center;
	    margin: 85px auto;
	}

	.c_modal button {
	    margin: 0px 5px;
	    background: #327172;
	    color: #fff;
	    border: none;
	    padding: 5px 15px;
	    border-radius: 2px;
	    cursor: pointer;
	}

*/

var PopUp = (function(){

	// var exports = {};

	class Popup {

		popUp(message, customform){

			const thisClass = this;

			let modal = $('<div>', {"class": "c_modal"});
			let box = $('<div>', {"class": "box"});
			let msg = $('<p>').html(message);

			let yesBtn = $('<button>', {"class": "yesBtn"}).html('yes').on('click', function(){
							thisClass.positiveFunc();
						});

			let noBtn = $('<button>', {"class": "noBtn"}).html('no').on('click', function(){
							thisClass.negativeFunc();
						});

			box.append(msg);

			if(customform !== undefined){

				box.append(customform);

			}else{
			
				box.append(yesBtn);
				box.append(noBtn);

			}

			modal.append(box);

			$('body').append(modal);

			$('.c_modal').on('click', function(e){

		  		if(!$(e.target).is('.c_modal')){
		            e.preventDefault();
		            return;
		        }

				thisClass.popDown();
			});

			if(customform !== undefined){
				this.positiveFunc();
			}

		}

		popDown(){

			$('.c_modal').remove();
			$('.c_modal').off();

		}

		constructor(positiveFunc, negativeFunc){
			this.positiveFunc = positiveFunc;
			this.negativeFunc = negativeFunc;
		}

	}

	return Popup;

}());
