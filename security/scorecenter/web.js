// Express initialization
var express = require('express');
var app = express(express.logger());
app.use(express.bodyParser());
app.set('title', 'nodeapp');



// Mongo initialization
var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/scorecenter';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
});



//code

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
   
   
app.post('/submit.json', function(request, response) {
	if (request.body.game_title) {
		if (request.body.username) {
			if (parseInt(request.body.score)) {
				db.collection('highscores', function(er, collection) {
					var now = new Date();
					var json = {game_title: request.body.game_title, username: request.body.username, score: parseInt(request.body.score), created_at: now};
					collection.insert(json);
					response.send('Your data has been recorded');
					});
			}
			else {
				response.send('Sorry, Invalid Input');
			}
		}
		else {
			response.send('Sorry, Invalid Input');
		}	
	}
	else {
		response.send('Sorry, Invalid Input');
	}
});


app.get('/', function (request, response) {
	response.set('Content-Type', 'text/json');
	db.collection('highscores', function(er, collection) {
		var arr = collection.find({},{_id: 0}).toArray(function (er, data) {
			response.send(data);
		});		
	});
});


app.get('/highscores.json', function(request, response) {
	var title=request.query.game_title;
	response.set('Content-Type', 'text/json');
	db.collection('highscores', function(er,collection) {
		var score_list = collection.find( {game_title : title},{_id: 0} ).sort( {score:-1} ).limit(10).toArray(function (er, data) {
			response.send(data);
			});
	});
});


app.get('/usersearch', function(request, response) {
	response.set('Content-Type', 'text/html');
	response.send('<!DOCTYPE html><html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script><title>User Search</title><script> function get_data() {var datas; var username=document.getElementById("input").value; $.post(\'http://hidden-brushlands-1773.herokuapp.com/usersearch_found\', { searching_name:username}, function(data) {var elem = document.getElementById("scoreboard"); elem.innerHTML = JSON.stringify(data);});};</script></head><body><h1>Please Enter The Name of the User</h1><input type="text" id="input" name="input" size="30" /><button type="button" id="submit" onclick="get_data()">Submit</button><h2>Here are the scores for this user: </h2><p id=\'scoreboard\'></p></body></html>'); 
});

app.post('/usersearch_found', function(request,response) {
	var name_data = request.body.searching_name;
	db.collection('highscores', function(er,collection) {
		collection.find( {username: name_data},{_id: 0} ).toArray(function (er, data) {
			response.send(data);
		});
	});
});

//port
app.listen(process.env.PORT || 3000);
