LoadmasterApp
	.directive('ngUser', function() {
	  return {
	    controller:'userCtrl',
	    link:function(scope,element,attrs){
				scope.init();
				$(document).on('pageshow',function(){
					console.log('pageshow ran')
					$(document).find('.ui-btn-down-b').each(function(){
						$(this).removeClass('ui-btn-down-b')
					})
				})
			}
		}
	})
	.directive('ngTrip', function() {
	  return {
		  controller:'tripCtrl',
		  link:function(scope,element,attrs){
			}
		}
	})
	// .directive('ngMobileAccessPage', function() {
	//   return {
	// 		templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_access_page.html',
	//     link:function(scope,element,attrs){
	// 			$('#tokencontainer').trigger('create')
	// 	  	$('#tokencontainer').bind("pageshow", function(e) {
	//     		$('#tokencontainer').trigger('create')
	//     	})
	// 		}
	// 	}
	// })
	.directive('ngMobileAccessPage', function() {
	  return {
			controller: 'mobileRegistrationCtrl',
	    link:function(scope,element,attrs){
				$('#tokenpage').on('pagehide', function (){
					$(this).remove();
				});
			}
		}
	})
	.directive('ngMobileTripStart', ['Helpers', function(Helpers) {
	  return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_start.html',
	    link:function(scope,element,attrs,Helpers){
				$('#home').trigger('create')
				scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")
	    	$("#home").on("pagebeforeshow", function(e) {
	    		//$('#home').trigger('create')
					if(!scope.$root.applyInProggess(scope)){
						scope.$apply(function(){
							scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")		
						})
					}else{	
						scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")		
					}
				}).on("pagehide", function(e) {
	    		$('#home').find('.map_container').html('') 	//clear map
	    	})
			}
		}
	}])
	.directive('ngMobileTripEnd', ['Helpers', function(Helpers) {
	  return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_end.html',
	    link:function(scope,element,attrs){
	    	$("#two").bind("pagebeforeshow", function(e) {
	    		//$('#two').trigger('create')
					console.log('inserting map in pagebeforeshow')
					if(!scope.$root.applyInProggess(scope)){
						scope.$apply(function(){
							scope.compileMap($('#two').find('.map_container'),"<div class='markeranimation' ng-map-end></div>")
		    		})
					}else{	
						scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")		
					}
				}).on("pagehide", function(e) {
		    	$('#two').find('.map_container').html('') 	//clear map
		    })
			}
		}
	}])
	.directive('ngMobileTripEnded', function() {
	  return {
		  templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_ended.html',
	    link:function(scope,element,attrs){
	    	$("#three").on("pagebeforeshow", function(e) {
	    		//$('#three').trigger('create')
					if(!scope.$root.applyInProggess(scope)){
						scope.$apply(function(){
							scope.showLastTrip()
						})
					}else{	
						scope.showLastTrip()
					}
	    	}).on("pagehide", function(e) {
	    		$("#three").find('.map_container').html('') 	//clear map
	    	})
			}
		}
	})
	.directive('ngCargoAutocomplete', function(){
		return{
			link:function(scope,element,attrs){
				$("#home").find('input').autocomplete({
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
				scope.map_loading=true
				scope.map_set_position="setstart_location"
				scope.set_address_event="set_start_address"
				scope.initMobileMap(true)
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
				scope.keep_updating_position=true
				scope.map_loading=true
				scope.map_set_position="setend_location"
				scope.set_address_event="set_end_address"
				scope.initMobileMap(true)
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
				startlocation:"=startlocation",
				endlocation:"=endlocation",
				startaddress:"=startaddress",
				endaddress:"=endaddress",
			},
	    link:function(scope,element,attrs){
				if(!!window.google){
			    scope.markerImage = new google.maps.MarkerImage(
						'src/img/start_marker.png',
						null, // size
						null, // origin
						new google.maps.Point( 0, 25 ),
						new google.maps.Size( 50, 50 ) // scaled size (required for Retina display icon)
					);
				}
				scope.map_loading=true
				scope.showNoCoords = false;
				scope.showmap = false;
				scope.has_position=true;
    		if(!!scope.startmarker){ 
					scope.removeMarker(scope.startmarker);
					scope.startmarker=null
				}
    		if(!!scope.endmarker){	
					scope.removeMarker(scope.endmarker);
					scope.endmarker=null 
				}
    		if(!!scope.startlocation && !!scope.endlocation){
					scope.startlocation=scope.startlocation.split(',')
					scope.endlocation=scope.endlocation.split(',')
	    		scope.initMobileMap(false);
	    		scope.startmarker = scope.addMarkerToMap(scope.startlocation[0],scope.startlocation[1]);
	    		scope.startmarker.setIcon('src/img/start_marker.png')
	    		scope.endmarker = scope.addMarkerToMap(scope.endlocation[0],scope.endlocation[1]);
	    		scope.endmarker.setIcon('src/img/end_marker.png')
					scope.showmap = true;
					scope.refreshMap();
    		}else{
					scope.map_loading=false;
				}
				$('.gpsnotfound').trigger("create");			
			}
		}
	})
