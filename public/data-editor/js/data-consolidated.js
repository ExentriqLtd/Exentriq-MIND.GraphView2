
var sheets_url = '/api/consolidations/';
var statusModal;
var firstTime;
var rowDetailsUrl;
var editable;
var treeview;
var touch = {};
var completeUrl;
var completeRandom;

$( document ).ready(function() {

    initProperties();

    completeUrl = base_url+sheets_url+dataId;
    completeRandom = base_url+sheets_url+dataId;
    completeRandom += "?&rand="+ new Date().getTime();
    // console.log(completeUrl);

    $.get(completeRandom, function(result){
        console.log("CONSOLIDATO", result);
        totalCount = result.count;
        statusResponsePosition = result.status_position;

        var familyEditable = window.parent.checkEditable;
        console.log("FAMILY EDITABLE", familyEditable);

        if(familyEditable == true)
        {
            if((result.editable == 0) == true)
            {
                editable = false;
            }
            else if((result.editable == 1) == true)
            {
                editable = true;
            }
        }
        else
        {
            editable = false;
        }

        if((result.treeview == 0) == true)
        {
            treeview = false;
        }
        else if((result.treeview == 1) == true)
        {
            treeview = true;
        }
        $(".container-buttons .element-counter .number-of-elements .nmbr").text(totalCount);

        var formats = [];
        
        for(var i = 0; i < result.format.length; i++)
        {
            formats.push({interval: result.format[i].column + '2:' + result.format[i].column + totalCount, ordering:result.format[i].format});
        }


        initSpreadsheet(sheets_url, value_change_func, formats, value_delete_func, value_delete_all_func, 'Z', "data_consolidation", editable, result, true, treeview);

        initFilters();
        firstLoad = true;

        function clipUrl(str, to, include) {
            if (include === void 0) {
              include = false;
            }            
            return str.substr(str.indexOf(to) + (include ? to.length : str.length), str.length);
        }
        filtersFromTree = clipUrl(window.location.search, "filters=", true);

        if(filtersFromTree != "")
        {
            var filtersFromTreeArray = [];
            var secondCrop = [];
            var firstCrop = filtersFromTree.split("&");

            for(var i = 0; i < firstCrop.length; i++)
            {
                secondCrop.push(firstCrop[i].split("="));
            }

            for (var i = 0; i < secondCrop.length; i++)
            {
                filtersFromTreeArray.push({name:secondCrop[i][0], value:secondCrop[i][1]});
            }

            $(".filter-open").hide();
            loadSpreadsheet(filtersFromTreeArray, []);
        }
        else
        {
            loadSpreadsheet([], []);
        }
    });

    $(".pagination-button").on('click', '.pag-button', function(e) {
        pageIndex ++;
        booleanOrdering = false;

        if(pageIndex == maxPageIndex)
        {
            $(this).hide();
        }        
        if(filteredContent == true)
        {
            paginationIndex ++;
            pageIndex = 1; 
        }
        if(paginationIndex == paginationMaxIndex)
        {
            $(this).hide();
        }
        
        loadSpreadsheet(filter_params_values, orderedElements);
    });
});