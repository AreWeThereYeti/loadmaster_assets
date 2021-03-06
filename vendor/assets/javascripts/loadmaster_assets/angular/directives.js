LoadmasterApp
	.directive('ngUser', function() {
	  return {
	    controller:'userCtrl',
	    link:function(scope,element,attrs){
				scope.init();

				$(document).on('pagebeforeshow',function(){
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
	.directive('ngMobileAccessPage', function() {
	  return {
			controller: 'mobileRegistrationCtrl',
	    link:function(scope,element,attrs){
				$('#tokenpage').on('pageshow', function (){
					scope.$root.resetAllVals()
				}).on('pagehide', function (){
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
				
				$("#home").find('.autocomplete').autocomplete({
					target: element.find('ul'),
					source: scope.cargo_types,
					callback: function(e) {
						var val = $(e.currentTarget).text();
						element.find('.autocomplete').val(val);
						element.find('.autocomplete').autocomplete('clear');
						scope.$apply(function(){
							scope.cargo=val;
						})
					},
					link: 'target.html?term=',
					minLength: 1
				});				
				
				scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")
	    	$("#home").on("pageshow", function(e) {
					if(!scope.$root.applyInProggess(scope)){
						scope.$apply(function(){
							scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")
							scope.current_map_scope="set_start_address"		
						})
					}else{	
						scope.compileMap($('#home').find('.map_container'),"<div class='markeranimation' ng-map-start></div>")	
						scope.current_map_scope="set_start_address"	
					}
				}).on("pagehide", function(e) {
					scope.$broadcast('deleteMap')
	    	})
			}
		}
	}])
	.directive('ngMobileTripEnd', ['Helpers', function(Helpers) {
	  return {
			templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_end.html',
	    link:function(scope,element,attrs){
	    	$("#two").bind("pageshow", function(e) {
					setTimeout(function(){	
						scope.removeElement(250 ,".registered");
						console.log("fired timer")
						},2000);
					if(!scope.$root.applyInProggess(scope)){
						$('.ui-btn-pressed').each(function(){
							$(this).removeClass('ui-btn-pressed')
						})
						scope.$apply(function(){
							scope.compileMap($('#two').find('.map_container'),"<div class='markeranimation' ng-map-end></div>")
							scope.current_map_scope="set_end_address"		
		    		})
					}else{	
						scope.compileMap($('#two').find('.map_container'),"<div class='markeranimation' ng-map-end></div>")	
						scope.current_map_scope="set_end_address"			
					}
				}).on("pagehide", function(e) {
					console.log('clearing map')
					scope.$broadcast('deleteMap')
					$(".registered").show();
					$('.ui-btn-pressed').each(function(){
						$(this).removeClass('ui-btn-pressed')
					})
		    })
			}
		}
	}])
	.directive('ngMobileTripEnded', function() {
	  return {
		  templateUrl: 'src/loadmaster_assets/vendor/assets/javascripts/loadmaster_assets/angular/templates/mobile_trip_ended.html',
	    link:function(scope,element,attrs){
	    	$("#three").on("pageshow", function(e) {
	    			setTimeout(function(){	
						scope.removeElement(250 ,".registered");
						console.log("fired timer")
						},2000);
					if(!scope.$root.applyInProggess(scope)){
						scope.$apply(function(){
							scope.showLastTrip()
						})
					}else{	
						scope.showLastTrip()
					}
	    	}).on("pagehide", function(e) {
					scope.$broadcast('deleteMap')
					$(".registered").show();
	    	})
			}
		}
	})
	.directive('ngCargoAutocomplete', function(){
		return{
			link:function(scope,element,attrs){
				$( "#home" ).on( "pageshow", function() {				
					$("#home").find('.autocomplete').autocomplete({
						target: element.find('ul'),
						source: scope.cargo_types,
						callback: function(e) {
							var val = $(e.currentTarget).text();
							element.find('.autocomplete').val(val);
							element.find('.autocomplete').autocomplete('clear');
							scope.$apply(function(){
								scope.cargo=val;
							})
						},
						link: 'target.html?term=',
						minLength: 1
					});
				})
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
				scope.setMarkerImage=function(){
					scope.markerImage = new google.maps.MarkerImage(
						'src/img/bluedot_retina.png',
						null, // size
						null, // origin
						new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
						new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
					);
				}
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
				scope.setMarkerImage=function(){
					scope.markerImage = new google.maps.MarkerImage(
						'src/img/bluedot_retina.png',
						null, // size
						null, // origin
						new google.maps.Point( 8, 8 ), // anchor (move to center of marker)
						new google.maps.Size( 17, 17 ) // scaled size (required for Retina display icon)
					);
				}
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
				
				scope.setMarkerImage=function(){
					if(!!window.google){
				    	scope.markerImage = new google.maps.MarkerImage(
							'src/img/start_marker.png',
							null, // size
							null, // origin
							new google.maps.Point( 0, 25 ),
							new google.maps.Size( 50, 50 ) // scaled size (required for Retina display icon)
						);
					}
				}
				
				scope.initMobileRouteMap()
				$('.gpsnotfound').trigger("create");			
			}
		}
	})
