/*New Code Added Date:19 MAr 2013 7:42
 Purpose: This method is used to get the querystring value
 */
$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name) {
        return $.getUrlVars()[name];
    }
});
/*End of New Code Added Date:20 feb 2013*/

var AccoApp = AccoApp || {};

AccoApp.isLocal = (window.location.host.indexOf("localhost")!= -1
    ||  window.location.host.indexOf("127.0.0.1") != -1
    ||  window.location.protocol.indexOf("file:")!= -1);
AccoApp.appBaseUrl= "";
AccoApp.serviceBaseUrl =
    (AccoApp.isLocal)
        ? "test/"
        : AccoApp.appBaseUrl+"/_vti_bin/Accolade.Enterprise.SharePoint/";
AccoApp.userProfile = null;
AccoApp.userSession = {};
AccoApp.TOSAccepted = false;
AccoApp.cache = {};

/** Define the services we need for this page */

var HomeRouter = Backbone.Router.extend({
    routes: {
        "inbox"                 : "readInbox",
        "readMessage/:id"       : "readMessage",
        "archiveMessage/:id"    : "markArchive",
        "message/dismiss/:id"   : "dismissMessage",

        "myaccount"             : "myAccount",

        "draftBox"              : "readDrafts",
        "readdraftMessage/:id"  : "readdraftMessage",
        "editDraft/:id"         :"editDraft",
        "draft/delete/:id"      :"deleteDraft",
        "saveDraft"             :"saveDraft",
        "saveDraft/:id"             :"saveDraft",
        "updateDraft/:id"       :"updateDraft",

        "archiveBox"            : "readArchive",
        "readarchiveMessage/:id": "readarchiveMessage",
        "archive/dismiss/:id"   : "dismissArchive",
        "sentBox"           : "sentMessages",
        "readSentMessage/:id": "readSentMessage",

        "benefits/:subid"    : "benefits",
        "readNotice/:id"     : "readNotice",
        "compose/:isreply"   : "compose",
        "compose"   : "compose",

        "send/:id"           : "sendMessage",
//        "save/:id"           : "saveMessage",
        "attachment/:id":       "attachment",
        "attachment"    :       "attachment",

        "Filepost":"Filepost",
        "Cancel":"Cancel",
        "*actions": "defaultRoute" // matches http://example.com/#anything-here

    },

    // handler to check logged in before any action
    before: function( route, params ) {
        if ( ! AccoApp.TOSAccepted ){
            document.location.href = "#";
            //stop route;
            return false;
        }
        return true;

    }
    //    "compose/:isReply":"compose",
});

var Services = Services || {};

