function invoiceCtrl($scope,$element,$attrs) {
	
	$scope.items=[]
	$scope.total_price=0
	$scope.tax=0.25
	
	$scope.init = function(){
		$scope.items.push({
			nr:null,
			description:null,
			units:null,
			unit_price:null,
			total_price:null	
		})
	}
	
	$scope.addItemRow = function(){
		$scope.items.push({
			nr:null,
			description:null,
			units:null,
			unit_price:null,
			total_price:null	
		})
	}
	
	$scope.$watch('items',function(newVal){
		$scope.total_price=0
		for(var i=0;i<$scope.items.length;i++){
			$scope.total_price+=Math.round(Number($scope.items[i].total_price)*100)/100 
		}
		$scope.taxes=Math.round($scope.total_price*$scope.tax*100)/100
		$scope.total_price_with_taxes=Math.round(($scope.total_price+$scope.taxes)*100)/100
	},true)  //true means deep watch
	
	$scope.submit = function(ev){
		ev.preventDefault()
		var url=$('#invoice-form-page').find('form').attr('action')
		var raw_data=$('#invoice-form-page').find('form').serializeArray()
		var data={}
		for(var i=0;i<raw_data.length;i++){
			data[raw_data[i].name]=raw_data[i].value
		}
		data['trips']=$scope.items
		data['netto_price']=$scope.total_price
		data['brutto_price']=$scope.total_price_with_taxes
		data['taxes']=$scope.taxes
		
		$.ajax({
			type:'POST',
		  url: url,
		  data:data,
			success:function(data){
				console.log('sucess!!')
 				window.location.href=data.redirect_url
			},
			error:function(err){
				console.log(err)
				alert('Du har ikke udfyldt alle felter korrekt. Prøv igen')
			}
		});
	}
	 
}

