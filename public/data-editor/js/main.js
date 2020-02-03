var base_url = '';
var session_token = '';
var spreadsheet;
var filter_params = [];
var sheets_url;
var value_change_func;
var value_delete_func;
var value_delete_all_func;
var last_col;
var formats;
var lineCount;
var dataId = '';
var totalCount;
var statusPosition;
var type_of_file;
var statusResponsePosition;
var allColumns;
var documentQueryResult;
var editableFile;
var editablePosition;
var pageSize = 100;
var pageIndex = 1;
var firstLoad;
var dataContainer = [];
var maxPageIndex = 1;
var filteredContent = false;
var firstDataContainer = []; 
var filter_params_values = [];
var colCount;
var paginationIndex = 1;
var paginationTotal;
var paginationMaxIndex;
// var paginatedValues = "";
var backupPaginatedValues;
var nofilter = false;
var noOrdered = false;
var treeView = false;
var treeDetailRowUrl;
var orderedElements = [];

var booleanAction = false;
var booleanOrdering = false;

var error_color = "#660000";
var success_color = "#009900";

var editablePositionArray;
var valueBeforeEditing;
var cellBeforeEditing;

var booleanActionStatus = false;

var arrayForNonEditableRowsValidation = [];
var arrayForNonEditableRowsMultiaction = [];

var timer;

function showLoader(){
  var html = "<div class='container-loading-indicator'><div class='eq-ui-loader-ring' style='position:fixed'><div class='eq-ui-loader-ring-light'></div><div class='eq-ui-loader-ring-track'></div></div></div>"
  $("body").append(html);
}

function hideLoader(){
  $(".container-loading-indicator").remove();
}

function initProperties(){
	var env = $.QueryString["env"];
	var agentId = $.QueryString["agentId"];
	dataId = $.QueryString["dataId"];

	if(env == "STAGE"){
    	base_url = 'http://kbs001exe.exentriq.com:30262/' + agentId;
	}else{
		base_url = 'https://bus001fer.exentriq.com/' + agentId;
		if(agentId == "91055")
			base_url = 'https://bus001sec.exentriq.com/' + agentId;
		if(agentId == "91106")
			base_url = 'https://bus002fer.exentriq.com/' + agentId;	

	}
  session_token = $.QueryString["sid"];
  
  $.ajaxSetup({
    headers:{
       'sessionToken': session_token
    }
  });
}


function v(obj, key){
  if(obj && (obj[key] || obj[key]==0)){
    return obj[key]
  }
  else{
    return null;
  }
}

function setRowColor(row, color){
	$($(".dhx_grid_row")[(row-1)]).css('border', '1px solid '+color);
}
function resetRowsColor(){
	$(".dhx_grid_row").css('border', '');
}
function resetRowColor(row){
	$($(".dhx_grid_row")[(row-1)]).css('border', '');
}

function initHeigth(){
  var wh = window.innerHeight;
  var filters_height = $('.container-header-modal').height();
  var offset = 50;
  var height = (wh - filters_height)- offset;
  //$('#cont').height(height);
}

