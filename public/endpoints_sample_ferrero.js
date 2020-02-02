commoncallsettings = "maxDegree1=20&maxDegree2=10"

var server = "http://ns27692.ip-91-121-88.eu/EGraphPubmed2";

endpoints =
	{
		suggestion     : "/sample_ferrero_traceability/suggestion.json?=",
		disambiguation : server + "/rest/searchgraphv2/disambiguation?query=",
		getAbstract: "/sample_ferrero_traceability/abstract",
		edgeinfo       : server + "/rest/searchgraphv2/sentence/cluster?",

		highlights     : "./sample/expandQuery.json?getMostProbableSenseSynonyms=true&doStemming=true&query=",

		clearhistory   : "/rest/terms/clearHistory",
		article        : "/rest/terms/getArticle?topic=",
		didyoumean     : "/rest/terms/didYouMean?query=",

		commonconcepts : "/rest/terms/getCommonWords?",
	
		search         : "/sample_ferrero_traceability/graph.json?=",
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
		search         : "/sample_ferrero_traceability/graph2.json?=",
		explore        : "/sample_ferrero_traceability/explore",
		path           : server + "/rest/searchgraphv2/graph?number=30&threshold=1&closesearch=true",
		disambiguation : "/rest/terms/disambiguation2?query=",
		article        : "/rest/terms/getArticle2?topic=",
		add            : server + "/rest/searchgraphv2/graph?number=30&threshold=1"
	}
	
endpointsdefaults = 
	{
	maxDegree1 : 20,
	maxDegree2 : 10,
	//number:20,
	//threshold:0.2
	}