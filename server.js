require('dotenv').config()
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(process.env.CONNECTION_STRING, { useUnifiedTopology: true })
  .then(client => {
    console.log('connected to database');
    const db = client.db('mush');
    const passagesCollection = db.collection('old-man');

    app.get('/', (req, res) => {
      passagesCollection.find().sort({ '_id': -1 }).toArray()
        .then(results => {
          res.render('index.ejs', { passages: results });
        })
        .catch(console.error);
    });

    app.get('/:id', (req, res) => {
      passagesCollection.findOne({ '_id': ObjectId(req.params.id) })
        .then(results => {
          console.log(results)
          res.render('passage.ejs', { passage: results });
        })
        .catch((err) => {
          console.log('ohh noooo')
        });
    });

    app.post('/passages', (req, res) => {
      passagesCollection.insertOne(req.body)
        .then(result => {
          console.log(result.insertedId);
          res.redirect('/');
        })
        .catch(console.error);
    });

    app.post('/:id', (req, res) => {
      passagesCollection.updateOne(
        { '_id': ObjectId(req.params.id) },
        { $set: { passage: req.body.passage } },
        { upsert: true })
        .then(results => {
          res.redirect(`/${req.params.id}`);
        })
        .catch((err) => {
          console.log('ohh noooo')
        });
    });

    app.post('/:id/delete', (req, res) => {
      passagesCollection.deleteOne({ '_id': ObjectId(req.params.id) })
        .then(results => {
          res.redirect(`/`);
        })
        .catch((err) => {
          console.log('ohh noooo')
        });
    });

    app.listen(3000, (req, res) => {
      console.log('listening on port 3000');
    });
  })
  .catch(console.error);