Services = {
    NoticeService : {
        url : AccoApp.isLocal ? "test/NoticeTest.json":AccoApp.serviceBaseUrl+"NewsService.svc/NoticeHeaders/3"
    },
    NoticeDetailService : {
        url : AccoApp.isLocal ? "test/NoticeDetailTest": AccoApp.serviceBaseUrl+"NewsService.svc/NoticeItem"
    },
    HealthAssistantService : {
        url : AccoApp.isLocal ? "test/HealthAssistant.json" : AccoApp.serviceBaseUrl + "ProfileService.svc/HealthAssistant"
    },
    AccountByUrl : {
        url : AccoApp.isLocal ? "test/AccountByUrl.json" : AccoApp.serviceBaseUrl + "ProfileService.svc/AccountByUrl/comcast-dev"
    },
    CheckUnread : {
        url : AccoApp.isLocal ? "test/UnreadMessage.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/UnreadMessageCount"
    },
    RecentMessage : function($start, $limit ){
        return {url : AccoApp.isLocal ? "test/RecentMessage.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/InboxFolder/" + $start+ "/limit/" + $limit};
    },
    SentMessage : function($start, $limit ){
        return {url : AccoApp.isLocal ? "test/SentMessage.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/SentFolder/" + $start+ "/limit/" + $limit};
    },
    GetAllowedRecipients:{
        url : AccoApp.isLocal ? "test/GetAllowedRecipientsTest.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/AllowedRecipients"
    },
    GetAllowedRegarding:{
        url : AccoApp.isLocal ? "test/GetAllowedRegardingTest.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/AllowedRegarding"
    },
    GetFolderMessage:{
        url: AccoApp.isLocal ? "test/Message" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/Message"
    },

    GetMessageDetail:function($MessageId){
        return{url: AccoApp.isLocal ? "test/Messages/" + $MessageId : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/Message/"+$MessageId};
    },
    GetMessageDataDetail:function($MessageId){ // message for Draft
        return{url: AccoApp.isLocal ? "test/Messages/Drafts/" + $MessageId  : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/MessageData/"+$MessageId};
    return{url: AccoApp.isLocal ? "test/Messages/Drafts/" + $MessageId  : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/MessageData/"+$MessageId};

    },

    MembershipService:{
        GetCurrentProfile:{
            url: AccoApp.isLocal ? "test/UserProfile.json" : AccoApp.serviceBaseUrl + "ProfileService.svc/Profile"
        },
        ChangeUsername : {
            url : AccoApp.isLocal ? "test/ChagneUsername.json" : AccoApp.serviceBaseUrl + "MembershipService.svc/UserName"
        },
        ChangeMail : {
            url : AccoApp.isLocal ? "test/ChagneUsername.json" : AccoApp.serviceBaseUrl + "MembershipService.svc/Email"
        },
        ChangePassword : {
            url : AccoApp.isLocal ? "test/ChangePassword.json" : AccoApp.serviceBaseUrl + "MembershipService.svc/ChangePassword"
        },
        SecurityList : {
            url : AccoApp.isLocal ? "test/SecurityList.json" : AccoApp.serviceBaseUrl + "MembershipService.svc/SecurityQuestions"
        },
        ChangeSecurity : {
            url : AccoApp.isLocal ? "test/ChangeSecurity.json" : AccoApp.serviceBaseUrl + "MembershipService.svc/SecurityQuestion"
        },
        SupportedFunctions : {
            url : AccoApp.isLocal ? "test/SupportedFunctions.json" : AccoApp.serviceBaseUrl + "ProfileService.svc/SupportedFunctionality/myaccount"
        }
    },

    GetUserDraftsMessage : function($start, $limit ){
        return {url : AccoApp.isLocal ? "test/UserDraftsFolder.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/DraftsFolder/" + $start+ "/limit/" + $limit};
    },
    GetUserArchiveMessage : function($start, $limit ){
        return {url : AccoApp.isLocal ? "test/ArchiveMessage.json" : AccoApp.serviceBaseUrl + "SecureMessagingService.svc/ArchiveFolder/" + $start+ "/limit/" + $limit};
    },
    AcceptedTermsOfService: function(deviceId){
        return {url : AccoApp.isLocal ? "test/AcceptedTermsOfService.json" : AccoApp.serviceBaseUrl + "ProfileService.svc/AcceptedTermsOfService/"+ deviceId};

    },
    // messaging function
    ReplyMessage : {url : "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/ReplyToMessage"},
    SendMessage  : {url : "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/NewMessage"},

    SaveDraftMessage : {url : "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/NewMessage"},
    UpdateDraftMessage: {url : "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/UpdateMessage"},
    DeleteDraftMessage : function(messageId){
        return  {url : "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/Message/" + messageId  }} ,
    ArchiveMessage : function(messageId){
        return {url: "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/ArchiveMessage/" + messageId }
    }

};

var uploadFile;

(function ($) {

    function attachBehaviors() {
        $(".menu-link").on("click", toggleAccoladeMenu);
		$('li[class^=menu-] a').on("click", function(){
//            $("body").toggleClass("menu-active");
            $("body").removeClass("menu-active");
        });

        $("button.compose-button").click(function(e){
            $("body").removeClass("menu-active");
            homeRouter.navigate("compose", {trigger:true});
        });
    }

    function toggleAccoladeMenu(e) {
        e.preventDefault();
        $("body").toggleClass("menu-active");
    }


//============ model & view definition
/////////////////////////////////////////////
    window.PageModel = Backbone.Model.extend({
        defaults : {
            Title: 'page',
            Id : ''
        }});

    window.PageView = Backbone.View.extend({
        id:"main-page",
        defaults : {

            template: "<br />"
        },
        __init: function(options){
            _.bindAll(this);
            if ( this.model)
                this.model.on("change", this.render, this);
            $(".page-wrapper").empty();

            var tmp = this.defaults.template;
            if (options && options.template ){
                tmp = options.template ;
            }
            this.template = _.template($(tmp).html());
//            this.render();
        },
        initialize : function(options){
            this.__init(options);
        },

        render : function(){
            //this.subviewsNavigator = new BackStack.StackNavigator({el:'.page-wrapper'});
            $("#main-page").remove();
            this.$el.html(this.template( /*this.model.toJSON() */));
            $(".page-wrapper").append(this.el);
            checkInbox(undefined, ".inbox-count" );
            return this;
        }
    });

    ///////////////////////////////////////
    window.MyAccountPage = PageView.extend ({
        event : {},

        initialize: function(options) {
            this.__init(options);
            this.errTemplate = _.template($("#com_success_notice").html());
        },

        render : function(){
            //this.subviewsNavigator = new BackStack.StackNavigator({el:'.page-wrapper'});
            PageView.prototype.render.apply(this);
            $("#securityCode").append(this.renderSecurityList());
            $("#userName").val(AccoApp.userSession.userName);
            $("#userMail").val("XXXXXXXXXXXX")
            // bind events :
            $(".account-form input").focus(function(e){
                $(".usec").removeClass("focused");
                $(this).closest(".usec").addClass("focused");

            });

            $("#btn-username").click(this.updateUserName);
            $("#btn-usermail").click(this.updateUserMail);
            $("#btn-password").click(this.updatePassword);
            $("#btn-seccode").click(this.updateSecurity);

            if (!AccoApp.userProfile.canChangeUserName()){
                $("#userName").attr("disabled", "disabled").addClass('text-disabled');
            }

            if (!AccoApp.userProfile.canChangeUserMail()){
                $("#userMail").attr("disabled", "disabled").addClass('text-disabled');
            }

            if (!AccoApp.userProfile.canChangePassword()){
                $("#userPasswordOld, #userPasswordNew").attr("disabled", "disabled").addClass('text-disabled');
            }

            if (!AccoApp.userProfile.canChangeSecurityQuestion()){
                $("#securityCode, #securityValue, #userPasswordSec").attr("disabled", "disabled").addClass('text-disabled');
            }
            return this;
        },

        renderSecurityList : function(){
            attrs = this.model.toJSON();
            var options = "<% _.each(GetSecurityQuestionsResult, function(obj) { %> <option sid='<%= obj.Id%>' value='<%= obj.Title%>'><%= obj.Title%></option> <% }); %>";
            renderedOptions = _.template(options, attrs);
            return renderedOptions;
        },

        onSectionFocus: function(e){
            $(".account-form button").slideDown();
            $(e.sourceElement).parent().find("button").slideUp();

        },

        postAjax : function(url, method , param, success, error){
            $.ajax({
                type: method,
                url: url,
                data: param,
                success: success,
                error : error
            });
        },
        // functional routines
        /**
         * @method : POST
         * @param param {currentUserName, newUserName }
         * @return : ChangeUserNameResult
         */
        updateUserName : function(e){
            thisRef = this;
            var param = {
                currentUserName : AccoApp.userSession.userName,
                newUserName : $("#userName").val()

            };
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: Services.MembershipService.ChangeUsername.url,
                data: JSON.stringify(param),
                success: function(response){
                    if (response.ChangeUserNameResult){
                        $(".uname-section .notice-msg").html("Your name changed successfully.");
                        AccoApp.userSession.userName = param.newUserName;
                    }else{
                        $(".uname-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Warning: Your name hasn't changed successfully."}));
                    }
                },
                error : function (response){
                    $(".uname-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Error: Your name hasn't changed successfully."}));
                }
            });
        },

        /**
         * @method : POST
         * @param param {UserName, OldPassword, NewPassword }
         * @return : ChangePasswordResult
         */
        updatePassword : function(e){
            thisRef = this;
            var param = {
                UserName : AccoApp.userSession.userName,
                OldPassword : $("#userPasswordOld").val(),
                NewPassword : $("#userPasswordNew").val()
            };
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: Services.MembershipService.ChangePassword.url,
                data: JSON.stringify(param),
                success: function(response){
                    if (response.ChangePasswordResult){
                        $(".upwd-section .notice-msg").html("Your password changed successfully.");
                        $("#userPasswordNew").val('');
                        $("#userPasswordOld").val('');

                    }else{
                        $(".upwd-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Failure. Check your password. New password must have one digit [0-9], one uppercase and one lowercase letter, one special symbol (!@#$%^&*?), and be between 9-20 characters in length."}));
                    }
                },
                error : function(){
                    $(".upwd-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Error: Service error changing password."}))
                }
            });

        },
        /**
         * @method : POST
         * @param param {UserName, Password, Question, Answer }
         * @param success
         * @param error
         * @return : UpdateSecurityQuestionResult
         */
        updateSecurity : function(e){
            thisRef = this;
            var param = {
                UserName : AccoApp.userSession.userName,
                Password : $("#userPasswordSec").val(),
                Question : $("#securityCode option:selected").text(), //$("#securityCode").val(),
                Answer : $("#securityValue").val()

            };
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: Services.MembershipService.ChangeSecurity.url,
                data: JSON.stringify(param),
                success: function(response){
                    if (response.UpdateSecurityQuestionResult){
                        $(".usec-section .notice-msg").html("Security question changed successfully.");
                        $("#userPasswordSec").val("");
                        $("#securityValue").val("");

                    }else{
                        $(".usec-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Warning: Security question hasn't changed successfully."}));
                    }
                },
                error : function(){
                    $(".usec-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Error: Security question hasn't changed successfully."}));
                }
            });
        },
        /**
         * @method : POST
         * @param param {xxxx }
         * @return : xxxxxxxxx
         */

        updateUserMail : function(e){
            thisRef = this;
            var param = {

            };
            $.ajax({
                type: "POST",
                url: Services.MembershipService.ChangeMail.url,
                data: JSON.stringify(param),
                success: function(response){
                    if (response.ChangeUserNameResult){
                        $(".umail-section .notice-msg").html("Your mail address changed successfully.")
                    }else{
                        $(".umail-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Warning: Your mail address hasn't changed successfully."}))
                    }
                },
                error : function(){
                    $(".umail-section .notice-msg").html(thisRef.errTemplate({content:"", title:"Error: Your mail hasn't changed successfully."}))
                }
            });

        }
    });

    window.UserAccountModel = Backbone.Model.extend({
        initialize: function () {
            this.fetch();
            //  this.on("change:xxxx", this.onXxxxChanged);
        },
        fetch : function () {
            thisRef = this;
            jQuery.ajaxSetup({async:false});
            $.get(Services.MembershipService.GetCurrentProfile.url, function(data){
                thisRef.set(data.GetProfileResult);
                AccoApp.userSession.userName = data.GetProfileResult.UserName;
            });

            $.get(Services.MembershipService.SupportedFunctions.url, function(data){
                thisRef.set(data)
            })

            $.get(Services.MembershipService.SecurityList.url, function(data){
                thisRef.set(data);
            })
            jQuery.ajaxSetup({async:true});

            $('.menu-benefits a').attr('href', '#benefits/' + this.get("SubId"));
        },

        isSupported : function(funcname){
            return _.contains(this.get("GetSupportedFunctionalityResult"), funcname);
        },
        canChangeUserName : function() { return this.isSupported("ChangeUsername")},
        canChangeUserMail : function() { return this.isSupported("Email")},
        canChangePassword : function() { return this.isSupported("ChangePassword")},
        canChangeSecurityQuestion : function() { return this.isSupported("ChangeSecurityQuestion")},

        isFederated : function(){
            return this.get("IsFederated");
        }
    });

    /////////////////////////////////////////////
    var NoticeItemModel = Backbone.Model.extend({
        defaults : {
            Title   : '',
            Id   : ''
        }
    });

    var NoticeItemView = Backbone.View.extend({
        tagName   : 'li',
        events     : {
            'click' : 'showNoticeModal'
        },

        showNoticeModal : function () {
            //console.log("Notice item " + this.model.get("Id"));
            $('#NoticeDetailDialog #NoticeDetail').remove();
            var homeNoticeModel = new NoticeDetailModel({ Id : this.model.get("Id")});
            var homeNoticeView = new NoticeDetailView({model : homeNoticeModel});

        },

        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<a href="#" id="notice_<%= Id %>"><%= Title %></a>');

        },
        render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    ////////////////////////////////
    var MsgItemModel = Backbone.Model.extend({
        defaults: {
            ContentPreview:'',
            Id : ''
        }
    });

    var MsgItemView = Backbone.View.extend({
        tagName   : 'li',
        events     : {
            'click' : 'showNoticeModal'
        },

        showNoticeModal : function () {
            //console.log("message Itme" + this.model.get("Id"));
            $('#NoticeDetailDialog #NoticeDetail').remove();
       },
        //className : "new",

        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<a href="#readMessage/<%= Id %>"><%= ContentPreview %></a>');

        },
        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';
            $(this.el).html( this.template(attrs) ).addClass(clsname);
            return this;
        }
    });

    ///////////// global collection types ///////
    window.InboxCollection = Backbone.Collection.extend({
        model: MsgItemModel,
        url: function () { return Services.RecentMessage(this.start,this.limit).url},
        parse: function(data) {
            return data.GetUserInboxFolderResult.Items;
        },
        start: 0,
        limit: 10

    });

    window.SentMsgCollection = Backbone.Collection.extend({
        model: MsgItemModel,
        url: function () { return Services.SentMessage(this.start,this.limit).url},
        parse: function(data) {
            return data.GetUserSentFolderResult.Items;
        },
        start: 0,
        limit: 10

    });

    window.MsgListView = Backbone.View.extend({
        id: 'recent-messages',
        tagName : 'ul',

        initialize : function(){
            _.bindAll(this);

            this.collection.bind('add', this.addItemHandler);

        },

        load : function(){
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new MsgItemView({model:model});
            myItemView.render();
            $(this.el).append(myItemView.el);
        },

        loadCompleteHandler : function(){
            //console.log('MSGList everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            $('#topMessages').append($(this.el));
            return this;
        }
    });


