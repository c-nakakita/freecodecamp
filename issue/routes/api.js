'use strict';

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('Error connecting to MongoDB:', err));

const isshueSchema = new mongoose.Schema({
  "project": String,
  "issue_title": String,
  "issue_text": String,
  "created_by": String,
  "assigned_to": String,
  "status_text": String,
  "created_on": Date,
  "updated_on": Date,
  "open": Boolean
}, { versionKey: false });

const Issue = mongoose.model('Issue', isshueSchema);
const keys = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
const reqKeys = ['issue_title', 'issue_text', 'created_by'];
const optKeys = ['assigned_to', 'status_text'];

module.exports = (app) => {
  app.route('/api/issues/:project')
  
    .get((req, res) => {
      let project = req.params.project;
      let query = {"project": project, ...req.query};
      Issue.find(query)
      .then(datas => {
        const dataary = datas.map(item => {
          let obj = item.toObject();
          optKeys.forEach(key => {
            if (!(key in obj)) {
              obj[key] = '';
            }
          });
          return obj;
        });
        res.json(dataary);
      }).catch(err => {
        console.log("", err);
        res.json({error: 'server error'});
      });
    })
    
    .post((req, res) => {
      let project = req.params.project;
      let errFlg = false;
      for (var key of reqKeys) {
        if (req.body[key] === undefined
          || req.body[key] === ''
        ) {
          errFlg = true;
          break;
        }
      }
      if (errFlg) {
        res.json({ error: 'required field(s) missing' });
        return;
      }
      const dt = new Date();
      const issue = new Issue({
        "project": project,
        "issue_title": req.body.issue_title,
        "issue_text": req.body.issue_text,
        "created_by": req.body.created_by,
        "assigned_to": req.body.assigned_to,
        "status_text": req.body.status_text,
        "created_on": dt,
        "updated_on": dt,
        "open": true
      });
      issue.save().then(data => {
        res.json({
          "_id": data._id,
          "issue_title": req.body.issue_title,
          "issue_text": req.body.issue_text,
          "created_by": req.body.created_by,
          "assigned_to": req.body.assigned_to ?? '',
          "status_text": req.body.status_text ?? '',
          "created_on": dt,
          "updated_on": dt,
          "open": true
          });
      }).catch(err => console.log("", err));        
    })
    
    .put((req, res) => {
      if (req.body._id === undefined
        || req.body._id === ''
      ) {
        res.json({error: 'missing _id'});
        return;
      }
      const updData = {};
      for (var key of keys) {
        if (req.body[key] !== undefined
          && req.body[key] !== ''
        ) {
          updData[key] = req.body[key];
        }
      }
      if (req.body.open !== undefined) {
        updData['open'] = req.body.open === 'false' ? false : true;
      }

      if (Object.keys(updData).length === 0 ) {
        res.json({ error: 'no update field(s) sent', '_id': req.body._id });
        return;
      }

      updData['updated_on'] = new Date();

      Issue.findByIdAndUpdate(
        req.body._id,
        updData,
        {new: true}
      )
      .then(data => {
        if (data) {
          res.json({  result: 'successfully updated', '_id': req.body._id });
        } else {
          res.json({error: 'could not update', _id:req.body._id})
        }
      }).catch(err => {
        console.log("", err);
        res.json({error: 'could not update', _id:req.body._id});
      });
    
    })
    
    .delete((req, res) => {
      let project = req.params.project;
      if (req.body._id === undefined
        || req.body._id === ''
      ) {
        res.json({ error: 'missing _id' });
        return;
      }
      Issue.findByIdAndDelete(req.body._id)
      .then(data => {
        if (data) {
          res.json({ result: 'successfully deleted', '_id': req.body._id });
        } else {
          res.json({ error: 'could not delete', '_id': req.body._id });
        }
      }).catch(err => {
        console.log("", err);
        res.json({ error: 'could not delete', '_id': req.body._id });
      });
    });
};
