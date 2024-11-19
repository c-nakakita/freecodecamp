/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { ObjectId } = require('mongodb');

module.exports = function (app, myDataBase) {
  const bookCol = myDataBase.collection('books');
  const commentCol = myDataBase.collection('comments');

  const getBookInfo = async (bookid) => {
    const data = await bookCol.aggregate([
      {
        $match: {
          _id: new ObjectId(bookid)
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'bookid',
          as: 'cms'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          comments: 
          {
            $map: {
              input: '$cms',
              as: 'cm',
              in: '$$cm.comment'
            }
          }
        }
      }
    ]).toArray();
    if (data.length === 1) {
      return data[0]
    }
    return undefined;
  };

  app.route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const data = await bookCol.aggregate([
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'bookid',
            as: 'cms'
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            commentcount: { $size: "$cms" }
          }
        }
      ]).toArray();
      res.json(data);
    })

    .post((req, res) => {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title === undefined
        || title === ''
      ) {
        res.json('missing required field title');
        return;
      }
      bookCol.insertOne({
        "title": title
      })
        .then(data => {
          res.json(data.ops[0]);
        }).catch(err => {
          console.log("", err);
          res.status(500).send('server error');
        });
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      try {
        const ret1 = await bookCol.deleteMany({});
        const ret2 = await commentCol.deleteMany({});
        res.json('complete delete successful');
      } catch (error) {
        console.log("", error);
        res.status(500).send('server error');
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const data = await getBookInfo(bookid);
      if (data) {
        res.json(data);
      } else {
        res.json('no book exists');
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (comment === undefined
        || comment === ''
      ) {
        res.json('missing required field comment');
        return;
      }
      const bk = await bookCol.findOne({ _id: new ObjectId(bookid) });
      if (bk) {
        const ret = await commentCol.insertOne({
          "comment": comment,
          "bookid": new ObjectId(bookid)
        });
        const data = await getBookInfo(bookid);
        res.json(data);
      } else {
        res.json('no book exists');
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      const ret = await bookCol.deleteOne({
        _id: new ObjectId(bookid)
      });
      if (ret.deletedCount === 1) {
        const ret = await commentCol.deleteMany({
          bookid: new ObjectId(bookid)
        });
        res.json('delete successful');
      } else {
        res.json('no book exists');
      }
    });
};
