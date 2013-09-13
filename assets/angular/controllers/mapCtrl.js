function mapCtrl($scope,$element,$attrs) {
		
	/* 			Initialize map */
	$scope.initialize = function(latitude, longitude) {
		$scope.mapOptions = {
		  center: new google.maps.LatLng(55.67610, 12.56834), //Får ikke et coordinat til at starte med så viser grå skærm
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
		
		$scope.map = new google.maps.Map(document.getElementById($scope.map_id), $scope.mapOptions);    
		$scope.startWatchPosition()
	}

	$scope.addMarkerToMap = function( latitude, longitude, label ){
		var marker = new google.maps.Marker({
				map: $scope.map,
				animation: google.maps.Animation.DROP,
				position: new google.maps.LatLng(latitude,longitude),
			title: (label || "")
		});
		$scope.bounds.extend(markerPosition)
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
		});
		setTimeout(function(){
			navigator.geolocation.clearWatch( positionTimer );
			}, (1000 * 60 * 5)
		);	
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