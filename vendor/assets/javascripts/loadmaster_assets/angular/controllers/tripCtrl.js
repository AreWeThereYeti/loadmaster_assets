/* trip controller with angularjs */
LoadmasterApp.controller('tripCtrl', function($scope, $element, $attrs, $http, $compile, Helpers) {

	$scope.current_map_scope="set_start_address"
	
	$scope.cargo_types = ['Dyr', 'Korn', 'Jord', 'Stabilgrus', 'Sand', 'Grus', 'Sten', 'Cement', 'Kalk', 'Mursten', 'foder', 'Malm', 'Halm'];

	/* 	Submit buttons */
	$scope.submit_start = function($event) {
		$event.preventDefault()
		$($event.target).parent().addClass('ui-btn-pressed')
		$scope.buttonDisable("#submit_start")
		if(!!$scope.start_location || $scope.start_address){
			$scope.AddStartValuesToDB({
				cargo			:	$scope.cargo,
				start_timestamp	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
				start_location	:	$scope.start_location,
				start_address	:	$scope.start_address,
				start_comments	:	$scope.start_comments.replace(/"/g , "-"); // Removes " if present in string
			});
		}else{
			alert('Vi har desværre ikke fundet din position endnu. Prøv igen')
		}
	};
		
	$scope.submit_end = function($event) {
		$event.preventDefault()
		$($event.target).parent().addClass('ui-btn-pressed')
		$scope.buttonDisable("#submit_end")
		if(!!$scope.end_location || $scope.end_address){
			//$scope.releaseWakeLock();
			$scope.AddEndValuesToDB({
				end_timestamp 	:	moment().format("YYYY-MM-DD HH:mm:ss Z"),
				end_location	:	$scope.end_location,
				end_address		:	$scope.end_address,
				end_comments	:	$scope.end_comments.replace(/"/g , "-"); // Removes " if present in string
			});
		}else{
			alert('Vi har desværre ikke fundet din position endnu. Prøv igen')
		}
	};
	
	/* 	Starting new trip*/
	$scope.submitStartNewTrip = function($event){
		$event.preventDefault();
		$($event.target).parent().addClass('ui-btn-pressed')
		$scope.$root.resetAllVals();
		$scope.buttonDisable("#submit_start");
		$scope.buttonDisable("#submitStartNewTrip")
		$.mobile.changePage("#home");

	}
	
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
	
	// this is the function that puts values into the database from page #home
	$scope.AddStartValuesToDB = function(trip) {
		$scope.start_timestamp = moment().format("HH:mm:ss DD-MM-YYYY")
	 
		// this is the section that actually inserts the values into the User table
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO Trip(_cargo, _start_timestamp, _start_location, _start_address, _start_comments) VALUES ("'+trip.cargo+'", "'+trip.start_timestamp+'", "'+trip.start_location+'", "'+trip.start_address+'", "'+trip.start_comments+'")');	
			},
			function error(err){alert("Ups, noget gik galt da vi prøvede at starte din tur. Prøv venligst igen")}, 
			function success(){
				$scope.$emit("setcargo", $scope.cargo)
				$scope.cargo = null;
				$('#comments_start').val('');
				$("select").prop("selectedIndex",0);
				$('select').selectmenu('refresh', true);
				$.mobile.changePage("#two");
				//$scope.startWakeLock()
			}
		);
		return false;
	}	
	
	// this is the function that puts values into the database from page #home
	$scope.AddEndValuesToDB = function(trip) {
		$scope.end_timestamp = moment().format("HH:mm:ss DD-MM-YYYY")

		// this is the section that actually inserts the values into the User table
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('UPDATE Trip SET _end_timestamp ="'+trip.end_timestamp+'", _end_location ="'+trip.end_location+'", _end_address ="'+trip.end_address+'", _end_comments ="'+trip.end_comments+'", _is_finished = 1 WHERE Id = (SELECT MAX(Id) from Trip)',[],function(tx,rs){
			});
			},function error(error){
				alert("Ups, noget gik galt da vi prøvede at gemme din tur. Prøv venligst igen")
				console.log(error)
			},function success(data){
				$('#comments_end').val(''); 
				$.mobile.changePage("#three")
			}
		)
	}
	
			/* 	Set positions */
	$scope.$on('setstart_location',function(ev,start_location){
		$scope.start_location=start_location;
	});
	
	$scope.$on('setend_location',function(ev,end_location){
		$scope.end_location=end_location;
	})
	
	$scope.$on('set_start_address',function(ev,address){
		$scope.start_address=address
	})
	
	$scope.$on('set_end_address',function(ev,address){
		$scope.end_address=address
	})
	
	$scope.$watch('cargo + start_location + start_address', function () {
		if($("#home").is(':visible')){
			if(!!$scope.cargo && $scope.cargo.length>0 && (!!$scope.start_location || (!!$scope.start_address && $scope.start_address.length>0))){
				$scope.buttonEnable("#submit_start")
			} else {
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
	
	$scope.showLastTrip = function(){
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Trip WHERE _is_finished = 1 AND Id = (SELECT MAX(Id) from Trip)',[],function(tx,rs){
				if(rs.rows.length>0){
					if(!$scope.$root.applyInProggess($scope)){
						$scope.$apply(function(){
							$scope.drawTrip($scope.formatSQLDbTrip(rs.rows.item(0)))
						})
					}else{ $scope.drawTrip($scope.formatSQLDbTrip(rs.rows.item(0))) }	
				}else{
					if(!$scope.$root.applyInProggess(scope)){
						$scope.$apply(function(){
							$scope.trip=null
						})
					}else{ $scope.trip=null }
				}
			});
			},function error(error){
				alert("We're sorry but something went wrong when trying to show your trip. Please try again")
				$scope.trip=null
			},function success(data){
				$scope.buttonEnable("#submitStartNewTrip")
			}
		)
	}
	
	$scope.drawTrip = function(trip){
		$scope.trip=trip
		$scope.compileMap($element.find('#three').find('.map_container'),"<div ng-map-finish startlocation=trip.startlocation endlocation=trip.endlocation startaddress=trip.startaddress endaddress=trip.endaddress></div>")	
	}
	
	$scope.formatSQLDbTrip = function(trip){
		if(trip._start_location!=null && trip._end_location!=null && trip._start_location!="null" && trip._end_location!="null"){
			trip.startlocation=trip._start_location		//passing variables with underscore to view in $compile throws error using vars without underscore instead
			trip.endlocation=trip._end_location
		}else{
			trip.startlocation=null
			trip.endlocation=null
		}
		trip.startaddress=trip._start_address
		trip.endaddress=trip._end_address
		trip.start_timestamp=moment(trip._start_timestamp).format("HH:mm:ss DD-MM-YYYY")
		trip.end_timestamp=moment(trip._end_timestamp).format("HH:mm:ss DD-MM-YYYY")
		trip.cargo=trip._cargo
		
		return trip
	}
	
	$scope.compileMap = function(el,map){
		try{
			$compile(el.append(map))($scope)
		}catch(err){
			console.log('failed to comple map: ')
			console.log(err)
		}
		
	}	
	
	$scope.buttonEnable = function(id){
		$(id).button("enable");
		$(id).button("refresh");
	}
	
	$scope.buttonDisable = function(id){
		if($(id).attr('disabled')!="disabled"){
			$(id).button("disable");
			$(id).button("refresh");
		}
	}

})             