function initSpreadsheet(sheets_url_p, value_change_func_p, formats_p, value_delete_func_p, value_delete_all_func_p, last_col_p, type_of_file_p, edit_line_p, firstQueryResult, isFirstLoad, treeView_p){

  sheets_url = base_url+sheets_url_p+dataId;
  value_change_func = value_change_func_p;
  formats = formats_p;
  value_delete_func = value_delete_func_p;
  value_delete_all_func = value_delete_all_func_p;
  // last_col = last_col_p;
  type_of_file = type_of_file_p;
  documentQueryResult = firstQueryResult;
  editableFile = edit_line_p;
  firstLoad = isFirstLoad;
  treeView = treeView_p;


  // console.log("EDITABILE?", editableFile);
  maxPageIndex = totalCount / pageSize;
  console.log(maxPageIndex);
  if(maxPageIndex.toFixed() == 0)
  {
    maxPageIndex = 0;
  }
  else
  {
    maxPageIndex = Math.ceil(maxPageIndex);
  }
  console.log(maxPageIndex);
  maxPageIndex = parseInt(maxPageIndex);


  format_definitions = [
    { name: "Common", id: "common", mask: "", example: "2702.31" },
    { name: "Id", id: "sublass_detail", mask: "00", example: "01" },
    { name: "fiscal_year_period", id: "fiscal_year_period", mask: "0.0000", example: "1.2019" },
    { name: "Number", id: "number", mask: "#,##0.00", example: "2702.31" },
    { name: "Percent", id: "percent", mask: "#,##0.00%", example: "27.0231" },
    { name: "Currency", id: "currency", mask: "$#,##0.00", example: "2702.31" }
  ];

  var options =
  {
    toolbarBlocks: [],
    editLine: editableFile,
    formats: format_definitions,
    autoFormat:false,
    menu: false,
    rowsCount: 100 * pageIndex
  }

  spreadsheet = new dhx.Spreadsheet("cont", options);
  spreadsheet.contextMenu.data.remove("lock");
  spreadsheet.contextMenu.data.remove("clear-styles");
  spreadsheet.contextMenu.data.remove("columns");
  spreadsheet.contextMenu.data.remove("clear");
  spreadsheet.contextMenu.data.remove("remove-row");

  spreadsheet.contextMenu.events.on("click", function (id) {

    if (id === "show-history") {
      var cells = spreadsheet.selection.getSelectedCell();
      var row  = cells.split(':')[0].replace(/[a-zA-Z]/g, '');

      var selection = 'A'+row+':'+last_col+row;
      var values = spreadsheet.getValue(selection);
      console.log(values);
      var idElement = values[0];

      if(idElement != "")
      {
        historyDetailRowUrl = sheets_url + "/rows/" + idElement + "/history";

        historyDetailRowUrl += "?&rand="+ new Date().getTime();
  
        var historyModal = window.parent.$("#history-modal");
        var historyModalItem = historyModal.find(".history-item");
        historyModalItem.remove();
        historyModalItem.find(".eq-ui-loader-line").show();
        historyModal.openModal();
  
        $.get(historyDetailRowUrl, function(result){
          console.log(result);
          if(result.length <= 0)
          {
            historyModal.find(".eq-ui-modal-content").find(".no-message-container").remove();
            var msg = "<div class=\"no-message-container\"><div></div><span>There is no history to show at the time</span></div>";
            historyModal.find(".eq-ui-modal-content").append(msg);
          }
          for(var i=0;i<result.length;i++){
            historyModal.find(".eq-ui-modal-content").find(".no-message-container").remove();
            var h = historyModal.find("#history-template").clone();
            h.addClass("history-item");
            
            h.find(".usr-icon").attr("src","/AvatarService?username=" + result[i].author);
            var msg = "<span class=\"bolded-word\">" + result[i].author + ":</span>";
            msg += " " + result[i].action;
            if(result[i].comment != null)
            {
              msg += " (" + result[i].comment + ")";
            }
            
            var formattedDate = new Date(result[i].timestamp);
            var d = formattedDate.getDate();
            var m =  formattedDate.getMonth();
            m += 1;  // JavaScript months are 0-11
            var y = formattedDate.getFullYear();
  
            msg += " on " + d + "/" + m + "/" + y;
            h.find(".details-history-cont").html(msg);
            
            h.addClass("view-history");
            historyModal.find(".eq-ui-modal-content").append(h);
          }
          
          historyModal.find(".eq-ui-loader-line").hide();
          
        });
      }
    }
      
    if (id === "show-detail") {
      var cells = spreadsheet.selection.getSelectedCell();
      var col = cells.split(':')[0].replace(/[0-9]+/g, '');
      var row  = cells.split(':')[0].replace(/[a-zA-Z]/g, '');
      spreadsheet.events.fire("StatusSelected", [col, row]);
    }

    if (id === "tree-view")
    {
      var treeModal = window.parent.$("#tree-modal");

      var cells = spreadsheet.selection.getSelectedCell();
      var row  = cells.split(':')[0].replace(/[a-zA-Z]/g, '');

      var selection = 'A'+row+':'+last_col+row;
      var values = spreadsheet.getValue(selection);
      var idElement = values[0];

      if(idElement != "")
      {
        treeDetailRowUrl = base_url + "/api/kpi/" + idElement + "/tree";
        treeDetailRowUrl += "?&rand="+ new Date().getTime();

        var treeModalItem = treeModal.find("#treeContainer");
        treeModal.find("#treeContainer").html("");
        treeModalItem.find(".eq-ui-loader-line").show();
        treeModal.openModal();

        $.get(treeDetailRowUrl, function(result){
          eval(result);
          window.parent.viewKpiTree(flare);
          treeModalItem.find(".eq-ui-loader-line").hide();
        });
      }
    }
  });

  spreadsheet.events.on("BeforeEditStart", function(cells){
    console.log("Editing is about to start");
    var row  = cells.replace(/[a-zA-Z]/g, '');
    var selection = 'A'+row+':'+last_col+row;
    var values = spreadsheet.getValue(selection);
    var columEdited = spreadsheet.selection._focusedCell.col;
    valueBeforeEditing = values[columEdited-1];
    cellBeforeEditing = cells;
    console.log(valueBeforeEditing);
  });

  spreadsheet.events.on("AfterEditEnd",function(cells){
    console.log(cells);
    var row  = cells.replace(/[a-zA-Z]/g, '');
    var selection = 'A'+row+':'+last_col+row;
    var values = spreadsheet.getValue(selection);
    var headerValues = spreadsheet.getValue('A1:'+ last_col + '1');
    // console.log(selection);
    // console.log(values);
    updateValue(values, selection, headerValues, row);
  });
}

