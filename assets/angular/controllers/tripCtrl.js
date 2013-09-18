/* trip controller with angularjs */
function tripCtrl($scope, $http) {

	/* 	Submit buttons */
	$scope.submit = function($event) {
		$event.preventDefault();
		$scope.AddStartValuesToDB({
			license_plate	:	$scope.license_plate,
			cargo			:	$scope.cargo,
			start_timestamp	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
			start_location	:	$scope.start_location,
			start_address	:	$scope.start_address,
			start_comments	:	$scope.start_comments
		});
		$scope.license_plate 	= null;
		$scope.cargo 			= null;
		$scope.start_location=[null,null];
		$('#comments_start').val('');
		$("select").prop("selectedIndex",0);
		$('select').selectmenu('refresh', true);
		$.mobile.changePage("#two");
	};
		
	$scope.submit_end = function($event) {
		$event.preventDefault();
		$scope.AddEndValuesToDB({
			end_timestamp 	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
			end_location	:	$scope.end_location,
			end_address		:	$scope.end_address,
			end_comments	:	$scope.end_comments
		});
		$scope.end_location=[null,null]
		$('#comments_end').val(''); 
		$.mobile.changePage("#three");
		$("#submit_end").button("disable");
		$("#submit_end").button("refresh");
		$("#submit_start").button("disable");
		$("#submit_start").button("refresh");
	};
	
			/* 	Set positions */
	$scope.$on('setstart_location',function(ev,start_location){
		$scope.start_location=start_location;
	});
	
	$scope.$on('setend_location',function(ev,end_location){
		$scope.end_location=end_location;
	})
	
	$scope.$watch('license_plate + cargo + start_location + start_address', function () {
		if($("#home").is(':visible')){
			if(!!$scope.license_plate && !!$scope.cargo && $scope.license_plate != "0" && $scope.cargo != "0"){
				if((!!$scope.start_location && !!$scope.start_location[0] && !!$scope.start_location[1]) || (!!$scope.start_address && $scope.start_address !="")){
					if(!!$("#submit_start")){
						$scope.enableSubmitBtn("#submit_start")		
					}
				}else{
					$scope.disableSubmitBtn("#submit_start")
				}	
			}
			else {
				$scope.disableSubmitBtn("#submit_start")
			}
		}			
	});
	
	$scope.disableSubmitBtn = function(id){
		if(!!$(id)){
			$(id).button("disable");
			$(id).button("refresh");
		}
	}
	
	$scope.enableSubmitBtn = function(id){
		if(!!$(id)){
			$(id).button("enable");
			$(id).button("refresh");
		}
	}
	
	$scope.$watch('access_token', function () {
		if($("#tokencontainer").is(':visible')){
			if(!!$scope.access_token && !!$scope.imei){
					$("#submit_accesstoken").button("enable");
					$("#submit_accesstoken").button("refresh");			
				}
			else if($scope.access_token == "" || $scope.imei == "" || $scope.access_token == null || $scope.imei == null || $scope.access_token == undefined || $scope.imei == undefined){
					$("#submit_accesstoken").button("disable");
					$("#submit_accesstoken").button("refresh");			
				}			
			}			
	});
	
	$scope.$watch('end_location + end_address', function () {
		if($("#two").is(':visible')){
			if((!!$scope.end_location && !!$scope.end_location[0] && !!$scope.end_location[1]) || (!!$scope.end_address && $scope.end_address !="") && !!$("#submit_end")){
				$scope.enableSubmitBtn("#submit_end")	
			}
			else {
				$scope.disableSubmitBtn("#submit_end")
			}
		}
	});

}             