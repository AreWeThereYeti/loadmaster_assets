LoadmasterApp.controller('mobileRegistrationCtrl',function($scope,$element,$attrs,Helpers){
	
	$scope.submitToken = function($event){
		// this is the section that actually inserts the values into the User table
		$event.preventDefault();
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO AUTH (access_token, imei, license_plate) VALUES ("'+$scope.access_token+'", "'+$scope.imei+'", "'+$scope.license_plate+'")',[]);
			},function error(err){
				alert("We're sorry but something went wrong. Please try again" + err)
				console.log(err)
			}, function success(){
				console.log('success saving access token')
				$.mobile.changePage("#home");
			}
		);
		
		return false;
	}
	
	$scope.$watch('license_plate + access_token + imei',function(){
		if(!!$scope.license_plate && !!$scope.access_token && !!$scope.imei){
			if($scope.license_plate.length > 8 && $scope.access_token.length > 8 && $scope.imei.length > 8){
				Helpers.buttonEnable("#submit_accesstoken")
			}else{
				Helpers.buttonDisable("#submit_accesstoken")
			}
		}
	})
	
})