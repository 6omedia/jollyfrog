var express = require('express');
var session = require('express-session');
var app = express();
let mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
let bodyParser = require('body-parser');
var config = '';
var cookieParser = require('cookie-parser');
var cors = require('cors');

if(process.env.NODE_ENV == 'test'){
	config = require('./config/test.json');
}else{
	config = require('./config/dev.json');
}

let options = { 
	server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
};

app.use(cors({origin: '*'}));

// app.use('/*', function (req, res, next) {

//     // Website you wish to allow to connect
//     res.header('Access-Control-Allow-Origin', 'http://localhost');

//     // Request methods you wish to allow
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.header('Access-Control-Allow-Credentials', true);

//     // res.header("Access-Control-Allow-Origin", "*");
//     // res.header("Access-Control-Allow-Headers", "X-Requested-With");

//     // Pass to next layer of middleware
//     next();
// });

// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

app.set('view engine', 'pug');
// app.set('views', __dirname + '/views');

//db connection      
mongoose.connect(config.db, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(session({
	secret: 'hhhmmmm',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use(cookieParser());

//parse application/json and look for raw text                                        
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  

app.use('/static', express.static('public'));
// app.use('/static/lib/clientjs', function(req, res){
// 	var clientjs = require('clientjs');
// 	res.send(clientjs);
// });

// main routes
var mainRoutes = require('./controllers/main.js');
app.use('/', mainRoutes);

// admin routes
var adminRoutes = require('./controllers/admin.js');
app.use('/admin', adminRoutes);

// api routes
var apiRoutes = require('./controllers/api/tracking.js');
app.use('/api', apiRoutes);

// api routes
var webApiRoutes = require('./controllers/api/websites.js');
app.use('/api/websites', webApiRoutes);

// api routes
var dashboardApiRoutes = require('./controllers/api/dashboard.js');
app.use('/api/dashboard', dashboardApiRoutes);

// api routes
var blockedDevicesApiRoutes = require('./controllers/api/blocked_devices.js');
app.use('/api/blocked-devices', blockedDevicesApiRoutes);

// api routes
var formsApiRoutes = require('./controllers/api/forms.js');
app.use('/api/forms', formsApiRoutes);

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	return res.json({
		error: {
			message: err.message,
    		error: err.status
		}
	});
});

app.listen(20100, function () {
	console.log('App running on port 20100');
});

module.exports = app;