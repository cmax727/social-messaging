var LoginMobile = LoginMobile || {};

LoginMobile.isLocal = (window.location.href.indexOf("localhost") != -1
	 ||  window.location.href.indexOf("127.0.0.1") != -1
	 ||  window.location.protocol.indexOf("file:")) != -1;
LoginMobile.appBaseUrl= "/";
LoginMobile.serviceBaseUrl =  
	(LoginMobile.isLocal)
	? "test/" 
	: LoginMobile.appBaseUrl+"_vti_bin/Accolade.Enterprise.SharePoint/";


/** Define the services we need for this page */
var Services = Services || {};
Services = { 
	NewsService : {
		url : LoginMobile.isLocal ? "test/NewsTest.json":LoginMobile.appBaseUrl+"NewsService.svc/LatestNewsHeaders/3"
	}
};


(function ($) {
	


	function toggleNewsDialog(e) {
		e.preventDefault();
		$(".modal-overlay, #NewsDetailDialog").toggleClass("is-visible");
	}

	var NewsItemModel = Backbone.Model.extend({
		defaults : {
			Title   : '',
			Id   : ''
		}
    });
    
	var NewsItemView = Backbone.View.extend({
		tagName   : 'li',
        template   : null,
       
		events : {
			'click': 'showNewsModal'
		},
		showNewsModal: function(){
			console.log(this.model.get("Id"));
			$('#NewsDetailDialog #NewsDetail').remove();
			var myNewsDetail = new NewsDetailCollection();
			var myNewsDetailView = new NewsDetailView({collection: myNewsDetail});
			myNewsDetailView.load();
		},
        initialize : function(){
			_.bindAll(this);
            this.template = _.template('<a href="#"><%= Title %></a>');

        },
        render : function(){
    
			$(this.el).html( this.template( this.model.toJSON() ) );
            return this;
        }
	});

    var NewsCollection = Backbone.Collection.extend({
		model: NewsItemModel,
		url: "test/NewsTest.json",
		parse: function(data) {
			return data.GetNewsHeadersResult.Items;
		},
		
	});

	var NewsListView = Backbone.View.extend({
		id         : "newslist",
        tagName     : "ul",
        events : {
        },
         
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
			var myItemView = new NewsItemView({model:model});
            myItemView.render();
            $(this.el).append(myItemView.el);
        },

        loadCompleteHandler : function(){
			console.log('Awesome everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(e){
			throw "Error loading JSON file";
        },

        render : function(){
			$('#newslist').append($(this.el));
            return this;
        }
	});
   
	

	/* News Detail */

	var NewsDetailHeaderModel = Backbone.Model.extend({
		defaults : {
			Title   : '',
			Id   : ''
		}
    });
    
	var NewsDetailHeaderCollection = Backbone.Collection.extend({
		model: NewsDetailHeaderModel,
	});
	
	var NewsDetailModel = Backbone.Model.extend({
		defaults : function(){
			return {
				Content		: '',
				Header		: new NewsDetailHeaderCollection 
			}
		}
    });

	var NewsDetailCollection = Backbone.Collection.extend({
		model : NewsDetailModel,
		url: "test/NewsItem.json",
		parse: function(data) {
			return data.GetNewsItemResult;
		}
	});
	
	var NewsDetailContentView = Backbone.View.extend({
        template   : null,
       
		events : {
			"click #NewsDlgCancelBtn":  toggleNewsDialog
		},
        initialize : function(){
			_.bindAll(this);
            this.template = _.template($('#newsdetail_template').html());
            this.model.on("change", this.render, this);
        },
        render : function(){
			$(this.el).html( this.template( this.model.toJSON() ) );
            return this;
        }
	});


	var NewsDetailView = Backbone.View.extend({
		id         : "NewsDetail",
        tagName     : "div",
        events : {
        },
         
        initialize : function(){
			_.bindAll(this);
			this.collection.bind('add', this.addItemHandler);
        },
		addItemHandler : function(model){
    			var myItemView = new NewsDetailContentView({model:model});
            myItemView.render();
            $(this.el).append(myItemView.el);
        },
		load : function(){
			this.collection.fetch({
				add: true,
				success: this.loadCompleteHandler,
				error: this.errorHandler
            });
        },  

        loadCompleteHandler : function(){
			console.log('Awesome everything was loaded without errors!');
            this.render();
        },

        errorHandler : function(){
			throw "Error loading JSON file";
        },

        render : function(){
			$('#NewsDetailDialog').append($(this.el));
			$(".modal-overlay, #NewsDetailDialog").toggleClass("is-visible");
            return this;
        }
	});

	$(document).ready(function () {
		 myCollection = new NewsCollection();
    newsView = new NewsListView({collection: myCollection});
    newsView.load();
	});

}(jQuery));
