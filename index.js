const express = require('express');
const {connectMongodb} = require('./conn');
const {isAuthenticated, isCustomer} = require('./middlewares');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;
const userRoutes = require('./routes/user');
const requestsRoutes = require('./routes/requests');
const responseRoutes = require('./routes/response');
const orderRoutes = require('./routes/order');
const log = require('./utils/logger');

app.use(require('express-status-monitor')());
// Middleware
app.use(express.json());


app.use(cors());
// MongoDB connection
connectMongodb(process.env.MONGO_DB_URI || 'mongodb://mongo:27017/facile');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/api/user', userRoutes);
app.use('/api/requests',isAuthenticated, requestsRoutes);
app.use('/api/response',isAuthenticated, responseRoutes);
app.use('/api/order',isAuthenticated, orderRoutes);

app.get('/', (req, res) => {
    log('info', 'App is Working');
    res.send('App is Working');
});


// Start the server
app.listen(port, () => {
    log('info', `Server is running on port ${port}`);
});
