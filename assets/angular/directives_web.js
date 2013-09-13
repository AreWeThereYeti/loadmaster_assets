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
				console.log('made trip list item with id: ' + scope.id)
	   	}
		}
	})
	.directive('ngMap',function(){
   	return {
	   	controller:'mapCtrl',
			scope:{
				start_location:'=start',
				end_location:'=end',
				start_input_id:'=startinputid',
				end_input_id:'=endinputid'
			},
	   	link:function(scope,element,attrs){
				scope.initialize()
				if(!!scope.start_location){
					var lat_lon=scope.start_location.split(',')
					scope.start_marker=scope.addMarkerToMap(lat_lon[0],lat_lon[1])
				}
				if(!!scope.end_location){
					var lat_lon=scope.end_location.split(',')
					scope.start_marker=scope.addMarkerToMap(lat_lon[0],lat_lon[1])
				}
				if(!!scope.start_input_id){
					scope.autoCompleteInput($('#'+scope.start_input_id)[0])
				}
				if(!!scope.end_input_id){
					scope.autoCompleteInput($('#'+scope.end_input_id)[0])
				}
				scope.centerOnMarkers()
	   	}
		}
	})
	
	