//== used at inbox page {
    /////////////////////////////
    var InboxItemView = Backbone.View.extend({
        tagName   : 'div',
        events     : {},

       //className : "new",

        initialize : function(){
            _.bindAll(this);
            /*New Code Added Date:20 Feb2013 id=<%=Id%>"  */
            this.template = _.template('<dt><%=Title %><div class="message-header-date"><%= Date %></div></dt> <dd><a id="<%=Id%>" href="#readMessage/<%=Id%>"><%= ContentPreview %>...</a></dd>');
            /*End of new  Code Added Date:20 Feb2013 */
        },

        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';

            dmatch = attrs.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){		// sample format : December 8, 2012 5:42 PM
                attrs.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
            }



            $(this.el).append( this.template(attrs) ).find('dd').addClass(clsname);
            return this;
        }
    });

    window.InboxListView = Backbone.View.extend({
        id: 'recent-messages',
        tagName : 'dl',
        initialize : function(){
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);

        },
        isLoading: false,
        load : function(){
            this.loadResults();

        },
        loadResults: function () {
            var that = this; // we are starting a new load of results so set isLoading to true
            this.isLoading = true; // fetch is Backbone.js native function for calling and parsing the collection url
            this.collection.fetch({
                add: true,
                success: function () {
                    that.loadCompleteHandler();
                    that.isLoading = false;
                },
                error: that.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new InboxItemView({model:model});
            myItemView.render();
            $(this.el).append($(myItemView.el).html());
        },

        loadCompleteHandler : function(){
            //console.log('Awesome everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            $('#message-container').append($(this.el));
            return this;
        }
    });
////////////////
var SentItemView = Backbone.View.extend({
        tagName   : 'div',
        events     : {},

       //className : "new",

        initialize : function(){
            _.bindAll(this);
            /*New Code Added Date:20 Feb2013 id=<%=Id%>"  */
            this.template = _.template('<dt><%=Title %><div class="message-header-date"><%= Date %></div></dt> <dd><a id="<%=Id%>" href="#readSentMessage/<%=Id%>"><%= ContentPreview %>...</a></dd>');
            /*End of new  Code Added Date:20 Feb2013 */
        },

        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';

            dmatch = attrs.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){       // sample format : December 8, 2012 5:42 PM
                attrs.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
            }



            $(this.el).append( this.template(attrs) ).find('dd').addClass(clsname);
            return this;
        }
    });
   window.SentListView = Backbone.View.extend({
        id: 'recent-messages',
        tagName : 'dl',
        initialize : function(){
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);

        },
        isLoading: false,
        load : function(){
            this.loadResults();

        },
        loadResults: function () {
            var that = this; // we are starting a new load of results so set isLoading to true
            this.isLoading = true; // fetch is Backbone.js native function for calling and parsing the collection url
            this.collection.fetch({
                add: true,
                success: function () {
                    that.loadCompleteHandler();
                    that.isLoading = false;
                },
                error: that.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new SentItemView({model:model});
            myItemView.render();
            $(this.el).append($(myItemView.el).html());
        },

        loadCompleteHandler : function(){
            
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            $('#sent-message-container').append($(this.el));
            return this;
        }
    });

    ////////////////////////////////////////////////////////
    MessageDetailModel = Backbone.Model.extend({
        initialize: function () {
            modelRef = this;
            this.fetch();

        },
        fetch : function (options) {

            typeof(options) != 'undefined' || (options = {});
            options.error = this.fetchError;
            Backbone.Model.prototype.fetch.call(this,options);
        },
        fetchError : function () {
            modelRef.set({
                Content: "Message read error",
                From: "",
                To: "",
                Header:{Date:"Unknown Error"},
                Regarding: "",
                Error:true
            });
        },
        parse : function (response) {
            var data = response.GetConversationByMessageIdResult[0];
            return data;

        },

        url : function () {
            return Services.GetMessageDetail(this.attributes.Id).url;
        }

    });

    MessageDetailView = PageView.extend( {
        events : {
            "click #MessageDetailDialog .prev-message-btn" : "readPrevMsg",
            "click #MessageDetailDialog .next-message-btn" : "readNextMsg"
        },

        initialize : function() {
            this.__init();
            this.template = _.template($('#page-template-messagedetail').html());

        },
        render : function(){

            t = this.model.toJSON()
            attrs = $.extend(true, {},  t);

            dmatch = attrs.Header.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                try {
                    attrs.Header.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
                } catch (e) {}
            }

            $(this.el).html( this.template( attrs ) );

            $(".page-wrapper").append(this.$el);

            if ( attrs.Error){ //error screen
                $("#messageDate").html("Unknow Message:").addClass('message-error');
                $("#messagecontent").html(attrs.Content).addClass('message-error');
                // and remove reply bar :
                $(".inbox-controls-container").hide();
            }

            $('#btnreply').attr('href','#compose/'+this.model.get("Id")+'');
            $('#btnArchive').attr('href','#archiveMessage/'+this.model.get("Id")+'');

            $('#btndismissmsg').attr('href',"#message/dismiss/"+ this.model.get("Id")+'');
            if ( true || AccoApp.userProfile.get("Id") == this.model.get("Id")){
                // parent = sent
                $('#btndismissmsg').show();
                $('#btndismissmsg').attr('data-next',"#sentBox");

            }else{ // inbox
                $('#btndismissmsg').hide();//attr('href',"#message/dismiss/"+ this.model.get("Id")+'');
                $('#btndismissmsg').attr('data-next',"#inbox");

            }
            $("#showdisclaimer").click(
                function (e) { 
                    $(".disclaimerText").toggleClass('is-visible');
                }
            );

            checkInbox(undefined, ".inbox-count" );
            return this;
        },

        goto : function(cmd){
            loadMessages();
            thisRef = this;
            $cur =0;


            for (var idx = 0; idx < AccoApp.currentMessages.length; idx ++){
                if ( AccoApp.currentMessages.models[idx].get("Id") == thisRef.model.get("Id") ){
                    $cur = idx;
                    break;
                };
            }
            if ( cmd =="next"){
                $cur = $cur +1;
            }else if ( cmd == "prev"){
                $cur = $cur + (AccoApp.currentMessages.length-1);
            }
            $cur = $cur % AccoApp.currentMessages.length;

            window.homeRouter.navigate("readMessage/" + AccoApp.currentMessages.models[$cur].get("Id"), {trigger:true});
            /*this.model.set("Id", AccoApp.currentMessages.models[$cur].get("Id"));
             */
//            this.model = AccoApp.currentMessages.models[$cur];
//            this.render();

        },

        readNextMsg : function(e){
            e.preventDefault();
            this.goto("next");

        },

        readPrevMsg : function(e){
            e.preventDefault();
            this.goto("prev");
        }

    });

    /*User Draft Message Section Created Date:26 feb2013*/
    //////////////////////////////////////
    var DraftMsgItemModel = Backbone.Model.extend({
        defaults: {
            ContentPreview:'',
            Id : ''
        }
    });

    var DraftMsgItemView = Backbone.View.extend({
        tagName   : 'li',
        events     : {
            'click' : 'showNoticeModal'
        },

        showNoticeModal : function () {
            $('#NoticeDetailDialog #NoticeDetail').remove();


        },
        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<a href="#readdraftMessage/<%= Id %>"><%= ContentPreview %></a>');

        },
        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';
            $(this.el).html( this.template(attrs) ).addClass(clsname);
            return this;
        }
    });

    window.DraftCollection = Backbone.Collection.extend({
        model: DraftMsgItemModel,
        url: Services.GetUserDraftsMessage(0,4).url,
        parse: function(data) {

            return data.GetUserDraftsFolderResult.Items;
        },
        initialize: function(models, options) {

            if (options.limit) {
                this.url = Services.GetUserDraftsMessage(0,options.limit).url;
            }
        }
   });

    var DraftItemView = Backbone.View.extend({
        tagName   : 'div',
        events     : {},
        //className : "new",

        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<dt><%=Title %> <div class="message-header-date"><%= Date %></div></dt> <dd><a id="<%=Id%>" href="#readdraftMessage/<%=Id%>"><%= ContentPreview %>...</a></dd>');
        },

        render : function(){
            attrs = this.model.toJSON();
            clsname =!attrs.HasRead ? 'new' : '';
            dmatch = attrs.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                attrs.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
            }
            $(this.el).html( this.template(attrs) ).find('dd').addClass(clsname);
            return this;
        }
    });

    window.DraftListView = Backbone.View.extend({
        id: 'Draft-messages',
        tagName : 'dl',

        initialize : function(){
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);
        },

        load : function(){
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new DraftItemView({model:model});
            myItemView.render();
            $(this.el).append($(myItemView.el).html());
        },

        loadCompleteHandler : function(){
            //console.log('Awesome everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){

            $('#draft-message-container').append($(this.el));
            return this;
        }
    });

    DraftMessageDetailModel = MessageDetailModel.extend({
        initialize: function () {
            modelRef = this;
            this.fetch();
        },

        url : function () {
            return Services.GetMessageDataDetail(this.attributes.Id).url;
        },
        parse : function (response) {
            var data = response.GetMessageResult;
            return data;
        }
    });

    DraftMessageDetailView = PageView.extend( {
        events : {
            "click #DraftMessageDetailDialog .prev-message-btn" : "readPrevMsg",
            "click #DraftMessageDetailDialog .next-message-btn" : "readNextMsg"
        },

        initialize : function() {
            this.__init();
            this.template = _.template($('#page-template-draft-messagedetail').html());

        },

        render : function(){
            t = this.model.toJSON()
            attrs = $.extend(true, {},  t);
             dmatch = attrs.Header.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                try {
                    attrs.Header.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
                } catch (e) {}
            }

            $(this.el).html( this.template( attrs ) );

            $(".page-wrapper").append(this.$el);

            if ( attrs.Error){ //error screen
                $("#messageDate").html("Unknow Message:").addClass('message-error');
                $("#messagecontent").html(attrs.Content).addClass('message-error');
                $(".inbox-controls-container").hide();
            }

            $('#btneditdraft').attr('href','#editDraft/'+this.model.get("Id")+'');
            $('#btnDeleteDraft').attr('href','#draft/delete/'+this.model.get("Id")+'');
            // checkInbox(undefined, ".inbox-count" );
            return this;
        },

        goto : function(cmd){
            loadDraftMessages();
            thisRef = this;
            $cur =0;
            for (var idx = 0; idx < AccoApp.currentMessages.length; idx ++){
                if ( AccoApp.currentMessages.models[idx].get("Id") == thisRef.model.get("Id") ){
                    $cur = idx;
                    break;
                };
            }
            if ( cmd =="next"){
                $cur = $cur +1;
            }else if ( cmd == "prev"){
                $cur = $cur + (AccoApp.currentMessages.length-1);
            }
            $cur = $cur % AccoApp.currentMessages.length;

            window.homeRouter.navigate("readdraftMessage/" + AccoApp.currentMessages.models[$cur].get("Id"), {trigger:true});
        },

        readNextMsg : function(e){
            e.preventDefault();
            this.goto("next");

        },

        readPrevMsg : function(e){
            e.preventDefault();
            this.goto("prev");
        }

    });
    /*End of Drafe Section*/

    /*----Archive Message Section---------------------------*/
    var ArchiveMsgItemModel = Backbone.Model.extend({
        defaults: {
            ContentPreview:'',
            Id : ''
        }
    });

    var ArchiveItemView = Backbone.View.extend({
        tagName   : 'div',
        events     : {},
        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<dt><%= Title %><div class="message-header-date"><%= Date %></div></dt> <dd><a id="<%=Id%>" href="#readarchiveMessage/<%=Id%>"><%= ContentPreview %>...</a></dd>');
        },

        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';
            dmatch = attrs.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                attrs.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
            }
            $(this.el).html( this.template(attrs) ).find('dd').addClass(clsname);
            return this;
        }
    });

    window.ArchiveCollection = Backbone.Collection.extend({
        model: ArchiveMsgItemModel,
        url: Services.GetUserArchiveMessage(0,4).url,
        parse: function(data) {

            return data.GetUserArchiveFolderResult.Items;
        },
        initialize: function(models, options) {

            if (options.limit) {
                this.url = Services.GetUserArchiveMessage(0,options.limit).url;
            }
        }

    });

    window.ArchiveListView = Backbone.View.extend({
        id: 'Archive-messages',
        tagName : 'dl',

        initialize : function(){
            _.bindAll(this);

            this.collection.bind('add', this.addItemHandler);

        },

        load : function(){
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new ArchiveItemView({model:model});
            myItemView.render();
            $(this.el).append($(myItemView.el).html());
        },

        loadCompleteHandler : function(){
            //console.log('Awesome everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){

            $('#archive-message-container').append($(this.el));
            return this;
        }
    });

    var ArchiveItemView = Backbone.View.extend({
        tagName   : 'div',
        events     : {},

        initialize : function(){
            _.bindAll(this);
            this.template = _.template('<dt><%= Title %><div class="message-header-date"><%= Date %></div></dt> <dd><a id="<%=Id%>" href="#readarchiveMessage/<%=Id%>"><%= ContentPreview %>...</a></dd>');
        },

        render : function(){
            attrs = this.model.toJSON();
            clsname = !attrs.HasRead ? 'new' : '';
            dmatch = attrs.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                attrs.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
            }
            $(this.el).html( this.template(attrs) ).find('dd').addClass(clsname);
            return this;
        }
    });

    ArchiveMessageDetailModel = MessageDetailModel.extend({
        initialize: function () {
            modelRef = this;
            this.fetch();

        }
    });

    ArchiveMessageDetailView = PageView.extend( {
        events : {
            "click #ArchiveMessageDetailDialog .prev-message-btn" : "readPrevMsg",
            "click #ArchiveMessageDetailDialog .next-message-btn" : "readNextMsg"
        },

        initialize : function() {
            this.__init();
            this.template = _.template($('#page-template-archive-messagedetail').html());

        },

        render : function(){
            t = this.model.toJSON()
            attrs = $.extend(true, {},  t);
            dmatch = attrs.Header.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                try {
                    attrs.Header.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
                } catch (e) {}
            }

            $(this.el).html( this.template( attrs ) );

            $(".page-wrapper").append(this.$el);

            if ( attrs.Error){ //error screen
                $("#messageDate").html("Unknow Message:").addClass('message-error');
                $("#messagecontent").html(attrs.Content).addClass('message-error');
                $(".inbox-controls-container").hide();
            }

            $('#btndismissarchive').attr('href','#archive/dismiss/'+this.model.get("Id")+'');

            $("#showdisclaimer").click(
                function (e) { 
                    $(".disclaimerText").toggleClass('is-visible');
                }
            );
            return this;
        },

        goto : function(cmd){
            loadArchiveMessages();
            thisRef = this;
            $cur =0;
            for (var idx = 0; idx < AccoApp.currentMessages.length; idx ++){
                if ( AccoApp.currentMessages.models[idx].get("Id") == thisRef.model.get("Id") ){
                    $cur = idx;
                    break;
                };
            }
            if ( cmd =="next"){
                $cur = $cur +1;
            }else if ( cmd == "prev"){
                $cur = $cur + (AccoApp.currentMessages.length-1);
            }
            $cur = $cur % AccoApp.currentMessages.length;

            window.homeRouter.navigate("readarchiveMessage/" + AccoApp.currentMessages.models[$cur].get("Id"), {trigger:true});
        },

        readNextMsg : function(e){
            e.preventDefault();
            this.goto("next");

        },

        readPrevMsg : function(e){
            e.preventDefault();
            this.goto("prev");
        }

    });

 /** *** 

 */
    SentMessageDetailModel = MessageDetailModel.extend({
        initialize: function () {
            modelRef = this;
            this.fetch();

        }
    });

    SentMessageDetailView = PageView.extend( {
        events : {
            "click #SentMessageDetailDialog .prev-message-btn" : "readPrevMsg",
            "click #SentMessageDetailDialog .next-message-btn" : "readNextMsg"
        },

        initialize : function() {
            this.__init();
            this.template = _.template($('#page-template-sent-messagedetail').html());

        },

        render : function(){
            t = this.model.toJSON()
            attrs = $.extend(true, {},  t);
            dmatch = attrs.Header.Date.match(/\((\d+)(.*?)\)/);
            if ( dmatch){
                try {
                    attrs.Header.Date = new Date(parseInt(dmatch[1])).setTimezoneOffset('0').toString('MM/dd/yyyy h:mm tt');
                } catch (e) {}
            }

            $(this.el).html( this.template( attrs ) );

            $(".page-wrapper").append(this.$el);

            if ( attrs.Error){ //error screen
                $("#messageDate").html("Unknow Message:").addClass('message-error');
                $("#messagecontent").html(attrs.Content).addClass('message-error');
                $(".inbox-controls-container").hide();
            }

            $('#btndismissSent').attr('href','#sent/dismiss/'+this.model.get("Id")+'');

            checkInbox(undefined, ".inbox-count" );
            return this;
        },

        goto : function(cmd){
            loadSentMessages();
            thisRef = this;
            $cur =0;
            for (var idx = 0; idx < AccoApp.currentMessages.length; idx ++){
                if ( AccoApp.currentMessages.models[idx].get("Id") == thisRef.model.get("Id") ){
                    $cur = idx;
                    break;
                };
            }
            if ( cmd =="next"){
                $cur = $cur +1;
            }else if ( cmd == "prev"){
                $cur = $cur + (AccoApp.currentMessages.length-1);
            }
            $cur = $cur % AccoApp.currentMessages.length;

            window.homeRouter.navigate("readSentMessage/" + AccoApp.currentMessages.models[$cur].get("Id"), {trigger:true});
        },

        readNextMsg : function(e){
            e.preventDefault();
            this.goto("next");

        },

        readPrevMsg : function(e){
            e.preventDefault();
            this.goto("prev");
        }

    });

    /*-----------------End of Archive Message section---------*/

    window.NoticeCollection = Backbone.Collection.extend({
        model: NoticeItemModel,
        url: Services.NoticeService.url,
        parse: function(data) {

            return data.GetNoticeHeadersResult.Items;
        }

    });

    window.NoticeListView = Backbone.View.extend({
        id         : "noticeList",
        tagName     : "ul",

        initialize : function(){
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);

        },

        load : function(){
            this.collection.fetch({
                add: true,
                success: this.loadCompleteHandler,
                error: this.errorHandler
            });
        },

        addItemHandler : function(model){
            var myItemView = new NoticeItemView({model:model});
            myItemView.render();
            $(this.el).append(myItemView.el);
        },

        loadCompleteHandler : function(){
            //console.log('NotieList everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
            throw "Error loading JSON file";
        },

        render : function(){
            $('#noticeList').append($(this.el));
            return this;
        }
    });

    /* Notice Detail */
    NoticeDetailModel = Backbone.Model.extend({
        initialize: function () {
            modelRef = this;
            this.fetch();

        },
        fetch : function () {

            typeof(options) != 'undefined' || (options = {});
            options.success = this.fetchSuccess;
            options.error = this.fetchError;
            Backbone.Model.prototype.fetch.call(this,options);
        },
        fetchSuccess : function (response){
            modelRef.set({
                Content: response.attributes.Content,
                hasRead: response.attributes.Header.hasRead,
                Title: response.attributes.Header.Title,
                Id: response.attributes.Header.Id

            });
        },
        fetchError : function () {
            modelRef.set({
                Content: "",
                hasRead: ""
            });
        },
        parse : function (response) {
            var data = response.GetNoticeItemResult;
            return data;

        },

        url : function () {

            return Services.NoticeDetailService.url + "/" + this.attributes.Id;
        }

    });

    NoticeDetailView = Backbone.View.extend( {
        id      : "NoticeDetail",
        tagName : 'div',
//		el : "#NoticeDetailDialog #NoticeDetail",

        events : {
            "click #NoticeDlgCancelBtn" : toggleNoticeDialog
        },
        initialize : function() {
            _.bindAll(this);
            this.template = _.template($('#modal-template-noticedetail').html());
            this.model.on("change", this.render, this);
            $(".modal-overlay, #NoticeDetailDialog").toggleClass("is-visible");
        },
        render : function(){
            $('#NoticeDetailDialog').append($(this.el));

            $(this.el).append($(this.el).html( this.template( this.model.toJSON() ) ));

            return this;
        }
    });

