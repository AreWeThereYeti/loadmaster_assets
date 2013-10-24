LoadmasterApp.controller('mapCtrl',function($scope,$element,$attrs,ServerAjax,Helpers) {
	
	$scope.defaultLat=55.693745;
	$scope.defaultLon=12.433777;
	$scope.markersArray = [];
	$scope.gps_not_found=null;
	$scope.map_loading=true;
	$scope.gps_timer_check_running=false;
	
	$scope.wait_for_gps_time=20; 	//secs to wait before prompting gps not found...
	
	if(!!window.google){
		$scope.markerImage = new google.maps.MarkerImage(
			'src/img/bluedot_retina.png',
			null, // size
			null, // origin
			new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
			new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
		);
			
		$scope.directionsService = new google.maps.DirectionsService();
	}
	
	/*-----------------------------------------------------------------------------
	* Private methods
	*------------------------------------------------------------------------------*/
		
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
		$scope.gps_not_found=null
		if(!!window.google){
			$scope.map_loading=true
			$('.ui-btn-pressed').removeClass('ui-btn-pressed')
			$scope.initializeMap()
			$scope.removeAllMarkers()
			$scope.refreshMap()
			
			if(watchPosition){
				$scope.startWatchPosition()
				$scope.checkForGPSNeverFound()
			}
		}
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.map_loading=false
			})
		},2000)
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
		clearInterval($scope.watchPositionTimer)
		$scope.watchPositionTimer=null
		$scope.resetVals()
	}
	
	$scope.$on('stopWatchPositionTimer', function() {
    clearInterval($scope.watchPositionTimer)
		$scope.watchPositionTimer=null
  }); 
	
	$scope.resetVals = function(){
		$scope.location=null
		$scope.address=null
		
		$scope.startmarker=null
		$scope.startlocation=null
		$scope.startaddress=null
		
		$scope.endmarker=null
		$scope.endlocation=null
		$scope.endaddress=null
		$scope.map_loading=true
	}

	$scope.addMarkerToMap = function( latitude, longitude, label ){
		if(!!window.google){
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
	}
	
	$scope.updateMarker = function(marker, latitude, longitude, label ){
		if(!!window.google){
			marker.setPosition(new google.maps.LatLng(latitude, longitude));
			if (label){
				marker.setTitle( label );
			}
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
		if(!!window.google){	marker.setMap(null); }
		marker=null;
	}
	
	$scope.centerOnMarkers = function(bounds){
		if(!!window.google){
			if(!bounds){	var bounds=$scope.bounds }
			$scope.map.fitBounds(bounds);
			if($scope.map.getZoom()>15){
				$scope.map.setZoom(14)
			}
		}
	}
	
	$scope.drawCurrentPosition =function(){
		//console.log('trying to find position again')
		navigator.geolocation.getCurrentPosition(
			function(position){
				$scope.$apply(function(){
					//alert("position found")
					//console.log("position found")
					//console.log('lat,lon, acc, speed: ' + position.coords.latitude + ',' + position.coords.longitude + ',' + position.coords.accuracy + ',' + position.coords.speed)
					if(position.coords.accuracy < 150 && position.coords.speed < 200){
						//console.log("speed and accuracy is good. Updating position.")
						$scope.updatePosition(position.coords.latitude, position.coords.longitude)
						$scope.gps_not_found=false;
						$scope.gps_found=true
					}
				})
			},
			function(errCode){
				//alert('could not find position')
				console.log('could not find position')
				console.log('code: '    + errCode.code +
                  '. message: ' + errCode.message)
 				$scope.$apply(function(){ 
					$scope.gps_found=false
					if(!$scope.gps_timer_check_running){
						$scope.listenForGpsNotFound() 
					}
 				}) 
			}, 
			{ maximumAge: 5000, timeout: 4000, enableHighAccuracy: true}
		);
	}
	
	$scope.listenForGpsNotFound = function(){
		console.log('starting gps_not_found_timer')
		var counter=0
		$scope.gps_timer_check_running=true
		$scope.gps_not_found_timer=setInterval(function(){
			if(counter==$scope.wait_for_gps_time){		//if gps not found in 30 secs
				console.log('gps was never found')
				$scope.gps_not_found=true;
				$scope.updatePosition(null)
				$scope.stopGpsNotFoundTimer()
			}else if(!$scope.gps_found){
				counter++
			}else if($scope.gps_found){
				$scope.stopGpsNotFoundTimer()
			}
		},1000)
	}
	
	$scope.stopGpsNotFoundTimer = function(){
		clearInterval($scope.gps_not_found_timer)
		$scope.gps_timer_check_running=false
	} 
	
	$scope.updatePosition = function(latitude, longitude){
		if(latitude==null){
			$scope.location=null
		}
		else{
			if(!!window.google){
				if(!$scope.locationMarker){
					$scope.locationMarker = $scope.addMarkerToMap(latitude, longitude,"Initial Position")
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.centerOnPosition(latitude,longitude)
						})
					},100);		//need delay as map is not created properly before this is executed
				}else{
					$scope.updateMarker($scope.locationMarker, latitude, longitude, "Updated / Accurate Position");
/* 					if($scope.keep_updating_position){ */
						$scope.centerOnPosition(latitude,longitude)
/* 		 			}  */
				}
			}
			$scope.location=[latitude, longitude]
			$scope.refreshMap()			
		}
	}
	
	$scope.centerOnPosition = function(latitude,longitude){
		if(!!window.google){
			$scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
		}
		// if($scope.map.getZoom()>15){
		// 	$scope.map.setZoom(14)
		// }
	}
	
	
	$scope.startWatchPosition = function(){
		$scope.drawCurrentPosition()
		$scope.watchPositionTimer=setInterval(function(){
			$scope.$apply(function(){
				$scope.drawCurrentPosition()
			})
		}, 3000);
	}
	
	$scope.refreshMap = function(){
		setTimeout(function(){ 
			google.maps.event.trigger($scope.map, 'resize'); 
		}, 20)
		$scope.preventLinksToGoogle()
	}
	
	$scope.refreshMapAndCenter = function(){
		if(!!window.google){
			setTimeout(function(){ 
				google.maps.event.trigger($scope.map, 'resize'); 
				$scope.centerOnMarkers()
			}, 20)
			$scope.preventLinksToGoogle()
		}
	}
	
	$scope.preventLinksToGoogle = function(){
		$('.map-container').on('click', function(e){
		    e.preventDefault();
		});
	}
	
	
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
	
	$scope.getAddressFromLatLon = function(lat,lon,update_obj){
		var geocoder= new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat,lon);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $scope.$apply(function(){
						$scope.formatted_address=results[0].formatted_address
						if(update_obj){
							var data = $scope.startorend=="start" ? {trip:{start_address:$scope.formatted_address}} : {trip:{end_address:$scope.formatted_address}}
							ServerAjax.update($scope.objid,'trips',data)
						}
					});
        }
      }else if(status=="OVER_QUERY_LIMIT"){		//google request limit reached.. try again in a couple of secs
				setTimeout(function(){
					$scope.$apply(function(){
						$scope.getAddressFromLatLon(lat,lon)
					})
				},2000)
      }
    });
	}
	
	$scope.calcDistance = function(LatLng_start,LatLng_end,update_obj){
	  var request = {
	    origin:LatLng_start,
	    destination:LatLng_end,
	    travelMode:google.maps.TravelMode.DRIVING
	  };
	  $scope.directionsService.route(request, function(response, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	     	$scope.$apply(function(){
	  			$scope.distance=response.routes[0].legs[0].distance.value/1000
					$scope.distance=Math.round($scope.distance*100)/100
					if(update_obj && !!$scope.distance){
						ServerAjax.update($scope.objid,'trips',{trip:{distance:$scope.distance}})
					}
	  		})
	    }else if(status=="OVER_QUERY_LIMIT"){		//google request limit reached.. try again in a couple of secs
		  	setTimeout(function(){
		  		$scope.$apply(function(){
		  			$scope.calcDistance(LatLng_start,LatLng_end)
		  		})
		  	},2000)
      }
	  });
	}
	
	
	$scope.centerOnTwoMarkers = function(mark_1,mark_2){
		if(!!window.google){
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
	
	/*-----------------------------------------------------------------------------
	* events
	*------------------------------------------------------------------------------*/
	
	$scope.$on('resfreshMap',function(){
		$scope.refreshMapAndCenter()
	})
	

	$scope.$watch('address', function() {
		$scope.location = null;
		$scope.$emit($scope.set_address_event,$scope.address)
		$scope.$emit($scope.map_set_position, null);
	}); 
	
	$scope.$watch('location', function() {
		$scope.address = null;
		$scope.$emit($scope.map_set_position, $scope.location);
		$scope.$emit($scope.set_address_event,null)
	}); 
	
	$scope.$watch('showmap', function() {
		if($scope.showmap && !!window.google){
			$scope.refreshMap()
			if(!!$scope.startmarker && !!$scope.endmarker){
				$scope.centerOnTwoMarkers($scope.startmarker,$scope.endmarker);
			}
		}
	});
	
	$scope.$on('newTrip',function(){
		$scope.resetVals()
	})
	
	/*-----------------------------------------------------------------------------
	* UI methods
	*------------------------------------------------------------------------------*/
	
	
	$scope.searchingForGps = function(){
		return typeof $scope.location=="undefined" || $scope.location==undefined ? true : false
	}
	
	$scope.gpsFoundNoInternet = function(){
		return !!$scope.location && !Helpers.hasInternet() ? true : false
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_not_found==true ? true : false;
	}
	
	$scope.showMap = function(){
		return !!$scope.location && Helpers.hasInternet() ? true : false
	}
	
	$scope.gpsFound = function(){
		return !!$scope.location
	}
	
	$scope.showEndRouteMap = function(){
		return !!$scope.startlocation && !!$scope.endlocation && Helpers.hasInternet() ? true : false
	}
	
	$scope.mapLoading = function(){
		return $scope.map_loading
	}
	
	$scope.showHasRouteNoInternet = function(){
		return !$scope.map_loading && !!$scope.startlocation && !!$scope.endlocation && !Helpers.hasInternet() ? true : false
	}
	
	$scope.noStartAndEndCoordsFound = function(){
		return !$scope.map_loading && (typeof $scope.startlocation=="undefined" || $scope.startlocation==undefined || typeof $scope.endlocation=="undefined" || $scope.endlocation==undefined)  ? true : false
	}	

})