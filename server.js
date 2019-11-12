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
app.get('/code', (req,res) => {
	db.all("Select * from Codes", (err, rows) => {
		console.log(rows);
	});
});

/* curl -x GET http://localhost:8000/neighborhoods */
app.get('/neighborhoods', (req,res) => {
	db.all("Select * from Neighborhoods", (err, rows) => {
		console.log(rows);
	});
});

/* curl -x GET http://localhost:8000/incidents */
app.get('/incidents', (req,res) => {
	db.all("Select * from Incidents", (err, rows) => {
		console.log(rows);
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