function updateValue(values, selection, headerValues, row)
{
  console.log("STO ENTRANDO FORSE QUI?");
    if(!touch[selection]){
        touch[selection]=true;

        setTimeout(function(){ delete touch[selection] }, 500);

        // console.log(values);
        // console.log(headerValues);
        var columEdited = spreadsheet.selection._focusedCell.col;

        // console.log(columEdited);
        var editedValue = values[columEdited-1];
        var editedType = headerValues[columEdited-1]
        var editedId = values[0];

        if(editedValue == valueBeforeEditing)
        {          
          return;
        }

        // console.log(editedValue);
        // console.log(editedType);

        // console.log(completeUrl);
        var editUrl = completeUrl +"/rows/"+editedId;

        var commentModal = window.parent.$("#eq-ui-modal-edit-comment");
        commentModal.find("textarea").val("");
        commentModal.openModal();

        commentModal.find(".eq-ui-modal-close").unbind("click").click(function()
        {
          spreadsheet.setValue(cellBeforeEditing, valueBeforeEditing);
          console.log("Rimettere come valore quello precedente");
          commentModal.closeModal();
        });

        commentModal.find(".comment_send").unbind("click").click(function(){
            
            var comment = commentModal.find("textarea").val();
            // console.log(comment);

            var payload = {};
            payload[editedType] = editedValue;
            payload['comment'] = comment;

            $.ajax({
                url: editUrl,
                type: 'PUT',
                data: payload,
                success: function(result) {
                    // console.log(result);
                    // console.log(result.success);
                    if(result.success == true)
                    {
                        toastr.success('The record was updated with the new value' , 'Record updated');
                        commentModal.closeModal();
                        // firstLoad = true;
                        // loadSpreadsheet([], []);
                        spreadsheet.unlock('A'+ row +':' + last_col + row);
                        spreadsheet.setStyle('A'+ row +':' + last_col + row,{background:"#e5fbe5"});
                        spreadsheet.lock('A'+ row +':' + last_col + row);

                        editablePositionArray.forEach(function(position){

                          editablePosition = parseInt(position);
                          // console.log(editablePosition);
                    
                          var editableColumn = spreadsheet._grid.config.columns[editablePosition].$letter;
                    
                          var column_editable = editableColumn+"1:"+editableColumn + lineCount;
                          // console.log(column_editable);
                          spreadsheet.unlock(column_editable);
                          dataContainer = saveActualJson();

                        });
                        spreadsheet.selection.setSelectedCell("A1");

                        if(type_of_file == "data_ingestion")
                        {
                          console.log(selection);
                          console.log(statusPosition + row);
                          
                          booleanActionStatus = true;

                          var valueToUpdate = statusPosition + row;
                          spreadsheet.unlock(valueToUpdate);
                          spreadsheet.setValue(valueToUpdate,'VALIDATING');
                          spreadsheet.lock(valueToUpdate);
                          arrayForNonEditableRowsValidation = [];

                          arrayForNonEditableRowsValidation.push(row);
                          console.log(arrayForNonEditableRowsValidation);
                          timer = setInterval(function() { showProgressValidation(valueToUpdate, editedId, row) }, 1000);
                          dataContainer = saveActualJson();
                        }

                    }
                    else
                    {
                        // console.log("ERRORE");
                        var errorString = "";
                        for(var i = 0; i < result.errors.length; i++)
                        {
                          errorString += result.errors[i];
                          commentModal.closeModal();
                        }
                        toastr.error(errorString, 'Something Wrong');
                    }

                }
            });
        }) 
    }
}

