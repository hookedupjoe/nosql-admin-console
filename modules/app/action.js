/*
 *  Simple method for running individually created actions from a directory
 */
'use strict';

module.exports.configure = function configure(config) {
    return function processReq(req, res, next) {
        var tmpName = req.query.name || '';
        if (!tmpName) {
            throw "No action name provided";
        }        
        try {
            var tmpFilePath = './actions/' + tmpName + '.js';
            var tmpProcessReq = require(tmpFilePath);
            if (typeof(tmpProcessReq.configure) == 'function') {
                var tmpToRun = tmpProcessReq.configure(config);
                tmpToRun(req, res, next);
                return
            } else {
                res.json({status:false, error: "Could not find action " + tmpName})
                return
            }
        } catch (ex) {
            res.json({status:false, error: ex.toString()})
        }
    };
};
