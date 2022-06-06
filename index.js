const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');
// const redis = require('./redisClient');

app.use(logger('dev'));

const {
    MS_CUSTOMER,
    MS_PHYSICAL_EVALUATION,
  } = require('./URLs');
  
  const customerServiceProxy = httpProxy(MS_CUSTOMER);
  const physicalEvaluationServiceProxy = httpProxy(MS_PHYSICAL_EVALUATION);
  
  app.get('/', (req, res) => res.send('API Gateway BodyPath'));
  
  app.use('/customer', (req, res, next) => customerServiceProxy(req, res, next));
  app.use('/phyisical_evaluation', (req, res, next) => physicalEvaluationServiceProxy(req, res, next));

  app.listen(10000, () => {
      console.log('API Gateway running!');
  })