////////////////////////////////////////////////////////
    var HealthAssistantModel = Backbone.Model.extend({
        id: null,
        // 	url : Services.HealthAssistantService.url,
        url : Services.AccountByUrl.url,

        initialize : function(config) {
            var thisRef = this;
            thisRef.config = config;
            thisRef.params = _.extend({}, thisRef.params, config.params || {});
            thisRef.deferred = this.fetch();

        },
        fetch : function (options) {
            var ajaxOptions = {
                "dataType" 	: "json",
                "cache"    	: false,
                "data"		: this.params
            };
            _.extend(ajaxOptions, options || {});

            Backbone.Model.prototype.fetch.call(this,ajaxOptions);
        },
        parse: function (response) {
            var data = response,
                thisRef = this;
            getAssistantData();
            return data;
        }

    });

    window.HealthAssistantView = Backbone.View.extend({
        templateName :null,
        tagName : 'div',

        initialize : function () {
            _.bindAll(this);
            this.template = _.template($("#health-ass-template").html());


            this.model = new HealthAssistantModel({});
            this.model.on("change", this.render, this);
        },
        render : function() {
            $("#health-assistantcall").append(this.template( this.model.toJSON() ));
            return this;
        }
    });

    function toggleNoticeDialog(e) {
        e.preventDefault();
        $(".modal-overlay, #NoticeDetailDialog").toggleClass("is-visible");
    }
    function messageCheck() {
        var check=true;
        notifications = [];
        if(typeof $("#composeMsgSubject").val() == "undefined" || $("#composeMsgSubject").val() == "") {
            notifications.push("A subject is required.");
            check = false;
        }
        if(typeof $("#composeMsgBody").val()== "undefined" || $.trim($("#composeMsgBody").val()) =="") {
            notifications.push("The message can not be blank.");
            check = false;
        }
        if($("#Recipients_selector").val() =="") {
            notifications.push("The To field is required.");
            check = false;
        }
        if($("#Regardings_selector").val() =="") {
            notifications.push("The Re field is required.");
            check = false;
        }
       /* $(".modal-overlay, #NoticeDetailDialog").toggleClass("is-visible");
        $("#NoticeDetail h3").text("All message fields are required.");
        $("#NoticeDetail p").text(""); */
        if(!check) {
            var nstr ="";
            $.each(notifications, function(k,v) {
               // $("#NoticeDetail p").append(v+"<br>");
               nstr = nstr+ " " + v;
            });
            alert (nstr); 
        }
        return check;
        

    }