function showProgressValidation(valueUpdating, idEditing, rowPosition)
{
  var progressValidationUrl = sheets_url + "/rows/" + idEditing + "/status?";
  progressValidationUrl += "&sessionToken="+session_token;
  progressValidationUrl += "&rand="+ new Date().getTime();
  booleanActionStatus = true;
  
  $.get(progressValidationUrl, function(result){
    var resultStatus = result.status;
    if(resultStatus == "ERROR")
    {
      clearInterval(timer);
      spreadsheet.unlock(valueUpdating);
      spreadsheet.setValue(valueUpdating,'ERROR');
      spreadsheet.lock(valueUpdating);
      arrayForNonEditableRowsValidation.splice( arrayForNonEditableRowsValidation.indexOf(rowPosition), 1 );
      dataContainer = saveActualJson();
    }
    else if(resultStatus == "IMPORTED")
    {
      clearInterval(timer);
      spreadsheet.unlock(valueUpdating);
      spreadsheet.setValue(valueUpdating,'IMPORTED');
      spreadsheet.lock(valueUpdating);
      arrayForNonEditableRowsValidation.splice( arrayForNonEditableRowsValidation.indexOf(rowPosition), 1 );
      dataContainer = saveActualJson();
    }
    else if(resultStatus == "WARNING")
    {
      clearInterval(timer);
      spreadsheet.unlock(valueUpdating);
      spreadsheet.setValue(valueUpdating,'WARNING');
      spreadsheet.lock(valueUpdating);
      arrayForNonEditableRowsValidation.splice( arrayForNonEditableRowsValidation.indexOf(rowPosition), 1 );
      dataContainer = saveActualJson();
    }

    console.log(arrayForNonEditableRowsValidation);
  });
}

var dataStyled = [];
var dataEditedBlocked = [];

