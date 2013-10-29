LoadmasterApp.controller('tripsListItemCtrl',function($scope,$element,$attrs) {
	
	$scope.select = function(){
		$scope.showDetails=true;
		$scope.$broadcast('resfreshMap')
	} 
	
	$scope.unselect = function(){
		$scope.showDetails=false;
	}
	
	$scope.$on('showTripDetails',function(ev,id){
		id==$scope.id ? $scope.select() : $scope.unselect()
	})
	
	$scope.showDetails = function(){
		return $scope.showDetails
	}
	
})
