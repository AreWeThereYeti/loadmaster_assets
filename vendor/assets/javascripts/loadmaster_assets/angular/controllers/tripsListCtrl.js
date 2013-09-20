function tripsListCtrl($scope,$element,$attrs) {
	
	$scope.selectedTrips=[]
	$scope.selectedTripId
	
	$scope.selectTableRow = function($event,id){
		var target=$($event.target)
		if(target.attr('type')!="checkbox"){
			$scope.$broadcast('showTripDetails',id)
			$scope.selectedTripId=id
		}else if(target.attr('name')=="trip_checkbox"){
			$scope.tripCheckboxed(target)
		}
	} 
	
	$scope.tripCheckboxed = function(target){
		if(target.is(':checked')){
			$scope.checkboxTrip(target.val())
		}else{
			$scope.unCheckboxTrip(target.val())
		}
	}
	
	$scope.checkboxTrip = function(val){
		$scope.selectedTrips.push(val)
	}
	
	$scope.unCheckboxTrip = function(val){
		$scope.selectedTrips.splice($scope.selectedTrips.indexOf(val), 1);
	}

	$scope.deleteSelectedTrips = function(){
		var delete_trips=confirm('Er du sikker på du vil slette alle turene? Dine ture vil blive slettet helt fra Loadmaster Logger og du vil ikke kunne genskabe dem!!')
		if(delete_trips){
			$.ajax({
			  type: "DELETE",
			  url: '/trips/destroy_multiple',
			  data: JSON.stringify({ids:$scope.selectedTrips}),
			  contentType: 'application/json', // format of request payload
			  dataType: 'json', // format of the response
			  success: function(msg) {
					alert('Dine ture blev slettet')
					window.location.reload(false); 
			  },  
				error: function(msg) {
					alert('UPS der skete en fejl, de valgte ture kunne desværre ikke slettes. Kontakt venligst Loadmaster hvis denne fejl bliver ved med at ske')
				}
			});
		}
	}
	
	$scope.printSelectedTrips = function(){
		console.log('printing following trips: ')
		console.log($scope.selectedTrips)
		window.location.href='/invoices/render_pdfs?ids='+JSON.stringify($scope.selectedTrips)
	}
	
	
}
