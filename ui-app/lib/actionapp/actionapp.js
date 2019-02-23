/*
ActionAppCore Core Library
Author: Joseph Francis, 2017 - 2018
License: MIT
*/

/**  
 *   About ActionAppCore
 *   

What is an Action?
 - An action is a registered function with a name that sends to calling object
   - the calling object contains the params needed for the function

 - Once an action is registered, there are lots of ways to call it.

   The primary way to call an action is to add an attribute to any element with the name "action" 
    ... such as ... <div action="doSomethingCool">Do it!</div>, when clicked, something cool will happen.
  
    How? You create a function called doSomethingCool and do cool stuf there..

    Example:
    ==================
    In the HTML you have ... 
    <button action="doSomethingCool" group="coolStuff" item="fred">Show Fred</button>

    In your page, you add this ...
    ThisPage.doSomethingCool = function (theAction, theTarget) {
        var tmpParams = ThisApp.getAttrs(theTarget, ['group', 'item']);
        //--- returns {group:"coolStuff", item:"fred"}
        ThisPage.doSomethingElseWithThisAsParams(tmpParams);    
    }

    Done.


Key features: 
  - Action based, which means "actions" are at the core of most "actions"
  - Simple, all the source code for the base system is a single, small file (this one).
  - Modular, so that all components are in their own function bubble yet can still communicate with each other easily
  - Repeatable, programming by exception, just start with a working, responsive application frame and go
  - Template based, making it easy to create dynamic content, but templating is not required
  - Comes with tons of libraries to make getting started easy

Key concepts / features the application framework provides:
  - Common / responsive navigational components such as primary pages and sub-tabs
    * Navigation areas can be included in the top menu and/or the sidebar
  - Common way to add a special "appaction" attribute to any element and have it trigger a common or custom function
    * So there is no need to have onclick events or other bindings
  - Application Actions use attributes on the target element to look for related parameters, such as the ID of the selected item
    * So there is no need to specify a bunch of parameters in function calls
  - Custom application modules and plugins use the concept of namespaces to assure uniqueness
  - Common subscribe / public service available
  - Common component repository allows for components and modules to register and hence be retrieved and communcated with directly
  - Common messages methodology with toaster option to pop them up and ways to clear / retrieve them easily
  - Common way to find and update DOM elements using attributes, used extensively for it's simplicity and power
  - Common concept of a "facet", which simply any element with a facet="area:item", allowing for simple content targeting
  - Plugin modules provide extended common and custom functionatlity that can be used across other modules
*/

//--- Global Entry Point
var ActionAppCore = {};

//--- Base module and simple module system --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {
    var modules = {};

    //--- Create module
    ActionAppCore.createModule = function (theModName, theOptionalModuleContent) {
        if (modules.hasOwnProperty(theModName)) {
            throw { error: "Module already exists", module: theModName }
        }
        modules[theModName] = theOptionalModuleContent || {};
        return modules[theModName];
    };
    //--- get / use module
    ActionAppCore.module = function (theModName) {
        if (!modules.hasOwnProperty(theModName)) {
            throw { error: "Module does not exists", module: theModName }
        }
        return modules[theModName];
    }

})(ActionAppCore, $);


//--- Common Modules --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {
    ActionAppCore.createModule("site");
    ActionAppCore.createModule("plugin");
    ActionAppCore.createModule("extension");
})(ActionAppCore, $);

//--- Common Functionality Extensions

/**
     * subscribe / unsubscribe / publish
    *     - Standard Pub / Sub functionality
    * 
    * 
    * @return void
    * 
    */


//--- PubSub Functionality
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention;

    me.subscribe = function () {
        this.events.on.apply(this.events, arguments);
    };

    me.unsubscribe = function () {
        this.events.off.apply(this.events, arguments);
    };

    me.publish = function () {
        this.events.trigger.apply(this.events, arguments);
    };

    me.initPubSub = function () {
        this.events = $({});
    };

    //--- return the prototype to be marged with prototype of target object
    ExtendMod.PubSub = me;

})(ActionAppCore, $);



/**
  * setDisplay
  *    - sets the attribute to hidden or not hidden
  * 
  * To Use: <any variable>.setDisplay(anyEl,anyBooleanValue);
  *
  * @param  {Object} theEl   [target object with details about the page to open]
  * @param  {Boolean} theIsVis   [true to show, false to hide]
  * @return void
  */
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention.prototype;

    me.setDisplay = function (theEl, theIsVis) {
        var tmpEl = null;
        if (!theEl) {
            console.error("Can not set diplay for element, none provided");
            return;
        }
        if (theEl.node) {
            tmpEl = $(theEl.node());
        } else {
            tmpEl = $(theEl);
        }
        if (theIsVis) {
            tmpEl.removeClass('hidden');
        } else {
            tmpEl.addClass('hidden');
        }
    }
    me.show = function (theEl) {
        me.setDisplay(theEl, true);
    }
    me.hide = function (theEl) {
        me.setDisplay(theEl, false);
    }

    ExtendMod.SetDisplay = me;

})(ActionAppCore, $);