/////////////////////////////////////
    function SaveNewMessage(success, fail) {
      
        if (messageCheck()) {
            var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
            var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());

            var parameter = {
                "to": to,
                "regardingUser": re,
                "topic": $("#composeMsgSubject").val(),
                "message": $.trim($("#composeMsgBody").val()),
                "send": "1" };

            $.ajax({
                type: "POST",
                url: "/_vti_bin/Accolade.Enterprise.SharePoint/SecureMessagingService.svc/NewMessage",
                data: JSON.stringify(parameter),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if ( success){
                        success(response);
                    }else{
                        alert("Message Sent Successfully");
                    }
                },
                error: function (xhr, desc, err) {
                    if ( fail){
                        fail(xhr, desc, err);
                    }else{
                        alert("Error " + xhr);
                        alert("Desc: " + desc + "\nErr:" + err);
//                    $("#inboxmessageid").val("");
                    }
                }
            });
            return true;
        } else {
            return false;
        }
    }

    function ReplySaveMessage(id, success, fail)    {
        if (messageCheck()) {
            var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
            var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());

            var parameter= {"messageId":id,"to":to, "message":$.trim($("#composeMsgBody").val()),"send":"1"}
            $.ajax({
                type:"POST",
                url:Services.ReplyMessage.url,
                data:JSON.stringify(parameter),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(response) {
                    if ( success){
                        
                        alert("Message Sent Successfully");
                    }else{
                        alert("Message Sent Successfully");
                    }
                },
                error: function (xhr, desc, err) {
                    if ( fail){
                        fail(xhr, desc, err);
                    }else{
                        alert("Error " + xhr);
                        alert("Desc: " + desc + "\nErr:" + err);
//                    $("#inboxmessageid").val("");
                    }
                }
            });
            return true;
        }else{
           
            return false;
        }
    }

    // create new draft message
    function SaveDraftMessage(parameter, isReply, success, fail)
    {
//        var parameter= {"to":{"Id":$("#Recipients_selector").val()},"regardingUser":{"Id":$("#Regardings_selector").val()},"topic":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
        $.ajax({
            type:"POST",
            url:isReply?Services.ReplyMessage.url : Services.SaveDraftMessage.url,
            data:JSON.stringify(parameter),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async: "false",
            success: function(response) {
                if ( success){
                    success(response);
                }else{
                    alert("Draft Saved Successfully");
                }
            },
            error: function (xhr, desc, err) {
                if ( fail){
                    fail(xhr, desc, err);
                }else{
                    alert("Error " + xhr);
                    alert("Desc: " + desc + "\nErr:" + err);
//                    $("#inboxmessageid").val("");
                }
            }
        });
    }

    function UpdateDraftMessage(parameter, success, fail)
    {
        $.ajax({
            type:"POST",
            url:Services.UpdateDraftMessage.url,
            data:JSON.stringify(parameter),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async: "false",
            success: function(response) {
                if ( success){
                    success(response);
                }else{
                    alert("Draft updated Successfully");
                }
            },
            error: function (xhr, desc, err) {
                if ( fail){
                    fail(xhr, desc, err);
                }else{
                    alert("Error " + xhr);
                    alert("Desc: " + desc + "\nErr:" + err);
//                    $("#inboxmessageid").val("");
                }
            }
        });
    }

    /*End of New Code Added Date:20feb2013*/
    $("#btndecline").click(function () {

        $(".modal-overlay,#uploadfile").removeClass("is-visible");
    });
	
	function win(r) {
		console.log("Code = " + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
	}

	function fail(error) {
		alert("An error has occurred: Code = " = error.code);
	}

    function AddAttachment(id) {
        if(id !=null && id!="" && typeof id!="undefined") {
            var messageId =id;
			if (getCookie("DeviceId") == "undefined") {
				var fileName =$('#fileuploader').val();
				var fileNameTokens = fileName.split("\\");
				CheckFileSize();
				fileName = fileNameTokens[fileNameTokens.length - 1];
				var daform = document.getElementById('uploadfileform');

				var nodeName = $('#fileuploader').attr('name');

				var Uri='/_vti_bin/accolade.enterprise.sharepoint/securemessagingservice.svc/Attachment/' + messageId + '/name/' + fileName + '/rsn/' + nodeName;
				daform.action = Uri;
				var formData = new FormData();
				formData.append('fileNode',document.getElementById('fileuploader').files[0]);
				xhr =new XMLHttpRequest();
				upload = xhr.upload;
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4){
						 $("#fileuploader").removeAttr("MessageID");
						$('#fileuploader').val("");
					}
				};
				xhr.open('POST',Uri,true);
				xhr.send(formData); 
			}else {
				var options = new FileUploadOptions();
				var nodeName = "fileNode";
				options.fileKey="file";
				options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
				options.mimeType="image/jpeg";
				
				var params = new Object();
				params.value1 = "attachment";

				options.params = params;

				var ft = new FileTransfer();
				ft.upload(imageURI, '/_vti_bin/accolade.enterprise.sharepoint/securemessagingservice.svc/Attachment/' + messageId + '/name/' + fileName + '/rsn/' + nodeName, win, fail, options);
			}
            // var jqxhr = $.post(Uri,{data:filename}, function(data) {
            //     alert("File Uploaded Successfully");
            //     $("#fileuploader").removeAttr("MessageID");
            //     $('#fileuploader').val("");

            // }).done(function(data) {
            //     $("#fileuploader").removeAttr("MessageID");
            //     $('#fileuploader').val(""); //debugger;alert("second success");
            //     })
            //   .fail(function(data) {
            //     $("#fileuploader").removeAttr("MessageID");
            //     $('#fileuploader').val(""); alert("Failed to attach");
            //   })
            //   .always(function(data){
            //     $("#fileuploader").removeAttr("MessageID");
            //     $('#fileuploader').val(""); //debugger;alert("finished");
            //     });
               
          /*  $.ajax({
                type: "POST",
                url: Uri,
                enctype: 'multipart/form-data',
                data: {
                    file: fileName
                },
                success: function() {
                     alert("File Uploaded Successfully");
                    $("#fileuploader").removeAttr("MessageID");
                    $('#fileuploader').val("");
                },
                fail: function() {
                     alert("Failure");
                    $("#fileuploader").removeAttr("MessageID");
                    $('#fileuploader').val("");
                }
            }); */

        }
        else{
            alert("please save message first to add attachment");
            $(".modal-overlay,#uploadfile").removeClass("is-visible");
        }
    }

    // this function is only acceptable for AccoApp.regardings & AccoApp.recipients
    function GetMsgPartner(partList, pId){
        return partList.find(function(el){ return el.get("Id") == pId})
    }


