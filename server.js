var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
//var js2xmlparser = require("js2xmlparser");
var sqlite3 = require('sqlite3')

var port = 8000;
var public_dir = path.join(__dirname, 'public');
var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');
var app = express();

// open stpaul_crime.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

var all_codes = [];
db.all('select code from Codes order by code', (err, rows) => {
	for(var i = 0; i<rows.length; i++) {
		all_codes.push(rows[i].code);
	}
});

var all_grids = [];
db.all('select distinct police_grid from Incidents where police_grid > 0 order by police_grid', (err, rows) => {
	for(var i = 0; i<rows.length; i++) {
		all_grids.push(rows[i].police_grid);
	}
});

var all_neighborhoods = [];
db.all('select distinct neighborhood_number from Neighborhoods order by neighborhood_number', (err, rows) => {
	for(var i = 0; i<rows.length; i++) {
		all_neighborhoods.push(rows[i].neighborhood_number);
	}
});


/*
Codes:
code (INTEGER) - crime incident type numeric code
incident_type (TEXT) - crime incident type description

Neighborhoods:
neighborhood_number (INTEGER) - neighborhood id
neighborhood_name (TEXT) - neighborhood name

Incidents:
case_number (TEXT): unique id from crime case
date_time (DATETIME): date and time when incident took place
code (INTEGER): crime incident type numeric code
incident (TEXT): crime incident description (more specific than incident_type)
police_grid (INTEGER): police grid number where incident occurred
neighborhood_number (INTEGER): neighborhood id where incident occurred
block (TEXT): approximate address where incident occurred
*/


/* curl -x GET http://localhost:8000/code */

/*
GET /codes
Return JSON object with list of codes and their corresponding incident type. Note - keys cannot start with a number, therefore are prepended with a 'C'.
Example:
{
  "C110": "Murder, Non Negligent Manslaughter",
  "C120": "Murder, Manslaughter By Negligence",
  "C210": "Rape, By Force",
  "C220": "Rape, Attempt",
  "C300": "Robbery",
  "C311": "Robbery, Highway, Firearm",
  "C312": "Robbery, Highway, Knife or Cutting Instrument",
  "C313": "Robbery, Highway, Other Dangerous Weapons",
  "C314": "Robbery, Highway, By Strong Arm",
  ...
}

Add the following query options for GET /codes (2 pts)
code - comma separated list of codes to include in result (e.g. ?code=110,700). By default all codes should be included.
format - json or xml (e.g. ?format=xml). By default JSON format should be used.

*/
app.get('/codes', (req,res) => {
	var code_list = all_codes;
	if(req.query.hasOwnProperty('code')) {
    	code_list = req.query.code.split(',');
    	/*console.log(string_code);
    	for(var i in string_code) {
    		code_list[i] = parseInt(string_code[i],10);
    	}*/
    }
	db.all("Select * from Codes where code in (" + code_list + ") order by code", (err, rows) => {
		console.log(rows);
		var codes = {};
		/*if(req.query.hasOwnProperty('code')) {
			code_list 
		}*/
		for(var i = 0; i < rows.length; i++) {
			codes['C' + rows[i].code] = rows[i].incident_type;
		}
		//console.log(codes);
		//if(req.query.xml)
		res.type('json').send(codes);
	});
});

