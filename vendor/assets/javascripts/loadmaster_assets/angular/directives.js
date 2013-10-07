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
	.directive('ngMobileAccessPage', function() {
	    return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_access_page.html',
		    link:function(scope,element,attrs){
				$('#tokencontainer').trigger('create')
			}
		}
	})
	.directive('ngMobileTripStart', function() {
	    return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_start.html',
		    link:function(scope,element,attrs){
		    	$("#home").bind("pageshow", function(e) {
		    		$('#home').trigger('create')
		    	})
		    	
			}
		}
	})
	.directive('ngMobileTripEnd', function() {
	    return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_end.html',
		    link:function(scope,element,attrs){
		    	$("#two").bind("pageshow", function(e) {
		    		$('#two').trigger('create')
		    	})
			}
		}
	})
	.directive('ngMobileTripEnded', function() {
	    return {
			  templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_ended.html',
		    link:function(scope,element,attrs){
		    	$("#three").bind("pageshow", function(e) {
		    		$('#three').trigger('create')
		    	})
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
	    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_map.html',
	    controller:'mapCtrl',
			scope:{},
	    link:function(scope,element,attrs){
				$('#home').bind( "pageshow", function( event ) {
					scope.map_set_position="setstart_location"
					scope.set_address_event="set_start_address"
					scope.initMobileMap(true)
				})
				$('#home').bind( "pagehide", function( event ) {
					scope.resetMap()
				})
				$('.gpsnotfound').trigger("create");
			}
		}
	})
	.directive('ngMapEnd', function() {
	    return {
	    replace: true,
			controller:'mapCtrl',
			scope:{},
	    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_map.html',
	    link:function(scope,element,attrs){
	    	$('#two').bind( "pageshow", function( event ) {
					scope.map_set_position="setend_location"
					scope.set_address_event="set_end_address"
					scope.keep_updating_position=true
					scope.initMobileMap(true)
				})
			$('#two').bind( "pagehide", function( event ) {
				scope.resetMap()
			})
				$('.gpsnotfound').trigger("create");
			}
		};
	})
	.directive('ngMapFinish', function() {
	    return {
		    replace: true,
		    templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/map_finish.html',
			controller:'mapCtrl',
			scope:{
			},
		    link:function(scope,element,attrs){
		    scope.markerImage = new google.maps.MarkerImage(
				'src/img/marker.png',
				null, // size
				null, // origin
				new google.maps.Point( 11, 16 ), // anchor (move to center of marker)
				new google.maps.Size( 22, 32 ) // scaled size (required for Retina display icon)
			);
		    	$('#three').bind( "pageshow", function( event ) {
						scope.showNoCoords = false;
						scope.showmap = false;
						scope.has_position=true;
						scope.startlocation=scope.$parent.start_location
						scope.startaddress=scope.$parent.start_address
						scope.endlocation=scope.$parent.end_location
						scope.endaddress=scope.$parent.end_address
						
		    		if(!!scope.startmarker){ 
							scope.removeMarker(scope.startmarker);
							scope.startmarker=null
						}
		    		if(!!scope.endmarker){	
							scope.removeMarker(scope.endmarker);
							scope.endmarker=null 
						}
		    		if(!!scope.startlocation && !!scope.endlocation){
			    		scope.initMobileMap(false);
			    		scope.startmarker = scope.addMarkerToMap(scope.startlocation[0],scope.startlocation[1]);
			    		scope.endmarker = scope.addMarkerToMap(scope.endlocation[0],scope.endlocation[1]);
							scope.showmap = true;
							scope.refreshMap();
		    		}else{
					    scope.showNoCoords = true;
						}
					$('.gpsnotfound').trigger("create");		
				})
			}
		}
	})
