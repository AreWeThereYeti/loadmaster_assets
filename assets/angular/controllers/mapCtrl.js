function mapCtrl($scope,$element,$attrs) {
	/* 			Initialize map */
	$scope.initialize = function(latitude, longitude) {
		if(!latitude){var latitude=55.724355}
		if(!longitude){var longitude=12.268982}
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
		}else{
			$scope.map = new google.maps.Map($element.find('.map-container')[0], $scope.mapOptions);    
		}
	}

	$scope.addMarkerToMap = function( latitude, longitude, label ){
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
	
	$scope.centerOnMarkers = function(){
		$scope.map.fitBounds($scope.bounds);
		if($scope.map.getZoom()>15){
			$scope.map.setZoom(14)
		}
	}
	
	$scope.startWatchPosition = function(){
		$scope.positionTimer = navigator.geolocation.watchPosition(function( position ){
			if(!$scope.locationMarker){
				$scope.locationMarker = $scope.addMarkerToMap(
					position.coords.latitude,
					position.coords.longitude,
					"Initial Position"
				);
			}
			$scope.updateMarker($scope.locationMarker, position.coords.latitude, position.coords.longitude, "Updated / Accurate Position");
			$scope.$emit($scope.map_set_position, [position.coords.latitude, position.coords.longitude]);
		}, $scope.errorHandler, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
		
		setTimeout(function(){
			navigator.geolocation.clearWatch( positionTimer );
			}, (1000 * 60 * 5)
		);	
	}

	$scope.errorHandler = function(){
		$scope.gpsNotFound();
		console.log("an error occured")
	}

	$scope.gpsStateUndefined = function(){
		return $scope.gps_found==null;
	}
	
	$scope.gpsFound = function(){
		return $scope.gps_found==true
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_found==false;
	}
	
	$scope.refreshMap = function(){
		window.the_scope=$scope
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
			$scope.centerOnMarkers()
		}, 20)
	}
	
	$scope.$on('resfreshMap',function(){
		$scope.refreshMap()
	})
	
}