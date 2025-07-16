require('dotenv').config();
const express = require('express');
const sequelize = require('../utils/database');
const userRouter = require('../router/userRouter');
var cookieParser = require('cookie-parser');
const chatRouter = require('../router/ChatRouter')
const paymentRouter = require('../router/PaymentRouter')

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', require('../router/userRouter'));
app.use('/', require('../router/ChatRouter'));
app.use('/', require('../router/PaymentRouter'));

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); 
        console.log('Connection to database has been established.');
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();