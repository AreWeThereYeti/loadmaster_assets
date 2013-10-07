function mapCtrl($scope,$element,$attrs) {
	
	$scope.defaultLat=55.693745;
	$scope.defaultLon=12.433777;
	$scope.markersArray = [];
	
	if(window.google){
		$scope.markerImage = new google.maps.MarkerImage(
			'src/img/bluedot_retina.png',
			null, // size
			null, // origin
			new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
			new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
		);
	}
		
	/* 			Initialize map */
	$scope.initializeMap = function(latitude, longitude,div) {
		if(!!window.google){
			$scope.bounds=new google.maps.LatLngBounds()
			$scope.gps_found=null;
			$scope.has_position=false;
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
	}
	
	$scope.initMobileMap = function(watchPosition){
		if(!!window.google){
			$('.ui-btn-pressed').removeClass('ui-btn-pressed')
			$scope.initializeMap()
			$scope.removeAllMarkers()
			$scope.refreshMap()
			if(watchPosition){
				console.log("start watching position")
				$scope.startWatchPosition()
				$scope.checkForGPSNeverFound()
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
	
	$scope.resetMap = function(){
		if(!!$scope.locationMarker){
			$scope.removeMarker($scope.locationMarker)
		}
		console.log('clearing position watcher on map: ' + $scope.map_set_position)
		clearInterval($scope.watchPositionTimer)
		$scope.watchPositionTimer=null
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
			flat: true,
			optimized: false,
			icon: $scope.markerImage,
			position: markerPosition,
			title: "marker",
			labelContent: "second",
			labelClass: "labels" // the CSS class for the label
		});
		$scope.markersArray.push(marker)
		return marker;
	}
	
	$scope.updateMarker = function(marker, latitude, longitude, label ){
		marker.setPosition(new google.maps.LatLng(latitude, longitude));
		if (label){
			marker.setTitle( label );
		}
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
		console.log('trying to find position again')
		navigator.geolocation.getCurrentPosition(
			function(position){
				$scope.$apply(function(){
					//alert("position found")
					console.log("position found")
					$scope.updatePosition(position.coords.latitude, position.coords.longitude)
					$scope.gps_found=true;
					$scope.has_position=true;
				})
			},
			function(errCode){
				//alert('could not find position')
				console.log('could not find position')
				console.log('code: '    + errCode.code +
                  '. message: ' + errCode.message)

/* 				$scope.$apply(function(){ */
					$scope.gps_found=false;
/* 				}) */
			}, 
			{ maximumAge: 5000, timeout: 5000, enableHighAccuracy: true}
		);
	}
	
	$scope.updatePosition = function(latitude, longitude){
		if(!$scope.locationMarker){
			$scope.locationMarker = $scope.addMarkerToMap(latitude, longitude,"Initial Position")
			$scope.centerOnPosition(latitude,longitude)
		}else{
			$scope.updateMarker($scope.locationMarker, latitude, longitude, "Updated / Accurate Position");
/* 			if($scope.keep_updating_position == true){ */
				$scope.centerOnPosition(latitude,longitude)
/* 			} */
		}
		$scope.location=[latitude, longitude]
		$scope.refreshMap()
	}
	
	$scope.centerOnPosition = function(latitude,longitude){
		$scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
		console.log("centering on position")
		if($scope.map.getZoom()>15){
			$scope.map.setZoom(14)
		}
	}
	
	
	$scope.startWatchPosition = function(){
		$scope.drawCurrentPosition()
		$scope.watchPositionTimer=setInterval(function(){
			$scope.$apply(function(){
				$scope.drawCurrentPosition()
			})
		}, 20000);
	}
	
	$scope.refreshMap = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
		}, 20)
		$scope.preventLinksToGoogle()
	}
	
	$scope.refreshMapAndCenter = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
			$scope.centerOnMarkers()
		}, 20)
		$scope.preventLinksToGoogle()
	}
	
	$scope.preventLinksToGoogle = function(){
		$('.map-container').on('click', function(e){
		    e.preventDefault();
		});
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
		var sec=0
		var was_found=false
		var interval=setInterval(function(){
			if($scope.gps_found){ 
				was_found=true 
				clearInterval(interval)
		 	}
			if(sec>=10 && !was_found){
				$scope.$apply(function(){
					$scope.gps_found=false
					clearInterval(interval)
				})
			}
			sec+=1
		}, 1000);
	}
	
	$scope.$watch('address', function() {
		console.log('address changed!')
		$scope.location = null;
		$scope.$emit($scope.set_address_event,$scope.address)
		$scope.$emit($scope.map_set_position, null);
	}); 
	
	$scope.$watch('location', function() {
		$scope.address = null;
		$scope.$emit($scope.map_set_position, $scope.location);
		$scope.$emit($scope.set_address_event,null)
	}); 
	
	$scope.$watch('gps_found', function() {
		console.log('gps_found is: ' + $scope.gps_found)
	});
	
	$scope.$watch('showmap', function() {
		if($scope.showmap){
			$scope.refreshMap()
			if(!!$scope.startmarker && !!$scope.endmarker){
				$scope.centerOnTwoMarkers($scope.startmarker,$scope.endmarker);
			}
		}
	});
	
	$scope.gpsStateUndefined = function(){
		return $scope.gps_found==null || $scope.gps_found==false ? true : false
	}
	
	$scope.showMap = function(){
		return $scope.gps_found && $scope.hasInternet() ? true : false
	}
	
	$scope.gpsFound = function(){
		return $scope.gps_found==true
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_found==false;
	}
	
	$scope.gpsFoundNoInternet = function(){
		return $scope.gps_found && !$scope.hasInternet() ? true : false
	}
	
	$scope.hasStartAndEndCoords = function(){
		return !!$scope.startmarker && !!$scope.endmarker ? true : false
	}

	$scope.hasInternet = function(){
		if(!navigator.connection || !Connection){		//is browser
			return true
		}
		if(navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.NONE || navigator.connection.type == Connection.CELL || navigator.connection.type == Connection.CELL_2G){
			return false
		} else if(navigator.connection.type == Connection.CELL_3G || navigator.connection.type == Connection.CELL_4G || navigator.connection.type == Connection.WIFI ||navigator.connection.type == Connection.ETHERNET){
			return true
		}
	}


}