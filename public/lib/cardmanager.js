

$container   = $("#cardcontainer");
idlist   = [];
cardlist = [];
next     = 0;
topiclist= [];
edgetopiclist = [];
function node2card(node)
	{
    idlist.push(node.id);
    crawl(node.id, false, false, node.label, node.summary, node, null)
	}


function draw(id, root, child, thumb, title, text, node, after,noinfo,remove) {

    var position = idlist.indexOf(id);
    cardlist[position] = {
        id: id,
        root: root,
        child: child,
        thumb: thumb,
        title: title,
        text: text,
        after: after,
        node: node,
        noinfo:noinfo,
        remove:remove
    }
    while (cardlist[next]) {
        card = cardlist[next];
        if(!card.remove)
        	dodraw(card.id, card.root, card.child, card.thumb, card.title, card.text, card.node, card.after,card.noinfo);
        next++;
    }
}

function dodraw(id, root, child, thumb, title, text, node, after,noinfo)
    {
    if ($("#" + id).length)
        return;
    $("#startgraph").show();
    //text = $("<div>" + text + "</div>").text();
    for (var x = 0; x < topiclist.length; x++)
        {
        var topic = topiclist[x];
        text = text.highlightAll(topic,"")
        }
    if(text=="")
    	{
	    text = '<p style="text-align: center; color: #ccc;"> No description available yet </p>';
    	}
    var topicblock=$("<div class=\"topicbars\"></div>");
    for(var x=0; x<node.sortedTopics.length; x++ )
        {
        var topic = node.sortedTopics[x];
        var newblock=$("<div></div>");
        newblock.css(
            {
            display:"inline-block",
            height:7,
            width : Math.floor(100*topic.value/node.totalTopics)+"%",
            background: colorscale(topic.key)
            });
        newblock.attr("data-original-title",topic.key.toUpperCase())
        topicblock.append(newblock);
        }
    
    //var topicsString = "<div>TOPICS</div>" + topicTooltips(+id)
    var exploreAction = ""
	if(!node.expanded)
		exploreAction = '<a class="explore" data-original-title="EXPLORE"><i class="fa fa-sitemap"></i></a>';
	else
		{
		if(node.collapsed)
			exploreAction = '<a class="explore" data-original-title="EXPAND"><i class="fa fa-expand"></i></a>';
		else
			exploreAction = '<a class="explore" data-original-title="COLLAPSE"><i class="fa fa-compress"></i></a>';
		}
    
    var newelement = $('' +
        '<div id="' + id + '" data-title="' + title + '" data-referenceId="' + node.referenceId + '"  data-uri="' + node.articleUri + '" class="piece">' +
        '<div class="card ' + (root ? "root" : "") + ' ' + (child || after ? "child" : "") + '">' +
        (thumb !== "" ? '<div class="thumb" data-thumb="' + thumb + '" style="background-image:url(' + thumb + ')"></div>' : "<br/>") +
        '<h3>' + truncateTitle(title,75,true) + '</h3>' +
        '<div class="actions">' +
        '<a class="centermap" data-original-title="CENTER ON MAP"><i class="fa fa-crosshairs"></i></a>' +
        //'<a class="category" data-original-title=\'' + topicsString + '\'><i class="fa fa-certificate"></i></a>' +
        (bookmarklist[id] ? '<a data-original-title="BOOKMARKED"><i class="fa fa-star" style="color:orange;"></i></a>' : '<a class="bookmark" data-original-title="BOOKMARK"><i class="fa fa-star-o"></i></a>') +
        
        (!noinfo ? '<a class="info" data-original-title="DETAILS"><i class="fa fa-info-circle"></i></a>' : "")  +

        //'<a class="showlinks" data-original-title="Links"><i class="fa fa-link"></i></a>'+
        exploreAction+
        '<a class="remove" data-original-title="HIDE"><i class="fa fa-eye-slash"></i></a>'+
        '<a class="ban" data-original-title="MARK AS IRRELEVANT"><i class="fa fa-ban"></i></a>'+
        //'<a class="closetab" data-original-title="Remove"><i class="fa fa-times"></i></a>'+
        '</div>' +
        '<div class="links">' +
        text +
        '</div>' +

        '</div>' +
        '</div>'
    );
    newelement.find(".links").before(topicblock);
    if (after) {
        if (!superafter) {
            superafter = after;
        }
        newelement.attr("data-parentid", after.attr("id"));

        newelement.css({
            position: "absolute",
            top: $(superafter).css("top"),
            left: $(superafter).css("left"),
        });
        $(superafter)
            .after(newelement);
        superafter = newelement;
    } else {
        $("#cardcontainer")
            .append(newelement)
        //.isotope( 'appended', newelement )

    }

}