/* curl -x GET http://localhost:8000/neighborhoods */
/*
GET /neighborhoods
Return JSON object with list of neighborhood ids and their corresponding neighborhood name. Note - keys cannot start with a number, therefore are prepended with a 'N'.
Example:
{
  "N1": "Conway/Battlecreek/Highwood",
  "N2": "Greater East Side",
  "N3": "West Side",
  "N4": "Dayton's Bluff",
  "N5": "Payne/Phalen",
  "N6": "North End",
  "N7": "Thomas/Dale(Frogtown)",
  "N8": "Summit/University",
  "N9": "West Seventh",
  "N10": "Como",
  "N11": "Hamline/Midway",
  "N12": "St. Anthony",
  "N13": "Union Park",
  "N14": "Macalester-Groveland",
  "N15": "Highland",
  "N16": "Summit Hill",
  "N17": "Capitol River"
}

Add the following query options for GET /neighborhoods (2 pts)
id - comma separated list of neighborhood numbers to include in result (e.g. ?id=11,14). By default all neighborhoods should be included.
format - json or xml (e.g. ?format=xml). By default JSON format should be used.

*/
app.get('/neighborhoods', (req,res) => {
	var neighborhood_list = all_neighborhoods;
	if(req.query.hasOwnProperty('id')) {
    	neighborhood_list = req.query.id.split(',');
    	/*for(var i in string_grid) {
    		neighborhood_list[i] = parseInt(string_neighborhood[i],10);
    	}*/
    }
	db.all("Select * from Neighborhoods where neighborhood_number in (" + neighborhood_list + ")", (err, rows) => {
		//console.log(rows);
		var neighborhoods = {};
		for(var i = 0; i < rows.length; i++) {
			neighborhoods['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;
		}
		//console.log(neighborhoods);
		res.type('json').send(neighborhoods);
	});
});

/* curl -x GET http://localhost:8000/incidents */
/*
GET /incidents
Return JSON object with list of crime incidents. Make date and time separate fields. Note - keys cannot start with a number, therefore are prepended with a 'I'.
Example:
{
  "I19245020": {
    "date": "2019-10-30",
    "time": "23:57:08",
    "code": 9954,
    "incident": "Proactive Police Visit",
    "police_grid": 87,
    "neighborhood_number": 7,
    "block": "THOMAS AV  & VICTORIA"
  },
  "I19245016": {
    "date": "2019-10-30",
    "time": "23:53:04",
    "code": 9954,
    "incident": "Proactive Police Visit",
    "police_grid": 87,
    "neighborhood_number": 7,
    "block": "98X UNIVERSITY AV W"
  },
  "I19245014": {
    "date": "2019-10-30",
    "time": "23:43:19",
    "code": 700,
    "incident": "Auto Theft",
    "police_grid": 95,
    "neighborhood_number": 4,
    "block": "79X 6 ST E"
  },
  ...
  	start_date - first date to include in results (e.g. ?start_date=2019-09-01)
	end_date - last date to include in results (e.g. ?end_date=2019-10-31)
	code - comma separated list of codes to include in result (e.g. ?code=110,700). By default all codes should be included.
	grid - comma separated list of police grid numbers to include in result (e.g. ?grid=38,65). By default all police grids should be included.
	neighborhood - comma separated list of neighborhood numbers to include in result (e.g. ?id=11,14). By default all neighborhoods should be included.
	limit - maximum number of incidents to include in result (e.g. ?limit=50). By default the limit should be 10,000. Result should include the N most recent incidents.
	format - json or xml (e.g. ?format=xml). By default JSON format should be used.
}
*/
app.get('/incidents', (req,res) => {
	var limit = 10000;
	var start_date = '2019-09-01';
	var end_date = '2019-11-01';
	var code_list = all_codes;
	var grid_list = all_grids;
	var neighborhood_list = all_neighborhoods;
	var format = 'json';
	if (req.query.hasOwnProperty('limit')) {
        limit = Math.min(limit,parseInt(req.query.limit, 10));
    }
    if(req.query.hasOwnProperty('start_date')) {
    	start_date = req.query.start_date;
    }
    if(req.query.hasOwnProperty('end_date')) {
    	end_date = req.query.end_date;
    }
    if(req.query.hasOwnProperty('code')) {
    	code_list = req.query.code.split(',');
    	/*console.log(string_code);
    	for(var i in string_code) {
    		code_list[i] = parseInt(string_code[i],10);
    	}*/
    }
    if(req.query.hasOwnProperty('grid')) {
    	var grid_list = req.query.grid.split(',');
    	/*for(var i in string_grid) {
    		grid_list[i] = parseInt(string_grid[i],10);
    	}*/
    }
    if(req.query.hasOwnProperty('neighborhood')) {
    	neighborhood_list = req.query.neighborhood.split(',');
    	/*for(var i in string_grid) {
    		neighborhood_list[i] = parseInt(string_neighborhood[i],10);
    	}*/
    }
    //console.log("Select * from Incidents where date_time >= '" + start_date + "' and date_time < '" + end_date + "' and code in (" + code_list + ") and police_grid in (" + grid_list + ") and neighborhood_number in (" + neighborhood_list + ") order by date_time desc limit " + limit);
	db.all("Select * from Incidents where date_time >= '" + start_date + "' and date_time < '" + end_date + "' and code in (" + code_list + ") and police_grid in (" + grid_list + ") and neighborhood_number in (" + neighborhood_list + ") order by date_time desc limit " + limit, (err, rows) => {
		if(err) {console.log(err);}
		/*{ case_number: '15132434',
	    date_time: '2015-06-26T07:09:00',
	    code: 1400,
	    incident: 'Vandalism',
	    police_grid: 74,
	    neighborhood_number: 5,
	    block: '77X CASE AV' }*/
		//console.log(rows);
		var incidents = {};
		for(var i = 0; i < rows.length; i++) {
			let this_date = rows[i].date_time.substring(0,10);
			let this_time = rows[i].date_time.substring(11,19);
			let this_code = rows[i].code;
			let this_incident = rows[i].incident;
			let this_police_grid = rows[i].police_grid;
			let this_neighborhood_number = rows[i].neighborhood_number;
			let this_block = rows[i].block;
			incidents['I' + rows[i].case_number] = {};
			incidents['I' + rows[i].case_number].date = this_date;
			incidents['I' + rows[i].case_number].time = this_time;
			incidents['I' + rows[i].case_number].code = this_code;
			incidents['I' + rows[i].case_number].incident = this_incident;
			incidents['I' + rows[i].case_number].police_grid = this_police_grid;
			incidents['I' + rows[i].case_number].neighborhood_number = this_neighborhood_number;
			incidents['I' + rows[i].case_number].block = this_block;
			//incidents['I' + rows[i].case_number] = {};
			//incidents['I' + rows[i].case_number].date = rows[i].date;
			//incidents['I' + rows[i].case_number].time = rows[i].date;
			//incidents['I' + rows[i].case_number].code = rows[i].code;
			//incidents['I' + rows[i].case_number].incident = rows[i].date;
		}
		//console.log(incidents);
		//if(req.query.hasOwnProperty('xml')) {}
		res.type('json').send(incidents);
	});
});

app.put('/new-incident', (req,res) => {
	
});

console.log('Now Listening on port ' + port);
var server = app.listen(port);



/*

var users;
var users_filename = path.join(public_dir, 'users.json');
fs.readFile(users_filename, (err, data) => {
	if(err) {
		console.log('Error reading users.json');
		users = {users: []};
	}
	else {
		users = JSON.parse(data);
	}
});

var app = express();
app.use(express.static(public_dir));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/list-users', (req, res) => {
	/*res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify(users));
	console.log(users);
	res.end();
	if(req.query.limit) {
		var limited_users = {'users': []};
		for(var i = 0; i<req.query.limit; i++) {
			limited_users.users.push[users.users[i]];
		}
		console.log(limited_users);
	}
	if(req.query.format == 'xml') {
		if(req.query.limit) {
		res.writeHead(200, {'Content-Type': 'application/xml'});
		res.write(js2xmlparser.parse('user',limited_users));
		console.log(js2xmlparser.parse('user',limited_users));
		}
		else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(js2xmlparser.parse('user',users));
		}
		//console.log(users);
		res.end();
	} else {
		res.type('json').send(users);
	}
});

app.put('/add-user', (req, res) => {
	//console.log("body: " + JSON.stringify(req.body));
	var new_user = {
		id: parseInt(req.body.id),
		name: req.body.name,
		email: req.body.email
	};
	var has_id = false;
	for(let i=0; i<users.users.length; i++) {
		if(users.users[i].id === new_user.id) { has_id = true; }
	}
	if(has_id){
		res.status(500).send('Error: Id ' + req.body.id + ' already exists');
		res.end();
	} else {
		users.users.push(new_user);
		console.log("Success");
		console.log(JSON.stringify(users));
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify(users));
		res.end();
	}
});

app.delete('/remove-user', (req, res) => {
	//console.log("body: " + JSON.stringify(req.body));
	var removed_user = {
		id: parseInt(req.body.id),
	};
	var index = -1;
	for(let i = 0; i<users.users.length; i++) {
		if(users.users[i].id == req.body.id) { index = i;}
	}
	if(index == -1){
		res.status(500).send('Error: Id ' + req.body.id + ' does not exist');
		res.end();
	} else {
		users.users.splice(index,1);
		console.log("Success");
		console.log(JSON.stringify(users));
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify(users));
		res.end();
	}
});


app.post('/update-user', (req, res) => {
	var new_user = {
		id: parseInt(req.body.id),
		name: req.body.name,
		email: req.body.email
	};
	var index = -1;
	for(let i = 0; i<users.users.length; i++) {
		if(users.users[i].id == req.body.id) { index = i;}
	}
	//console.log(new_user);
	if(index == -1) {
		res.status(500).send('Error: Id ' + req.body.id + ' does not exist');
		res.end();
	}
	else {
		users.users[index].name = new_user.name;
		users.users[index].email = new_user.email;
		console.log("Success");
		console.log(JSON.stringify(users));
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(js2xml.parse(users));
		res.end();
	}
});
 */

