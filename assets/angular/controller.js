/* Is this needed? */
angular.module("loadmaster",[])
  .config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

/* User controller with angularjs */
function userCtrl($scope) {

	window.myscope = $scope;
	window.db = $scope.isDatabaseEmpty;
	
	$scope.shortName = 'WebSqlDB';
	$scope.version = '1.0';
	$scope.displayName = 'WebSqlDB';
	$scope.maxSize = 65535;
	$scope.host = 'http://195.231.85.191:5000';

	$scope.init = function(){
/* 		debugging function */

/* 		$scope.dropTables(); */

/* 		End of debugging functions */
		$scope.initializeDB()
		$scope.isAccessTokenInDatabase()
		
	    $.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.defaultPageTransition   = 'none';
	    $.mobile.defaultDialogTransition = 'none';
		
		if($scope.access_token != ""){
			$scope.checkInterval();		
		}
	}
	
	$scope.checkInterval = function(){
		$scope.intervalID = setInterval(function(){
				$scope.$apply(function(scope){
					document.addEventListener("deviceready", function(){
					}, false);
				scope.checkConnection();
			  	})	
				console.log("firing checkConnection")
			}, 5000);	
	}
	
	$scope.isAccessTokenInDatabase = function(){
			// initial variables
		if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		
		console.log("is access token in database?")
		
		$scope.db.transaction(function (tx){
			tx.executeSql('SELECT * FROM Auth', [], function (tx, result){  // Fetch records from SQLite
				var dataset = result.rows; 
				if (dataset.length == 0 ){
					$.mobile.changePage("#tokencontainer");
				}
				else if(!!dataset.length){
					console.log("dataset item 1 " + dataset.item(0).imei)
					$scope.access_token = dataset.item(0).access_token;
					$scope.imei = dataset.item(0).imei;

					$.mobile.changePage("#home");
					console.log("access token " + $scope.access_token + "og imei er " + $scope.imei);
				}
			});
		});	
	}
		
	/* check Connection */
	$scope.checkConnection = function(){
		console.log("Checking connection");
		if(navigator.connection.type == Connection.UNKNOWN || navigator.connection.type == Connection.WIFI){
			console.log('Unknown connection');
			
/* 			move this to only trigger if connection is found */
			$scope.isDatabaseEmpty();

		} else if(navigator.connection.type == Connection.CELL_3G || navigator.connection.type == Connection.CELL_4G){
			console.log("Found connection. Checking if database is empty ")
		}
	}
	
	
	/* Is database empty */
	$scope.isDatabaseEmpty = function() {
		if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
		
		var numberOfRows;
	 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
	
		query = "SELECT * FROM Trip;";
		$scope.db.transaction(function(transaction){
	         transaction.executeSql(query, [], function(tx, results){
		         var dataset = results.rows;
		         if (dataset.length == 0){
			        numberOfRows = results.rows.length;
					console.log("table has "+results.rows.length+" rows. returning "+ numberOfRows);
		         }else if (dataset.length > 0){
			        console.log("Dataset is bigger than 0")
			        var item = dataset.item(0)
					if (item['_is_finished'] == undefined) {                               
						console.log("first trip is not done")
			        } else if(item['_is_finished'] == 1) {
			        	console.log("first trip is finished. Syncing to database")
				        $scope.syncToDatabase();
			        }   
		         }
	         },function error(err){alert('error selecting from database ' + err)}, function success(){});              
		});
		return numberOfRows;
	}
	
	/* Sync to server */
	$scope.syncToDatabase = function () {
			
		if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
			
			$scope.db.transaction(function (tx)	 
				{
					tx.executeSql('SELECT * FROM Trip', [], function (tx, result)  // Fetch records from SQLite		 
					{	 
						var dataset = result.rows; 
						var trips = new Array();
						for (var i = 0, item = null; i < dataset.length; i++) {
							item = dataset.item(i);
							var trip = {
								trip_id			: item['Id'],
								cargo			: item['_cargo'],
								license_plate 	: item['_license_plate'],
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
								console.log(trip)
								trips.push(trip);	
							}
						}
						$scope.InsertRecordOnServerFunction(trips);      // Call Function for insert Record into SQl Server
					});
				});
			}
	
	/* Syncs with server */
	$scope.InsertRecordOnServerFunction = function(trips){  // Function for insert Record into SQl Server
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
			}
		});
	};
	
