require('dotenv-safe').config();
const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');
var cors = require('cors');
const jwt = require('jsonwebtoken');
// const redis = require('./redisClient');

app.use(logger('dev'));
app.use(cors);

const {
    MS_CHECKOUT,
    MS_CUSTOMER,
    MS_PHYSICAL_EVALUATION
  } = require('./URLs');
  
const checkoutServiceProxy = httpProxy(MS_CHECKOUT);
const customerServiceProxy = httpProxy(MS_CUSTOMER);
const physicalEvaluationServiceProxy = httpProxy(MS_PHYSICAL_EVALUATION);

app.get('/', (req, res) => res.send('API Gateway BodyPath'));
app.use('/checkout', (req, res) => checkoutServiceProxy(req, res));

app.use((req, res, next) => {
    let token = req.headers.authorization;

    if(!token) return res.sendStatus(401);
    token = token.replace('Bearer ', "");
        
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        console.log(token);
        console.log(decoded.user_id);
        if(err) return res.status(401).send({ error: 'Token inválido'});

        req.user_id = decoded.user_id;
        return next();
    });
})

app.use('/phyisical_evaluation', (req, res, next) => physicalEvaluationServiceProxy(req, res, next));
app.use('/customer', (req, res, next) => customerServiceProxy(req, res, next));

app.listen(10000, () => {
    console.log('API Gateway running!');
})