require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('Error connecting to MongoDB:', err));

const urlInfoSchema = new mongoose.Schema({
  "original_url": String
});

let UrlInfo = mongoose.model('UrlInfo', urlInfoSchema);


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const validURL = (urlstr) => {
  if (URL.canParse(urlstr)) {
    const url = new URL(urlstr);
    return url.protocol === "http:" || url.protocol === "https:";
  }
  return false;
};

app.get('/api/shorturl/:short_url', (req, res) => {
  UrlInfo.findById(req.params.short_url)
  .then(data => {
    if (data) {
      console.log(data.original_url)
      res.redirect(data.original_url);
    } else {
      res.json({ error: 'invalid url' });
    }
  })
  .catch(err => console.log("", err));
});

app.post('/api/shorturl', (req, res) => {
  if (validURL(req.body.url)) {
    UrlInfo.findOne({"original_url": req.body.url})
    .then(data => {
      if (data) {
        res.json({
          "original_url": req.body.url,
          "short_url": data._id.toString()
        });
      } else {
        const ui = new UrlInfo({
          "original_url": req.body.url
        }); 
        ui.save()
        .then(ret => {
          UrlInfo.findById(ret._id)
          .then(data => {
            const {_id, ...otherFields} = data.toObject()
            console.log(_id.toString());
            res.json({
              "original_url": req.body.url,
              "short_url": _id.toString()
            });
          })
          .catch(err => console.log("", err));
        })
        .catch(err => console.log("", err));
      }
    })
    .catch(err => console.log("", err));
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