//Start it up! =========== start actions
    $(document).ready(function () {
        //health assistant is on every page.
        initApp();
        getUserProfile();

        checkInbox(undefined, ".inbox-count" );
        attachBehaviors();

        window.homeRouter = new HomeRouter; //Home page

        // callback which always called after mathing route call.
        homeRouter.on('all', function(actions) {
            $("body").removeClass("menu-active");
        });

        homeRouter.on('route:myAccount', function (){

            pageview = new MyAccountPage({model:AccoApp.userProfile, template:"#page-template-myaccount"});
            pageview.render();
            $(".home-title").html("My Account");
            $('body').attr('class', 'page-home');
        });

        homeRouter.on('route:defaultRoute', function(actions) {
            var deviceId = null;
            deviceId = getCookie("DeviceId");
            getTOSAccepted(deviceId);

            $(".home-title").text("My Accolade");
            $('body').attr('class', 'page-home');


            if (AccoApp.TOSAccepted) {
                pageview = new PageView({template:'#page-template-home'});
                pageview.render();

                healthAssistantView = new window.HealthAssistantView();

                recentMsgs = new InboxCollection([],{limit:10});
                recentMsgsView = new MsgListView({collection: recentMsgs});
                recentMsgsView.load();

                var noticeCollection = new NoticeCollection();
                window.noticeView = new NoticeListView({collection: noticeCollection});
                noticeView.load();
            } else {
                pageview = new PageView({template:'#page-template-tos'});
                pageview.render();
                //Terms of Service Accept Action
                $("#btnTOSAccept").click(function () {
                    var deviceId = null;
                    deviceId = getCookie("DeviceId");
                    setTOSAccepted(deviceId);
                });
                // disable all links
                $(".menu-link").unbind("click");
                $(".app-footer a").attr("href", "#");
            }

        });

        homeRouter.on('route:readInbox', function() { //read all messages from Inbox
            $(".home-title").html("Inbox");
            $('body').attr('class', 'page-inbox');

            pageview = new PageView({template:'#page-template-inbox'});
            pageview.render();

            inboxMsgs = new InboxCollection([],{limit:5});
            inboxMsgsView = new InboxListView({collection: inboxMsgs});
            inboxMsgsView.load();

        });

        homeRouter.on('route:markArchive', function(id) { //make a message as archived one
            parameter = {}
            $.ajax({
                type:"PUT",
                url:Services.ArchiveMessage(id).url,
                data:"",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async: "false",
                success: function(response) {
                    alert("Message Archived Successfully");
                    homeRouter.navigate("inbox", {trigger:true});
                },
                error: function (xhr, desc, err) {
                    alert("Error " + xhr+ "r\n" +
                        "Desc: " + desc + "\nErr:" + err);

                }
            });

        });

        homeRouter.on('route:sentMessages', function() { //read all messages from Inbox
            $(".home-title").html("Sent Messages");
            $('body').attr('class', 'page-inbox');

            pageview = new PageView({template:'#page-template-sent-Message'});
            pageview.render();
            sentMsg= undefined;
            sentMsgs = undefined;
            sentMsgsView = undefined;
            sentMsgs = new SentMsgCollection([],{limit:5});
            sentMsgsView = new SentListView({collection: sentMsgs});
            sentMsgsView.load();

        });


        homeRouter.on('route:readDrafts', function() { //read all messages from Inbox

            $(".home-title").html("Drafts");
            $('body').attr('class', 'page-inbox');
            pageview = new PageView({template:'#page-template-draft-Message'});
            pageview.render()
            //CHANGE TO DRAFTS FOLDER.
            var draftMsgs = new DraftCollection([],{limit:1000});
            draftMsgsView = new DraftListView({collection: draftMsgs});
            draftMsgsView.load();

        });
        homeRouter.on('route:readdraftMessage', function(id) { //Home page read a message.

            $(".home-title").html("DRAFT");
            $('body').attr('class', 'page-inbox');
            $("#topMessages.message-container").toggleClass("is-visible");
            $("#noticeList").toggleClass("is-visible");
            $(".home-title").text("Read Message");
            $(".readMessage").toggleClass("is-visible")
            var draftmessageItemModel = new DraftMessageDetailModel({Id : id});
            var draftmessageItemView = new DraftMessageDetailView({ model : draftmessageItemModel });


        });

        homeRouter.on('route:editDraft', function(id) { //Home page read a message.

            pageview = new PageView({template:"#page-template-draftedit"});
            pageview.render();
            $("#composeMsgSubject").removeAttr('disabled');
            $(".home-title").text("DRAFT MESSAGE");

            AccoApp.cache.recipientView.render();
            AccoApp.cache.regardingView.render();

            // button settings at this View

            $("#btnUpdateDraft").on('click', function(e){
                //TODO centralize validiation .. hotfix.
               if(messageCheck()) {
                    var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
                    var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());

                    var parameter= {"messageId":id,"to":to, "regarding":re, "subject":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
                    UpdateDraftMessage(parameter, function(response){
                        alert("Draft Saved successfully");
                        homeRouter.navigate("draftBox", {trigger:true});
                    });
                }
            });
            $("#btnAttachFile").attr("href", "#attachment/" + id);
            $("#btnSaveDraft").attr("href", "#saveDraft/" + id);
            $("#btnSendDraft").on('click', function(e){
                if(messageCheck()) {
                    var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
                    var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());

                    var parameter= {"messageId":id,"to":to, "regarding":re, "subject":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"1"};
                    UpdateDraftMessage(parameter, function(response){
                        alert("Message Sent successfully");
                        homeRouter.navigate("draftBox", {trigger:true});
                    });
                } 
            });

        //  var datatest = $("#Recipients_selector").val();
            var Model = Backbone.Model.extend();
            var MessageCollection = Backbone.Collection.extend({
                model: Model,
                url: Services.GetMessageDataDetail(id).url,
                parse: function (response) {
                    return response;
                }
            });


            var stuff = new MessageCollection;
            stuff.fetch({
                success: function (collection, response) {
                    if (response.GetMessageResult != "" || response.GetMessageResult != null) {
                        $("#Recipients_selector").val(response.GetMessageResult.To.Id);
                        $("#Regardings_selector").val(response.GetMessageResult.Regarding.Id);
                        $("#composeMsgSubject").val(response.GetMessageResult.Header.Title);
                        $("#composeMsgBody").val(response.GetMessageResult.Content);
                        if(response.GetMessageResult.IsReply==true) {
                            $("#composeMsgSubject").attr('disabled','disabled');
                        }
                    }
                }
            });


        });

        // delete a draft message
        homeRouter.on('route:deleteDraft', function(id) { //Home page read a message.
            $.ajax({
                type:"DELETE",
                url:Services.DeleteDraftMessage(id).url,
                data:"",
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async: "false",
                success: function(response) {
                    alert("Draft Deleted Successfully");
                    homeRouter.navigate("draftBox", {trigger:true});
                },
                error: function (xhr, desc, err) {
                    alert("Error " + xhr+ "r\n" +
                        "Desc: " + desc + "\nErr:" + err);
                    $("#inboxmessageid").val("");
                }
            });

//            homeRouter.navigate("draftBox", {trigger:true});
        });

        homeRouter.on('route:dismissArchive', function(id) { //Home page read a message.
            homeRouter.navigate("archiveBox", {trigger:true});
        });

        homeRouter.on('route:dismissMessage', function(id) { //Home page read a message.
            homeRouter.navigate($("btndismissmsg").attr("data-next"), {trigger:true});
        });

        // archive functions here:
        homeRouter.on('route:readArchive', function() { //read all messages from Inbox
            $(".home-title").html("Archive");
            $('body').attr('class', 'page-inbox');
            pageview = new  PageView({template:'#page-template-archive-Message'});
            pageview.render()
            //CHANGE TO DRAFTS FOLDER.
            var draftMsgs = new ArchiveCollection([],{limit:1000});
            draftMsgsView = new ArchiveListView({collection: draftMsgs});
            draftMsgsView.load();
           

        });

        homeRouter.on('route:readarchiveMessage', function(id) {

            $(".home-title").html("Archive");
            $('body').attr('class', 'page-inbox');
            $("#topMessages.message-container").toggleClass("is-visible");
            $("#noticeList").toggleClass("is-visible");
            $(".home-title").text("Archive Message");
            $(".readMessage").toggleClass("is-visible")
            var archivemessageItemModel = new ArchiveMessageDetailModel({Id : id});
            var archivemessageItemView = new ArchiveMessageDetailView({ model : archivemessageItemModel });
        });
        homeRouter.on('route:readSentMessage', function(id) {

            $(".home-title").html("Sent");
            $('body').attr('class', 'page-inbox');
            $("#topMessages.message-container").toggleClass("is-visible");
            $("#noticeList").toggleClass("is-visible");
            $(".home-title").text("Sent Message");
            $(".readMessage").toggleClass("is-visible")
            var sentMessageItemModel = new SentMessageDetailModel({Id : id});
            var sentMessageItemView = new SentMessageDetailView({ model : sentMessageItemModel });
        });

        homeRouter.on('route:dismissArchive', function(id) {
            // not found proper function which need to delete an archive msg.
            homeRouter.navigate("archiveBox", {trigger:true});
        });



        homeRouter.on('route:readMessage', function(id) { //Home page read a message.
            $('body').attr('class', 'page-inbox');
            $(".home-title").text("Read Message");

            //console.log("read message logic goes here for id [" +id +"]." );
            var messageItemModel = new MessageDetailModel({Id : id});
            var messageItemView = new MessageDetailView({ model : messageItemModel });

            // AccoApp.getMessageItem(id);
        });

        homeRouter.on('route:readNotice', function(id) {
            var homeNoticeModel = new NoticeDetailModel({ Id : this.model.get("Id")});
            var homeNoticeView = new NoticeDetailView({model : homeNoticeModel});
            $(".home-title").html("INBOX");
            $('body').attr('class', 'page-inbox');
            $("#topMessages.message-container").toggleClass("is-visible");
            $("#noticeList").toggleClass("is-visible");
            $(".home-title").text("Read Message");
            $(".readMessage").toggleClass("is-visible")
            //console.log("read Notice logic goes here for id [" +id +"]." );
        })


        homeRouter.on('route:benefits', function(subid) {//Home page read a message.
            pageview = new PageView({template:'#page-template-benifits'});
            pageview.render();
            $(".home-title").html("Benefits");
            //$("#iframe-benifit").attr('src', 'benefits/benefits_' + subid + '_2013.html');
            $('#benefit_container').load('benefits/benefits_' + subid + '_2013.html');
        });
        //SEND A Message from compose or reply.
        homeRouter.on('route:sendMessage', function(id) {

            if(typeof id != "undefined" && id !="undefined"){ //undefined is the param in the url.
                
                if ( ReplySaveMessage(id) ){
                    homeRouter.navigate("inbox", {trigger:true});
                } else {
                    homeRouter.navigate("compose",{trigger:false});
                }

            } else {
                
                if ( SaveNewMessage() ){
                    homeRouter.navigate("sentBox", {trigger:true});
                } else {
                    homeRouter.navigate("compose",{trigger:false});
                }
            }

        });
        homeRouter.on('route:compose', function(isreply) {
            if ( !isreply ||isreply == "compose"){
                isreply = undefined;
            }

            $('body').attr('class', 'page-inbox');


            pageview = new PageView({template:"#page-template-compose"});
            pageview.render();
            if ( isreply){
                $("#btncancel").attr("href","#readMessage/"+ isreply);
                $("#btnAttachFile").attr("href", "#attachment/" + isreply);
                $("#btnSaveDraft").attr("href", "#saveDraft/" + isreply);
            }
            else{
                $("#btnAttachFile").attr("href", "#attachment");
                $("#btnSaveDraft").attr("href", "#saveDraft");
                $("#btncancel").click(function (e){
                    //e.preventDefault();window.history.back();
                    homeRouter.navigate("inbox", {trigger:true});
                });
            }



            //if(!isreply) { //create compose module.
            //console.log("compose view");
            if($("#Recipients_selector").html() != "undefined")
            {
                $("#Recipients_selector").remove();
            }
            if($("#Regardings_selector").html() != "undefined")
            {

                $("#Regardings_selector").remove();
            }
            $(".home-title").text("Compose");

            AccoApp.cache.recipientView.render();
            AccoApp.cache.regardingView.render();


            if (typeof isreply !="undefined" && isreply !="compose") {
                var id = isreply;

                $("#AttachFile").css("display","inline-block");
                $("#btnsendmail").attr('href','#send/'+isreply+'');
//              var datatest = $("#Recipients_selector").val();
                var Model = Backbone.Model.extend();

                var MessageCollection = Backbone.Collection.extend({
                    model: Model,
                    url: Services.GetMessageDataDetail(isreply).url,
                    parse: function (response) {
                        return response;
                    }


                });
                var stuff = new MessageCollection;


                stuff.fetch({
                    success: function (collection, response) {
                        rDetail = response.GetMessageResult ;// response.GetConversationByMessageIdResult[0];
                        if (rDetail != "" || rDetail != null) {
                            $("#Recipients_selector").val(rDetail.From.Id);
                            $("#Regardings_selector").val(rDetail.Regarding.Id);
                            $("#composeMsgSubject").val(rDetail.Header.Title);
                            $("#composeMsgSubject").attr('disabled','disabled');
                            $("#composeMsgBody").val(rDetail.Content);
                        }
                    }
                });
            }else{
                $("#AttachFile").attr("href","#attachment/id");
                $("#btnsendmail").attr("href","#send/undefined");
                $("#composeMsgSubject").removeAttr('disabled');
                $("#Regardings_selector").val(AccoApp.userProfile.get("Id"));
                $("Recipients_selector").val(AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.Id);
                $("#Recipients_selector option:eq(1)")[0].selected =true;

            }
            //  } // end if !reply
            // if(/iPhone|iPod|iPad/.test(navigator.userAgent) ) {
            //     $("#btnAttachFile").hide();
            // } else {
            //     $("#btnAttachFile").show();
            // }
           
            //     if(window.innerWidth < 320) {
            //         $('input,textarea,password').focus(
            //                 function(e) { 
                                
            //                     $('footer').hide();
            //                     $('.inbox-controls').hide();
            //                 }
            //          );
                    
            //         $('input,textarea,password').blur(
            //                 function(e) { 
            //                     $('footer').show(); 
            //                     $('.inbox-controls').show();

            //                 }
            //         );
            //     }

            
        });

        // depricated : see route:editDraft
        homeRouter.on('route:updateDraft', function(id){
            var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
            var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());
            $("#composeMsgSubject").removeAttr('disabled');
            var parameter= {"messageId":id,"to":to, "regarding":re, "subject":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
            UpdateDraftMessage(parameter, function(response){
                alert("Draft Saved Successfully");
                $("#inboxmessageid").val(response.CreateNewMessageResult.Header.Id);
                $("#fileuploader").attr("MessageID",response.CreateNewMessageResult.Header.Id);
                homeRouter.navigate("draftBox", {trigger:true});
            });
        });

        homeRouter.on('route:saveDraft',function(id){
            var to = GetMsgPartner(AccoApp.recipients, $("#Recipients_selector").val());
            var re = GetMsgPartner(AccoApp.regardings, $("#Regardings_selector").val());
            if(!id) {
                var parameter= {"to":to, "regardingUser":re, "topic":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
                SaveDraftMessage(parameter,false, function(response){
                    alert("Draft Saved Successfully");
                    $("#inboxmessageid").val(response.CreateNewMessageResult.Header.Id);
                    $("#fileuploader").attr("MessageID",response.CreateNewMessageResult.Header.Id);
                    homeRouter.navigate("draftBox", {trigger:true});
                });
            } else {
                var parameter= {"messageId":id,"to":to, "regardingUser":re, "topic":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
                SaveDraftMessage(parameter,true, function(response){
                     alert("Draft Saved Successfully");
                     $("#inboxmessageid").val(response.ReplyToMessageResult.Header.Id);
                     $("#fileuploader").attr("MessageID",response.ReplyToMessageResult.Header.Id);
                     homeRouter.navigate("draftBox", {trigger:true});
                 });
            }
        });

        homeRouter.on('route:attachment', function(id)
        {
           if(messageCheck()){
            if ( !id){

                var parameter= {"to":{"Id":$("#Recipients_selector").val()},"regardingUser":{"Id":$("#Regardings_selector").val()},"topic":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};

                SaveDraftMessage(parameter,false, function(response){
//                    alert("Draft Saved Successfully");
                    id = response.CreateNewMessageResult.Header.Id
                    $("#fileuploader").attr("MessageID",id);
                    homeRouter.navigate("editDraft/" + id, {trigger:true});
                });
//                $(".modal-overlay, #uploadfile").toggleClass("is-visible");
            }

            {
                $("#fileuploader").attr("MessageID",id);

                $(".modal-overlay, #uploadfile").toggleClass("is-visible");
            }
        }

        });
        homeRouter.on('route:Filepost', function()
        {
            if($("#fileuploader").val() !="")
            {

                var messageID= $("#fileuploader").attr("MessageID");
                if(typeof messageID !="undefined" && messageID !="id" && messageID !=null)
                {
                 $('#uploadfileform').submit(function () {
                   
                    return false;
                 });
                    AddAttachment(messageID);
                }
                else{
                    /*    var parameter= {"to":{"Id":$("#Recipients_selector").val()},"regardingUser":{"Id":$("#Regardings_selector").val()},"topic":$("#composeMsgSubject").val(),"message":$.trim($("#composeMsgBody").val()),"send":"0"};
                     SaveDraftMessage(parameter, function(response){
                     AddAttachment(response.CreateNewMessageResult.Header.Id);
                     alert("File Uploaded Successfully");
                     });
                     */
                }
                $(".modal-overlay, #uploadfile").toggleClass("is-visible");
                $("#Acceptterms").removeClass("form-submitted");
            }else
            {
                alert("Please attach file to upload");
                return false;
            }
        });
        homeRouter.on('route:Cancel', function()
        {
            $("#fileuploader").val("");
            $("#fileuploader").removeAttr("MessageID");
            $(".modal-overlay,#uploadfile").removeClass("is-visible");

        });
        Backbone.history.start();
    });
}(jQuery));

