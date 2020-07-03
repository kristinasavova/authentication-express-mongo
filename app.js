const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
// // also call a module and let the connect-mongo access the sessions
const MongoStore = require('connect-mongo')(session); 

const app = express();

// Mongodb connection
mongoose.connect("mongodb://localhost:27017/bookworm",
    { useNewUrlParser: true,
        useUnifiedTopology: true
    });
const db = mongoose.connection;

// Mongo error
db.on('error', err => {
    console.error('Database connection error', err); 
});

// Use sessions for tracking logins
app.use(session({
    secret: 'treehouse loves you',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// Make user ID available in templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    next();
});

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from /public
app.use(express.static(__dirname + '/public'));

// View engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// Include routes
const routes = require('./routes/index');
app.use('/', routes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Express app listening on port 3000');
});
