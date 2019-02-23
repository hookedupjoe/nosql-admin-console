/*
Common routes index to setup application routes
*/
'use strict';

module.exports.configure = function (app, config) {

    //--- Add Global Uitilies to commonly passed locals
    config.locals.$ = require(config.locals.path.libraries + "/globalUtilities").$;
    config.locals.$.NoSQL = require(config.locals.path.libraries + "/libraryForNoSQL.js");

    //--- Setup app data access entry point using application data config
    var tmpAppDataConfig = require(config.locals.path.modules + "/app/data-config.js");
    config.locals.$.appData = require(config.locals.path.modules + "/libraryForAppDataAccess.js").configure(config, tmpAppDataConfig);

    var appRouter = require('express').Router(),
        appApi = require('./app/index').configure(config),
        express = require('express'),
        appAuth = require('./app_auth/index').configure(config);

    app.use(express.static(__dirname + '/../../ui-app'));
    app.use(express.static(__dirname + '/../../data'));

    //--- Simple token in header based authentication
    app.use('/app-auth', appAuth);
    app.use(getAuthorizationHeaderHandler(config.get('express.requiredAuthorizationHeader')));

    appRouter.all('/*', appApi);
    app.use('/app/',appRouter);


    //--- End of setup - helper functions below    
    function getAuthorizationHeaderHandler(allAuthorizationHeaders) {
        var configuredHeaders = (allAuthorizationHeaders && allAuthorizationHeaders.length > 0) ?
            allAuthorizationHeaders.split(',').map(function (str) {
                return str.trim();
            }) : [];
        return function (req, res, next) {
            if (configuredHeaders.length > 0) {
                var currentRequestAuthorizationHeader = req.get('authorization');
                if (!currentRequestAuthorizationHeader || configuredHeaders.indexOf(currentRequestAuthorizationHeader) === -1) {
                    res.sendStatus(403);
                } else {
                    next();
                }
            } else {
                next();
            }
        };
    }
    

};
