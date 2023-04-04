var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const documentsRouter = require('./routes/documents');
const mysql = require('mysql');
var app = express();

app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'documentApp',
    password: 'RandomKey',
    database: 'documentapp'
});

connection.connect(function(err) {
    if (err) {
        console.log('Error connecting to mysql db');
        return;
    }
    console.log('Connection established with mysql db');
});

app.locals.db = connection;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/documents', documentsRouter);

module.exports = app;
