(function(ClientJS){

	function Model(obj){
		
	}
	Model.prototype.blockThisDevice = function(fingerprint, device_name, callback){
		
		$.ajax({
			url: '/api/blocked-devices/add',
			method: 'POST',
			data: {
				fingerprint: fingerprint,
				device_name: device_name
			},
			success: function(data){
				if(data.success){
					$.ajax({
						url: '/api/blocked-devices',
						method: 'GET',
						success: function(data){
							if(data.devices){
								callback(true, data.devices);
							}
						}
					});
				}else{
					callback(false, null);
				}
			},
			error: function(){
				callback(false);
			}
		});

	};
	Model.prototype.unblockDevice = function(fingerPrint, callback){

		$.ajax({
			url: '/api/blocked-devices/' + fingerPrint,
			method: 'DELETE',
			success: function(data){
				if(data.success){

					$.ajax({
						url: '/api/blocked-devices',
						method: 'GET',
						success: function(data){
							if(data.devices){
								callback(true, data.devices);
							}
						}
					});
					
				}else{
					callback(false, null);
				}
			},
			error: function(){
				callback(false, null);
			}
		});

	};

	function View(){
		this.mainBit = $('.main_bit');
		this.deviceNameInput = $('#deviceNameInput');
	}
	View.prototype.loadDeviceBlockedScreen = function(){

		this.mainBit.empty();
		this.mainBit.append('<p>This device is not being tracked on your websites</p>');

	};
	View.prototype.loadNormalScreen = function(){

		this.mainBit.empty();
		
		this.mainBit.append('<p>This device is not blocked from the websites your tracking.</p>');
		this.mainBit.append('<p>If you want to block this device click below</p>');
		this.mainBit.append('<input id="deviceNameInput" type="text" placeholder="Device Name...">');
		this.mainBit.append('<div class="btn blockDevice">Block This Device</div>');

	};
	View.prototype.loadErrorScreen = function(error){	

		this.mainBit.empty();
		this.mainBit.append('<p>Something went wrong... Specificly ' + error + '</p>');

	};
	View.prototype.refreshDevice = function(devices){

		$('#blockedDevices_list').empty();

		for(i=0; i<devices.length; i++){
			var li = '';
			li += '<li data-fingerprint="' + devices[i].fingerprint + '">';
			li += '<span>' + devices[i].device_name + '</span>';
			li += '<span class="x">x</span>';
			li += '</li>';
			$('#blockedDevices_list').append(li);
		}

	};

	function BlockedDevices(Model, View){

		view = new View();
		model = new Model({});

		var client = new ClientJS();
		var thisFingerPrint = client.getFingerprint();

		$.ajax({
			url: '/api/blocked-devices/' + client.getFingerprint(),
			method: 'GET',
			success: function(data){
				
				if(data.device){
					$('.theContainer').removeClass('spinning');
					view.loadDeviceBlockedScreen();
				}else{
					$('.theContainer').removeClass('spinning');
					view.loadNormalScreen();
				}

			},
			error: function(error){
				view.loadErrorScreen(error);
			}
		});

		/*** events ***/

		view.mainBit.on('click', '.blockDevice', function(){
			var device_name = $('#deviceNameInput').val();
			if(device_name != ''){
				$('.theContainer').addClass('spinning');
				model.blockThisDevice(client.getFingerprint(), device_name, function(success, devices){
					if(success){
						view.loadDeviceBlockedScreen();
						view.refreshDevice(devices);
						$('.theContainer').removeClass('spinning');
					}else{
						alert('Something went wrong...');
					}
				});
			}else{
				alert('Please give this device a name');
			}
		});

		$('#blockedDevices_list').on('click', '.x', function(){
			model.unblockDevice($(this).parent().data('fingerprint'), function(success, devices){
				if(success){
					view.refreshDevice(devices);
					if(!devices.includes(thisFingerPrint)){
						view.loadNormalScreen();
					}
				}else{
					alert('Something went wrong...');
				}
			});
		});

	}

	BlockedDevices.prototype.updateModelFromView = function(ideaBoxes) {

	};

	var blockedDevices = new BlockedDevices(Model, View);

}(ClientJS));