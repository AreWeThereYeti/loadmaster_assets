console.log("directives loaded");

angular.module('loadmaster', [])
	.directive('ngUser', function() {
	    return {
	    controller:userCtrl,
	    link:function(scope,element,attrs){
			scope.init();
			}
		}
	})

	.directive('ngTrip', function() {
	    return {
		    controller:tripCtrl,
		    link:function(scope,element,attrs){
			}
		}
	})

	
	.directive('ngMapStart', function() {
	    return {
		    replace: true,
		    templateUrl: '../www/loadmaster_assets/assets/angular/templates/map_start.html',
		    controller:mapCtrl,
		    link:function(scope,element,attrs){
		    	scope.map_id="map_canvas_start"
				scope.map_set_position="setstart_location"
				$('#home').bind( "pageshow", function( event ) {
					navigator.geolocation.getCurrentPosition(function( latitude, longitude ){
						if(!!scope.map){
							scope.startWatchPosition()
						}else{
							scope.initialize();
							scope.startWatchPosition()
						}
						scope.addMarkerToMap(latitude, longitude)
						scope.$emit(scope.map_set_position, [latitude, longitude]);
					}, scope.errorHandler, {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true})
				})
				$('.gpsnotfound').trigger("create");
	
			}
		}
	})
	.directive('ngMapEnd', function() {
	    return {
	    replace: true,
	    templateUrl: '../www/loadmaster_assets/assets/angular/templates/map_end.html',
	    link:function(scope,element,attrs){
	    	var geo_el = document.getElementById('geoTemp');
			$('geoTemp').html('Ready...')
	    	scope.map_id="map_canvas_end"
	    	scope.map_set_position="setend_location"
	    	$('#two').bind( "pageshow", function( event ) {
					navigator.geolocation.getCurrentPosition(function( latitude, longitude ){
						if(!!scope.map){
							scope.startWatchPosition()
						}else{
							scope.initialize();
							scope.startWatchPosition()
						}
						scope.addMarkerToMap(latitude, longitude)
						scope.$emit(scope.map_set_position, [latitude, longitude]);
					}, scope.errorHandler, {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true})
				} )
				$('.gpsnotfound').trigger("create");
			}
		};
	})
	.directive('ngMapFinish', function() {
	    return {
	    replace: true,
	    templateUrl: '../www/loadmaster_assets/assets/angular/templates/map_finish.html',
	    link:function(scope,element,attrs){
	    	var geo_el = document.getElementById('geoTemp');
			$('geoTemp').html('Ready...')
	    	scope.map_id="map_canvas_finish"
	    	$('#three').bind( "pageshow", function( event ) {
	    		if(!!scope.startlocation && !!scope.endlocation){
		    		scope.initialize();
		    		scope.savebounds = true;
		    		scope.addMarkerToMap(scope.startlocation[0],scope.startlocation[1]);
		    		scope.addMarkerToMap(scope.endlocation[0],scope.endlocation[1]);	
		    		scope.centerOnMarkers();    		
	    		}
			$('.gpsnotfound').trigger("create");
			})
		}
	}
})
