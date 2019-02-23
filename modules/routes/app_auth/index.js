/*
 *  Simple Authentication to assure API access is secure when on server 
 */
'use strict';

module.exports.configure = function configure(config) {

    return function processReq(req, res, next) {

        //res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin,Content-type');
        //res.setHeader('Access-Control-Allow-Origin', '*');

        try {
            var authConfig = config.get("components.auth-request");
            var tmpPassword = req.get('password');
            if( !(tmpPassword) ){
                res.sendStatus(403);
                return;
            }

            var tmpCheckPW = authConfig.password;            

            if( !(tmpPassword == tmpCheckPW) ){
                res.sendStatus(403);
                return;
            }

            res.json({
                status: true,
                token: authConfig.token
            })
        } catch (error) {
            res.json(
                {status:false, "error": error.toString()}
            )
        }
    }

}