const express = require('express');
const {connectMongodb} = require('./conn');
const zipFolder = require('zip-folder');
const fs = require('fs');
const path = require('path');
const {logRequest, isAuthenticated, isCustomer} = require('./middlewares');
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

// Middleware
app.use(express.json());
app.use(logRequest);


app.use(cors());
// MongoDB connection
connectMongodb(process.env.MONGO_DB_URI || 'mongodb://mongo:27017/facile');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/api/user', userRoutes);
app.use('/api/requests',isAuthenticated, requestsRoutes);
app.use('/api/response',isAuthenticated, responseRoutes);
app.use('/api/order',isAuthenticated, orderRoutes);

app.get('/logs',(req,res)=>{
    const logFilePath = path.join(__dirname, 'logs');

    zipFolder(logFilePath, 'logs.zip', (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({message: 'Error downloading logs'});
        }
        res.download('logs.zip');
    });
})
app.get('/', (req, res) => {
    res.send('App is Working');
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
