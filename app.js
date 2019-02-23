//------------------------------------------------------------------------------
// node.js base application for apis / admin consoles
//------------------------------------------------------------------------------
var path = require('path'),
    http = require('http'),
    config = require('config');  // this is the name of node module, not the config directory

config.locals = {
    name: 'nosql-admin-console',
    title: 'NoSQL Admin Console',
    path: {
        root: path.resolve(__dirname)
    }
};
config.locals.path.modules = config.locals.path.root + "/modules";
config.locals.path.libraries = config.locals.path.root + "/modules";

var app = require('express')(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

//--- Load env vars from config if present
if (config.has('env')) {
    var envVariables = config.get('env');
    for (var name in envVariables) {
        process.env[name] = envVariables[name];
    }
}

//--- Use standard body and cookie parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// handler for monitoring, added first to allow response without authorization header
app.use(getMonitoringHandler(config.get('express.status.path'), config.get('express.status.responseCode')));

//--- Plug in application routes
require('./modules/routes').configure(app, config);

// error handlers
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    next();
});


//--- Standard Server Startup
var server = http.createServer(app);
server.listen(config.get('http.port'), '0.0.0.0');

//--- Show port in console
server.on('listening', onListening(server));
function onListening(server) {
    return function () {
        var address = server.address();
        var bind = (typeof address === 'string') ? 'pipe ' + address : address.address + ':' + address.port;
        console.log('Listening on ' + bind);
    };
}

function getMonitoringHandler(path, responseCode) {
    return function (req, res, next) {
        if (req.originalUrl === path) {
            res.sendStatus(responseCode);
        } else {
            next();
        }
    };
}
