angular.module('loadmaster', [])
  .directive('ngLoadmaster',function(){
		return {
		  controller:'loadmasterCtrl',
		  link:function(scope,element,attrs){
		  }
		}
	})
	.directive('ngTrips',function(){
	   return {
       controller:'tripsCtrl',
       link:function(scope,element,attrs){
       }
		 }
   })
	.directive('ngTripsList',function(){
   	return {
	   	controller:'tripsListCtrl',
	   	link:function(scope,element,attrs){
	   	}
		}
	})
	.directive('ngTripsListItem',function(){
   	return {
	   	controller:'tripsListItemCtrl',
			scope:{
        id:"=tripid"
      },
	   	link:function(scope,element,attrs){
	   	}
		}
	})
	.directive('ngUiMap',function(){
   	return {
	   	controller:'mapCtrl',
			scope:{
				start_input_id:'=startinputid',
				end_input_id:'=endinputid',
			},
	   	link:function(scope,element,attrs){
				navigator.geolocation.getCurrentPosition(function(position) {
		      scope.initialize(position.coords.latitude,position.coords.longitude);
					scope.initUIMap(scope.start_input_id,scope.end_input_id)
		    }, function() {		//error function
		      scope.initialize()
					scope.initUIMap(scope.start_input_id,scope.end_input_id)
		    });

				if($('#new_trip').is(':visible')){
					$(document).keydown(function(ev){
						if(ev.which==13){
							if(ev.target.id=="trip_start_address" || ev.target.id=="trip_end_address"){
								ev.preventDefault()
							}
						}
					})
				}
	   	}
		}
	})
	.directive('ngStaticMap',function(){
   	return {
	   	controller:'mapCtrl',
			scope:{
				start_lat:'=startlat',
				start_lon:'=startlon',
				end_lat:'=endlat',
				end_lon:'=endlon',
			},
	   	link:function(scope,element,attrs){
				scope.initialize()
				if(!!scope.start_lat && !!scope.start_lon){
					scope.start_marker=scope.addMarkerToMap(scope.start_lat,scope.start_lon)
					scope.centerOnMarkers()
				}
				if(!!scope.end_lat && !!scope.end_lon){
					scope.end_marker=scope.addMarkerToMap(scope.end_lat,scope.end_lon)
					scope.centerOnMarkers()
				}
	   	}
		}
	})
	.directive('ngInvoice',function(){
		return{
			controller:'invoiceCtrl',
			link:function(scope,element,attrs){
				scope.init()
			}
		}
	})
	.directive('ngGetAddress',function(){
		return{
			controller:'mapCtrl',
			scope:{
				lat:'=lat',
				lon:'=lon'
			},
			link:function(scope,element,attrs){
				if(!!scope.lat && !!scope.lon){
					console.log('calling getAddressFromLatLon')
					scope.getAddressFromLatLon(scope.lat,scope.lon)
				}
			}
		}
	})
	
	
	
	
	