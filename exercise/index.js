const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  "username": String
});

const exerciseSchema = new mongoose.Schema({
  "description": String,
  "duration": Number,
  "date": Date,
  "userid": String
});

let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get('/api/users', (req, res) => {
  User.find({})
  .then(data => {
    res.json(data.map(({_id, username}) => ({_id, username})));
  })
  .catch(err => console.log("", err));
});

app.post('/api/users', (req, res) => {
  if (req.body.username !== "") {
    User.findOne({"username": req.body.username})
    .then(data => {
      if (data) {
        res.json({"username": req.body.username, _id:data._id});
      } else {
        const usr = new User({"username": req.body.username});
        usr.save()
        .then(data => {
          res.json({"username": req.body.username, _id:data._id});
        }).catch(err => console.log("", err));
      }
    })
    .catch(err => console.log("", err));
  } else {
    res.json({error: 'empty username'})
  }
});

const regDuration=/^[0-9]+$/

app.post('/api/users/:_id/exercises', (req, res) => {
  errMsgs=[];
  if (req.body.description === "") {
    errMsgs.push('empty description');
  }
  if (req.body.duration === "") {
    errMsgs.push('empty duration');
  } else if (!regDuration.test(req.body.duration)) {
    errMsgs.push('invalid duration');
  }
  if (req.body.date !== ""
    && req.body.date !== undefined
    && isNaN(new Date(req.body.date))) {
    errMsgs.push('invalid date');
  }
  if (0 < errMsgs.length) {
    res.json({error: errMsgs})
  } else {
    User.findById(req.params._id)
    .then(data => {
      if (data) {
        const username=data.toObject()['username'];
        date=new Date(req.body.date);
        if (isNaN(date)) {
          date=new Date();
        }
        const ex = new Exercise({
          "description": req.body.description,
          "duration": Number(req.body.duration),
          "date": date,
          "userid": req.params._id
        });
        ex.save()
        .then(data => {
          json={
            "username": username, 
            "description": req.body.description,
            "duration": Number(req.body.duration),
            "date": date.toDateString(),
            "_id": req.params._id
          };
          res.json(json);
        })
        .catch(err => console.log("", err));
      } else {
        res.json({error: 'invalid user id'})
      }
    })
    .catch(err => console.log("", err));
  }
});

const limitDuration=/^[0-9]+$/

app.get('/api/users/:_id/logs', (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  let limit = req.query.limit;
  errMsgs=[];
  if (from !== undefined && isNaN(new Date(from))) {
    errMsgs.push('invalid from');
  }
  if (to !== undefined && isNaN(new Date(to))) {
    errMsgs.push('invalid to');
  }
  if (limit !== undefined && !limitDuration.test(limit)) {
    errMsgs.push('invalid limit');
  }
  if (0 < errMsgs.length) {
    res.json({error: errMsgs});
  } else {
    User.findById(req.params._id)
    .then(data => {
      if (data) {
        const username=data.toObject()['username'];
        let query = {'userid': req.params._id};
        if (from !== undefined && to !== undefined) {
          query['date'] = {$gte: new Date(from), $lte: new Date(to)}
        } else if (from !== undefined) {
          query['date'] = {$gte: new Date(from)}
        } else if (to !== undefined) {
          query['date'] = {$lte: new Date(to)}
        }
        if (limit === undefined) {
          limit=0;
        } else {
          limit=Number(limit);
        }
        Exercise.find(query)
        .limit(limit)
        .then(data => {
          json={
            "_id": req.params._id
            , "username": username
            , "count": data.length
            , "log": data.map(item => {
              return {
                "description": item.description
                , "duration": Number(item.duration)
                , "date": item.date.toDateString()
              }
            })
          };
          res.json(json);
        })
        .catch(err => console.log("", err));
      } else {
        res.json({
          "_id": req.params._id
            , "username": ''
            , "count": 0
            , "log": []
        });
      }
    })
    .catch(err => console.log("", err));
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