function updateCard(nodeId)
	{
	var node = currentRenderer.getNode(nodeId);
	
	var exploreAction = ""
	if(!node.data.expanded)
		exploreAction = '<a class="explore" data-original-title="EXPLORE"><i class="fa fa-sitemap"></i></a>';
	else
		{
		if(node.data.collapsed)
			exploreAction = '<a class="explore" data-original-title="EXPAND"><i class="fa fa-expand"></i></a>';
		else
			exploreAction = '<a class="explore" data-original-title="COLLAPSE"><i class="fa fa-compress"></i></a>';
		}
	console.log("NEW EXPLORE ACTION",exploreAction);
	$("#"+nodeId+" .explore").replaceWith(exploreAction);;
	}

function drawsentence(title, sentences,uri)
    {
    for(var x=0;x<sentences.length;x++)
        {
        var text = sentences[x];
        var newelement = $('' +
	        '<div data-title="' + title + '" data-uri="' + uri + '" class="piece" style="display:none">' +
	            '<div class="card edgecard">' +
	                
	                '<div class="actions">' +
	                    '<a class="bookmark bookclass" data-original-title="BOOKMARK"><i class="fa fa-star-o"></i></a>' +
	                    '<a class="info" data-original-title="VIEW SOURCE"><i class="fa fa-info-circle"></i></a>' +
	                '</div>' +
	                '<div class="links">' +
	                    text +
	                '</div>' +
	                '<div class="edgesource">Source : ' + title + '</div>' +
	            '</div>' +
	        '</div>'
	        );
		$("#edgedata")
        	.append(newelement);
        }


    

    }
function drawcarrot(title, text, url,type)
    {
    if(type=="text")
        {
        text = $("<div>" + text + "</div>").text();
        for (var x = 0; x < topiclist.length; x++)
            {
            var topic = topiclist[x];
            text = text.highlightAll(topic,"");
            };
        if(currentMode == "edge")
	        for (var x = 0; x < edgetopiclist.length; x++)
	            {
	            var topic = edgetopiclist[x];
	            text = text.highlightAll(topic,"");
	            };
        }
    var newelement = $('' +
        '<div data-title="' + title + '" data-url="' + url + '" class="piece">' +
            '<div class="card">' +
                '<h3>' + title + '</h3>' +
                '<div class="actions">' +
                    '<a class="bookmark" data-original-title="BOOKMARK"><i class="fa fa-star-o"></i></a>' +
                    '<a class="info" data-original-title="DETAILS"><i class="fa fa-info-circle"></i></a>' +
                '</div>' +
                '<div class="spacer"></div>' +
                '<div class="links media_'+type+'">' +
                    text +
                '</div>' +
            '</div>' +
        '</div>'
        );

    $("#carrotdata")
        .append(newelement);

    }
function selectCard(nodeId)
	{
	if($("#mainblocks").hasClass("fullsize"))
    	{
	    $("#rightbar .toggle").trigger("click");	
    	}
    $("#mainmethod").trigger("click");
    closeInfo();
    var element = $("#" + nodeId);
    if (element.length)
    	{
        closeEdgeInfo();
        $(".card.selected").removeClass("selected");
        element.find(".card").addClass("selected");
        var scrollto = $('#cardcontainer').scrollTop() - (141) + element.offset().top - 15;
        $('#cardcontainer')
            .stop()
            .animate(
            	{
                scrollTop: scrollto
            	}, 1000);
	    }
	}

function filterCard()
	{
	for(var x=0; x< haridata.nodes.length; x++)
		{
		var node = haridata.nodes[x];
		$("#" + node.id).css("display",node.hidden ? "none" : "block");
		}

	}

