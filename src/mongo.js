// @ts-check
const { MongoClient } = require('mongodb');
const DB_USER = 'lilstar';
const DB_PWD = 'forever3';
const uri = `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.glzxe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = client;
