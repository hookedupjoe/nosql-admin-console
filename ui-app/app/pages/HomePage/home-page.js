/*
Author: Joseph Francis
License: MIT
*/

//---  Logs Page module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName:"HomePage", 
        pageTitle: "Home", 
        pageNamespace: 'home',
        navOptions: {
            icon: 'home',
            topLink:true,
            sideLink:true
        },
        appModule:AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/HomePage/tpl',
        templateMap:{
            "page-body.html": thisPageSpecs.pageNamespace + ":page-body"
        }
    }

    thisPageSpecs.layoutOptions = {
        templates: {
            "center": thisPageSpecs.pageNamespace + ":" + "page-body"
        },  
        facetPrefix: thisPageSpecs.pageNamespace,
        north: false,
        south: false,
        west:false,
        east: false
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
    ThisPage._onPreInit = function(theApp){
        ThisPage.om = theApp.om;
        //console.log("Home Page: _onPreInit ");
        
    }
    ThisPage._onInit = function() {
        //console.log("Home Page: _onInit");
    }

    //=== On Page Activation ===
    /*
    * This happens the first time the page is activated and happens only one time
    *    Do the lazy loaded stuff in the initial activation, then do any checks needed when page is active
    *    Do stuff that needs to be available from this component, such as services, 
    *     that are needed even if the page was not activated yet
    */
    ThisPage._onFirstActivate = function(theApp){
        //console.log("Home Page: _onFirstActivate");

        ThisPage._om = theApp.om;
        ThisPage.inBuffer = 40;
        ThisPage.outBuffer = 12;
        ThisPage.minHeight = 50;

        ThisPage.aboutThisPage = function(){
            ThisApp.showCommonDialog({ header: "About this application", content: {data:'', template:'app:about-this-app'} });
        }
       
        ThisPage.initOnFirstLoad().then(
            function(){
                
                ThisPage._onActivate();
            }
        );        
    }
    
    ThisPage._onActivate = function(){
       
    }
    //--- End lifecycle hooks

    //--- Layout related lifecycle hooks
    ThisPage._onResizeLayout = function(){
        ThisPage.refreshMainGrid();
    }
    //--- End Layout related lifecycle hooks



        
})(ActionAppCore, $);
