const express = require('express');
const bodyParser = require('body-parser');
const models = require('./db')
const router = require('./routers');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.set('models', models)
app.use(bodyParser.json());
app.use(router);

app.use(errorHandler);

module.exports = app;