//--- CoreApp Standard App Component ---- ---- ---- ---- ---- ---- ---- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.CoreApp = CoreApp;

    var ExtendMod = ActionAppCore.module("extension");

    //--- Note: Everything references me not this as this is a singleton with no instances
    var me = CoreApp.prototype;

    //--- Singleton for currently running application
    function CoreApp(theOptions) {

        //--- set currently loaded application as globally available object from global entrypoint
        ActionAppCore.app = me;

        me.isDom = function(element) {
            return element instanceof Element;  
        }

        me.options = theOptions || {};
        me.actions = me.options.actions || {};
        me.actionsDelegates = me.options.actionsDelegates || {};

        var defaults = {};
        me.events = $({});
        me.$window = $(window);
        me.$document = $(document);


        me.pagesGroup = "app:pages";

        me.messages = [];
        me.messagesAt = 0;
        me.navConfig = {};

        me.getNavConfig = function (theName) {
            return me.navConfig[theName];
        }


        me.registerNavLink = function (theNavObject) {
            if (!(theNavObject)) { return false };
            var tmpName = theNavObject.name || '';
            me.navConfig[tmpName] = theNavObject;
            var tmpOpts = theNavObject.options || {};
            theNavObject.isSideLink = ( tmpOpts.sideLink );
            theNavObject.isTopLink = ( tmpOpts.topLink );            
            theNavObject.iconHTML = tmpOpts.iconHTML || '';
            if( tmpOpts.icon ){
                theNavObject.iconHTML = '<i class="' + tmpOpts.icon + ' icon"></i>'
            }
            
            //theNavObject.isNavLink = ( theNavObject.display == 'primary' );
            me.config.navlinks.push(theNavObject)
            return true;
        }

        me._messageOptions = {
            show:true
        }
        me.setMessagesOption = function(theOption, theValue){            
            ThisApp._messageOptions[theOption] = theValue
        }
        me.setMessagesOptions = function(theOptions){            
            $.extend(ThisApp._messageOptions,theOptions);
        }
        me.getMessages = function () {
            return me.messages;
        }
        me.getMessageCount = function () {
            return me.messagesAt;
        }
        me.clearMessages = function () {
            me.messages = [];
            me.messagesAt = 0;
        }

        /**
         * appMessage
        *  - Send an message and saves in messages array, optionall with related saved data
        * 
        * Example: 

        * ThisApp.appMessage("Just some info");
        * ThisApp.appMessage("Successful message here.", true, "It was updated", { what: "nothing" });
        * ThisApp.appMessage("Warning, Warning, Warning!", "w", "This is just a warning", { reason: "testing" });
        * ThisApp.appMessage("There was an error, in case you want to take action.", false, false, { reason: "testing" });
        *    Also see: ThisApp.setMessagesOption(theOption,theValue)
        * 
        * @param  {String} theMsg   [The name of the facet to load]
        * @param  {String} theOptionalType   [info, warning, error, success] Default: info
        *  "info" or <blank> 
        *  "warning" or "w"
        *  "error" or "e" or false
        *  "success" or "s" or true
        * @param  {String} theOptions
        *    .title =   [The optional title, no title if excluded]
        *    .data =   [The optional data to be stored with the message log]
        *    .show =   [show as toastr or just log it] (can set option for default and override here)
        * @return void
        * 
        */
        me.appMessage = function (theMsg, theOptionalType, theOptions) {
            var tmpType = "info";
            var tmpOptions = theOptions || {};
            var tmpOptionalData = tmpOptions.data || false;
            

            if (typeof (theOptionalType) == 'string') {
                theOptionalType = theOptionalType.toLowerCase();
                if (theOptionalType == "warning" || theOptionalType == "error" || theOptionalType == "success") {
                    tmpType = theOptionalType;
                } else if (theOptionalType == "w") {
                    tmpType = "warning";
                } else if (theOptionalType == "e") {
                    tmpType = "error";
                } else if (theOptionalType == "s") {
                    tmpType = "success";
                }
            } else if (typeof (theOptionalType) == 'boolean') {
                if (theOptionalType == true) {
                    tmpType = "success";
                }
            }
            var tmpMsgPos = (me.messagesAt++);
            var tmpMsgObj = {
                text: theMsg,
                type: tmpType,
                title: tmpOptions.title || '',
                pos: tmpMsgPos,
                data: tmpOptionalData
            }

            me.messages.push(tmpMsgObj)
            var tmpIsShow = me._messageOptions.show;
            if(typeof(tmpOptions.show) == 'boolean'){
                tmpIsShow = tmpOptions.show;
            }
            if( tmpIsShow ){
                if (typeof (tmpOptions.title) == 'string') {
                    toastr[tmpType](theMsg, tmpOptions.title);
                } else {
                    toastr[tmpType](theMsg);
                }
            }
            
            me.publish("message:sent", tmpMsgObj);
        }

        /**
          * subscribe / unsubscribe / publish
          *     - Standard Pub / Sub functionality
         * 
         * 
         * @return void
         * 
         */
        me.subscribe = function () {
            ThisApp.events.on.apply(ThisApp.events, arguments);
        };

        me.unsubscribe = function () {
            ThisApp.events.off.apply(ThisApp.events, arguments);
        };

        me.publish = function () {
            ThisApp.events.trigger.apply(ThisApp.events, arguments);
        };

    }


    $.extend(me, ExtendMod.SetDisplay);

    me.initTemplates = function(theTemplateSpecs){
        var dfd = jQuery.Deferred();

        //--- if no templates to process, no prob, return now
        if( !(theTemplateSpecs && theTemplateSpecs.templateMap)){
            dfd.resolve(true);
            return dfd.promise();
        }

        var tmpTpls = [];        
        for( var aName in theTemplateSpecs.templateMap){
            tmpTpls.push(aName);
        }
        var tmpBaseURL = theTemplateSpecs.baseURL || 'app/app-tpl/';

        //--- This is needed because this changes inside the promise due to 
        //    not .bind(this) in the function, the temp reference is quicker, same result
        var tmpThis = this;
        ThisApp.om.getObjects('[html]:' + tmpBaseURL, tmpTpls).then(function (theDocs) {
            for( var aKey in theDocs ){
                var tmpTplName = theTemplateSpecs.templateMap[aKey];
                if( tmpTplName ){
                    ThisApp.addTemplate(tmpTplName, theDocs[aKey]); 
                }
            }
            dfd.resolve(true);
        });
        return dfd.promise();

    }

    me.components = {};

    /**
       * loadFacet
       *  - Load HTML content or renders a jsRender template into a known facet name
       * 
       * Example: ThisApp.loadFacet('myarea:out', '', 'tpl-some-registered-template');
       *   - This loads the facet <div facet="myarea:out" ... with a rendered template 'tpl-some-registered-template'
       *
       * 
       * Note:  theContent is usually HTML if no template name passed
       *        theContent can be blank, a string value or an objet to be passed into the template for rendering
       *        if there is a string value for theOptionalTemplateName, 
       *         ... theOptionalTemplateName is used to render the content and theContent passed as the input
       * 
       * 
       * @param  {String} theName   [The name of the facet to load]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalParent$   [The jQuery element to use instead of global]
       * 
       * @return void
       * 
       * 
       */
    me.loadFacet = function (theName, theContent, theOptionalTemplateName, theOptionalParent$) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName) {
            tmpContent = me.getTemplatedContent(theOptionalTemplateName,tmpContent);
        }
        var tmpParent = (theOptionalParent$ && (theOptionalParent$.find)=='function') ? theOptionalParent$.find : $;
        var tmpFacet = tmpParent(tmpSelector);
        tmpFacet.html(tmpContent);
        return tmpFacet;
    }

    /**
       * addToFacet
       *  - Appends or Prepends to existing facet content
       * 
       * Example: See loadFacet for more details
       * 
       * 
       * @param  {String} theName   [The name of the facet to append/prepend to]
       * @param  {String} theContent   [The content to load or object to use when rendering the template]
       * @param  {String} theOptionalTemplateName   [The content to load or object to use when rendering the template]
       * @param  {String} thePrepend   [true to prepend, blank or false to append (default)]
       * @return void
       * 
       * 
       */
    me.addToFacet = function (theName, theContent, theOptionalTemplateName, thePrepend) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpContent = theContent || '';
        if (theOptionalTemplateName && theOptionalTemplateName != '' && theOptionalTemplateName != null) {
            tmpContent = me.getTemplatedContent(theOptionalTemplateName,tmpContent);
        }
        var tmpFacet = $(tmpSelector);
        if (thePrepend === true) {
            tmpFacet.prepend(tmpContent);
        } else {
            tmpFacet.append(tmpContent);
        }
        return tmpFacet;
    }

    /**
   * getFacet$
   *  - Returns jQuery element for the facet name provided
   *  - Optionally pass a parent element as the scope to look in
   * 
   * Example: 
   *   var tmpEl = ThisApp.getFacet('main:out')
   *   var tmpEl = ThisApp.getFacet('main:out',parentEl)
   * 
   * @param  {String} theName   [The name of the facet to append/prepend to]
   * @param  {jQuery Element} theOptionalParent   [The parent to find in, uses global search if not provided]
   * @return {jQuery Element} [The facet element]
   * 
   */
    me.getFacet$ = function (theName, theOptionalParent) {
        var tmpSelector = '[facet="' + theName + '"]';
        var tmpParent = false;
        if (theOptionalParent && theOptionalParent != null) {
            tmpParent = theOptionalParent;
            if (!tmpParent.attr) {
                tmpParent = $(tmpParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSelector);
        } else {
            return $(tmpSelector);
        }
    }


    /**
       * gotoPage
       * Goes to a page on the site
       *
       * @param  {String} thePageName   [The unique page name to open]
       * @return this
       */
    me.gotoPage = function (thePageName) {
        me.gotoTab({ group: 'app:pages', item: thePageName, animation: 'fade in', duration: 100 });
        var tmpActionObj = ThisApp.getNavConfig(thePageName);
        if (tmpActionObj && typeof (tmpActionObj.onActivate) == 'function') {
            tmpActionObj.onActivate();
        }
        me.hideSidebar();

        ThisApp.refreshLayouts();
        return me;
    }


    /**
     * Show / hide the sidebar
     *
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return this
     */


    me.sidebarSetDisplay = function (theIsVis) {
        $('[appuse="side-menu"]').sidebar((theIsVis !== false) ? 'show' : 'hide');
        return me;
    }
    me.hideSidebar = function () {
        return me.sidebarSetDisplay(false);
    }
    me.showSidebar = function () {
        return me.sidebarSetDisplay(true);
    }



    /**
     * gotoTab
     * 
     * To Use:  
     * 
     *  Go to a top level page
     *      ThisApp.gotoTab({page:'mainpage'})
     *  Go to a sub tab (assuming on current main page)
     *      ThisApp.gotoTab({group:'some:group', item:'some:item"})
     *  Go to a top level page and a sub tab on that page
     *      ThisApp.gotoTab({page:'mainpage', group:'some:group', item:'some:item"})
     *
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the item to show within the group, like 'main'
     *  - page = Optional primary page to open in case on a different page
     * 
     * Example: 
     *          var tmpInitialSpot = {
     *            page:'logs',
     *            group:'logs:tabs',
     *            item: 'jobs'
     *          };
     *          ThisApp.gotoTab(tmpInitialSpot);
     *
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */
    me.gotoTab = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpHadPage = false;
        if (tmpOptions.hasOwnProperty('page')) {
            me.gotoPage(tmpOptions.page);
            tmpHadPage = true;
        }
        if ((tmpOptions.group && tmpOptions.item)) {
            me.gotoTabLink(tmpOptions);
            me.gotoCard(tmpOptions);
        } else {
            if (!tmpHadPage) {
                console.error("Can not go to tab, group and item are required.")
            }
        }
        return me;
    }

    /**
     * gotoCard
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     * @param  {Object} theOptions   [object with details that control what tab and/or page to open]
     * @return this
     */

    me.gotoCard = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.animation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 250;
        var tmpSelector = {
            appuse: 'cards',
            group: tmpGroupName
        }
        me.getByAttr$(tmpSelector, tmpParent).addClass('hidden').transition('hide', 1);
        tmpSelector.item = tmpItemId;
        me.getByAttr$(tmpSelector, tmpParent).removeClass('hidden').transition(tmpAnimation + ' in', tmpAnimDuration);
        if (ThisApp.refreshLayouts) {
            ThisApp.refreshLayouts();
        }
        return me;
    }


    /**
     * gotoTabLink
     *   - Hides all the related cards and show the card within a card group
     * 
     * Options:
     *  - group = Name of the group, usually namespaced like main:tabs
     *  - item = Name of the card to show within the group, like 'main'
     *  - parent = Optional parent jQuery element to look inside
     *  
     * To Use:  
     * 
     *  Show the specific card in the group, assuming to look at the entire page 
     *      ThisApp.gotoCard({group:'some:group', item:'some:item'})
     *  Show the specific card in the group, within the parent element passed
     *      ThisApp.gotoCard({group:'some:group', item:'some:item', parent: someEl})
     *
     *
     * @param  {Object} theOptions   [object with details about the page / tab to open]
     * @return void
     */
    me.gotoTabLink = function (theOptions) {
        var tmpOptions = theOptions || {};
        var tmpGroupName = tmpOptions.group || '';
        var tmpItemId = tmpOptions.item || '';
        var tmpParent = theOptions.parent || undefined;
        var tmpAnimation = tmpOptions.tabAnimation || 'fade';
        var tmpAnimDuration = tmpOptions.duration || 1000;

        //--- Create a list of attributes to look for
        //  * appuse is tablink and the group is this group
        var tmpSelector = {
            appuse: 'tablinks',
            group: tmpGroupName
        }
        //--- Remove the 'active' class from all matching items for this group that are tablinks
        //--- Note: The getByAttr$ returns the elements, jQuery's removeClass 
        //          returns the elements being effected for chaining
        var tmpAll = me.getByAttr$(tmpSelector)
            .removeClass('active');

        //--- Add the item selector to update the search to find just the one that is active
        tmpSelector.item = tmpItemId;
        //--- Add the 'active' class to the one item we have
        //--- Note: This calls me.getByAttr$ not ThisApp.getByAttr$, which by default only searches this tab page content
        //--  Note: The reason tmpAll is passed is to keep the scope down to the active ones, since we 
        //          have a handle to those already, that is optional, if not passed, just this page is passed
        me.getByAttr$(tmpSelector, tmpAll).addClass('active');
    }


    //--- Public ================ ================= ===================== ================


    /**
     * getAttrs
     *    - returns an object with the attribute values matching the array of names passed
     * 
     * To Use: var tmpAttribs = ThisApp.getAttrs(anyEl,['item','group']);
     *    - returns an object with {item:"val",group:"val"}
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return {Object} [node name = attribute, node value = attribute value]
     */
    me.getAttrs = function (theEl, theAttrList) {
        var tmpRet = {};
        if (!theEl) {
            return tmpRet;
        }
        var tmpAttrList = theAttrList || {};
        if (typeof (tmpAttrList) == 'string') {
            tmpAttrList = [tmpAttrList];
        }
        var tmpEl = $(theEl);
        for (aAttrPos in tmpAttrList) {
            var tmpAName = tmpAttrList[aAttrPos];
            if (tmpAName) {
                tmpRet[tmpAName] = tmpEl.attr(tmpAName);
            }
        }
        return tmpRet;
    }

    /**
     * getByAttr$
     *    - returns a jQuery element collection (which may be one) that matches the attributes passed
     *    - the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2="SOMEVALUE2"]
     * 
     * To Use: var tmpEls = ThisApp.getByAttr$({ group: "THEGROUPNAME", "item": "THEITEMNAME" })
     *    - returns jQuery elements, use as usual  -  i.e. tmpEls.html(tmpContentHTML); or tmpEls.removeClass('active');
     * 
     * Note: If a blank value is passed
     * 
     *
     * @param  {Object} theItems   [object where the name is the attibute and the value is the value to look for]
     * @param  {Object} theParent   [parent object to search in, if not provided, a global search is done]
     * @param  {Boolean} theExcludeBlanks   [set to true to ignore blank values]
     *         * Important: By default if an attribute that has no value to find is passed (present but blank)
     *                then ALL items that contain the attribute will be included.
     *                 the same as using [ATTRIBUTENAME="SOMEVALUE"][ATTRIBUTENAME2]
     *           Setting theExcludeBlanks to true will use [ATTRIBUTENAME="SOMEVALUE"] (leaving the item out)
     * 
     * @return {$el} [jQuery element collection (which may be one)]
     */
    me.getByAttr$ = function (theItems, theParent, theExcludeBlanks) {
        if (!theItems) {
            return false;
        }
        var tmpFoundItems = false;
        var tmpSS = '';
        for (aItemName in theItems) {
            if ((aItemName)) {
                var tmpVal = theItems[aItemName];
                tmpFoundItems = true;
                var tmpSSItem = '';
                if (tmpVal) {
                    tmpSSItem = '[' + aItemName + '="' + tmpVal + '"]'
                } else {
                    if (theExcludeBlanks !== true) {
                        tmpSSItem = '[' + aItemName + ']'
                    }
                };
                tmpSS += tmpSSItem;
            }
        }

        if (!tmpFoundItems) {
            return false;
        }

        var tmpParent = false;
        if (theParent) {
            //--- Convert if there is a parent and it is not a jQuery element already
            if (typeof (theParent) != 'string' && theParent.hasOwnProperty('nodeType')) {
                tmpParent = $(theParent);
            }
        }
        if (tmpParent) {
            return tmpParent.find(tmpSS);
        } else {
            return $(tmpSS);
        }

    }

    /**
     * setDisplay
     *    - sets the attribute to hidden or not hidden
     * 
     * To Use: ThisApp.setDisplay(anyEl,anyBooleanValue);
     *
     * @param  {Object} theEl   [target object with details about the page to open]
     * @param  {Boolean} theIsVis   [true to show, false to hide]
     * @return void
     */
    // me.setDisplay = function (theEl, theIsVis) {
    //     var tmpEl = $(theEl);
    //     if (theEl.node) {
    //         tmpEl = $(theEl.node());
    //     } else {
    //         tmpEl = $(theEl);
    //     }
    //     if (theIsVis) {
    //         tmpEl.removeClass('hidden');
    //     } else {
    //         tmpEl.addClass('hidden');
    //     }
    // }
    // me.show = function (theEl) {
    //     me.setDisplay(theEl, true);
    // }
    // me.hide = function (theEl) {
    //     me.setDisplay(theEl, false);
    // }
    me.initModuleComponents = initModuleComponents;
    function initModuleComponents(theApp, theModuleName, theComponents) {
        var appModule = ActionAppCore.module(theModuleName);
        for (var aPos in theComponents) {
            var tmpComp = theComponents[aPos];
            try {
                var tmpCompName = theComponents[aPos];
                var tmpComp = appModule[tmpCompName];
                theApp.registerComponent(theModuleName + ":" + tmpComp.pageName, tmpComp);
            } catch (ex) {
                console.error("Error in init component: " + theModuleName, ex);
            }
        }
    }


    /**
     * useModuleComponentsuseModuleComponents
     *    - Initializes application components from the modules they live in
     * 
     * To Use: 
     *   var tmpAppComponents = ['DataTablesPage', 'PouchPage', 'LogsPage'];
     *   var tmpPluginComponents = ['DataTables'];
     *   ThisApp.useModuleComponents('app', tmpAppComponents)
     *   ThisApp.useModuleComponents('plugin', tmpPluginComponents)
     *
     *  Note: Order matters, they load in the order provided, 
     *        ... if components add their own navigational items, the navigation items show in that order
     *
     * @param  {String} theModuleName   [the name of the module (i.e. app or plugin or any custom module)]
     * @param  {Array<String/Object>} theComponents   [List of components to load form this module, in the order they should initialize.  Pass string for just plugin  or {name:yourname,options:optionalOptions}]
     * @return void
     */
    me.useModuleComponents = useModuleComponents;
    function useModuleComponents(theModuleName, theComponents) {
        if (!theModuleName && theComponents) {
            console.error("Need both theComponents and theModuleName");
            return false;
        }
        var tmpComponents = theComponents || [];

        var tmpModule = ActionAppCore.module(theModuleName);
        if (!(tmpModule)) {
            console.error("Module not found: " + tmpModule);
            return false;
        }
        for (var aPos in tmpComponents) {
            var tmpComp = tmpComponents[aPos];
            if (typeof (tmpComp) == 'string') {
                tmpComp = { name: tmpComp };
            }
            var tmpName = tmpComp.name || '';
            if (tmpName) {
                try {
                    var tmpOptions = tmpComp.options || {};
                    $.extend(tmpOptions, { app: ThisApp });
                    var tmpNew = new tmpModule[tmpName](tmpOptions);
                } catch (ex) {
                    console.error("Error loading component: " + tmpName);
                }
            } else {
                console.error("Attempting to load plugin, but no name provided.", tmpComp);
            }

        }
        return true;
    }


    /**
     * getComponent
     *    - Returns any registered component by full name
     * 
     * To Use: 
     *   me.dt = ThisApp.getComponent("plugin:DataTables");
     *    - or - 
     *   me.logs = ThisApp.getComponent("app:Logs");
     *
     *  Note: You can then call the related component functions
     *        There is no need to get the component to use the related registered actions (i.e. <div appaction="logs:doSomeAction")
     *
     * @param  {String} theName   [the full name of the component to load including module name]
     * @return void
     */
    me.getComponent = getComponent;
    function getComponent(theName) {
        return me.components[theName];
    }

    /**
     * registerComponent
     *    - Register a component that can be received using getComponent
     * 
     * To Use: Implement your controller as shown below and register with the full module:ComponentName
     * 
     * 
     * Example: 
     * 
     * function ThisPageController(theOptions) {
     *   me.options = theOptions || {};
     *   me.actions = me.options.actions || {};
     *   var defaults = {};
     *   if (typeof (me.options.app) == 'object') {
     *       ThisApp = me.options.app;
     *       if (ThisApp && ThisApp.registerComponent) {
     *           ThisApp.registerComponent("app:PouchPage", this);
     *       }
     *   }
     * }
     *
     * @param  {String} theName   [the full name of the component to register including module name]
     * @param  {Object} theController   [The base object for the component being registered, usually "me"]
     * @return void
     */

    me.registerComponent = registerComponent;
    function registerComponent(theName, theController) {
        me.components[theName] = theController;
    }

    /**
     * registerAction
     *    - Register an action
     * 
     * Note: Usually components register a single action delegate function for all in the registered namespace
     *       ... see "registerActionDelegate" for details.
     * 
     * Example: 
     *   ThisApp.registerAction("doSomethingSpecial", me.doSomethingSpecial);
     * 
     *
     * @param  {String} theActionName   [the name of the action, do NOT include any module name prefix (:) here]
     * @param  {Object} theFunction   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerAction = registerAction;
    function registerAction(theActionName, theFunction) {
        ThisCoreApp.actions[theActionName] = theFunction;
    }

    me.unRegisterAction = unRegisterAction;
    function unRegisterAction(theActionName) {
        if(typeof(ThisCoreApp.actions[theActionName]) != 'undefined'){
            delete ThisCoreApp.actions[theActionName];
        }
    }

    /**
     * registerActionDelegate
     *    - Register an delegate for all actions with a prefix using (:)
     * 
     * 
     * Example: 
     *   ThisApp.registerActionDelegate("previews", runAction);
     *    - this makes any <div appaction="previews:doSomething" .. 
     *     ...   go be routed to the callback "runAction" delegate function
     *
     * @param  {String} theActionDelegateName   [the prefix to use (do not iclude the ":")]
     * @param  {Function} theDelegate   [The standard "Action" function to handle the action pass (action name, target object)]
     * @return void
     */
    me.registerActionDelegate = registerActionDelegate;
    function registerActionDelegate(theActionDelegateName, theDelegate) {
        ThisCoreApp.actionsDelegates[theActionDelegateName] = theDelegate;
    }




    /**
     * runAppAction
     *    - Manually run an action passing the name and target object (jQuery element)
     * 
     * Example: 
     *   ThisApp.runAppAction("doSomethingSpecial", someEl);
     * 
     *
     * @param  {String} theAction   [the name of the action, you can include a module name prefix (:) here]
     * @param  {Object} theObject   [The object that contains the attributes that provide the target action parameters]
     * @return void
     */
    me.runAppAction = runAppAction;
    function runAppAction(theAction, theObject) {
        var tmpAction = theAction || '';
        var tmpASPos = tmpAction.indexOf(":");
        var tmpActionSpace = '';
        var tmpRan = false;

        var tmpObject = theObject;

        if (tmpASPos > -1) {
            tmpActionSpace = tmpAction.substr(0, tmpASPos);
            if (tmpActionSpace && ThisApp.actionsDelegates.hasOwnProperty(tmpActionSpace)) {
                var tmpAD = ThisApp.actionsDelegates[tmpActionSpace];
                if (typeof (tmpAD) == 'function') {
                    tmpAction = tmpAction.replace((tmpActionSpace + ":"), "");
                    tmpRan = true;
                    tmpAD(tmpAction, tmpObject);
                }
            }
        }

        if (!tmpRan) {
            var tmpAction = ThisCoreApp.actions[theAction] || ThisCoreApp[theAction];
            if (tmpAction) {
                return tmpAction(theAction, tmpObject);
            } else {
                console.error("No registered action for " + theAction);
                return null
            }
        }
    }

    /**
     * hideCommonDialog
     *    - Hidex the common dialog box if open
    */
    me.hideCommonDialog = hideCommonDialog;
    function hideCommonDialog() {
        getCommonDialog().modal('hide');
    }

    /**
     * showCommonDialog
     *    - Shows the common dialog box with content provided
     * 
     * 
     * Example: 
     *   ThisApp.showCommonDialog();
     *
     * @param  {Object} theOptions   [The options object with header and content and optional actions]
     * 
     * theOptions ...
     * 
     * Dialog content:
     *   header: String for HTML or Object with content and data
     *   content: String for HTML or Object with content and data
     *   footer: String for HTML or Object with content and data
     *     Note: Footer usually used for actions
     * 
     * Callback Functions: 
     *   onBeforeClose = function that is called before the dialog closes
     *    Note: When used, ESC and clicking off the dialog do NOT close the dialog
     *        When used - return false to not allow the dialog to close (i.e. validation)
     *        This is used for forms and advanced dialogs
     * 
     *   onClose = function that is called AFTER the dialog closes
     *   onShow = function that is called when the dialog loads
     * 
     * @return this
     */
    me.showCommonDialog = showCommonDialog;
    
    var commonDialogCallbackOnShow = false;
    var commonDialogCallbackOnHide = false;
    var commonDialogCallbackOnHidden = false;
    
    function showCommonDialog(theOptions) {
        var tmpHeader = theOptions.header || '';
        var tmpContent = theOptions.content || '';
        var tmpFooter = theOptions.footer || '';

        var tmpOnClose = theOptions.onClose || '';
        var tmpOnBeforeClose = theOptions.onBeforeClose || '';
        var tmpOnOpen = theOptions.onOpen || '';

        var tmpCloseText = theOptions.closeText || 'Close';
        ThisApp.getFacet$('site:dialog-close-text').html(tmpCloseText);

        var tmpDialog = getCommonDialog();

        if( typeof(tmpOnBeforeClose) == 'function'){
            commonDialogCallbackOnHide = tmpOnBeforeClose;
            //--- If we are going to allow a stop of close, this is needed
            tmpDialog.modal('setting', {  closable: false }); 
        } else {
            //--- This is a normal dialog, allow esc and off-click to close
            tmpDialog.modal('setting', {  closable: true }); 
        }
        if( typeof(tmpOnClose) == 'function'){
            commonDialogCallbackOnHidden = tmpOnClose;
        }
        if( typeof(tmpOnOpen) == 'function'){
            commonDialogCallbackOnShow = tmpOnOpen;
        }
        if (typeof (tmpContent) == 'object') {
            tmpContent = me.getTemplatedContent(tmpContent);
        }
        if( tmpHeader === ''){
            tmpHeader = '&nbsp;';
        } else if (typeof (tmpHeader) == 'object') {
            tmpHeader = me.getTemplatedContent(tmpHeader);
        }
        if( tmpFooter === ''){
            //ThisApp.getFacet$('site:dialog-footer').css('display','none')
            
            ThisApp.getFacet$('site:dialog-footer').removeClass('actions');
        } else if (typeof (tmpFooter) == 'object') {
            tmpFooter = me.getTemplatedContent(tmpFooter);
            ThisApp.getFacet$('site:dialog-footer').addClass('actions');
            //ThisApp.getFacet$('site:dialog-footer').css('display','')
        }



        ThisApp.loadFacet('site:dialog-header', tmpHeader);
        ThisApp.loadFacet('site:dialog-content', tmpContent);
        ThisApp.loadFacet('site:dialog-footer', tmpFooter);

        tmpDialog.modal('show');
        
        setTimeout(resetDialogBodyArea,10)

        return me;
    }

    function resetDialogBodyArea(){
        var tmpHeader = ThisApp.getFacet$('site:dialog-header');
        var tmpBody = ThisApp.getFacet$('site:dialog-content');
        var tmpFooter = ThisApp.getFacet$('site:dialog-footer');
        
        var tmpOutHeight = tmpHeader.get(0).clientHeight + tmpFooter.get(0).clientHeight;
        tmpOutHeight = tmpOutHeight + 80; 
        var tmpWiHeight = $( window ).height(); //$( window ).height();
        var tmpBodyNewH = (tmpWiHeight - tmpOutHeight) + 'px';
        tmpBody.css({"height":tmpBodyNewH,"overflow":"auto"});
    }

    me.closeCommonDialog = closeCommonDialog;
    function closeCommonDialog() {
        getCommonDialog().modal('hide');
    }

    /**
     * Template Manager Functionality 
     * 
     *    Common method of getting templated HTML
     *
     */
        
    /**
     * getTemplatedContent
     * 
     *    Common method of getting templated content by name
     *
     * @param  {String} theTemplateName   [The name of the template to pull]
     * @param  {Object} theData   Optional, needed if template expects one
     * @param  {Object} theOptions   Optional, any options supported by this or calling methods
     * @return void
     */
    me.getTemplatedContent = function (theOptionsOrTemplateName, theDataIfNotObject, theOptions) {
        var tmpTemplateName = theOptionsOrTemplateName;
        var tmpData = theDataIfNotObject;
        if (typeof (theOptionsOrTemplateName) == 'object') {
            tmpTemplateName = theOptionsOrTemplateName.template;
            tmpData = theOptionsOrTemplateName.data || theDataIfNotObject || '';
        }
        tmpData = tmpData || '';
        if (!(tmpTemplateName)) {
            console.error("Need to pass template name as a string or an object with a .template")
            return;
        }

        return me.renderTemplate(tmpTemplateName, tmpData, theOptions);
    }
    me.tplIndex = {};
    
   

    /**
     * compileTemplates
     *    - Looks for <pre> or <script> objects that contain template markup
     *    - Get the name of the attribute and the content, add the content to the templates with the attribute name
     *
     * @param  {String} theOptionalAttrName  Pass in the attribute name to look for templats inside
     * @param  {Object} theOptionalAttrName  Pass in the parent jQuery element to start with, uses default for getByAttr if not provided
     * @return void
     */
    me.compileTemplates = function(theOptionalAttrName, theOptionalTarget){
        var tmpAttrName = theOptionalAttrName || "data-htpl";
        var tmpSelector = {};
        //--- Init what to look for, anything with this attribute
        tmpSelector[tmpAttrName] = "";
        //--- Get all elements with this attribute
        ThisApp.getByAttr$(tmpSelector, theOptionalTarget).each(function(theIndex) {
          var tmpEl$ = $(this);
          var tmpKey = "" + tmpEl$.attr(tmpAttrName);
          me._templates[tmpKey] = Handlebars.compile(this.innerHTML);          
          this.innerHTML = '';
        });
    }
 /**
     * addTemplate
     *    - Adds / compiles Handlebars template
     *
     * @param  {String} theKey  The unique name for this template
     * @param  {Object} theHTML  The HTML to include
     * @return void
     */
    me.addTemplate = function(theKey, theHTML){
        me._templates[theKey] = Handlebars.compile(theHTML);
    }
    
        //me.htmlHandlebars = {};
    me._templates = {};
    me.renderTemplate = function(theName, theContext){
        try {
            var tmpFn = (ThisApp._templates[theName]);
            return tmpFn(theContext);
        } catch (theError) {
            console.error("Error rendering template " + theError,"Name was " + theName);
        }
    }


    //======================================
    //======================================
    //======================================


    //--- App Actions ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
     * AppAction: showPage
     * 
     * To Use:  <div appaction="showPage" item="THEPAGENAME">...
     *
     * @param  {String} theAction   [name of the action (showPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        if (tmpPage) {
            me.gotoPage(tmpPage);
        } else {
            console.error("No item provided");
        }
        return me;
    }

    /**
     * AppAction: showSubPage
     * 
     * To Use:  <div appaction="showPage" group="THEGROUPNAME" item="THEPAGENAME" >...
     *
     * @param  {String} theAction   [name of the action (showSubPage)]
     * @param  {Object} theTargetObj   [target object with details about the page to open]
     * @return this
     */
    var showSubPage = function (theAction, theTargetObj) {
        if (!theTargetObj) {
            theTargetObj = theAction;
        }
        var tmpPage = $(theTargetObj).attr("item") || '';
        var tmpGroupName = $(theTargetObj).attr("group") || '';
        if (tmpPage && tmpGroupName) {
            me.gotoTab({ group: tmpGroupName, item: tmpPage });
        } else {
            console.error("No pagename provided");
        }
    }




    //--- Internal Functionality ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 
    //--- ========  ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== 


    /**
    * me.commonDialog - globally used dialog, private variable used to assure proper usage
   */
    var commonDialog = null,
        commonDialogTemplate = 'tpl-common-global-dialog',
        commonDialogFacet = 'site:global-dialog';

    me.commonDialogIsOpen = false;
    me.commonDialogWindowsBind = false;

    function commonDialogOnWindowResize(){
        if(ThisApp.commonDialogIsOpen){
            resetDialogBodyArea();
        };        
    }

    var $window = $(window), previousScrollTop = 0, scrollLock = false;
    $window.scroll(function(event) {     
        if(scrollLock) {
            $window.scrollTop(previousScrollTop); 
        }
        previousScrollTop = $window.scrollTop();
    });

    function onCommonDialogShow(){
        if( !ThisApp.commonDialogWindowsBind ){
            //--- Lazy init one resize handler / move to even more common? Do this everytime and remove?  Reasons?
            ThisApp.commonDialogWindowsBind = true;
            window.onresize = commonDialogOnWindowResize.bind(ThisApp);
        }
        ThisApp.commonDialogIsOpen = true;
        scrollLock = true;
        if( typeof(commonDialogCallbackOnShow) == 'function' ){
            commonDialogCallbackOnShow();
        }
    }

    function onCommonDialogHidden(theEl){
        //console.log("onCommonDialogHidden")
        ThisApp.commonDialogIsOpen = true;
        scrollLock = false;
        if( typeof(commonDialogCallbackOnHidden) == 'function' ){
            commonDialogCallbackOnHidden();
        }        
        commonDialogCallbackOnShow = false;
        commonDialogCallbackOnHide = false;
        commonDialogCallbackOnHidden = false;        
    }

    function onCommonDialogHide(theEl){
        if( typeof(commonDialogCallbackOnHide) == 'function' ){
            tmpResults = commonDialogCallbackOnHide(theEl);
            if(tmpResults === false){
                return false;
            }
        }
        return true;
    }

    function getCommonDialog() {
        if (!commonDialog) {
            commonDialog = ThisApp.getByAttr$({ appuse: 'global-dialog' })
            commonDialog.modal('setting', {
                detachable: false,
                centered: false,
                closable: true,
                dimmerSettings: {
                    opacity: 1
                },
                onShow: onCommonDialogShow,
                onHide: onCommonDialogHide,
                onHidden: onCommonDialogHidden
            }); 
            
            ThisApp.commonDialog = commonDialog;
        }
        return commonDialog;
    }

    me.hasSidebar = false;

    function initMenus() {
        //--- ToDo: Review semaction name / use ****
        var tmpSBSelector = '[semaction="showsidebar"]';
        if ($(tmpSBSelector).length > 0) {
            me.hasSidebar = true;
            $('[appuse="side-menu"]')
            .sidebar('setting', 'duration', 20)
            .sidebar('setting', 'mobileTransition', 'fade')            
            .sidebar('attach events', tmpSBSelector);
        }
    }

    function initGlobalDialog() {
        //--- ToDo: Why not just add the HTML directly to body in this case?

        //--- Dynamically create the common dialog facet
        var tmpNewDiv = $('<div facet="site:global-dialog" class="hidden"></div>').appendTo('body');
        //--- Populate with common dialog (ToDo: Allow override?)
        var tmpHTML = '<div appuse="global-dialog" class="ui modal longer inverted"><button style="float:right;margin-top:5px;margin-right:5px;" class="icon ui basic blue button circle" action="_app:closeCommonDialog" ><i class="close icon"></i> <span facet="site:dialog-close-text">Close</span></button><div facet="site:dialog-header" class="header"></div>  <div facet="site:dialog-content" class="content common-dialog-content"> </div> <div facet="site:dialog-footer" class="common-dialog-footer"></div> </div> ';
        me.loadFacet(commonDialogFacet, tmpHTML )        
    }

    function initAppActions() {
        $('body').on("click", itemClicked)
    }
    function instClicked(theEvent) {
        theEvent.preventDefault();
        theEvent.stopPropagation();
    }

    //---- Internal: Gets the action or appaction from the current element or the first parent element with such an entry,
    //               ... this is needed so when a child element is clicked, the proper parent action element is used.
    function _getActionFromObj(theObj) {
        var tmpObj = theObj;
        var tmpAction = $(tmpObj).attr("appaction") || $(tmpObj).attr("action") || "";
        if (!tmpAction) {
            var tmpParent = $(tmpObj).closest('[action]');
            if (tmpParent.length == 1) {
                tmpObj = tmpParent.get(0);
                tmpAction = $(tmpObj).attr("action") || "";
            } else {
                tmpParent = $(tmpObj).closest('[appaction]');
                if (tmpParent.length == 1) {
                    tmpObj = tmpParent.get(0);
                    tmpAction = $(tmpObj).attr("appaction") || "";
                    $(tmpObj).attr("action", tmpAction)
                } else {
                    return false; //not an action
                }
            }
        }
        return { action: tmpAction, el: tmpObj };
    }

    //---- Internal: Catch a click item to look for the action
    function itemClicked(theEvent) {
        var tmpObj = theEvent.target || theEvent.currentTarget || theEvent.delegetTarget || {};
        var tmpActionDetails = _getActionFromObj(tmpObj);
        if (!((tmpActionDetails.hasOwnProperty('action') || tmpActionDetails.hasOwnProperty('appaction')) && tmpActionDetails.hasOwnProperty('el'))) {
            //--- OK, just clicked somewhere with nothing to catch it, but not an action
            return;
        }
        var tmpAction = tmpActionDetails.action;
        tmpObj = tmpActionDetails.el;

        if (tmpAction) {
            theEvent.preventDefault();
            theEvent.stopPropagation();
            runAppAction(tmpAction, tmpObj);
        }
        return false;
    }

    //--- ToDo - Implement better message center with toastr as UI option or toastless
    function initMessageCenter() {
        toastr.options.closeButton = true;
        toastr.options.timeOut = 1000;
        /*
        //--- Some other available options
        toastr.options.timeOut = 2000;
        toastr.options.extendedTimeOut = 6000;
         */
    }

    me.siteLayout = null;

    me.refreshLayouts = function (theTargetEl) {
        me.siteLayout.resizeAll();
    }
    me.resizeLayouts = function (name, $pane, paneState) {
        try {
            var tmpH = $pane.get(0).clientHeight - $pane.get(0).offsetTop - 1;
            me.getByAttr$({ appuse: "cards", group: "app:pages", item: '' }).css("height", tmpH + "px");;
        } catch (ex) {

        }
    }

    //=== CRAPPY ASS POPUP FUNCTIONALITY -- REMOVE IT???
    me.clearActivePopup = clearActivePopup;    
    function clearActivePopup(){
        if( !ThisApp.activePopup ){
            return;
        }
        ThisApp.activePopup.popup('destroy');
        ThisApp.activePopup = false;
    }
    //=== Pass title and content, optionally an onClose event (not normal part of sui popup)
    //--- This creates the popup, then destroys when closed and does a callback if there
    me.showPopup = showPopup;
    function showPopup(theDetails, theTargetEl){
        var tmpDetails = theDetails || '';
        var tmpTargetEl = false;
        if( ThisApp.activePopup ){
            ThisApp.activePopup.popup('destroy');
            ThisApp.activePopup = false;
        }
        if( typeof(tmpDetails) == 'string'){
            //This is from an action, convert it
            tmpTargetEl = $(theTargetEl);
            tmpDetails = {};
            var tmpTitle = tmpTargetEl.attr('title') || tmpTargetEl.attr('popup-title' || '');
            var tmpContent = tmpTargetEl.attr('content') || tmpTargetEl.attr('popup-content'|| '');
            if( tmpTitle ){
                tmpDetails.title = tmpTitle;
            }
            if( tmpContent ){
                tmpDetails.content = tmpContent;
            }

        } else {
            tmpTargetEl = theTargetEl || tmpDetails.el || false;
            //--- Make sure we are dealing with a jQuery element on the one passed
            if( !tmpTargetEl ){
                tmpTargetEl = document.body;
            }
            if(tmpTargetEl && typeof(tmpTargetEl.get) !== 'function'){
                tmpTargetEl = $(tmpTargetEl);
            }
        }
        
        var tmpPopup;
        var tmpFn = false;
        if( typeof(tmpDetails.onClose) == 'function' ){
            tmpFn = tmpDetails.onClose;
        }
        
        var tmpPopSpecs = {
            on:'click',
            //hideOnScroll:true,
            exclusive:true,
            lastResort: 'bottom left',
            onHidden: function(){
                if( tmpFn ){
                    tmpFn();
                }
                tmpPopup.popup('destroy');
                ThisApp.activePopup = false;                
            }
        }

        $.extend(tmpPopSpecs, tmpDetails);
        tmpPopup = tmpTargetEl.popup(tmpPopSpecs).popup('show');
        ThisApp.activePopup = tmpPopup;
    }

    //--- Run _app function, commonly used application wide functions
    me.runAction = runAction;
    function runAction(theAction, theSourceObject) {
        var tmpAction = theAction || '';
        tmpAction = tmpAction.replace((this.pageNamespace + ":"), '');
        if (typeof (this[tmpAction]) == 'function') {
            this[tmpAction](tmpAction, theSourceObject);
        } else if (typeof (me[tmpAction]) == 'function') {
            me[tmpAction](tmpAction, theSourceObject);
        }
    }

    me.init = init;
    var ThisCoreApp = this;
    function init(theAppConfig) {

        ThisCoreApp = this;
        
        //--- Init Required Plugins
        me.useModuleComponents('plugin', ['ObjectManager']);
        me.om = me.getComponent("plugin:ObjectManager");
        this.registerActionDelegate("_app", this.runAction.bind(this));
        
        //--- ToDo: Support options in theAppConfig to control this        
        me.siteLayout = $('body').layout({
            center__paneSelector: ".site-layout-center"
            , north__paneSelector: ".site-layout-north"
            , north__spacing_open: 4
            , north__spacing_closed: 4
            , north__resizable: false
            , spacing_open: 6 // ALL panes
            , spacing_closed: 8 // ALL panes
            , onready: ThisApp.resizeLayouts
            , center__onresize: ThisApp.resizeLayouts
        });

        me.config = me.config || {};
        if (theAppConfig) {
            $.extend(me.config, theAppConfig)
        }
        me.config.navbuttons = me.config.navbuttons || [];
        me.config.navlinks = me.config.navlinks || [];
        me.registerAction("showPage", showPage);
        me.registerAction("showSubPage", showSubPage);

        me.$appPageContainer = $(me.config.container || '[appuse="main-page-container"]');

        for (var aName in me.components) {
            var tmpController = me.components[aName];
            //--- Call any plug in component init functions on init, if it has one
            if (tmpController && typeof (tmpController.init) == 'function') {
                tmpController.init(this);
            }
        }

        var tmpNavHTML = '{{#each navlinks}} {{#if isTopLink}}<a appuse="tablinks" group="app:pages" item="{{name}}" appaction="showPage" class="item blue">{{title}}</a>{{/if}} {{/each}}';
        var tmpSideLinksHTML = '{{#each navlinks}} {{#if isSideLink}}<a appuse="tablinks" group="app:pages" item="{{name}}" appaction="showPage" class="item">{{{iconHTML}}}{{title}}</a>{{/if}} {{/each}}';
        ThisApp.addTemplate('tpl-side-menu-item',tmpSideLinksHTML)
        ThisApp.addTemplate('tpl-nav-menu-item',tmpNavHTML)
        $('[appuse="side-menu"]').html(ThisApp.renderTemplate('tpl-side-menu-item',me.config));
        $('[appuse="nav-menu"]').html(ThisApp.renderTemplate('tpl-nav-menu-item',me.config));

        initMenus();
        initAppActions();
        initMessageCenter();
        initGlobalDialog();

        if (me.config['navlinks']) {
            var tmpFirstNavLink = me.config['navlinks'][0];
            if (tmpFirstNavLink && tmpFirstNavLink.name) {
                ThisApp.gotoPage(tmpFirstNavLink.name);
            }
        }
    }

})(ActionAppCore, $);
















