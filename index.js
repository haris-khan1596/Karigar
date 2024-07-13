const express = require('express');
const {connectMongodb} = require('./conn');
const {logRequest} = require('./middlewares');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;
const userRoutes = require('./routes/user');

// Middleware
app.use(express.json());
app.use(logRequest);


app.use(cors());
// MongoDB connection
connectMongodb(process.env.MONGO_DB_URI || 'mongodb://mongo:27017/facile');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/api/user', userRoutes);
// Define a simple route
app.get('/', (req, res) => {
    res.send('App is Working');
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
