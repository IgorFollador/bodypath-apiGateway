require('dotenv-safe').config();
const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');
var cors = require('cors');
const jwt = require('jsonwebtoken');
// const redis = require('./redisClient');

const port = process.env.PORT || 10000;

app.use(logger('dev'));
app.use(cors());

const {
    MS_CHECKOUT,
    MS_CUSTOMER,
    MS_PHYSICAL_EVALUATION,
    MS_FOOD_PLAN
  } = require('./URLs');
  
const checkoutServiceProxy = httpProxy(MS_CHECKOUT);
const customerServiceProxy = httpProxy(MS_CUSTOMER);
const physicalEvaluationServiceProxy = httpProxy(MS_PHYSICAL_EVALUATION);
const foodPlanServiceProxy = httpProxy(MS_FOOD_PLAN);


app.get('/', (req, res) => res.send('API Gateway BodyPath'));
app.use('/checkout', (req, res) => checkoutServiceProxy(req, res));

app.use((req, res, next) => {
    let token = req.headers.authorization;
    if(!token) return res.sendStatus(401);
    token = token.replace('Bearer ', "");
    
    jwt.verify(token, process.env.SECRET, (err, payload) => {
        if(err) return res.sendStatus(401);
        req.userId = payload;
        next();
    })
})

app.use('/customer', (req, res, next) => customerServiceProxy(req, res, next));
app.use('/phyisical_evaluation', (req, res, next) => physicalEvaluationServiceProxy(req, res, next));
app.use('/food_plan', (req, res, next) => foodPlanServiceProxy(req, res, next));

app.listen(port, () => {
    console.log('API Gateway running!');
})