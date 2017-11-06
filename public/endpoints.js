commoncallsettings = "maxDegree1=20&maxDegree2=10"

var server = "http://localhost:8080/EGraphPubmed2";

endpoints =
	{
		suggestion     : server + "/rest/searchgraphv2/suggestion?query=",
		disambiguation : server + "/rest/searchgraphv2/disambiguation?query=",
		getAbstract: server + "/rest/searchgraphv2/node/abstract?",
		edgeinfo       : server + "/rest/searchgraphv2/sentence/cluster?",

		highlights     : "./sample/expandQuery.json?getMostProbableSenseSynonyms=true&doStemming=true&query=",

		clearhistory   : "/rest/terms/clearHistory",
		article        : "/rest/terms/getArticle?topic=",
		didyoumean     : "/rest/terms/didYouMean?query=",

		commonconcepts : "/rest/terms/getCommonWords?",
	
		search         : "/rest/terms/graph",
		add            : "/rest/terms/add",
		remove         : "/rest/terms/remove",
		explore        : "/rest/terms/explore",
		path           : "/rest/terms/path",

		ispdf            : "/rest/terms/isPdf?uri=",
		metadata         : "/rest/terms/getMetadata?uri=",
		documentreader   : "/hariterms/web/viewer.html?file=",
		documentextractor: "/hariterms/article.jsp?uri="
	}

docendpoints = 
	{
		search         : server + "/rest/searchgraphv2/graph?number=20&threshold=1",
		explore        : server + "/rest/searchgraphv2/graph?number=20&threshold=1",
		path           : server + "/rest/searchgraphv2/graph?number=20&threshold=1&closesearch=true",
		disambiguation : "/rest/terms/disambiguation2?query=",
		article        : "/rest/terms/getArticle2?topic=",
		add            : server + "/rest/searchgraphv2/graph?number=20&threshold=1"
	}
	
endpointsdefaults = 
	{
	maxDegree1 : 20,
	maxDegree2 : 10,
	//number:20,
	//threshold:0.2
	}