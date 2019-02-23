/*
Author: Joseph Francis
License: MIT
*/

//---  Quick Page module --- --- --- --- --- --- --- --- --- --- --- --- 
//--- Example of page that does not use templates for layout
//---  the system auto creates a layout, can be used directly
//--- facets are prefix:region  (i.e. mock:center)
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName: "MockDataPage",
        pageTitle: "Mock Data",
        pageNamespace: 'mock',
        navOptions: {
            icon: 'database',
            topLink: true,
            sideLink: true
        },
        appModule: AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/MockDataPage/tpl',
        //---  Using a template, but not for the UI
        templateMap: {
            "form-csv-data.html": thisPageSpecs.pageNamespace + ":form-csv-data"
            , "msg-item.html": thisPageSpecs.pageNamespace + ":msg-ctr-item"
        }
    }

    thisPageSpecs.layoutOptions = {
        facetPrefix: thisPageSpecs.pageNamespace
        , north: true
        , south: true
        , east: false
        , west: false
    }


    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);

    ThisPage.templates = {};

    //===== Hook into the application lifecycle for this page =====
    // .. they happen in this order

    //=== On Application Load ===
    /*
    * This happens when the page is loaded, try to push activity back to when the tab is used
    *    If your component need to do stuff to be availale in the background, do it here
    */
    ThisPage._onPreInit = function (theApp) {
    }
    ThisPage._onInit = function (theApp) {
        ThisPage._om = theApp.om;
        ThisPage._webctl = theApp.getComponent("plugin:WebControls");
    }

    //=== On Page Activation ===
    /*
    * This happens the first time the page is activated and happens only one time
    *    Do the lazy loaded stuff in the initial activation, then do any checks needed when page is active
    *    Do stuff that needs to be available from this component, such as services, 
    *     that are needed even if the page was not activated yet
    */
    ThisPage._onFirstActivate = function () {
        //--- Do the layout initiaze stuff
        ThisPage.initOnFirstLoad().then(
            function () {
                //--- Do one time init stuff, minus stuff we do every time the page is activated
                initUI()
                //--- Call activate routine if stuff is there
                // Can also just do it twice if one call, no difference
                ThisPage._onActivate();
            }
        );
    }

    ThisPage._onActivate = function () {
        refreshUI();
    }

    function refreshUI() {
        //--- Automatically refresh messsage on page load
        //showInFooter("Latest Status?")
    }

    function showInFooter(theText) {
        ThisPage.loadFacet('mock:footer-text', theText)
    }

    function getDialogFieldValues(theAppUse) {
        var tmpFields = ThisApp.getByAttr$({ appuse: theAppUse });
        var tmpFieldValues = {};
        var tmpFieldCount = tmpFields.length;
        if (tmpFieldCount > 0) {
            for (let index = 0; index < tmpFields.length; index++) {
                var tmpFieldEl = $(tmpFields[index]);
                var tmpVal = tmpFieldEl.val();
                var tmpName = tmpFieldEl.attr('name');
                tmpFieldValues[tmpName] = tmpVal;
            }
        }
        return tmpFieldValues
    }

    ThisPage.sendBulkData = function () {
        var tmpData = getDialogFieldValues('mock:form-csv:field');

        var tmpOptions = {
            url: '/app/action?name=send-bulk',
            method: 'POST',
            data: JSON.stringify(tmpData),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        };
        ThisApp.apiCall(tmpOptions).then(
            function (theResults) {
                console.log("API Call Done", theResults)
                console.log("API Call arguments", arguments)
                alert("Data loaded, see / refresh reports, see console for details`")

            }
        )
    }

    function initUI() {
        //--- Can load directly from HTML

        var tmpHTML = [];
        tmpHTML.push('<h2 class="ui header" style="padding:5px;margin:4px;">')
        tmpHTML.push('  <i class="database icon"></i>')
        tmpHTML.push('  <div class="content">')
        tmpHTML.push('Mock Data Loader')
        tmpHTML.push('  </div>')
        tmpHTML.push('</h2>')
        ThisPage.loadFacet('mock:north', tmpHTML.join(''))

        tmpHTML = [];
        tmpHTML.push('<div class="ui label large fluid basic black">')
        tmpHTML.push('  <i class="info icon"></i>')
        tmpHTML.push('<span facet="mock:footer-text"></span>')
        //tmpHTML.push('  <a class="detail" style="float:right;margin-right:10px;">View Messages</a>')
        tmpHTML.push('</div>')
        ThisPage.loadFacet('mock:south', tmpHTML.join(''))
        ThisPage.loadFacet('mock:center', ThisApp.renderTemplate('mock:form-csv-data', {}))


        /*
        //--- Can load a Workspace using code / data
        ThisPage.westWS = ThisPage._webctl.newWorkspace({ facet: "mock:west" });
        var tmpWSMenu = {
            "objects": [
                {
                    "cid": "sui-buttons",
                    "states": {
                        "color": "green",
                        "controls": [
                            {
                                "label": "Prepare to Load",
                                "action": "mock:prepareToLoad"
                            },
                            {
                                "color": "blue",
                                "label": "Send Bulk Data",
                                "action": "mock:sendBulkData"
                            }
                        ],
                        "orientation": "vertical",
                        "fluid": true
                    }
                }
            ]
        }


        $.when(
            ThisPage.westWS.loadFromObject(tmpWSMenu)
        ).then(function () {
            ThisApp.refreshLayouts();
        })
         */

         //--- Or just refresh once done if nothing else requiring a promise
         ThisApp.refreshLayouts();

    }
    ThisPage.openDesigner = function () {
        ThisApp.gotoPage('WorkspacesPage');
    }


    ThisPage.prepareToLoad = function () {

    }




})(ActionAppCore, $);