function loadSpreadsheet(filter_params_values, orderElements){
  
  showLoader();

  // colCount = spreadsheet.config.colsCount;
  // // console.log("COL COUNT", colCount);
  var service_url = sheets_url + "/csv?";
  var service_url_json = sheets_url + "/json?";
  service_url += "&sessionToken="+session_token;
  service_url_json += "&sessionToken="+session_token;

  var paginationUrl = sheets_url + "/count?";
  paginationUrl += "&size="+ pageSize;
  paginationUrl += "&sessionToken="+session_token;
  
  var paginatedValues;


  filteredContent = false;

  // console.log(filter_params_values);
  if(filter_params_values.length == 0)
  {
    nofilter = true;
  }

  filter_params_values.forEach(function(filter_params_value){
    if(firstLoad != true)
    {
      
    }
    else
    {
      paginationIndex = 1;
    }

    service_url += "&"+filter_params_value.name+"="+encodeURIComponent(filter_params_value.value);
    service_url_json += "&"+filter_params_value.name+"="+encodeURIComponent(filter_params_value.value);
    paginationUrl += "&"+filter_params_value.name+"="+encodeURIComponent(filter_params_value.value);
    paginatedValues += "&"+filter_params_value.name+"="+encodeURIComponent(filter_params_value.value);
    
    if(filter_params_value.value != "")
    {
      filteredContent = true;
    }
  });

  if(orderElements.length == 0)
  {
    noOrdered = true;
  }

  orderElements.forEach(function(orderElement){
    if(firstLoad == true)
    {
      paginationIndex = 1;
    }

    service_url += "&order="+orderElement.id+" "+orderElement.ordering;
    service_url_json += "&order="+orderElement.id+" "+orderElement.ordering;
    paginationUrl += "&order="+orderElement.id+" "+orderElement.ordering;
    paginatedValues += "&order="+orderElement.id+" "+orderElement.ordering;
  })

  // console.log(paginatedValues);
  // console.log(backupPaginatedValues);

  if(backupPaginatedValues != paginatedValues)
  {
    // console.log("QUI LO IMPOSTO A 1");
    paginationIndex = 1;
  }

  backupPaginatedValues = paginatedValues;

  if(filteredContent == true)
  {
    pageIndex = 1;
    nofilter = false;

    service_url += "&page="+ paginationIndex;
    service_url_json += "&page="+ paginationIndex;

    paginationUrl += "&rand="+ new Date().getTime();

    $.get(paginationUrl, function(data) {
      // console.log(data);
      paginationTotal = data.total;
      paginationMaxIndex = data.pages;

      $(".container-buttons .element-counter .number-of-elements .nmbr").text(paginationTotal); 
      if((paginationMaxIndex <= 1) || (paginationIndex == paginationMaxIndex))
      {
        $(".pagination-button .pag-button").hide();
      }
      else
      {
        $(".pagination-button .pag-button").show();
      }

    });
  }
  else
  {
    if(pageIndex <= maxPageIndex)
    {
      service_url += "&page="+ pageIndex;
      service_url_json += "&page="+ pageIndex;
    }
  }

  $(".button-filters-page.download-open").attr('href',service_url + "&download="+window.parent.modalTitle+".csv");
  $(".button-filters-page.download-open").attr('download', window.parent.modalTitle);

  service_url += "&size="+ pageSize;
  service_url_json += "&size="+ pageSize;

  service_url += "&rand="+ new Date().getTime();
  service_url_json += "&rand="+ new Date().getTime();

  console.log("QUESTO E' IL SERVIZIO CHE CHIAMO", service_url);
  // console.log("PAGE INDEX",pageIndex);

  $.get(service_url, function(dataResult) {
    console.log(dataResult);
    data = dataResult.csv;
    // data = dataResult;
  
    // console.log("RISPOSTA", data);
    // console.log("DATA CONTAINER MIO", dataContainer);

    if((firstLoad == false) && (nofilter == true) && (booleanAction == false) && (booleanOrdering == false))
    {
      console.log("FIRSTLOAD FALSE e NO FILTER TRUE e ACTION FALSE e ORDERING FALSE");
      dataContainer += data;
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);
    }
    else if((firstLoad == false) && (booleanOrdering == true))
    {
      console.log("FIRSTLOAD FALSE e ORDERING TRUE");
      dataContainer = data;
      dataStyled = [];
      dataEditedBlocked = [];
      booleanOrdering = false;
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);

    }
    else if((firstLoad == false) && (nofilter == true) && (booleanAction == true))
    {
      console.log("FIRSTLOAD FALSE e NO FILTER TRUE e BOOLEAN ACTION TRUE");
      dataContainer += data;
      //dataStyled = [];
      booleanAction = false;
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);
    }
    else if((firstLoad == false) && (filteredContent == false))
    {      
      console.log("FIRSTLOAD FALSE E NON CI SONO FILTRI IMPOSTATI QUINDI SONO SU ALL");
      dataContainer = data;
      dataStyled = [];
      dataEditedBlocked = [];
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);

      if (maxPageIndex == 0)
      {
        $(".pagination-button .pag-button").hide();
      }
      else
      {
        $(".pagination-button .pag-button").show();
      }
      nofilter = true;

    }
    else if((firstLoad == false) && (filteredContent == true))
    {
      console.log("FIRSTLOAD FALSE E GLI ELEMENTI SONO FILTRATI - C'E UN SECONDO IF");
      nofilter = false;
      if(paginationIndex > 1)
      {
        console.log("FIRSTLOAD FALSE, GLI ELEMENTI SONO FILTRATI, e PAGINATION INDEX E' MAGGIORE DI 1 (quindi ho paginato i filtrati)");
        dataContainer += data;
      }
      else
      {
        console.log("FIRSTLOAD FALSE, GLI ELEMENTI SONO FILTRATI, e PAGINATION INDEX E' MINORE DI 1 (quindi NON ho paginato i filtrati)");
        dataContainer = data;
        dataStyled = [];
        dataEditedBlocked = [];
      }
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);
    }
    else
    {
      console.log("PRENDO IL RISULTATO E LO SOVRASCRIVO PERCHE' SONO NELL'ELSE, QUINDI AL PRIMO LOAD, IMPOSTO IL PRIMO LOAD COME FALSE");
      dataContainer = data;
      dataStyled = [];
      dataEditedBlocked = [];
      spreadsheet.parse(dataContainer, "csv");
      // spreadsheet.parse(dataContainer);

      if (maxPageIndex == 0)
      {
        $(".pagination-button .pag-button").hide();
      }
      else
      {
        $(".pagination-button .pag-button").show();
      }

      spreadsheet.contextMenu.data.add({
        value: "Show History",
        id: "show-history"
      });
    
      if(treeView == true)
      {
        spreadsheet.contextMenu.data.add({
          value: "Tree View",
          id: "tree-view"
        });
      }

      firstLoad = false;
    }

    hideLoader();

    colCount = spreadsheet.config.colsCount;

    last_col = spreadsheet._grid.config.columns[colCount].$letter ;
    lineCount = dataContainer.split('\n').length;
    lineCount = lineCount - 1; //First Line is header and Last Line is Empty
    // console.log("LINE COUNT", lineCount);

    if(filteredContent == false)
    {
      $(".container-buttons .element-counter .number-of-elements .nmbr").text(totalCount);
    }

    if(dataResult.style != undefined)
    {
      if(pageIndex > 1)
      {
        var controllo = dataResult.style;
        for (var i = 0; i<controllo.length; i++)
        {
          controllo[i].row = controllo[i].row + pageIndex * pageSize;
        }

        dataStyled = $.merge( dataStyled, controllo );

      }
      else
      {
        dataStyled = dataResult.style;
      }
    }

    // console.log(dataStyled);

    if(dataStyled != undefined)
    {
      for (var i = 0; i < dataStyled.length; i++)
      {
        var styledRow = dataStyled[i].row + 2; //parte da 0 array + 1 che è header (la paginazione è gestita all'arrivo dell'array)
        spreadsheet.setStyle('A'+ styledRow +':' + last_col + styledRow,{background:"#e5fbe5"});
      }
    }

    if(dataResult.imported != undefined)
    {
      if(pageIndex > 1)
      {
        var controllo = dataResult.imported;
        for (var i = 0; i<controllo.length; i++)
        {
          controllo[i].row = controllo[i].row + pageIndex * pageSize;
        }

        dataEditedBlocked = $.merge( dataEditedBlocked, controllo );

      }
      else
      {
        dataEditedBlocked = dataResult.imported;
      }
    }
    afterLoadSettings();

  })
}

