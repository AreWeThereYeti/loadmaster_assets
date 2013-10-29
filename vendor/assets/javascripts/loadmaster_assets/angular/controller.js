/* Is this needed? */
var LoadmasterApp = angular.module("loadmaster",[])
//   .config(function($httpProvider){
//     delete $httpProvider.defaults.headers.common['X-Requested-With'];
// 	})
	
/* User controller with angularjs */
LoadmasterApp.controller('userCtrl',function($scope,$element,$attrs,$compile,Helpers) {

	$scope.IS_MOBILE=true
	window.myscope = $scope;
	window.db = $scope.isDatabaseEmpty;
	$scope.isAllowedToSync = true;
	
	$scope.shortName = 'WebSqlDB';
	$scope.version = '1.0';
	$scope.displayName = 'WebSqlDB';
	$scope.maxSize = 65535;
	$scope.host = 'https://portal.loadmasterloggerfms.dk';
	// $scope.host = 'http://192.168.1.35:3000'
	
	$scope.$on("setcargo", function(evt, cargo){
		$scope.top_cargo = cargo;
		$('.weight').trigger("create");
	})
	

	$scope.init = function(){
/* 		debugging function */

 		// $scope.dropTables(); 

/* 		End of debugging functions */
		$scope.initializeDB()
		$scope.isAccessTokenInDatabase()
		$scope.checkLastTripFinished()
		$scope.checkLengthOfDatabase()
		
	  $.mobile.buttonMarkup.hoverDelay = 0;
	  //$.mobile.defaultPageTransition   = 'fade';
		$.mobile.defaultPageTransition   = 'none';
	  $.mobile.defaultDialogTransition = 'none';
/* 	  $.mobile.useFastClick = true; */

		if($scope.access_token != ""){
			$scope.checkInterval();		
		}
	}
	
	$scope.checkInterval = function(){
		$scope.intervalID = setInterval(function(){
			$scope.$apply(function(scope){
				scope.checkConnection();
		  	})	
		}, 5000);	
	}
	
	
	$scope.isAccessTokenInDatabase = function(){
			// initial variables
		if(!$scope.db){
			$scope.createNewDB()
		}	
		
		$scope.db.transaction(function (tx){
			tx.executeSql('SELECT * FROM Auth', [], function (tx, result){  // Fetch records from SQLite
				var dataset = result.rows; 
				if (dataset.length == 0 ){
					$scope.loadAndShowRegistrationPage()
				}
				else if(!!dataset.length){
					$scope.access_token = dataset.item(0).access_token;
					$scope.imei = dataset.item(0).imei;
					$scope.license_plate = dataset.item(0).license_plate;
					// $.mobile.changePage("#home");
				}
			});
		});	
	}
	
	/* 	Reset access token if incorrect */
	$scope.resetAccessToken = function(){
	 	if(!$scope.$root.db){
			$scope.$root.createNewDB()
		}	
		/* 	Deletes synced rows from trips table */
		$scope.$root.db.transaction(function(transaction) {
			transaction.executeSql('DELETE FROM Auth', []);
			},function error(err){console.log('error resetting accesstoken ' + err)}, function success(){}
		);
		console.log("access token er " + $scope.access_token)
		if(!$('#tokenpage').is(':visible')){
			alert("Access token er forkert")
		}
		clearInterval($scope.intervalID);
		$scope.loadAndShowRegistrationPage()
	}	
	
	$scope.loadAndShowRegistrationPage = function(){
		console.log('-----!!!!! broadcasting stop watch position timer-------')
		$.mobile.loadPage("src/pages/registration.html",true).done(function (e, ui, page) {
			$scope.$apply(function(){
				$compile($('#tokenpage'))($scope)
				setTimeout(function () {
				  $('#tokenpage').trigger('create');
					$.mobile.changePage("#tokenpage");
				}, 1000);
			})

		}).fail(function (err) {
    	alert("We're sorry but something went wrong. Please close the app and try again");
			console.log(err)
	    });
	}
	
	/* check Connection */
	$scope.checkConnection = function(){
		try{
			if(!!navigator && !!navigator.connection && !!navigator.connection.type && !!Connection && navigator.connection.type == Connection.CELL_3G || navigator.connection.type == Connection.CELL_4G || navigator.connection.type == Connection.WIFI ||navigator.connection.type == Connection.ETHERNET){
				//console.log('connectiontype is : ' + navigator.connection.type);
				if(!window.google && Helpers.hasInternet()){
/* 					alert('fetching google maps') */
					$("head").append('<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false&callback=asyncInitGoogleMaps"></script>');
					var checkForGoogleMapsInit=setInterval(function(){
						console.log('checking for google present')
						if(!!window.google){
/* 							console.log('google present') */
							$scope.$broadcast('reDrawCurrentPosition')
							clearInterval(checkForGoogleMapsInit)
						}else{
							console.log('no google yet')
						}
					},1000)
				}
				$scope.isDatabaseEmpty();
			}
		}catch(err){
			console.log('cant get connection type')
			if(!$scope.is_mobile_app()){
				//$scope.isDatabaseEmpty();
			}
		}

	}
	
	
	/* Is database empty */
	$scope.isDatabaseEmpty = function() {
		if(!$scope.db){
			$scope.createNewDB()
		}	
		
		var numberOfRows;

		query = "SELECT * FROM Trip;";
		$scope.db.transaction(function(transaction){
	         transaction.executeSql(query, [], function(tx, results){
		         var dataset = results.rows;
		         if (dataset.length == 0){
			        numberOfRows = results.rows.length;
		         }else if (dataset.length > 0){
			        var item = dataset.item(0)
					if (item['_is_finished'] == undefined) {                               
			        } else if(item['_is_finished'] == 1) {
				        $scope.syncToDatabase();
			        }   
		         }
	         },function error(err){alert('error selecting from database ' + err)}, function success(){});              
		});
		return numberOfRows;
	}
	
	$scope.createNewDB = function(){
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
	}
	
	$scope.checkLastTripFinished = function(){
		if(!$scope.db){	$scope.createNewDB() }	
		
		var numberOfRows;
	
		query = "SELECT * FROM Trip;";
		$scope.db.transaction(function(transaction){
      transaction.executeSql(query, [], function(tx, results){
       	var dataset = results.rows;
				if (dataset.length > 0){
	       	var item = dataset.item(dataset.length-1)
					if (item['_is_finished'] == undefined) { 
						$scope.promptUnfinishedTrip()                              
					}   
	      }
      },function error(err){alert('error selecting from database ' + err)}, function success(){});              
		});
		return numberOfRows;
	}
	
	$scope.promptUnfinishedTrip = function(){
		var confirm=window.confirm('Du har en uafsluttet tur. Vil du fortsætte din tur?? Hvis du trykker annuller, vil din uafsluttede tur blive slettet.')
		if(confirm){
			$.mobile.changePage('#two')
		}else{
			/* 	Deletes synced rows from trips table */
			var confirm=window.confirm('Er du sikker? Din uafsluttede tur vil blive slettet hvis du trykker ok. Tryk annuller for at fortsætte turen')
			if(confirm){
				$scope.db.transaction(function(transaction) {
					transaction.executeSql('DELETE FROM Trip WHERE id = (SELECT MAX(Id) from Trip)');
					},function error(err){alert('error deleting from database ' + err)}, function success(){}
				);
			}else{
				$.mobile.changePage('#two')
			}
		}
	} 
	
	/* Sync to server */
	$scope.syncToDatabase = function () {
			
		if(!$scope.db){
			$scope.createNewDB()
		}	
			
		$scope.db.transaction(function (tx){
			tx.executeSql('SELECT * FROM Trip', [], function (tx, result){	 
				var dataset = result.rows; 
				var trips = new Array();
				for (var i = 0, item = null; i < dataset.length; i++) {
					item = dataset.item(i);
					var trip = {
						trip_id			: item['Id'],
						cargo			: item['_cargo'],
						license_plate 	: $scope.license_plate,
						start_location 	: item['_start_location'],
						start_address 	: item['_start_address'],
						end_location 	: item['_end_location'],
						end_address	 	: item['_end_address'],
						start_timestamp : item['_start_timestamp'],
						end_timestamp 	: item['_end_timestamp'],
						start_comments 	: item['_start_comments'],
						end_comments 	: item['_end_comments']
					};
					
					if(!!item['_is_finished']){
						trips.push(trip);	
					}
				}
				$scope.InsertRecordOnServerFunction(trips);      // Call Function for insert Record into SQl Server
			});
		},function error(err){
/*
			console.log('push to db failed with error:')
			console.log(err)
*/
		});
	}
	
	/* Syncs with server */
	$scope.InsertRecordOnServerFunction = function(trips){  // Function for insert Record into SQl Server
		console.log('InsertRecordOnServerFunction')
		if($scope.isAllowedToSync == true){	
			$scope.isAllowedToSync = false;
			console.log('posting trip to:')
			console.log($scope.host + "/api/v1/trips")
			$.ajax({
				type: "POST",
				url: $scope.host + "/api/v1/trips",
				data :  {
				     access_token	: $scope.access_token, // Skal kun sættes en gang ind i databasen
				     trips			: trips,
				     device_id		: $scope.imei
				 },
							
				processdata: true,
				success: function (msg)
				{
					console.log('succes!!!!')
					console.log()
					//On Successfull service call
					$scope.dropAllRows(); //Uncomment this when success message is received. Make this function receive synced rows from server
					$scope.isAllowedToSync = true; 
				},
				error: function (msg) {
					window.msg = msg;
					console.log(msg);
					console.log(msg.status);
					if(!!msg.responseText && !!msg.responseText.err_ids){				
						if(JSON.parse(msg.responseText).err_ids != 0){	
							$scope.dropRowsSynced(JSON.parse(msg.responseText).err_ids)
						}
					}
	
					else if(msg.status == 401){
						$scope.resetAccessToken()
					}	
					
					else if(msg.status == 404){
						console.log("404 error ")				
					}
					$scope.isAllowedToSync = true;						
				}
			});
		}
	};

	
	/* Drops synced rows */
	$scope.dropAllRows = function(){
		 
		 if(!$scope.db){
			$scope.createNewDB()
		}	
		 		 
		/* 	Deletes synced rows from trips table */
			$scope.db.transaction(function(transaction) {
				transaction.executeSql('DELETE FROM Trip WHERE _is_finished = 1', [/* Insert array of IDs of synced rows. See below */]);
				},function error(err){alert('error deleting from database ; ' + err.message)}, function success(){}
			);
			return false;

		}
	
		/* Drops synced rows */
	$scope.dropRowsSynced = function(err_ids){
		 
		if(!$scope.db){
			$scope.createNewDB()
		}	
		 		 
		/* 	Deletes synced rows from trips table */
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('DELETE FROM Trip WHERE id <> *', [err_ids]);
			},function error(err){alert('error deleting from database : ' + err.message)}, function success(){}
		);
		return false;
	}	
	
	$scope.resetAllVals = function(){
		$scope.start_address = null
		$scope.start_location = null
		$scope.start_comments = null
		$scope.start_timestamp = null
		$scope.top_cargo = null
		$scope.cargo = null
		$scope.top_cargo = null
		$scope.top_startaddress = null
		$scope.top_startlocation = null
		$scope.end_address = null
		$scope.end_comments = null
		$scope.end_location = null
		$scope.end_timestamp = null
		$scope.top_endaddress = null
		$scope.top_endlocation = null
		if(!!$scope.$$nextSibling){
			$scope.$broadcast('deleteMap')
		}

	}
	 
	/* --------------  Database ---------------- */	 	
	// called when the application loads
	$scope.initializeDB = function(){
	
			// initial variables
	 
		// This alert is used to make sure the application is loaded correctly
		// you can comment this out once you have the application working
		console.log("DEBUGGING: we are in the InitializeDB function"); 
	 
		// this line tries to open the database base locally on the device
		// if it does not exist, it will create it and return a database object stored in variable db
		if(!$scope.db){
			$scope.createNewDB()
		}	
		// this line will try to create the table User in the database justcreated/openned
		$scope.db.transaction(function(tx){

			tx.executeSql( 'CREATE TABLE IF NOT EXISTS Auth(access_token varchar, imei varchar, license_plate varchar)', []);
			 
			// this line actually creates the table User if it does not exist and sets up the three columns and their types
			// note the UserId column is an auto incrementing column which is useful if you want to pull back distinct rows
			// easily from the table.
			tx.executeSql( 'CREATE TABLE IF NOT EXISTS Trip(Id INTEGER PRIMARY KEY AUTOINCREMENT, _cargo varchar, _start_timestamp int, _start_location int, _start_address varchar,  _start_comments varchar, _end_timestamp int, _end_location int, _end_address varchar, _end_comments varchar, _is_finished int)', [])},
			function error(err){alert('error on init local db : ' + err.message)}, function success(){console.log("database created")}
		) 
	}
	
	$scope.checkLengthOfDatabase = function() {
		if(!$scope.db){
			$scope.createNewDB()
		}	
		
		query = "SELECT * FROM Trip;";
		$scope.db.transaction(function(transaction){
	         transaction.executeSql(query, [], function(tx, results){
		        $scope.numberOfRows = results.rows.length;
        		console.log("antal ture i databasen : " + $scope.numberOfRows) 
	         },function error(err){alert('error selecting from database ' + err)}, function success(){});              
		});
	}

/* DEBUGGING functions */

	$scope.dropTables = function(){

		shortName = 'WebSqlDB';
		version = '1.0';
		displayName = 'WebSqlDB';
		maxSize = 65535;
	
		db = openDatabase(shortName, version, displayName, maxSize);


		db.transaction(function(tx){

			// IMPORTANT FOR DEBUGGING!!!!
			// you can uncomment these next twp lines if you want the table Trip and the table Auth to be empty each time the application runs
			tx.executeSql( 'DROP TABLE Trip');
			tx.executeSql( 'DROP TABLE Auth');

		})
	}
	
	$scope.is_mobile_app = function(){
		return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)
	}
	
	$scope.applyInProggess = function(scope){
		return scope.$$phase || scope.$root.$$phase ? true : false
	}
	
}) 