function setNativeOptions(deviceId) {
    $('#logout-button').attr('href','/_layouts/Accolade.SharePoint.Login/Logout.aspx?sr=1&isNativeMobileApp=1&deviceId='+deviceId);
}
/** util functions **/
function initApp(){
    //Handle native app options
    var deviceId = null;
    deviceId = getCookie("DeviceId");
    if(deviceId !=null && deviceId != "") {
        setNativeOptions(deviceId);
    }
    var Recipient = Backbone.Model.extend();
    var RecipientsList = Backbone.Collection.extend({
        model : Recipient,
        url : Services.GetAllowedRecipients.url,
        parse : function(response) {
            return response.GetValidRecipientsResult;
        }
    });
    AccoApp.recipients= new RecipientsList();
    var RecipientView = Backbone.View.extend({
        template: _.template($("#Recipients_select_template").html()),
        events: {
            "change #Recipients_selector": "recipientsSelected"
        },
        recipientsSelected: function(){},
        initialize: function(){
            var self = this;
            this.collection.fetch({
                success: function(){
                    //  self.render();
                }
            });
        },
        render: function(){
            $("#pcomposeMsgTo").append(
                this.template({recipients: this.collection.toJSON()})
            );
            return this;
        }
    });
    var recipientview = new RecipientView({collection:AccoApp.recipients});
    AccoApp.cache.recipientView = recipientview;

    var Regarding = Backbone.Model.extend();
    var RegardingList = Backbone.Collection.extend({
        model : Regarding,
        url : Services.GetAllowedRegarding.url,
        parse : function(response) {
            return response.GetValidRegardingResult;
        }
    });


    AccoApp.regardings = new RegardingList();
    var RegardingView = Backbone.View.extend({
        template: _.template($("#Regardings_select_template").html()),
        events: {
            "change #Regardings_selector": "regardingSelected"
        },
        regardingSelected: function(){},
        initialize: function(){
            var self = this;
            this.collection.fetch({
                success: function(){
                    //self.render();
                }
            });
        },
        render: function(){
            $("#pcomposeMsgRe").append(
                this.template({regardings: this.collection.toJSON()})
            );
            return this;
        }
    });
    var regardingview = new RegardingView({collection: AccoApp.regardings});
    AccoApp.cache.regardingView = regardingview;

}
function getUserProfile(){
    if (! AccoApp.userProfile) AccoApp.userProfile = new UserAccountModel();

    
    //$('.menu-benefits a').attr('href', '#benefits/' + AccoApp.userProfile.get("SubId")); // this code moved to UserAccountModel success fetch
}