function afterLoadSettings()
{
  formats.forEach(function(f){
    spreadsheet.setFormat(f.interval,f.format);
  });

  if(lineCount > pageSize)
  {
    allColumns = "A1:"+last_col+lineCount;
  }
  else
  {
    allColumns = "A1:"+last_col+pageSize;
  }
  // console.log("TUTTE", allColumns);

  spreadsheet.lock(allColumns);

  if(editableFile == true)
  {
    // console.log(documentQueryResult.editable_positions);
    editablePositionArray = documentQueryResult.editable_positions.split(',');

    editablePositionArray.forEach(function(position){

      editablePosition = parseInt(position);
      // console.log(editablePosition);

      var editableColumn = spreadsheet._grid.config.columns[editablePosition].$letter;

      var column_editable = editableColumn+"1:"+editableColumn + lineCount;
      // console.log(column_editable);
      spreadsheet.unlock(column_editable);

    });
  }
  
  if(type_of_file == "data_ingestion")
  {
    statusPosition = spreadsheet._grid.config.columns[statusResponsePosition].$letter;

    if(dataEditedBlocked != undefined)
    {
      for (var i = 0; i < dataEditedBlocked.length; i++)
      {
        var styledRow = dataEditedBlocked[i].row + 2; //parte da 0 array + 1 che è header (la paginazione è gestita all'arrivo dell'array)
        spreadsheet.lock('A'+ styledRow +':' + last_col + styledRow);
      }
    }
  }

  var header_selection = "A1:"+last_col+'1';
  spreadsheet.lock(header_selection);
  

  console.log("Arrivo qui", spreadsheet);
  spreadsheet.selection.setSelectedCell("A1");

}

function initFilter(label, name, values){
  //FILTERS

  $("<div />", { class: "single-filter-container-"+name }).appendTo(".filters");
  $("<label />", { text: label}).appendTo(".single-filter-container-"+name);
  var select = $("<select />", { class:"filter", name:name, id:name}).appendTo(".single-filter-container-"+name);
  $("<option />", { text:"All", value:""}).appendTo(select);
  values.forEach(function(value){
    $("<option />", { text:value, value:value}).appendTo(select);
  });
  filter_params.push(name);
}