function openInfo(nodeId,title,uri)
	{
	if($("#mainblocks").hasClass("fullsize"))
    	{
	    $("#rightbar .toggle").trigger("click");	
    	}
    currentInfo = title;
    currentInfoID = nodeId;
    $(".tooltip").remove();
	$("#infocontainer").addClass("open");
	$("#infoframe").html("");
	$("#infotitle").text(title.toUpperCase());
	$("#infosummary i")
		.css("color","");

	$("#infosummary")
		.css({
			"color":"",
			"background":""
			});
	$("#infosummary")
		.attr("data-original-title","SUMMARIZE");

	var referenceId = "";
    if(nodeId)
        {
        $("#infobookmark").show();
        $("#infobookmark").attr("data-nodeId",nodeId)
        $("#infobookmark").removeAttr("data-title");
        $("#infobookmark").removeAttr("data-uri");
        setBookmarked($("#infobookmark"),bookmarklist[nodeId],true)
        var node = currentRenderer.getNode(nodeId);
        if(node.data.isMetaArticle)
        	{
	        $("#mainmethod")
	        	.addClass("disabled")
	        	
	        $("#hsbing")
	        	.trigger("click");
	        
	        return;
        	}
        referenceId = node.data.referenceId;
        }
    else
        {
        scrolltosentence = $(this).parents()
        $("#infobookmark").removeAttr("data-nodeId");
        $("#infobookmark").attr("data-title",title);
        $("#infobookmark").attr("data-uri",uri);
        $("#infobookmark").hide();
        }

	if(uri && uri.indexOf("hw:")===0)
		highwireInfo(title,uri)
	else
		wikipediaInfo(title,uri,referenceId)
	
	}


function setBookmarked(element,status,dontadd)
    {
    console.log(element.position(),element.offset());
    $("#bookmarkanimation").stop();
    $("#bookmarkanimation").hide();
	$(".fa-cloud-download").removeClass("ping");
    if(status)
        {
        if(!dontadd)
        	{
        	var count = +$(".counter").attr("data-count");
        	count++;
        	$(".counter").attr("data-count",count).text(count);
        	
	        var initialposition = element.offset();
        
	        var endingposition = $(".fa-cloud-download").offset();
	        $("#bookmarkanimation").css(initialposition).show();
	        var distance = (endingposition.left-initialposition.left);
	        var bezier_params = {
			    start: { 
			      x: initialposition.left, 
			      y: initialposition.top, 
			      angle: -45,
			      length : 0.3,
			    },  
			    end: { 
			      x:endingposition.left+8,
			      y:endingposition.top+6, 
			      angle: 135,
			      length : 0.3,
			    }
			  }
			  
			$("#bookmarkanimation").animate({path : new $.path.bezier(bezier_params)},
				{
				duration:2000,
				easing: "easeOutCubic",
				complete:function(){$("#bookmarkanimation").fadeOut()}
				});
			setTimeout(function()
				{
				$(".fa-cloud-download").addClass("ping");
				setTimeout(function()
					{
					$(".fa-cloud-download").removeClass("ping");
					}, 500)
				
				}, 1200);
        	}
        
		
        element.attr("data-original-title","BOOKMARKED");
        
        var star = element.is("i") ? element : element.find("i");
        
        star
            .removeClass("fa-star-o")
            .addClass("fa-star")
            .css("color","orange");
        }
    else
        {
        element.attr("data-original-title","BOOKMARK");
        element.find("i")
            .addClass("fa-star-o")
            .removeClass("fa-star")
            .css("color","");
        }
    }


function closeInfo()
    {
    $(".tooltip").remove();
    $("#infocontainer").removeClass("open");
    $("#pdfviewer").removeClass("open");
    $("#mainmethod").removeClass("disabled").trigger("click");
    }
currentEdgeElement=null;
function openEdgeInfo(edge)
    {
    if($("#mainblocks").hasClass("fullsize"))
    	{
	    $("#rightbar .toggle").trigger("click");	
    	}
    $("#mainmethod").trigger("click");
    closeInfo();
    currentEdgeElement = edge;
    
    $("#edgestart").text(edge.fromNode.data.label);
    $("#edgeend").text(edge.toNode.data.label);
	
	var size = 20;
	var textlength = Math.max(edge.fromNode.data.label.length,edge.toNode.data.label.length)
	if(textlength > 30)
		size= 15;
	if(textlength > 50)
		size= 11;	

	$("#edgestart,#edgeend").css("font-size",size)

    $("#edgedata").html("");
    $("#edgecontainer").addClass("open");
    hariEdgeInfo(edge)
    }
