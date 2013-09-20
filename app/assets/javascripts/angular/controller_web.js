function loadmasterCtrl($scope,$element,$attrs) {
	
	$scope.selectTableRow = function(controller,id){
		console.log('selectTableRow ran')
		window.location.href="/"+controller+"/"+id
	}
	
	$scope.preventDefault = function($event){
		$event.preventDefault();
		$event.stopImmediatePropagation();
	}
	
}