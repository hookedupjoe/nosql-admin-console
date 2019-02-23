/*
Entry point for this application
*/
'use strict';

module.exports.configure = function configure(config) {

    let $ = config.locals.$;

    return function processReq(req, res, next) {

        var tmpAppAreaName = req.path || '';
        if (tmpAppAreaName.charAt(0) == '/') {
            tmpAppAreaName = tmpAppAreaName.substr(1);
        }

        try {
            var tmpAppAreaName = config.locals.path.modules + '/app/' + tmpAppAreaName + '.js';
            var tmpAppReq = require(tmpAppAreaName);

            if (typeof(tmpAppReq.configure) == 'function') {
                var tmpToRun = tmpAppReq.configure(config);
                tmpToRun(req, res, next);
                return
            } else {
                res.json({status:false, error: "Could not find application area " + tmpAppAreaName})
                return
            }
        } catch (ex) {
            res.json({status:false, error: ex.toString()})
        }
    };

};