function getFilters(){
  filter_params_values = [];
  filters.forEach(function(filter){
    if(filter.label != "id" && filter.label != "quantity")
        initFilter(filter.label, filter.name, filter.values);
    });
  return filter_params_values;
}

function initFilters(){
  var rand = new Date().getTime();
  $.ajax({
    type: "GET",
    url: sheets_url+'/filters?rand='+rand,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "bearer "+session_token);
    },
    success: function(filters) {
      filter_params = [];
			$('.filters prova').html('');
      filters.forEach(function(filter){
        initFilter(filter.label, filter.name, filter.values);
      });
      initHeigth();
      $( ".filter" ).change(function(a) {
        filter_params_values = [];
        filter_params.forEach(function(filter_param){
          var value = $('#'+filter_param).val();
          filter_params_values.push({name:filter_param, value:value});
        });

				resetRowsColor();
        loadSpreadsheet(filter_params_values, orderedElements);
      });
      $(".filter").chosen()
    }
  });
}

$( document ).ready(function() {
  var selectedColumn = "";

  $(document).on("click",".dhx_grid_header_cell.dhx_string_cell",function(e) {

    booleanOrdering = true;

    if(selectedColumn != "" && selectedColumn != $(this).attr('dhx_id'))
    {
      $( ".dhx_grid_header_cell.dhx_string_cell" ).each(function( index ) {
        if($( this ).attr('dhx_id') == selectedColumn)
        {
          $(this).find('span').remove();
          return false;
        }
      });
    }

    selectedColumn = $(this).attr('dhx_id');

    var ordering = "desc";

    if($(this).find('span').length > 0)
    {
      if($(this).find('span').hasClass('orderDesc'))
      {
        ordering = "asc";
        $(this).find('span').remove();
        $(this).append('<span class="orderAsc">▲</span>');
      }
      else
      {
        ordering = "desc";
        $(this).find('span').remove();
        $(this).append('<span class="orderDesc">▼</span>');
      }
    }
    else
    {
      $(this).append('<span class="orderDesc">▼</span>');
    }
  
    orderedElements = [];
    orderedElements.push({id:selectedColumn, ordering:ordering});
    

    loadSpreadsheet(filter_params_values, orderedElements);
  });
});

function saveActualJson()
{
  var actualState = spreadsheet.serialize();  
  var arrayLength = [];

  if(actualState.data != undefined)
  {
    arrayLength = actualState.data;
  }
  else
  {
    arrayLength = actualState;
  }

  var columnsInfo = spreadsheet._grid.config.columns;

  // console.log(arrayLength);
  // console.log(columnsInfo);

  var matrix = [];

  var columnMap = [];

  for (var i = 0; i < columnsInfo.length; i++)
  {
    // console.log(columnsInfo[i].$letter);
    if(columnsInfo[i].$letter != undefined)
    {
      columnMap[columnsInfo[i].$letter] = parseInt(columnsInfo[i].id);
    }
  }

  // console.log(columnMap);

  for(var i = 0; i < arrayLength.length; i++)
  {
    
    var indexRow = arrayLength[i].cell.replace(/[a-zA-Z]/g, '');
    indexRow = parseInt(indexRow) -1;
    var indexCol = arrayLength[i].cell.replace(/[0-9]+/g, '');

    // console.log(columnMap[indexCol]);
    if(!columnMap[indexCol]) continue;
    // console.log("Index", indexRow,"-",indexCol);
    // console.log("Column Map", columnMap[indexCol]);
    if(!matrix[indexRow]) matrix[indexRow] = new Array(columnMap.length);

    if(arrayLength[i].value != undefined)
    {
      matrix[indexRow][columnMap[indexCol]-1] = arrayLength[i].value;
    }
  }

  var DataValueString = $.csv.fromArrays(matrix);
  // console.log(DataValueString);
  return DataValueString;
}


(function($) {
    $.QueryString = (function(paramsArray) {
        let params = {};
        for (let i = 0; i < paramsArray.length; ++i)
        {
            let param = paramsArray[i]
                .split('=', 2);
            if (param.length !== 2)
                continue;
            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }
        return params;
    })(window.location.search.substr(1).split('&'))
})(jQuery);