function closeEdgeInfo()
    {
    currentEdgeElement=null;
    if(requests.hariedgeinfo)
    	requests.hariedgeinfo.abort();
    $(".tooltip").remove();
    $("#edgecontainer").removeClass("open");
    $("#mainmethod").removeClass("disabled").trigger("click");
    }

currentMode="main";
function openCarrot(method)
    {
    $("#carrotcontainer").addClass("open");
    $("#carrotdata").html("");
    var search = "";
    var title  = "";
    if($("#edgecontainer").hasClass("open"))
        {
        currentMode = "edge";
        search = currentEdge;
        
        $("#carrotcontrols").hide()
        }
    else if($("#infocontainer").hasClass("open"))
        {
        currentMode = "node";
        search = currentInfo;
        title  = "NODE : " + search;
        $("#carrotcontrols").html('<span id="carrottitle">'+title+'</span>');
        }
    else
        {
        currentMode = "main";
        search = currentSearch;
        title  = "MAIN : " + search;
        $("#carrotcontrols").html('<span id="carrottitle">'+title+'</span>');
        }
    //
    hariCarrot(search,method);
    }
function closeCarrot()
    {
    $(".tooltip").remove();
    $("#carrotcontainer").removeClass("open");
    }

function renderEdgeInfo(data,hasCommonWords)
    {
    if(data.length)
    	{
    	var sentenceids={};
	    $("#edgedata").append('<h4 class="sentencetitle">with the following recommended sources</h4>');
	    for(var x=0;x<data.length;x++)
	        {
	        var sentence = data[x];
	        if(!sentenceids[sentence.id])
	       		drawsentence(sentence.title, sentence.sentence, sentence.uri)
	       	sentenceids[sentence.id] = true;
	        }
    	}
    else if(!hasCommonWords)
    	{
	    $("#mainmethod")
        	.addClass("disabled")
        	
        $("#hsbing")
        	.trigger("click");
    	}
    }

function renderCarrot(data)
    {
    console.log(data)
    if(data.length)
	    {
	    for(var x=0;x<data.length;x++)
	        {
	        var element = data[x];
	        drawcarrot(element.title, element.sentence,element.url,element.type)
	        }
		}
	else
		{
		$("#carrotdata")
        	.append('<h2 style="text-align: center; color: #ccc;"> No results </h2>');
		}
    }

