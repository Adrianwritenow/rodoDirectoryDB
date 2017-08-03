const express =  require('express');
const mustacheExpress =require('mustache-express')
const app =  express();
const session = require('express-session');
const passport = require('passport');
const models = require("./models");
const LocalStrategy = require('passport-local').Strategy;


app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: "2C44-4D44-WppQ38S",
  resave: false,
  saveUninitialized:true

}));

passport.use(new LocalStrategy(
  function (userName, userPass, done){
    User.authenticate(userName,userPass, function(err,user){
      if (err) {
            return done(err)
        }
        if (user) {
            return done(null, user)
        } else {
            return done(null, false, {
                message: "There is no user with that username and password."
            })
        }
    })
}))

app.use(function (request, response, next) {
  response.locals.user = request.user;
  next();
})

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

const requireLogin = function (request, response, next) {
  if (request.user) {
    next()
  } else {
    response.redirect('/login');
  }
}

app.get('/',  requireLogin, function(request, response){
  if (request.session && request.session.admin){
    MongoClient.connect(url, function(err, db) {
      findRobots(db, function(result){
        response.render('robots', {users:result})
      });
    });
  }else{
    response.redirect('/login');
  }
});

app.get('/login',function(request,response){
    response.render('login');
});
app.get('/register',function(request,response){
    response.render('register');
});

app.post('/register', function (request, response){
  request.getValidationResult()
    .then(function(result) {
      if (!result.isEmpty()) {
        return response.render("register", {
          username: request.body.userName,
          errors: result.mapped()
        });
      }
      const user = new User({
        username: request.body.userName,
        password: request.body.userPass
      })

      user.save(function(err) {
          if (err) {
              return response.render("register", {
                  messages: {
                      error: ["That username is already taken."]
                  }
              })
          }
          return response.redirect('/login');
      })
  })
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


app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});
