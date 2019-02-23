/*
  Common data access functionality, including defaults
*/
'use strict';

module.exports.configure = function configure(theConfig, theDataMap) {
    var config = theConfig;
    var dataMap = theDataMap;

    let $ = config.locals.$;
    let NoSQL = $.NoSQL
    
    
    var defaultAccountName = dataMap.defaultAccountName || '';
    var tmpNoSQLAccountInfo = dataMap.accounts[defaultAccountName];
    if (!(tmpNoSQLAccountInfo)) {
        throw "NoSQL default account not setup"
    }
    var accountDefault = new NoSQL.NoSqlAccount($.cloneObject(tmpNoSQLAccountInfo));
    var defaultDatabaseName = dataMap.defaultDatabaseName || '';
    

    return {
        dataMap: dataMap
        ,defaultAccountName: defaultAccountName
        ,defaultDatabaseName: defaultDatabaseName
        ,accountDefault: accountDefault
        ,getFullViewDetails: getFullViewDetails
        ,getAccount: getAccount
        ,getDatabaseForView: getDatabaseForView
        ,getDefaultDatabase: getDefaultDatabase
    }
    

    function getAccount(theAccountName){
        var tmpAccountInfo = dataMap.accounts[theAccountName];
        if (!(tmpAccountInfo)) {
            console.warn("Account not found, using default account " + defaultAccountName );
            //or ..>   throw "NoSQL account not setup " + tmpViewDetails.account
            return accountDefault;
        } else {
            return new NoSQL.NoSqlAccount($.cloneObject(tmpAccountInfo));
        }
    }

    function getDefaultDatabase(){
        if( !(defaultDatabaseName)){
            throw "No default database configured"
        }
        //--- Allow non-mapped name as default db na,e
        var tmpDBName = dataMap.databases[defaultDatabaseName] || defaultDatabaseName;
        return accountDefault.getDatabase(tmpDBName)
    }

    function getDatabaseForView(theViewDetails){
        var tmpViewDetails = getFullViewDetails(theViewDetails);
        var tmpAccount = accountDefault;
        if( theViewDetails.account){
            tmpAccount = getAccount(theViewDetails.account);
        }
        return tmpAccount.getDatabase(tmpViewDetails.db);
    }

    function getFullViewDetails(theInitialDetails) {
        var tmpDetails = theInitialDetails;
        try {
            if (!(tmpDetails)) {
                throw "View not found"
            }
            if( !(tmpDetails.db) ){
                tmpDetails.db = defaultDatabaseName;
            }
            //--- Only allow know databases
            tmpDetails.db = dataMap.databases[tmpDetails.db] || '';
            if( !(tmpDetails.db) ){
                throw "No database for this view or defaulit"
            }
        } catch(ex){
            tmpDetails = {error: ex.toString()}
        }
        
        return tmpDetails;
    }

};
