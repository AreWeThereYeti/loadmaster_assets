LoadmasterApp.service('ServerAjax', function() {
	this.update = function(id,controller,data) {
		console.log('updating data:')
		console.log(data)
		$.ajax({
			type: "PUT",
			url: controller+'/'+id+'.json',
			data :  data,
			success: function (msg){
			},
			error: function (msg) {
				console.log('error updating reccord')
				console.log(msg)
			}
		});
	};
});

LoadmasterApp.service('Helpers', function() {
	this.hasInternet = function() {
		var has_internet=false
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if(app){
			if(typeof navigator === 'undefined' || typeof navigator.connection === 'undefined' || typeof navigator.connection.type === 'undefined' || typeof Connection === 'undefined'){
				console.log('cant see if there is internet, for some reason...')
			}
			else if(navigator.connection.type == Connection.CELL_2G || navigator.connection.type == Connection.CELL_3G || navigator.connection.type == Connection.CELL_4G || navigator.connection.type == Connection.WIFI ||navigator.connection.type == Connection.ETHERNET){
				//console.log('has internet')
				has_internet=true
			}
		}else{
			//console.log('was not app... has internet is true')
			has_internet=true
		}
		return has_internet;
	};
	
	this.buttonEnable = function(id){
		$(id).button("enable");
		$(id).button("refresh");
	}
	
	this.buttonDisable = function(id){
		$(id).button("disable");
		$(id).button("refresh");
	}
	
});