$(document).ready(function() {
    
    $("body").on("mouseenter", ".piece", function()
    	{
        var nodeId = +$(this).attr("id");
        overCard = nodeId;
        //console.log("MOUSE OVER",nodeId);
    	});
    $("body").on("mouseleave", ".piece", function()
    	{
        var nodeId = +$(this).attr("id");
        if(overCard == nodeId);
        	overCard=null;
        //console.log("MOUSE LEAVE",nodeId);
    	});
    $("body").on("click", ".card .centermap", function()
    	{
        var nodeId = +$(this).parents(".piece").attr("id");
        currentRenderer.goToNode(nodeId);
        selectCard(nodeId);
    	});
    $("body").on("click", ".card .explore", function()
        {
        $(".tooltip").remove();
        hideTooltip();
        var nodeId = +$(this).parents(".piece").attr("id");
        tooltipnode = {};
        currentRenderer.toggleNode(nodeId);
        });
    $("body").on("click", ".card .remove", function()
        {
        $(".tooltip").remove();
        hideTooltip();
        var nodeId = +$(this).parents(".piece").attr("id");
        console.log(nodeId);
        currentRenderer.removeNodes(nodeId);
        $("#"+nodeId).remove();
        overCard = null;
        });
	$("body").on("click", ".card .ban", function()
        {
        $(".tooltip").remove();
        hideTooltip();
        var nodeId = +$(this).parents(".piece").attr("id");
        hariRemoveModal(nodeId);
        });
    $("#edgecontainer").on("click", ".card .info", function()
        {
        var nodeId = +$(this).parents(".piece").attr("id");
        var title  = $(this).parents(".piece").attr("data-title");
        var uri    = $(this).parents(".piece").attr("data-uri");
        gotosentence = $(this).parents(".piece").find(".links").first().text().toLowerCase();
        console.log("INFO",nodeId,title,uri);
        if(nodeId && !(uri && uri.indexOf("hw:")===0))
            currentRenderer.goToNode(nodeId);
        openInfo(nodeId,title,uri);
        });
    $("#cardcontainer").on("click", ".card .info", function()
        {
        var nodeId = +$(this).parents(".piece").attr("id");
        var title  = $(this).parents(".piece").attr("data-title");
        var uri    = $(this).parents(".piece").attr("data-uri");
        gotosentence = null;
        console.log("INFO",nodeId,title,uri);
        if(nodeId && !(uri && uri.indexOf("hw:")===0))
            currentRenderer.goToNode(nodeId);
        openInfo(nodeId,title,uri);
        });
    $("#carrotcontainer").on("click", ".card .info ,.card .thumb,.card h3,.card .edgesource, .card img", function()
        {
        console.log("URL");
        var title  = $(this).parents(".piece").attr("data-title");
        var url  = $(this).parents(".piece").attr("data-url");
        showModal(title,url);
        })
	
	
	
    $("#cardcontainer").on("click", ".card .bookmark", function()
        {
        console.log("INFO");
        var nodeId    = +$(this).parents(".piece").attr("id");
        var title     = $(this).parents(".piece").attr("data-title");
        var uri     = $(this).parents(".piece").attr("data-uri");
        var wikititle = title.replace(/ /,"_");
        var url       = "http://en.m.wikipedia.org/wiki/"+wikititle;
        
        
        
        if(uri && uri.indexOf("hw:")===0)
			{
			url = location.origin + endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + uri);
			}
        
        var text      = $(this).parents(".piece").find(".links").html()
		var image     = $(this).parents(".piece").find(".thumb")
		var thumb      = null;
		if(image.length>0)
			{
			thumb = image.attr("data-thumb");
			}
			
		
		
        $(this)
        	.addClass("bookmarked")
        	.removeClass("bookmark");

        setBookmarked($(this),true);

        addNodeBookmark(nodeId,title,url,text,thumb);
        
        
        currentRenderer.goToNode(nodeId);
        });
    $("#infoframe").on("click", ".bookmarksentence", function()
        {
        $(this).removeClass("bookmarksentence")
        var nodeId    = +$("#infobookmark").attr("data-nodeid");
        var title = "";
        var uri   = ""
        if(nodeId)
        	{
	        var node      = currentRenderer.getNode(nodeId);
	        title     = node.data.label;
			uri       = node.data.articleUri;
        	}
        else
        	{
	        title    = $("#infobookmark").attr("data-title");
	        uri    = $("#infobookmark").attr("data-uri");
        	}
        
        
        var wikititle = title.replace(/ /,"_");
        var url       = "http://en.m.wikipedia.org/wiki/"+wikititle;
        
        if(uri && uri.indexOf("hw:")===0)
			{
			url = location.origin + endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + uri);
			}
        
        var text      = $(this).parent().text();

        setBookmarked($(this),true);

        addNodeBookmark(nodeId,title,url,text,null);
        });
    $("#edgecontainer").on("click", ".card .bookmark", function()
        {
        console.log("INFO");
        var title = $(this).parents(".piece").attr("data-title");
        var text  = $(this).parents(".piece").find(".links").html();
        var uri   = $(this).parents(".piece").attr("data-uri");
        var wikititle=title.replace(/ /,"_");
        var url = "http://en.m.wikipedia.org/wiki/"+wikititle;
		if(uri && uri.indexOf("hw:")===0)
			{
			url = location.origin + endpoints.documentreader + encodeURIComponent(endpoints.documentextractor + uri);
			}
		
        $(this).removeClass("bookmark");

        setBookmarked($(this),true);

        addEdgeBookmark(currentEdgeElement,title,url,text);
        });
    $("#carrotcontainer").on("click", ".card .bookmark", function()
        {
        console.log("INFO");
        var title     = $(this).parents(".piece").attr("data-title");
        var url       = $(this).parents(".piece").attr("data-url");
        var text      = $(this).parents(".piece").find(".links").html()


        $(this).removeClass("bookmark");

        setBookmarked($(this),true);
        if(currentMode == "main")
            {
			addNodeBookmark(null,title,url,text);
			}
        if(currentMode == "node")
            {
			addNodeMediaBookmark(currentInfoID,title,url,text);
			}
        else
            {
            addEdgeBookmark(currentEdgeElement,title,url,text);
            }
        });
    $("#infobookmark").on("click", function()
        {
        console.log("INFO");
        var nodeId    = +$(this).attr("data-nodeId");
        var element   = $("#" + nodeId);
        var title     = "";
        var wikititle = "";
        var url       = "";
        var text      = "";
        if(element.length)
            {
            element.find(".bookmark").trigger("click");
            }
        else
            {
            url = "";
            }

        setBookmarked($(this),true);

        });
    $("#hyperselector").on("click","a",function(e)
        {
        e.preventDefault();
        e.stopPropagation();

        if(currentSearch !== "" && !$(this).hasClass("disabled"))
            {
            $("#hyperselector .selected").removeClass("selected");
            $(this).addClass("selected");

            var method = $(this).attr("data-source");

            if(method == "home" )
                {
                closeCarrot();
                }
            else
                {
                openCarrot(method);
                }
            }


        })
	$("body")
		.on("click",".addcommonnode",function()
			{
			var $this = $(this).parent();
			var weight = $this.attr("data-weight");
			var term = $this.attr("data-term");
			
			var right=-Infinity;
			for(var nodeid in supernodeUI)
				{
				var node = supernodeUI[nodeid];
				if(node.pos.x > right)
					right = node.pos.x;
				}
			right += 4000;
			
			var newnodePos = {x:right,y:0};
			var popoverPos = 
				{
				x : ($("#graph").width()/2),
				y: $("#graph").height()/2 
				}
			
			//var firstnode  = ngraph.getNode(currentEdgeElement.fromNode.id);
			//var secondnode = ngraph.getNode(currentEdgeElement.toNode.id);	
				
			ngraph.goTo(
				15,
				ngraph.fixPosition(newnodePos),
				function()
					{
					hariAdd(term,null,null,newnodePos,function(mainnode)
						{
						$this.replaceWith('<span data-nodeid="'+mainnode.id+'" class="existingnode" data-weight="'+weight+'" style="font-size:'+weight/1.5+'px;">'+term+'</span>');
						
						ngraph.graph.addLink(+mainnode.id, currentEdgeElement.fromNode.id , {});
						ngraph.graph.addLink(+mainnode.id, currentEdgeElement.toNode.id, {});
						});
					//hariAddPopover(newnodePos,popoverPos);	
					});
			});	
	$("body").on("click", ".existingnode", function()
        {
        var nodeId = +$(this).attr("data-nodeid");
        currentRenderer.goToNode(nodeId);
        });
	$("#infosummary").on("click",function()
		{
		$(".tooltip").remove();
		
		if($("#infoframe").hasClass("summarized"))
			{
			$("#infosummary")
				.css({
					"color":"",
					"background":""
					});
			$("#infosummary")
				.attr("data-original-title","SUMMARIZE");
			$("#infoframe").removeClass("summarized");
			$("#infoframe .contents > *").show();
			
			$("#infoframe .contents .bookmarkclass").hide();
			}
		else
			{
			$("#infosummary")
				.css(
					{
					"color":"orange",
					"background":"#fafafa"
					});
			$("#infosummary")
				.attr("data-original-title","FULL DOCUMENT");;
			$("#infoframe").addClass("summarized");
			$("#infoframe .contents > *").hide();
			$("#infoframe .highlight,#infoframe .highlightnode,#infoframe .highlightsentence").each(function(i,e)
				{
				$(e).parents("p").show();
				if($(e).parents("p").find(".bookmarkclass").length === 0)
					$(e).parents("p").prepend('<i data-original-title="BOOKMARK" class="fa fa-star-o bookmarksentence bookmarkclass"></i>');
				});
			$("#infoframe .contents i").show();
			}
		});

    $("#infoclose").on("click",closeInfo);
    $("#edgeclose").on("click",closeEdgeInfo);
    
       
    });