function callbackLogin(){
    $.get(Services.MembershipService.GetCurrentProfile.url, function(data){
        AccoApp.userSession.userName = data.GetProfileResult.UserName;
//        AccoApp.userSession.company = "Comcast";
    });
}
var aShow = function(daElementStr) {
    return;
    //deprecated
}
function aHide(daElementStr) {
    return;
    //deprecated
}

function checkInbox(interval, container, callback){
    if( typeof interval == 'undefined') {// interval=120000;
        $.getJSON(Services.CheckUnread.url,
            function(data){
                $(container).html(data.GetUnreadMessageCountResult);
                if ( callback) {callback();}
            });

    } else {
        setInterval(function(){
                $.getJSON(Services.CheckUnread.url,
                    function(data){
                        $(container).html(data.GetUnreadMessageCountResult);
                        if ( callback) {callback();}
                    });},
            interval );
    }
}
function CheckFileSize() {
    var reg =/\.(jpg|jpeg|png|gif)$/i;
    var fSize = document.getElementById('fileuploader').files[0];
    uploadFile=fSize;
    var filename=$("#fileuploader").val();
    if (typeof fSize != 'undefined') {
        if (reg.test(filename)) {
            if (fSize.size > 26214400) {
                alert('file size is greater than 25Mb');
                $("#fileuploader").val("");
                return false;
            }
        } else {
            alert("We're sorry, only jpg, gif and png files are allowed.");
            $("#fileuploader").val("");
            return false;
        }
    }
    return true;
}

function loadMessages($limit){
    
        $limit = 1000;
        AccoApp.currentMessages = new InboxCollection([],{limit:$limit});
        AccoApp.currentMessages.fetch({async:false});
    
}
function loadDraftMessages($limit){
   
        $limit = 1000;
        AccoApp.currentMessages = new  DraftCollection([],{limit:$limit});
        AccoApp.currentMessages.fetch({async:false});
    
}
function   loadArchiveMessages($limit)
{
    
        $limit = 1000;
        AccoApp.currentMessages = new ArchiveCollection([],{limit:$limit});
        AccoApp.currentMessages.fetch({async:false});
   
}
function   loadSentMessages($limit)
{
    i
        if ( !$limit )
            $limit = 1000;
        AccoApp.currentMessages = new SentMsgCollection([],{limit:$limit});
        AccoApp.currentMessages.fetch({async:false});
    
}
// Get Cookie Name for Device Id
function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");

    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
    return "undefined"; //if failed to get cookie
}
// Get TOS Status using the service
function getTOSAccepted(deviceId) {
    var uri = Services.AcceptedTermsOfService(deviceId).url;
    $.ajax({
        type:"GET",
        url:uri,
        dataType:"json",
        success: function(response) {
            AccoApp.TOSAccepted = response.GetTermsOfServiceStatusResult;
        },
        error:function(e){
            console.log(e);
        },
        async:false
    });
}
//Set TOS Status using the service
function setTOSAccepted(deviceId) {
    var uri = Services.AcceptedTermsOfService(deviceId).url;
    $.ajax({
        type:"PUT",
        url:uri,
        dataType:"json",
        data:null,
        contentType:"application/json; charset=utf-8",
        success: function(response) {
            AccoApp.TOSAccepted = response.SetTermsOfServiceStatusResult;
            document.location.href = "/pages/mobilesite/home.html";
        },
        error:function(e, textStatus, errorThrown){
            console.log(e);
        },
        async:false
    });
}
function getAssistantData() {
    var uri = Services.HealthAssistantService.url;
    $.ajax({
        type:"GET",
        url:uri,
        contentType:"application/json; charset=utf-8",
        success: function(response) {
            AccoApp.HealthAssistantDetail = response;
            var phone = $('#health-assistantcall.support-callout div a #ha-phone').text();
             $('#health-assistantcall.support-callout div a').attr('href',
                "tel:"+phone+(typeof AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber!='undefined' && AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber!=null
                    ? "" /*"pppppp" + AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber */
                    : ""));
            $('#health-assistantcall.support-callout div a #ha-prompt').html('Tap to call your health assistant, ' +AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.NickName+ '.');
            $('#health-assistantcall.support-callout div a #ha-extension').text(' x '
                +typeof AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber!='undefined' && AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber!=null
                ? AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.PhoneNumber : "");
            $('#health-assistantcall.support-callout div a #ha-profilepic').attr('src','/haimages/' +AccoApp.HealthAssistantDetail.GetHealthAssistantProfileResult.MrmId + '.png');
        },
        error:function(e, textStatus, errorThrown){
            console.log(e);
        },
        async:true
    });
}