/*
Author: Joseph Francis
License: MIT
*/
//---  SitePage - Base for all application pages --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    SiteMod.SitePage = SitePage;

    var defaultLayoutOptions = {        
        spacing_closed: 8,
        spacing_open: 6,
        resizable: true,
        togglerLength_open: 100,
        togglerLength_closed: 100,
        south__resizable: false,
        south__closable: false,
        south__slidable: false,
        south__togglerLength_open: 0,
        south__spacing_open: 0,
        north__resizable: false,
        north__closable: false,
        north__slidable: false,
        north__togglerLength_open: 0,
        north__spacing_open: 0,
        center__paneSelector: ".middle-center",
        north__paneSelector: ".middle-north",
        south__paneSelector: ".middle-south",
        west__paneSelector: ".middle-west",
        east: { paneSelector: ".middle-east", resizable: true, resizeWhileDragging: true, slidable: true }
    };



    //--- Base class for application pages
    function SitePage(theOptions) {
        this.options = theOptions || {};
        this.pageName = this.options.pageName || '';
        this.pageNamespace = this.options.pageNamespace || '';

        this.pageTitle = this.options.pageTitle || '';
        this.pageTemplates = this.options.pageTemplates || [];
        this.layoutTemplates = this.options.layoutTemplates || false;

        this.navOptions = this.navOptions || this.options.navOptions || {};
        this._activatedFlag = false;
        //this.pageTemplate = this.options.pageTemplate || '';
        this.layoutOptions = this.options.layoutOptions || false;
        

//!this.pageTemplate || 
        if (this.layoutOptions) {
            this.layoutOptions = this.layoutOptions || {};
            this.layoutConfig = $.extend({}, defaultLayoutOptions, (this.options.layoutConfig || {}));

            //--- Use standard border layout template if none provided
            this.layoutOptions.facetPrefix = this.layoutOptions.facetPrefix || this.pageName;
            //this.pageTemplate = this.pageTemplate || 'tpl-border-layout';
            this.layoutConfig.center__onresize = (
                function(){
                    if( typeof(this._onResizeLayout) == 'function'){
                        this._onResizeLayout();
                    }
                }
            ).bind(this);

            //--- Extend with new layout related facet functions
            this.addToRegion = function (theRegion, theContent, theOptionalTemplateName, thePrepend) {
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.addToFacet(tmpRegionFacetName, theContent, theOptionalTemplateName, thePrepend)
            }
            this.loadRegion = function (theRegion, theContent, theOptionalTemplateName) {
                var tmpRegionFacetName = this.layoutOptions.facetPrefix + ":" + theRegion;
                ThisApp.loadFacet(tmpRegionFacetName, theContent, theOptionalTemplateName)
            }

        }
        this.appModule = this.options.appModule || false;
        if (this.appModule) {
            this.appModule[this.pageName] = this;
        }
    }

    var me = SitePage.prototype;
    //var that = this;

    me.initOnFirstLoad = function(){
        var dfd = jQuery.Deferred();
        var tmpThis = this;
        ThisApp.initTemplates(this.pageTemplates).then(
            function(){
                //--- No async calls, just run it
                tmpThis.initLayout();
                dfd.resolve(true);
            }
        );
        return dfd.promise();
    }

    
    //--- Usage: <div appuse="template" name="yourns:yourname">Template for {{titie}}</div>
    me.loadTemplatesFromMarkup = function(){
        var tmpEls = this.getByAttr$({page: this.pageName, appuse:"template"})
        if( tmpEls && tmpEls.length > 0){
            for( var i = 0 ; i < tmpEls.length; i++){
                var tmpEl = $(tmpEls[i]);
                var tmpName = tmpEl.attr('name') || '';
                var tmpHTML = tmpEl.html();
                ThisApp.addTemplate(tmpName,tmpHTML);
                //console.log("tmpEl tmpName",tmpName);
            }
        }
    }

    //--- Usage: <div appuse="content" region="north">North Content</div>
    me.loadLayoutFromMarkup = function(){
        console.log("loadLayoutFromMarkup")
        var tmpEls = this.getByAttr$({page: this.pageName, region:"center", appuse:"content"})
        if( tmpEls && tmpEls.length > 0){
            //console.log("Loading Region: center");
            this.loadRegion('center', tmpEls.html());
        }
        var tmpRegions = ['north','south','east','west'];
        for( var i = 0 ; i < tmpRegions.length; i++){
            var tmpRegion = tmpRegions[i];
            //--- Is this region turned on?
            if( this.layoutOptions[tmpRegion]){
                //--- Find related element and use it
                var tmpEls = this.getByAttr$({page: this.pageName, region:tmpRegion, appuse:"content"})
                if( tmpEls && tmpEls.length > 0){
                   this.loadRegion(tmpRegion, tmpEls.html());
                }
                tmpEls.remove();
            }
        }
    }


    me.initLayout = function(){
        
        if(this.layoutOptions && this.layoutOptions.content){
            var tmpContentItems = this.layoutOptions.content;           
            for( var aName in tmpContentItems ){
                var tmpContent = tmpContentItems[aName];
                this.loadRegion(aName, tmpContent);
            }
        }
        if(this.layoutOptions && this.layoutOptions.markedupLayout === true){
            this.loadLayoutFromMarkup();
        }
        if(this.layoutOptions && this.layoutOptions.markedupTemplates === true){
            this.loadTemplatesFromMarkup();
        }

        if(this.layoutOptions && this.layoutOptions.templates){
            var tmpLTs = this.layoutOptions.templates;
            var tmpContext = {}
            for( var aName in tmpLTs ){
                var tmpLT = tmpLTs[aName];
                var tmpLTName = '';
                if( typeof(tmpLT) == 'string'){
                    tmpLTName = tmpLT;
                } else {
                    tmpLTName = tmpLT.name;
                }
                this.loadRegion(aName, ThisApp.renderTemplate(tmpLTName, tmpContext));
            }
        }
        
        //--- This resizes the layouts with the new content loaded from templates
        if( typeof(ThisApp.refreshLayouts) == 'function' ){
            ThisApp.refreshLayouts();
        }
    }
   
    me.open = function (theOptions) {
        return ThisApp.gotoPage(this.pageName);
    }
    me.focus = me.open;
    
    me.loadFacet = function (theName, theContent, theOptionalTemplateName) {
        return ThisApp.loadFacet(theName, theContent, theOptionalTemplateName, this.getParent$());
    }
    me.getByAttr$ = function (theItems, theExcludeBlanks) {
        return ThisApp.getByAttr$(theItems, this.getParent$(), theExcludeBlanks);
    }
    me.getParent$ = function () {
        var tmpAttribs = {
            group: "app:pages",
            item: this.pageName
        }
        this.parent$ = this.parent$ || this.app.getByAttr$(tmpAttribs);
        return this.parent$;
    }


    //======================================
    //======================================
    //======================================


    me.init = init;
    function init(theApp) {

        if (theApp) {
            this.app = theApp;
        }

        if (typeof (this._onPreInit) == 'function') {
            this._onPreInit(this.app)
        }

        if (this.app && this.pageNamespace && this.pageNamespace != '') {
            this.app.registerActionDelegate(this.pageNamespace, runAction.bind(this));
        }

        //--- Add dynamic link on init from plugin module
        if (this.app && this.app.$appPageContainer) {
            this.app.$appPageContainer.append('<div appuse="cards" group="app:pages" item="' + this.pageName + '" class="hidden">' + this.pageTitle + '</div>');
            this.app.registerNavLink({
                "name": this.pageName,
                "title": this.pageTitle,
                "options": this.navOptions || {},
                "onActivate": onActivateThisPage.bind(this)
            });
            this.getLayoutHTML = function(){
                var tmpRet = "";
                var tmpAll = ['north','south','center', 'east','west'];
                var tmpPre = this.layoutOptions.facetPrefix;
                for(var i = 0 ; i < tmpAll.length ; i++){
                    var tmpArea = tmpAll[i];
                    if( this.layoutOptions[tmpArea] !== false){
                        tmpRet += '<div facet="' + tmpPre + ':' + tmpArea+ '" class="middle-' + tmpArea+ '"></div>';    
                    }
                }
                return tmpRet;
            };

            this.parentEl = this.app.getByAttr$({ group: "app:pages", item: this.pageName });
            this.parentEl.html(this.getLayoutHTML());

            if (typeof (this._onInit) == 'function') {
                this._onInit(this.app)
            };

            if (this.layoutOptions && this.layoutConfig) {
                this.layoutSpot = ThisApp.getByAttr$({ group: ThisApp.pagesGroup, "item": this.pageName });
                this.layout = this.layoutSpot.layout(this.layoutConfig);
            };

        }

        //--- Example of how to interact with theApp or ActionAppCore.app
        /*
        To register actions not handled by action handler (prefixed:)
            theApp.registerAction("logs:refreshMessageCenter", refreshMessageCenter);
            theApp.registerAction("logs:clearMessageCenter", clearMessageCenter);

        To subscribe to application level messages ...
           theApp.subscribe("message:sent", refreshMessageCenter)
        */


    }



    //---- Internal Stuff ---------------------
    /*
    function registerPage() {
        if (typeof (me.options.app) == 'object') {
            ThisApp = me.options.app;
            if (me.pageName != '' && ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent("app:" + me.pageName, this);
            }
        }
    }
     */
    me.runAction = runAction;
    function runAction(theAction, theSourceObject) {
        var tmpAction = theAction || '';
        tmpAction = tmpAction.replace((this.pageNamespace + ":"), '');
        if (typeof (this[tmpAction]) == 'function') {
            this[tmpAction](tmpAction, theSourceObject);
        } else if (typeof (me[tmpAction]) == 'function') {
            me[tmpAction](tmpAction, theSourceObject);
        }
    }

    function onActivateThisPage() {
        //-- Runs _onFirstActivate one time, 
        //    ... then calls _onActivate sucessive times
        //  _onActivate NOT CALLED the first time, 
        //   ... call manually if needed from _onFirstActivate
        if (!this._activatedFlag) {
            this._activatedFlag = true;
            if(typeof(this._onFirstActivate) == 'function'){
                this._onFirstActivate(this.app);
            }
        } else if(typeof(this._onActivate) == 'function'){
            this._onActivate(this.app);
        }
    }
    
    return me;

})(ActionAppCore, $);
