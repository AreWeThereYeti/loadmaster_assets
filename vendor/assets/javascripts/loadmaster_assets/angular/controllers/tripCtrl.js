/* trip controller with angularjs */
function tripCtrl($scope, $http) {

	
	$scope.cargo_types = ['Dyr', 'Korn', 'Jord', 'Stabilgrus', 'Sand', 'Grus', 'Sten', 'Cement', 'Kalk', 'Mursten', 'foder', 'Malm', 'Halm'];

	/* 	Submit buttons */
	$scope.submit = function($event) {
		$($event.target).parent().addClass('ui-btn-pressed')
		$scope.AddStartValuesToDB({
			cargo			:	$scope.cargo,
			start_timestamp	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
			start_location	:	$scope.start_location,
			start_address	:	$scope.start_address,
			start_comments	:	$scope.start_comments
		});
		$scope.$emit("setcargo", $scope.cargo)
		$scope.cargo 			= null;
		$('#comments_start').val('');
		$("select").prop("selectedIndex",0);
		$('select').selectmenu('refresh', true);
		$event.preventDefault();
		$.mobile.changePage("#two");
		//$scope.startWakeLock()
	};
		
	$scope.submit_end = function($event) {
		$($event.target).parent().addClass('ui-btn-pressed')
		//$scope.releaseWakeLock();
		$scope.AddEndValuesToDB({
			end_timestamp 	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
			end_location	:	$scope.end_location,
			end_address		:	$scope.end_address,
			end_comments	:	$scope.end_comments
		});
		$('#comments_end').val(''); 
		$event.preventDefault();
		$.mobile.changePage("#three");
		$scope.buttonDisable("#submit_end")
		$scope.buttonDisable("#submit_start")
	};
	
	$scope.startWakeLock = function() {
		if($scope.is_mobile_app()){
			cordova.require('cordova/plugin/powermanagement').acquire(
				function() { console.log( 'successfully acquired full wake lock' ); },
				function() { console.log( 'error acquiring full wake lock' ); }
			);
		}
	};
	
	$scope.releaseWakeLock = function() {
		if($scope.is_mobile_app()){
			cordova.require('cordova/plugin/powermanagement').release(
				function() { console.log( 'successfully released full wake lock' ); },
				function() { console.log( 'error releasing full wake lock' ); }
			);
		}
	};	
	
			/* 	Set positions */
	$scope.$on('setstart_location',function(ev,start_location){
		$scope.start_location=start_location;
	});
	
	$scope.$on('setend_location',function(ev,end_location){
		$scope.end_location=end_location;
	})
	
	$scope.$on('set_start_address',function(ev,address){
		console.log('setting start_address ')
		$scope.start_address=address
	})
	
	$scope.$on('set_end_address',function(ev,address){
		$scope.end_address=address
	})
	
	$scope.$watch('cargo + start_location + start_address', function () {
		console.log('checker om du kan submitte')
		if($("#home").is(':visible')){
			if(!!$scope.cargo && $scope.cargo.length>0 && (!!$scope.start_location || (!!$scope.start_address && $scope.start_address.length>0))){
				console.log('det kan du!')
				$scope.buttonEnable("#submit_start")
			} else {
				console.log('det kan du ikke!')
				$scope.buttonDisable("#submit_start")
			}
		}			
	});
	
	$scope.$watch('access_token', function () {
		if($("#tokencontainer").is(':visible')){
			if(!!$scope.access_token && $scope.access_token.length>0 && !!$scope.imei && $scope.imei.length>0){
				$scope.buttonEnable("#submit_accesstoken")
			}else{
				$scope.buttonDisable("#submit_accesstoken")
			}
		}			
	});
	
	$scope.$watch('end_location + end_address', function () {
		if($("#two").is(':visible')){
			if(!!$scope.end_location || !!$scope.end_address){
				$scope.buttonEnable("#submit_end")
			}else{
				$scope.buttonDisable("#submit_end")
			}
		}
	});
	
	$scope.buttonEnable = function(id){
		$(id).button("enable");
		$(id).button("refresh");
	}
	
	$scope.buttonDisable = function(id){
		$(id).button("disable");
		$(id).button("refresh");
	}

}             