/* 	Reset access token if incorrect */
	$scope.resetAccessToken = function(){
	 	if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
		
		console.log("Deleting access token and device id from table")
		 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		
		/* 	Deletes synced rows from trips table */
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('DELETE FROM Auth', [/* Insert array of IDs of synced rows. See below */]);
			},function error(err){alert('error resetting accesstoken ' + err)}, function success(){}
		);
		console.log("access token er " + $scope.access_token)
		alert("Access token er forkert")
		clearInterval($scope.intervalID);
		$.mobile.changePage("#tokencontainer");
	}

	
	/* Drops synced rows */
	$scope.dropAllRows = function(){
		 
		 if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
			
		 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		 		 
		/* 	Deletes synced rows from trips table */
			$scope.db.transaction(function(transaction) {
				transaction.executeSql('DELETE FROM Trip WHERE _is_finished = 1', [/* Insert array of IDs of synced rows. See below */]);
				},function error(err){alert('error deleting from database ' + err)}, function success(){}
			);
			return false;

		}
	
		/* Drops synced rows */
	$scope.dropRowsSynced = function(err_ids){
		 
		 if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
			
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		 		 
		/* 	Deletes synced rows from trips table */
			$scope.db.transaction(function(transaction) {
				transaction.executeSql('DELETE FROM Trip WHERE id <> *', [err_ids]);
				},function error(err){alert('error deleting from database ' + err)}, function success(){}
			);
			return false;
		}	
	
		/* 	Starting new trip*/
	$scope.submitStartNewTrip = function($event){

		$event.preventDefault();
		$.mobile.changePage("#home");
	}
	
	$scope.submitToken = function($event){

		console.log($scope.access_token)
		
		// this is the section that actually inserts the values into the User table
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO AUTH (access_token, imei) VALUES ("'+$scope.access_token+'", "'+$scope.imei+'")',[]);
			},function error(err){alert('error on save to local db ' + err)}, function success(){}
		);
		
		$scope.checkInterval()
		$event.preventDefault();
		$.mobile.changePage("#home");
		
		return false;
	}
	 
	/* --------------  Database ---------------- */	 	
	// called when the application loads
	$scope.initializeDB = function(){
	
			// initial variables
	 
		// This alert is used to make sure the application is loaded correctly
		// you can comment this out once you have the application working
		console.log("DEBUGGING: we are in the InitializeDB function");
		
		if (!window.openDatabase) {
			// not all mobile devices support databases  if it does not, the following alert will display
			// indicating the device will not be albe to run this application
			alert('Databases are not supported in this browser.');
			return;
		}
	 
		// this line tries to open the database base locally on the device
		// if it does not exist, it will create it and return a database object stored in variable db
		if(!$scope.db){
			$scope.db = openDatabase($scope.shortName, $scope.version, $scope.displayName, $scope.maxSize);
		}	
		// this line will try to create the table User in the database justcreated/openned
		$scope.db.transaction(function(tx){

			tx.executeSql( 'CREATE TABLE IF NOT EXISTS Auth(access_token varchar, imei varchar)', []);
			 
			// this line actually creates the table User if it does not exist and sets up the three columns and their types
			// note the UserId column is an auto incrementing column which is useful if you want to pull back distinct rows
			// easily from the table.
			tx.executeSql( 'CREATE TABLE IF NOT EXISTS Trip(Id INTEGER PRIMARY KEY AUTOINCREMENT, _license_plate varchar, _cargo varchar, _start_timestamp int, _start_location int, _start_address varchar,  _start_comments varchar, _end_timestamp int, _end_location int, _end_address varchar, _end_comments varchar, _is_finished int)', [])},
			function error(err){alert('error on init local db ' + err)}, function success(){console.log("database created")}
		) 
	}
	
	// this is the function that puts values into the database from page #home
	$scope.AddStartValuesToDB = function(trip) {
		
		console.log("cargo er " + trip.cargo);
	 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
	 
		// this is the section that actually inserts the values into the User table
		$scope.db.transaction(function(transaction) {
			console.log("Cargo er i submit og vi kører nu addstartvalues to db" + $scope.cargo);
			transaction.executeSql('INSERT INTO Trip(_license_plate, _cargo, _start_timestamp, _start_location, _start_address, _start_comments) VALUES ("'+trip.license_plate+'", "'+trip.cargo+'", "'+trip.start_timestamp+'", "'+trip.start_location+'", "'+trip.start_address+'", "'+trip.start_comments+'")');	
		},function error(err){alert('error on save to local db ' + err)}, function success(){});
		return false;
	}	
	
	// this is the function that puts values into the database from page #home
	$scope.AddEndValuesToDB = function(trip) {
	 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}

		// this is the section that actually inserts the values into the User table
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('UPDATE Trip SET _end_timestamp ="'+trip.end_timestamp+'", _end_location ="'+trip.end_location+'", _end_address ="'+trip.end_address+'", _end_comments ="'+trip.end_comments+'", _is_finished = 1 WHERE Id= last_insert_rowid()',[]);
			},function error(err){alert('error on save to local db ' + err)}, function success(){}
		);
		return false;
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
	
} 



