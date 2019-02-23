(function () {

  ThisApp = null;

  function getAuthToken() {
    return window.sessionStorage.getItem('authToken') || '';
  }
  
  function doLogin(theUsername, thePassword) {
    var dfd = $.Deferred();
    var tmpAuthToken = getAuthToken();
    if (tmpAuthToken && tmpAuthToken != null && tmpAuthToken != '') {
      dfd.resolve(tmpAuthToken);
      return dfd.promise();
    }

    var tmpURL = './app-auth';

    $.ajax({
      url: tmpURL,
      method: 'GET',
      headers: { "password": thePassword, "user": theUsername },
      success: function (theResponse) {
        if (theResponse && theResponse.token) {
          window.sessionStorage.setItem('authToken', theResponse.token || '');
          dfd.resolve(theResponse.token);
        } else {
          dfd.reject("No token in reply")
        }
      },
      error: function (theError) {
        dfd.reject('Error authorizing ' + theError.toString());
      }
    });


    //return tmpPassword;
    return dfd.promise();
  }




  var tmpAuthToken = getAuthToken();
  setup(tmpAuthToken);


  function setup(theAuthToken) {
    try {
      var siteMod = ActionAppCore.module('site');
      ThisApp = new siteMod.CoreApp();

      var tmpTplSpecs = {
        baseURL: 'app/app-tpl',
        templateMap: {
          "about-this-app.html": "app:about-this-app",
          "page-loading-spinner.html": "app:page-loading-spinner"
        }
      };


      /* ****************************************
      //------------ This App Config
      //-- "display" Option:  The Links on the top hide when in mobile, the display options control where the links show
      //     primary = show on top but not in sidebar, then add to sidebar for small screens only
      //     both = show on top and sidebar, then add to sidebar for small screens only
      //     primary = show on top but not in sidebar, then add to sidebar for small screens only
      //     [blank] = blank or missing value will make it show on the left only
      */
      var appModule = ActionAppCore.module('app');

      var tmpPluginComponents = ['DataTables','WebControls'];

      var tmpPages = [];
      if (theAuthToken == '') {
        tmpPages = ['LoginPage'];
      } else {
        tmpPages = ['MockDataPage', 'ReportsPage', 'LogsPage'];
      }
      if( tmpPages && tmpPages.length > 1){
        ThisApp.getByAttr$({appuse:'app-sidebar-tribber'}).show();
      }


      var tmpAppCompsToInit = tmpPages;
      var tmpAppComponents = [];

      ThisApp.useModuleComponents('plugin', tmpPluginComponents)

      ThisApp.initModuleComponents(ThisApp, 'app', tmpAppCompsToInit)
      ThisApp.useModuleComponents('app', tmpAppComponents)

      ThisApp.siteLayout = null;

      ThisApp.refreshLayouts = function (theTargetEl) {
        ThisApp.siteLayout.resizeAll();
      }
      ThisApp.resizeLayouts = function (name, $pane, paneState) {
        try {
          var tmpH = $pane.get(0).clientHeight - $pane.get(0).offsetTop - 1;
          ThisApp.getByAttr$({ appuse: "cards", group: "app:pages", item: '' }).css("height", tmpH + "px");;
        } catch (ex) {

        }
      }

      ThisApp.siteLayout = $('body').layout({
        center__paneSelector: ".site-layout-center"
        , north__paneSelector: ".site-layout-north"
        , north__spacing_open: 0
        , north__spacing_closed: 0
        , north__resizable: false
        , spacing_open: 6 // ALL panes
        , spacing_closed: 8 // ALL panes
        , onready: ThisApp.resizeLayouts
        , center__onresize: ThisApp.resizeLayouts
      });


      //            ThisApp.loginPrompt = loginPrompt;
      ThisApp.getAuthToken = getAuthToken;
      ThisApp.doLogin = doLogin;


      ThisApp.init();

      ThisApp.initTemplates(tmpTplSpecs);
      ThisApp.getByAttr$({ appuse: "app-loader" }).remove();


      ThisApp.aboutThisApp = function () {
        ThisApp.showCommonDialog({ header: "About this application", content: { data: '', template: 'app:about-this-app' } });
      }

      //--- Optionally set system wide menu defaults
      //- ToDo: If we roll this up, then change to setMenuDefaults(theDefaults) ...
      ThisApp._menuDefaults = ThisApp._menuDefaults || {};
      $.extend(ThisApp._menuDefaults, {
        button: {
          color: 'blue',
          size: 'large'
        },
        icon: {
          color: 'blue',
          size: 'large'
        }
      })

      //--- Turn off messages by default
      ThisApp.setMessagesOptions({ show: false })


      ThisApp.apiCall = apiCall;
      function apiCall(theOptions) {
       var dfd = $.Deferred();
        
        if (!theOptions) {
          dfd.reject("No api call details provided");
          return;
        }

        var tmpOptions = theOptions || '';
        if( typeof(tmpOptions) == 'string'){
          tmpOptions = {url:tmpOptions};
        }

        var tmpURL = theOptions.url;
        if (!tmpURL) {
          throw "No URL provided"
        }

        var tmpRequest = {
          headers: { "authorization": ThisApp.getAuthToken() },
          method: 'GET',
          success: function (theResponse) {
            dfd.resolve(theResponse);
          },
          error: function (theError) {
            dfd.reject(theError)
          }
        };

        $.extend(tmpRequest, theOptions);
   
        $.ajax(tmpRequest);
        
        return dfd.promise();
      }

      
      
    } catch (ex) {
      console.error("Unexpected Error " + ex);
    }


  }

})();

