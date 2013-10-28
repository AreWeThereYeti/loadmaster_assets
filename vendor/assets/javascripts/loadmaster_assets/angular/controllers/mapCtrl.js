LoadmasterApp.controller('mapCtrl',function($scope,$element,$attrs,ServerAjax,Helpers) {
	
	$scope.defaultLat=55.693745;
	$scope.defaultLon=12.433777;
	$scope.markersArray = [];
	$scope.gps_not_found=null;
	$scope.map_loading=true;
	$scope.gps_timer_check_running=false;
	
	$scope.wait_for_gps_time=30; 	//secs to wait before prompting gps not found...
	
	/*-----------------------------------------------------------------------------
	* Private methods
	*------------------------------------------------------------------------------*/
		
	/* 			Initialize map */
	$scope.initializeMap = function(latitude, longitude,div) {
		if(!!window.google){
			if(!!google.maps.DirectionsService){	$scope.directionsService = new google.maps.DirectionsService(); }
			if(!!google.maps.LatLngBounds){	$scope.bounds=new google.maps.LatLngBounds() 	}
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
				$scope.setMarkerImage()  
			}
		}
	}
	
	$scope.initMobileMap = function(watchPosition){
		$scope.gps_not_found=null
		$scope.map_loading=true
		$('.ui-btn-pressed').removeClass('ui-btn-pressed')
		if(!!window.google){
			$scope.initializeMap()
			$scope.removeAllMarkers()
			$scope.refreshMap()
		}	
		
		if(watchPosition){
			$scope.startWatchPosition()
			$scope.checkForGPSNeverFound()
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
	
	
	$scope.initMobileRouteMap = function(){
		$scope.map_loading=true
		$scope.showNoCoords = false;
		$scope.showmap = false;
		$scope.has_position=true;
		if(!!$scope.startmarker){ 
			$scope.removeMarker($scope.startmarker);
			$scope.startmarker=null
		}
		if(!!$scope.endmarker){	
			$scope.removeMarker($scope.endmarker);
			$scope.endmarker=null 
		}
		if(!!$scope.startlocation && !!$scope.endlocation && !!window.google){
			$scope.startlocation=$scope.startlocation.split(',')
			$scope.endlocation=$scope.endlocation.split(',')
  		$scope.initMobileMap(false);
  		$scope.startmarker = $scope.addMarkerToMap($scope.startlocation[0],$scope.startlocation[1]);
  		$scope.startmarker.setIcon('src/img/start_marker.png')
  		$scope.endmarker = $scope.addMarkerToMap($scope.endlocation[0],$scope.endlocation[1]);
  		$scope.endmarker.setIcon('src/img/end_marker.png')
			$scope.showmap = true;
			$scope.refreshMap();
		}else{
			$scope.map_loading=false;
			if(!window.google){
				var checkForGoogleMaps = setInterval(function(){
					if(!!window.google){
						if(!$scope.$root.applyInProggess($scope)){
							$scope.$apply(function(){
								$scope.initMobileRouteMap()
							})
						}else{	
							$scope.initMobileRouteMap()
						}
						clearInterval(checkForGoogleMaps)
					}else{
					}
				},1000)
			}
		}
	}
	
	$scope.setMarkerImage=function(){			//override this method to use other markers than default google
		return false;
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
		$scope.stopGpsNotFoundTimer()
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
			if(!$scope.map){
				$scope.initMobileMap(true)
			}
			
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
			try{
				marker.setPosition(new google.maps.LatLng(latitude, longitude));
				if (label){
					marker.setTitle( label );
				}				
			}catch(err){
				console.log('error on setting position')
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
		console.log('trying to find position again')
		navigator.geolocation.clearWatch($scope.watchPositionNavigator)
		$scope.watchPositionNavigator = navigator.geolocation.watchPosition(
			function(position){
				console.log('watchPosition success callback called')
				$scope.$apply(function(){
					//alert("position found")
					console.log("position found")
					//console.log('lat,lon, acc, speed: ' + position.coords.latitude + ',' + position.coords.longitude + ',' + position.coords.accuracy + ',' + position.coords.speed)
					if(position.coords.accuracy < 1000 && position.coords.speed < 200){
/* 						console.log("speed and accuracy is good. Updating position.") */
						$scope.updatePosition(position.coords.latitude, position.coords.longitude)
						$scope.gps_not_found=false;
						$scope.gps_found=true
						$scope.stopGpsNotFoundTimer()
						if(!$scope.gps_timer_check_running){
							$scope.listenForGpsNotFound() 
						}
					}
				})
			},
			function(errCode){
				console.log(errCode)
				if(errCode.PERMISSION_DENIED == errCode.code || errCode.POSITION_UNAVAILABLE == errCode.code){
					if(errCode.PERMISSION_DENIED == errCode.code){
						alert("Vi kunne ikke finde din location da du ikke har aktiveret location services på din enhed. Gå venligst ind i dine instillinger og slå location services til.")
					}
					$scope.$apply(function(){ 
/* 						$('.position-available').append("<p>no position found (not timeout error)</p>") */
						$scope.gps_found=false
						$scope.stopGpsNotFoundTimer()
						if(!$scope.gps_timer_check_running){
							$scope.listenForGpsNotFound() 
						}
						$scope.gps_not_found=true;
						$scope.updatePosition(null)
	 				})
					$scope.positionNotFound()
				}else if(errCode.TIMEOUT == errCode.code){			
					console.log('timeout error does happen')
					if(!$scope.location){				//only try to find position again on timeout error if no $scope.location is previously found
						$scope.positionNotFound()
					}
				}
			}, 
			{ maximumAge: 30000, timeout: 4000, enableHighAccuracy: true}
		);
	}
	
	$scope.positionNotFound = function(){
		$scope.gps_found=false
		$scope.stopGpsNotFoundTimer()
		if(!$scope.gps_timer_check_running){
			$scope.listenForGpsNotFound() 
		}
		$scope.gps_not_found=true;
		$scope.updatePosition(null)
	}
	
	$scope.$on('reDrawCurrentPosition',function(){
		console.log('reDrawCurrentPosition ran')
		if(!$scope.map){
			console.log('no map.. make one')
			$scope.initMobileMap(true)
		}
		if(!!$scope.location){
			console.log('there is an location... draw it!')
			$scope.gps_not_found=false;
			$scope.gps_found=true
			$scope.updatePosition($scope.location[0],$scope.location[1])
		}
	})
	
	$scope.listenForGpsNotFound = function(){
		console.log('starting gps_not_found_timer')
		var counter=0
		$scope.gps_timer_check_running=true
		$scope.gps_not_found_timer=setInterval(function(){
			console.log('gps_not_found_timer ran with gps_found: ' + $scope.gps_found)
			if(counter==$scope.wait_for_gps_time){		//if gps not found in e.g. 30 secs
				console.log('gps was never found')
				// $scope.gps_not_found=true;
				// $scope.updatePosition(null)
				$scope.drawCurrentPosition()
				$scope.stopGpsNotFoundTimer()
			}else{
				console.log('running gps not found timer with counter: ' + counter)
				counter++
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
					console.log('reinitting marker and updating position')
					$scope.locationMarker = $scope.addMarkerToMap(latitude, longitude,"Initial Position")
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.centerOnPosition(latitude,longitude)
						})
					},100);		//need delay as map is not created properly before this is executed
				}else{
					console.log('updating marker position')
					$scope.updateMarker($scope.locationMarker, latitude, longitude, "Updated / Accurate Position");
/* 					if($scope.keep_updating_position){ */
						$scope.centerOnPosition(latitude,longitude)
/* 		 			}  */
				}
			}else{
				alert('google not defined.. cant draw marker')
			}
			$scope.location=[latitude, longitude]
			if(!!window.google){
				$scope.refreshMap()	
			}		
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
		console.log('calling draw current position')
		$scope.drawCurrentPosition()
		// $scope.watchPositionTimer=setInterval(function(){
		// 	$scope.$apply(function(){
		// 		$scope.drawCurrentPosition()
		// 	})
		// }, 3000);
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
		return !!$scope.location && (!Helpers.hasInternet() || !window.google) ? true : false
	}
	
	$scope.gpsNotFound = function(){
		return $scope.gps_not_found==true ? true : false;
	}
	
	$scope.showMap = function(){
		return !!$scope.location && Helpers.hasInternet() && !!window.google ? true : false
	}
	
	$scope.gpsFound = function(){
		return !!$scope.location
	}
	
	$scope.showEndRouteMap = function(){
		return !!$scope.startlocation && !!$scope.endlocation && Helpers.hasInternet() && !!window.google ? true : false
	}
	
	$scope.mapLoading = function(){
		return $scope.map_loading
	}
	
	$scope.showHasRouteNoInternet = function(){
		return !$scope.map_loading && !!$scope.startlocation && !!$scope.endlocation && (!Helpers.hasInternet() || !window.google) ? true : false
	}
	
	$scope.noStartAndEndCoordsFound = function(){
		return !$scope.map_loading && (typeof $scope.startlocation=="undefined" || $scope.startlocation==undefined || typeof $scope.endlocation=="undefined" || $scope.endlocation==undefined)  ? true : false
	}	

})