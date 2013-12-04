var LoadmasterApp = angular.module("loadmaster",[])
LoadmasterApp.controller('loadmasterCtrl',function($scope,$element,$attrs) {
	
	$scope.IS_MOBILE=false
	
	$scope.selectTableRow = function(controller,id,event){
		if(!!event && $(event.target).attr('type')!="submit"){
			window.location.href="/"+controller+"/"+id
		}
	}
	
	$scope.preventDefault = function($event){
		$event.preventDefault();
		$event.stopImmediatePropagation();
	}
	
})