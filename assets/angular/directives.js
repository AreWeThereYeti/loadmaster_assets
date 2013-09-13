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
	.directive('ngMapStart', function() {
	    return {
	    replace: true,
	    templateUrl: '../www/js/angular/templates/map_start.html',
	    controller:mapCtrl,
	    link:function(scope,element,attrs){
	    	scope.map_id="map_canvas_start"
			scope.map_set_position="setstart_location"
			$('#home').bind( "pageshow", function( event ) { 
				scope.initialize();
			} )
			$('.gpsnotfound').trigger("create");
			}
		}
	})
	.directive('ngMapEnd', function() {
	    return {
	    replace: true,
	    templateUrl: '../www/js/angular/templates/map_end.html',
	    link:function(scope,element,attrs){
	    	var geo_el = document.getElementById('geoTemp');
			$('geoTemp').html('Ready...')
	    	scope.map_id="map_canvas_end"
	    	scope.map_set_position="setend_location"
	    	$('#two').bind( "pageshow", function( event ) {
				scope.initialize()	
				} )
			$('.gpsnotfound').trigger("create");
	    }
	};
});