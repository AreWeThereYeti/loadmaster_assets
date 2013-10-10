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
	this.help_me = function() {
		alert('helper called!')
	};
});