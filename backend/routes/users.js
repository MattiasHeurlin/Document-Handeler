var express = require('express');
var router = express.Router();
const CryptoJS = require('crypto-js');
const uuid = require('uuid');
router.get('/', function (req, res, next) {

  const sql = 'SELECT * FROM users';
  req.app.locals.db.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.status(200).send(result);
  })



});

router.post('/add', function (req, res, next) {
  if (!req.body.name || !req.body.password) {
    res.status(400).send({ message: 'Bad Request' });
    return;
  }
  const nameSql = `SELECT * FROM users WHERE username = '${req.body.name}'`;
  req.app.locals.db.query(nameSql, function (err, result) {
    if (err) {
      console.log('failed to connect to server' + err);
      res.status(500).send({ message: 'failed to connect to server ', error: err });
      return;
    }
    if (result.length > 0) {
      res.status(400).send({ message: 'User already exists' });
      return;
    }

    const newUser = {
      id: uuid.v4(),
      name: req.body.name,
      password: CryptoJS.SHA256(req.body.password).toString(),
    }
    const sql = `INSERT INTO users (id, username, password) VALUES ('${newUser.id}', '${newUser.name}', '${newUser.password}')`;
    req.app.locals.db.query(sql, function (err, result) {
      if (err) {
        console.log('failed to connect to server' + err);
        res.status(500).send({ message: 'failed to connect to server ', error: err });
        return;
      }
      console.log('Success: ' + result);
      res.status(201).send({ message: 'User Created' });
    });
  });

});

router.post('/login', function (req, res, next) {
  if (!req.body.name || !req.body.password) {
    res.status(400).send({ message: 'Bad Request' });
    return;
  }
  const name = req.body.name;
  const hashedPassword = CryptoJS.SHA256(req.body.password).toString();
  const sql = `SELECT * FROM users WHERE username = '${name}' AND password = '${hashedPassword}'`;
  req.app.locals.db.query(sql, function (err, result) {
    if (err) {
      console.log('failed to connect to server' + err);
      res.status(500).send({ message: 'failed to connect to server ', error: err });
      return;
    }
    if (result.length > 0) {
      res.status(200).send({ message: 'Login Success', user: result[0] });
      return;
    }
    res.status(400).send({ message: 'Login Failed' });
  });

});




module.exports = router;
