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
	
	.directive('ngCargoAutocomplete', function(){
		return{
			link:function(scope,element,attrs){
				$("#home").bind("pageshow", function(e) {
					element.find('input').autocomplete({
						target: element.find('ul'),
						source: scope.cargo_types,
						callback: function(e) {
							var val = $(e.currentTarget).text();
							element.find('input').val(val);
							element.find('input').autocomplete('clear');
							scope.$apply(function(){
								scope.cargo=val
							})
						},
						link: 'target.html?term=',
						minLength: 1
					});
				});
			}
		}
	})

	
	.directive('ngMapStart', function() {
    return {
	    replace: true,
	    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/map_start.html',
	    controller:mapCtrl,
	    link:function(scope,element,attrs){
				scope.map_set_position="setstart_location"
				$('#home').bind( "pageshow", function( event ) {
					scope.initialize()
					scope.removeAllMarkers()
					scope.refreshMap()
					scope.startWatchPosition()
					scope.checkForGPSNeverFound()
				})
				$('.gpsnotfound').trigger("create");
			}
		}
	})
	.directive('ngMapEnd', function() {
	    return {
	    replace: true,
	    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/map_end.html',
	    link:function(scope,element,attrs){
	    	scope.map_set_position="setend_location"
	    	$('#two').bind( "pageshow", function( event ) {
					scope.initialize();
					scope.removeAllMarkers()
					scope.refreshMap()
					scope.startWatchPosition()
					scope.checkForGPSNeverFound()
				})
				$('.gpsnotfound').trigger("create");
			}
		};
	})
	.directive('ngMapFinish', function() {
	    return {
		    replace: true,
		    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/map_finish.html',
		    link:function(scope,element,attrs){
		    	$('#three').bind( "pageshow", function( event ) {
		    		scope.showmap = false;
		    		if(!!scope.startmarker){ 
							scope.removeMarker(scope.startmarker);
							scope.startmarker=null
						}
		    		if(!!scope.endmarker){	
							scope.removeMarker(scope.endmarker);
							scope.endmarker=null 
						}
		    		if(!!scope.startlocation && !!scope.endlocation){
		    			scope.showmap = true;
			    		scope.initialize();
							scope.refreshMap()
			    		scope.startmarker = scope.addMarkerToMap(scope.startlocation[0],scope.startlocation[1]);
			    		scope.endmarker = scope.addMarkerToMap(scope.endlocation[0],scope.endlocation[1]);
			    		scope.centerOnTwoMarkers(scope.startmarker,scope.endmarker);	
		    		}
					$('.gpsnotfound').trigger("create");		
				})
			}
		}
	})
