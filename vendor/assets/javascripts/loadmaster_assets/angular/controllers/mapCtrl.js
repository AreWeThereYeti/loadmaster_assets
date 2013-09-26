function mapCtrl($scope,$element,$attrs) {
	
	$scope.defaultLat=55.693745;
	$scope.defaultLon=12.433777;
	$scope.bounds=new google.maps.LatLngBounds()
	$scope.markersArray = [];
		
	/* 			Initialize map */
	$scope.initialize = function(latitude, longitude) {
		$scope.gps_found=null;
		if(!$scope.map){
			if(!latitude){var latitude=$scope.defaultLat}
			if(!longitude){var longitude=$scope.defaultLon}
			$scope.mapOptions = {
			  center: new google.maps.LatLng(latitude, longitude), 
			  zoom: 12,
			  streetViewControl: false,
			  zoomControl: true,
			  draggable:true,
			  zoomControlOptions: {
			  	style: google.maps.ZoomControlStyle.LARGE
			  },
			  maptypecontrol :false,
			  disableDefaultUI: true,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			$scope.map = new google.maps.Map($element.find('.map-container')[0], $scope.mapOptions);    
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
		$scope.markersArray.push(marker)
		return marker;
	}
	
	$scope.updateMarker = function(marker, latitude, longitude, label ){
		marker.setPosition(new google.maps.LatLng(latitude, longitude));
		if (label){
			marker.setTitle( label );
		}
		$scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
	}
	
	$scope.removeAllMarkers = function(){
		for (var i = 0; i<$scope.markersArray.length; i++ ) {
	    $scope.removeMarker($scope.markersArray[i])
	  }
		$scope.markersArray=[]
		$scope.locationMarker=null
	}
	
	$scope.removeMarker = function(marker){
		marker.setMap(null);
		marker=null;
	}
	
	$scope.centerOnMarkers = function(bounds){
		if(!bounds){	var bounds=$scope.bounds }
		$scope.map.fitBounds(bounds);
		if($scope.map.getZoom()>15){
			$scope.map.setZoom(14)
		}
	}
	
	$scope.drawCurrentPosition =function(){
		//console.log('looking for position')
		navigator.geolocation.getCurrentPosition(
			function(position){
				$scope.$apply(function(){
					//console.log('found position and is updating')
					$scope.updatePosition(position.coords.latitude, position.coords.longitude)
					$scope.gps_found=true;
				})
			},
			function(errCode){
				console.log('could not find position')
				$scope.$apply(function(){
					$scope.gps_found=false;
				})
			}, 
			{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true}
		);
	}
	
	$scope.updatePosition = function(latitude, longitude){
		if(!$scope.locationMarker){
			$scope.locationMarker = $scope.addMarkerToMap(latitude, longitude,"Initial Position")
		}
		$scope.updateMarker($scope.locationMarker, latitude, longitude, "Updated / Accurate Position");
		$scope.$emit($scope.map_set_position, [latitude, longitude]);
	}
	
	$scope.startWatchPosition = function(){
		$scope.drawCurrentPosition()
		$scope.watchPositionTimer=setInterval(function(){
			$scope.$apply(function(){
				$scope.drawCurrentPosition()
			})
		}, 5000);
	}
	
	$scope.refreshMap = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
		}, 20)
	}
	
	$scope.refreshMapAndCenter = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
			$scope.centerOnMarkers()
		}, 20)
	}
	
	$scope.$on('resfreshMap',function(){
		$scope.refreshMapAndCenter()
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
			
			var lat=autocompleteInput.getPlace().geometry.location[Object.keys(autocompleteInput.getPlace().geometry.location)[0]]
			var lon=autocompleteInput.getPlace().geometry.location[Object.keys(autocompleteInput.getPlace().geometry.location)[1]]
			
			$(lat_input).val(Number(lat))
			$(lon_input).val(Number(lon))
			
			var place=autocompleteInput.getPlace()
			marker.setPosition(place.geometry.location);
			marker.setVisible(true)
			
			var bound=new google.maps.LatLng(lat,lon)	
		 	input.id=="trip_start_address" ? $scope.start_bound=bound : $scope.end_bound=bound
			
			var bounds=new google.maps.LatLngBounds()
			if(!!$scope.start_bound){	bounds.extend($scope.start_bound) }
			if(!!$scope.end_bound){		bounds.extend($scope.end_bound) }
		
			$scope.centerOnMarkers(bounds);
		})
	}
	
	$scope.getAddressFromLatLon = function(lat,lon){
		var geocoder= new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat,lon);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $scope.$apply(function(){
						$scope.formatted_address=results[1].formatted_address
					});
        }
      } else {
        console.log("Geocoder failed due to: " + status);
      }
    });
	}
	
	$scope.centerOnTwoMarkers = function(mark_1,mark_2){
		
		var lat=mark_1.position[Object.keys(mark_1.position)[0]]
		var lon=mark_1.position[Object.keys(mark_1.position)[1]]
		var bound=new google.maps.LatLng(lat,lon)
		var bounds=new google.maps.LatLngBounds(bound)
		
		var lat=mark_2.position[Object.keys(mark_2.position)[0]]
		var lon=mark_2.position[Object.keys(mark_2.position)[1]]	
		var bound=new google.maps.LatLng(lat,lon)
		bounds.extend(bound)
		
		setTimeout(function(){ 
			$scope.centerOnMarkers(bounds)
		}, 20)
	}
	
	$scope.checkForGPSNeverFound = function(){
		console.log('checkForGPSNeverFound ran')
		var sec=0
		var was_found=false
		var interval=setInterval(function(){
			console.log('checking for gps never found')
			if($scope.gps_found){ 
				was_found=true 
				clearInterval(interval)
		 	}
			if(sec>=10 && !was_found){
				$scope.$apply(function(){
					console.log('gps never found!!!')
					$scope.gps_found=false
					clearInterval(interval)
				})
			}
			sec+=1
		},1000);
	}
	
	$scope.$watch('start_address', function() {
		$scope.start_location = null;
	}); 
	
	$scope.$watch('start_location', function() {
		$scope.start_address = null;
	}); 
	
	$scope.$watch('end_address', function() {
		$scope.end_location = null;
	}); 
	
	$scope.$watch('end_location', function() {
		$scope.end_address = null;
	}); 
	
	$scope.$watch('gps_found', function() {
		console.log('gps_found is: ' + $scope.gps_found)
	});
	
	$scope.gpsStateUndefined = function(){
		if($scope.gps_found==null || $scope.gps_found==false){
			return true;
		}else{ return false; }
	}
	
	$scope.gpsFound = function(){
		return $scope.gps_found==true
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_found==false;
	}



}