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
	    templateUrl: 'src/loadmaster_assets/assets/angular/templates/map_start.html',
	    controller:mapCtrl,
	    link:function(scope,element,attrs){
	    	scope.map_id="map-container"
				scope.map_set_position="setstart_location"
				$('#home').bind( "pageshow", function( event ) {
					scope.initialize();
					scope.startWatchPosition()
				})
				$('.gpsnotfound').trigger("create");
			}
		}
	})
	.directive('ngMapEnd', function() {
	    return {
	    replace: true,
	    templateUrl: 'src/loadmaster_assets/assets/angular/templates/map_end.html',
	    link:function(scope,element,attrs){
	    	var geo_el = document.getElementById('geoTemp');
				$('geoTemp').html('Ready...')
	    	scope.map_id="map-container-end"
	    	scope.map_set_position="setend_location"
	    	$('#two').bind( "pageshow", function( event ) {
					scope.initialize();
					scope.startWatchPosition()
				})
				$('.gpsnotfound').trigger("create");
			}
		};
	})
	.directive('ngMapFinish', function() {
	    return {
	    replace: true,
	    templateUrl: 'src/loadmaster_assets/assets/angular/templates/map_finish.html',
	    link:function(scope,element,attrs){
	    	var geo_el = document.getElementById('geoTemp');
				$('geoTemp').html('Ready...')
	    	scope.map_id="map-container-finish"
	    	$('#three').bind( "pageshow", function( event ) {
	    		scope.showmap = false;
	    		if(!!scope.startlocation && !!scope.endlocation){
	    			scope.showmap = true;
	    			console.log("showmap er : " + scope.showmap)
		    		scope.initialize();
		    		scope.savebounds = true;
		    		scope.addMarkerToMap(scope.startlocation[0],scope.startlocation[1]);
		    		scope.addMarkerToMap(scope.endlocation[0],scope.endlocation[1]);	
		    		scope.centerOnMarkers();    		
	    		} else if (!!scope.startadress || !!scope.endadress){
		    		console.log("showmap er : " + scope.showmap)
	    		}
    			console.log("showmap er : " + scope.showmap)
    			console.log(scope.startadress + scope.endadress)
				$('.gpsnotfound').trigger("create");
				})
			}
		}
	})
