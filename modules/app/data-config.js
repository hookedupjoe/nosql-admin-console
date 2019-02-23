module.exports = {
    "defaultDatabaseName": "mockdata",
    "defaultAccountName": "local",
	"databases": {
		"mockdata": "mock-data-002",
		"testbed": "my-testbed"
    },
	"accounts": {
		"local": {
			"url": "http://localhost:5984/",
			"key": "apiadmin",
			"password": "YOURPASSWORD"
		},
		"YOUR-ACCOUNT-NAME": {
			"account": "IFCLOUDANT-USEID-bluemix",
			"key": "API-KEY-NAME",
			"password": "API-KEY-PASSWORD"
		}
	}
}