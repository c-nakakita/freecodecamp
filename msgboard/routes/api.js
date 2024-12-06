'use strict';

const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const saltRounds = 12;

const checkReqFields = (body, fields) => {
  for (var field of fields) {
    if (body[field] === undefined
      || body[field] === '') {
      return false;
    }
  }
  return true;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

module.exports = function (app, myDataBase) {

  const trdCol = myDataBase.collection('threads');

  app.route('/api/threads/:board')
    .post(async (req, res) => {
      if (!checkReqFields(req.body, ['text', 'delete_password'])) {
        res.send("error");
        return;
      }
      const hashedPwd = await hashPassword(req.body['delete_password']);
      const now = new Date();
      const ret = await trdCol.insertOne({
        board: req.params.board,
        text: req.body['text'],
        created_on: now,
        bumped_on: now,
        reported: false,
        delete_password: hashedPwd,
        replies:[]
      });
      res.redirect(303, `/b/${req.params.board}`)
    })
    .get(async (req, res) => {
      const threads = await trdCol
      .aggregate([
        {$match: {board:req.params.board}},
        {
          $project: {
            _id:1,
            text: 1,
            created_on:1,
            bumped_on: 1,
            replycount: {$size: "$replies"},
            replies: {
              $slice: [
                {$sortArray: {input: "$replies", sortBy: {created_on: -1}}},3
              ]
            }
          }
        },
        {
          $project: {
            _id:1,
            text: 1,
            created_on:1,
            bumped_on: 1,
            replycount: 1,
            replies: {
              $map: {
                input: "$replies",
                as: "reply",
                in: {
                  "_id": "$$reply._id",
                  "text": "$$reply.text",
                  "created_on": "$$reply.created_on"
                }
              }
            }
          }
        }
      ])
      .sort({["bumped_on"]:-1})
      .limit(10)
      .toArray();
      res.json(threads);
    })
    .delete(async (req, res) => {
      if (!checkReqFields(req.body, ['thread_id', 'delete_password'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.body['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      var result = bcrypt.compareSync(req.body['delete_password'], thread['delete_password']);
      if (!result) {
        res.send("incorrect password");
        return;
      }
      await trdCol.deleteOne({
        "_id": new ObjectId(req.body['thread_id'])
      });
      res.send("success");
    })
    .put(async (req, res) => {
      if (!checkReqFields(req.body, ['thread_id'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.body['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      thread.reported = true;
      const ret = await trdCol.updateOne(
        {"_id": new ObjectId(req.body['thread_id'])},
        { $set: thread }
      );
      res.send('reported');
    });

  app.route('/api/replies/:board')
    .post(async (req, res) => {
      if (!checkReqFields(req.body, ['thread_id', 'text', 'delete_password'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.body['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      const hashedPwd = await hashPassword(req.body['delete_password']);
      const now = new Date();
      thread.bumped_on = now;
      thread.replies.push({
        "_id": new ObjectId(),
        text: req.body['text'],
        created_on: now,
        delete_password: hashedPwd,
        reported: false,
        deleted: false
      });
      const ret = await trdCol.updateOne(
        {"_id": new ObjectId(req.body['thread_id'])},
        { $set: thread }
      );
      //res.redirect(303, `/b/${req.params.board}/${req.body['thread_id']}`)
      const replies = thread.replies.map(({_id, text, created_on}) => ({_id, text, created_on}));
      res.json({
        "_id": req.body['thread_id'],
        "text": thread['text'],
        "created_on": thread['created_on'],
        "bumped_on": thread['bumped_on'],
        "replies": replies
      });
    })
    .get(async (req, res) => {
      if (!checkReqFields(req.query, ['thread_id'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.query['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      const replies = thread.replies.map(({_id, text, created_on}) => ({_id, text, created_on}));
      res.json({
        "_id": req.query['thread_id'],
        "text": thread['text'],
        "created_on": thread['created_on'],
        "bumped_on": thread['bumped_on'],
        "replies": replies
      });
    })
    .delete(async (req, res) => {
      if (!checkReqFields(req.body, ['thread_id', 'reply_id', 'delete_password'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.body['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      const repId = new ObjectId(req.body['reply_id']);
      let reply = thread.replies.find(re => re._id.toString() === req.body['reply_id']);
      if (!reply) {
        res.send("error");
        return;
      }
      var result = bcrypt.compareSync(req.body['delete_password'], reply['delete_password']);
      if (!result) {
        res.send("incorrect password");
        return;
      }
      reply['deleted'] = true;
      reply['text'] = '[deleted]';
      const ret = await trdCol.updateOne(
        {"_id": new ObjectId(req.body['thread_id'])},
        { $set: thread }
      );
      res.send("success");
    })
    .put(async (req, res) => {
      if (!checkReqFields(req.body, ['thread_id', 'reply_id'])) {
        res.send("error");
        return;
      }
      let thread = await trdCol.findOne({
        "_id": new ObjectId(req.body['thread_id']),
        "board": req.params.board
      });
      if (!thread) {
        res.send("error");
        return;
      }
      let reply = thread.replies.find(re => re._id.toString() === req.body['reply_id']);
      if (!reply) {
        res.send("error");
        return;
      }
      reply.reported = true;
      const ret = await trdCol.updateOne(
        {"_id": new ObjectId(req.body['thread_id'])},
        { $set: thread }
      );
      res.send('reported');
    });

};
