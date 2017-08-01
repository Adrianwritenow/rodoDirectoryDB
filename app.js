const express =  require('express');
const mustacheExpress =require('mustache-express')
const app =  express();
app.use(express.static('public'));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');


var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/robots';

var robotsNeedJob = function(db,callback){
  var collection = db.collection('robots');

  collection.find({"job": null}).toArray(function(err, result) {
   console.log("found ",result.length, " users")
   callback(result);

 });
}

var findRobots = function(db, callback){

  var collection = db.collection('robots');

  collection.find().toArray(function(err, result) {
   console.log("found ",result.length, " users")
   callback(result);
 });
}

app.get('/', function(request, response){
  MongoClient.connect(url, function(err, db) {
    findRobots(db, function(result){
      response.render('robots', {users:result})
    });
  });
});

app.get('/needWork', function(request,response){
  MongoClient.connect(url, function(err, db) {
    robotsNeedJob(db, function(result) {
      response.render('robots', { users:result});
    });
  });
});

app.get('/:username', function(request, response){
  MongoClient.connect(url, function(err,db){
    findRobots(db, function(result){
      let robot = result.find(function(member){
        return member.username.toLowerCase() === request.params.username.toLowerCase();
      });
      response.render('roboProfile', robot);

    });
  });
});
// });

// MongoClient.connect(url, function(err, db) {
//   console.log("Connected successfully to server");
//   findRobots(db, function() {
//   });
// });


app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});
