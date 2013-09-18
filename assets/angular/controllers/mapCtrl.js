function mapCtrl($scope,$element,$attrs) {
	
	$scope.defaultLat=55.693745
	$scope.defaultLon=12.433777
		
	/* 			Initialize map */
	$scope.initialize = function(latitude, longitude,onCurrentLocation) {
		$scope.gps_found=undefined
		if(!$scope.map){
			if(!latitude){var latitude=$scope.defaultLat}
			if(!longitude){var longitude=$scope.defaultLon}
			$scope.bounds=new google.maps.LatLngBounds()
			$scope.mapOptions = {
			  center: new google.maps.LatLng(latitude, longitude), //Får ikke et coordinat til at starte med så viser grå skærm
			  zoom: 12,
			  streetViewControl: false,
			  zoomControl: true,
			  zoomControlOptions: {
			  	style: google.maps.ZoomControlStyle.LARGE
			  },
			  maptypecontrol :false,
			  disableDefaultUI: true,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
		
			if($scope.IS_MOBILE){
				$scope.map = new google.maps.Map(document.getElementById($scope.map_id), $scope.mapOptions); 
				$scope.refreshMapNoCenter()   
			}else{
				$scope.map = new google.maps.Map($element.find('.map-container')[0], $scope.mapOptions);    
			}
		}
	}
	
	$scope.initUIMap = function(start_input_id,end_input_id){
		$scope.start_marker = new google.maps.Marker({  
			map: $scope.map, 
			animation: google.maps.Animation.DROP,
		});
		$scope.autoCompleteInput($('#'+start_input_id)[0],$scope.start_marker)

		$scope.end_marker = new google.maps.Marker({  
			map: $scope.map, 
			animation: google.maps.Animation.DROP,
		});
		$scope.autoCompleteInput($('#'+end_input_id)[0],$scope.end_marker)
	}

	$scope.addMarkerToMap = function( latitude, longitude, label ){
		if(!latitude){var latitude=55.724355}
		if(!longitude){var longitude=12.268982}
		var markerPosition = new google.maps.LatLng(latitude, longitude)
		if(!$scope.IS_MOBILE || $scope.savebounds){
			$scope.bounds.extend(markerPosition)
		}
		var marker = new google.maps.Marker({
			map: $scope.map,
			animation: google.maps.Animation.DROP,
			position: markerPosition,
			title: (label || "")
		});
		return(marker);
	}
	
	$scope.updateMarker = function(marker, latitude, longitude, label ){
		marker.setPosition(new google.maps.LatLng(latitude, longitude));
		if (label){
			marker.setTitle( label );
		}
		$scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
	}
	
	$scope.removeMarker = function(marker){
		marker.setMap(null);
	}
	
	$scope.centerOnMarkers = function(bounds){
		if(!bounds){	var bounds=$scope.bounds }
		$scope.map.fitBounds(bounds);
		if($scope.map.getZoom()>15){
			$scope.map.setZoom(14)
		}
	}
	
	$scope.drawCurrentPosition =function(){
		navigator.geolocation.getCurrentPosition(
			function(position){
				$scope.$apply(function(){
					$scope.updatePosition(position.coords.latitude, position.coords.longitude)
					$scope.gps_found=true;
				})
			},
			function(errCode){
				$scope.$apply(function(){
					$scope.gps_found=false;
				})
			}, 
			{timeout: 5000}
		);
	}
	
	$scope.updatePosition = function(latitude, longitude){
		if(!$scope.locationMarker){
			$scope.locationMarker = $scope.addMarkerToMap(latitude, longitude,"Initial Position")
		}
		$scope.updateMarker($scope.locationMarker, latitude, longitude, "Updated / Accurate Position");
		$scope.$emit($scope.map_set_position, [latitude, longitude]);
	}

	
	// $scope.startWatchPosition = function(){
	// 	$scope.positionTimer = navigator.geolocation.watchPosition(function( position ){
	// 		$scope.updatePosition(position.coords.latitude, position.coords.longitude)
	// 		$scope.gps_found=true;
	// 	},function(){
	// 		console.log('failed getting current position from watchPosition')
	// 		$scope.gps_found=false;
	// 	}, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
	// }
	
	$scope.startWatchPosition = function(){
		$scope.drawCurrentPosition()
		$scope.watchPositionTimer=setInterval(function(){
			$scope.$apply(function(){
				$scope.drawCurrentPosition()
			})
		}, 5000);
	}

	$scope.$watch('gps_found',function(){
		if(!$scope.gps_found){
			$scope.$emit($scope.map_set_position, [null, null]);
		}
	})

	$scope.gpsStateUndefined = function(){
		return $scope.gps_found==null;
	}
	
	$scope.gpsFound = function(){
		return $scope.gps_found==true
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_found==false;
	}
	
	$scope.refreshMapNoCenter = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
		}, 20)
	}
	
	$scope.refreshMap = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
			$scope.centerOnMarkers()
		}, 20)
	}
	
	$scope.$on('resfreshMap',function(){
		$scope.refreshMap()
	})
	
	$scope.autoCompleteInput = function(input,marker){
		var autocompleteInput = new google.maps.places.Autocomplete(input);
		google.maps.event.addListener(autocompleteInput, 'place_changed', function(ev) {
			if(input.id=="trip_start_address"){
				lat_input="#trip_start_lat"
				lon_input="#trip_start_lon"
			}else if(input.id=="trip_end_address"){
				lat_input="#trip_end_lat"
				lon_input="#trip_end_lon"
			}
			$(lat_input).val(Number(autocompleteInput.getPlace().geometry.location.pb))
			$(lon_input).val(Number(autocompleteInput.getPlace().geometry.location.qb))
			
			var place=autocompleteInput.getPlace()
	
			marker.setPosition(place.geometry.location);
			marker.setVisible(true)
			
			if(!!$scope.start_marker.position){		
				var start_bound=new google.maps.LatLng($scope.start_marker.position.pb,$scope.start_marker.position.qb)	
				var bounds=new google.maps.LatLngBounds(start_bound)
			}
			if(!!$scope.end_marker.position){		
				var end_bound=new google.maps.LatLng($scope.end_marker.position.pb,$scope.end_marker.position.qb)	
				if(!!bounds){
					bounds.extend(end_bound)
				}else{
					var bounds=new google.maps.LatLngBounds(end_bound)
				}
			}
			$scope.centerOnMarkers(bounds);
		})
	}
	
	$scope.$on('setGpsFoundFalse',function(){
		$scope.gps_found=undefined
	})
}