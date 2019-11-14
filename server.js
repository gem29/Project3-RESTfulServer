var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var js2xmlparser = require("js2xmlparser");
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
*/
app.get('/codes', (req,res) => {
	db.all("Select * from Codes", (err, rows) => {
		//console.log(rows);
		var codes = {};
		for(var i = 0; i < rows.length; i++) {
			codes['C' + rows[i].code] = rows[i].incident_type;
		}
		console.log(codes);
		res.end();
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
*/
app.get('/neighborhoods', (req,res) => {
	db.all("Select * from Neighborhoods", (err, rows) => {
		console.log(rows);
		var neighborhoods = {};
		for(var i = 0; i < rows.length; i++) {
			neighborhoods['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;
		}
		console.log(neighborhoods);
		res.end();
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
}
*/
app.get('/incidents', (req,res) => {
	db.all("Select * from Incidents", (err, rows) => {
		console.log(rows);
		var incidents = {};
		for(var i = 0; i < rows.length; i++) {
			//incidents['I' + rows[i].case_number] = {};
			//incidents['I' + rows[i].case_number].date = rows[i].date;
			//incidents['I' + rows[i].case_number].time = rows[i].date;
			//incidents['I' + rows[i].case_number].code = rows[i].code;
			//incidents['I' + rows[i].case_number].incident = rows[i].date;
		}
		console.log(incidents);
		res.end();
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

