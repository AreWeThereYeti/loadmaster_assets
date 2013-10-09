LoadmasterApp.service('ServerAjax', function() {
	this.update = function(id,controller,data) {
		console.log('updating record with id: ' + id + ' and controller: ' + controller + ' and data: ')
		console.log(data)
		$.ajax({
			type: "PUT",
			url: controller+'/'+id+'.json',
			data :  data,
			success: function (msg)
			{
				console.log('succes!!!!')
			},
			error: function (msg) {
				console.log('error!')
				console.log(msg)
			}
		});
	};
});