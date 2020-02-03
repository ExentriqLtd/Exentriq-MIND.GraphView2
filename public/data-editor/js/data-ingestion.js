
var sheets_url = '/api/extractions/';
var firstTime;
var rowDetailsUrl;
var historyDetailRowUrl;
var allRowSelected = [];
var booleanForMultiOrNot = false;
var booleanForMultiOnSelection = false;
var touch = {};
var listOfIdForMulti = {};
var timeOutMultiAction;
var duringMultiActionBoolean;
var editable;
var completeUrl;
var completeRandom;
var rowSelected;

$( document ).ready(function() {

    initProperties();
    loadErrorInfos();

    completeUrl = base_url+sheets_url+dataId;
    completeRandom = base_url+sheets_url+dataId;
    completeRandom += "?&rand="+ new Date().getTime();
    // console.log(completeUrl);

    $.get(completeRandom, function(result){
        console.log(result);
        totalCount = result.count;
        // console.log(totalCount);
        statusResponsePosition = result.status_position;
        
        var formats = [];
        
        for(var i = 0; i < result.format.length; i++)
        {
            formats.push({interval: result.format[i].column + '2:' + result.format[i].column + totalCount, ordering:result.format[i].format});
        }

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
        
        initSpreadsheet(sheets_url, value_change_func, formats, value_delete_func, value_delete_all_func, "Z", "data_ingestion", editable, result, true, false);
        initFilters();
        loadSpreadsheet([], []);

        spreadsheet.events.on("StatusSelected", function(col, row){
        
            if(duringMultiActionBoolean == true)
            {
                // console.log(arrayForNonEditableRowsMultiaction);

                // for(var i=0; i<arrayForNonEditableRowsMultiaction.length; i++)
                // {
                //     console.log("INDEX POSITION", arrayForNonEditableRowsMultiaction[i]);
                //     console.log("ROW POSITION", row);
                //     console.log("IF TRUE RETURN", arrayForNonEditableRowsMultiaction[i] == row);

                //     if(arrayForNonEditableRowsMultiaction[i] == row)
                //     {
                //         return;
                //     }
                // }
                
                //toastr.warning('An action is in progress. Please Wait.');

                return;
            }
            if(booleanActionStatus == true)
            {
                booleanActionStatus = false;
                console.log(arrayForNonEditableRowsValidation);
                for(var i=0; i<arrayForNonEditableRowsValidation.length; i++)
                {
                    console.log(arrayForNonEditableRowsValidation[i]);
                    if(arrayForNonEditableRowsValidation[i] == row)
                    {
                        return;
                    }
                }
            }
            console.log("OPPURE QUI?");
            var selection = 'A'+row+':'+last_col+row;
            var values = spreadsheet.getValue(selection);
            var error = values[statusResponsePosition-1]; //E' un array. Va tolta una posizione.
            var id = values[0];
            booleanForMultiOrNot = false;
            rowDetailsUrl = sheets_url + "/rows/" + id;
            rowDetailsUrl += "?&rand="+ new Date().getTime();

            var statusModal = window.parent.$("#eq-ui-modal-status-info");
            var statusModalContainer = statusModal.find("#details_container");
    
            error = error.toString();
    
            if ((error == "ERROR") || (error == "WARNING"))
            {    
                if(error == "ERROR")
                {
                    statusModal.find(".eq-ui-modal-footer .status_accept").hide();
                    statusModal.find(".eq-ui-modal-footer .status_reject").hide();
                }
                else
                {
                    statusModal.find(".eq-ui-modal-footer .status_accept").show();
                    statusModal.find(".eq-ui-modal-footer .status_reject").show();
                }
    
                statusModal.find(".eq-ui-modal-footer").show();
                statusModal.find(".eq-ui-form-group").show();
            }
            else
            {
                statusModal.find(".eq-ui-modal-footer").hide();
                statusModal.find(".eq-ui-form-group").hide();
            }
    
            if((error == "WARNING") || (error == "CONFIRM") || (error == "DISCARDED") || (error == "REJECTED") || (error == "ERROR"))
            {
                showLoader();
    
                $.get(rowDetailsUrl, function(result){
                    var resultMessages = result.messages;
                    statusModalContainer.find("#detail-template.detail-item").remove();
                    statusModal.find("textarea").val("");
    
                    for(var i=0;i<resultMessages.length;i++){
        
                        var d = statusModalContainer.find("#detail-template").clone();
                        d.addClass("detail-item");
                        d.find(".details-cont").text(resultMessages[i]);
                        d.show();
                        statusModalContainer.append(d);
                    }
                    
                    hideLoader();
                    statusModal.openModal();
                });
            }
    
            return true;
          });
        
        spreadsheet.events.on("afterSelectionSet", function(cell){
    
            var col = cell.split(':')[0].replace(/[0-9]+/g, '');
            var row  = cell.split(':')[0].replace(/[a-zA-Z]/g, '');
            var selection = 'A'+row+':'+last_col+lineCount;
            
            if(cell != selection)
            {
                if (cell.split(':')[1] != undefined)
                {
                    var secondCol = cell.split(':')[1].replace(/[0-9]+/g, '');
                    var secondRow = cell.split(':')[1].replace(/[a-zA-Z]/g, '');

                    row = parseInt(row);
                    secondRow = parseInt(secondRow);
                    
                    // console.log(row);
                    // console.log(secondRow);

                    if((row == 1) && (secondRow == lineCount+1))
                    {
                        console.log("Second e Row sono 1 e line Count", row, secondRow, lineCount+1);
                    }
                    else if(row != secondRow)
                    {
                        if(row == 1 && secondRow == spreadsheet.config.rowsCount)
                        {
                            return;
                        }
                        allRowSelected = [];

                        if(row > secondRow)
                        {
                            var numberSelected = row - secondRow + 1;
                        }
                        else
                        {
                            var numberSelected = secondRow - row + 1;
                        }
                        $(".container-buttons-bar .number-of-elements .nmbr").text(numberSelected);
                        $(".container-header-modal").hide();
                        $(".bar-selection").show();
        
                        var lastErrorValue;
                        var obj;
                        var checkForButtons;

                        for(var i=0; i < numberSelected; i++){
    
                            if(secondRow > row)
                            {
                                var cicledRow = parseInt(row) + i;
                            }
                            else
                            {
                                var cicledRow = parseInt(row) - i;
                            }
                            var selected = 'A'+cicledRow+':'+last_col+cicledRow;
                            var values = spreadsheet.getValue(selected);

                            lastErrorValue = error;
                            var error = values[statusResponsePosition-1];
                            var id = values[0];
        
                            if(lastErrorValue == undefined)
                            {
                                lastErrorValue = error;
                            }
                            
                            if(lastErrorValue == error)
                            {
                                obj = {};
                                obj["id"] = id;
                                obj["error"] = error;
                                obj["rowPosition"] = selected;
                                obj["row"] = cicledRow;
                                checkForButtons = error;
                                allRowSelected.push(obj);
                            }
                            else
                            {
                                if(error != "")
                                {
                                    return false;
                                }
                            }
                        }
                            
                        if((checkForButtons == "WARNING") || (checkForButtons == "ERROR"))
                        {
                            $(".container-buttons-bar .buttons-list .multipleAction span").addClass(checkForButtons);
    
                            $(".container-buttons-bar .buttons-list .multipleAction").show();
                        }
                    }
                    
                }
                else
                {
                    $(".container-header-modal").show();
                    $(".bar-selection").hide();
                }
            }
    
            if(col == statusPosition && row != "1")
            {
                // console.log(booleanForMultiOnSelection);

                if(booleanForMultiOnSelection != true)
                {
                    spreadsheet.events.fire("StatusSelected", [col, row]);
                }
            }  
        });
    });

    $(".container-buttons-bar .buttons-list").on('click', '.multipleAction', function(e) {

        booleanForMultiOrNot = true;
        e.preventDefault();
        var errorMultiSelected = $(this).find("span").attr('class');

        var statusModalMulti = window.parent.$("#eq-ui-modal-status-info");
        var statusModalContainer = statusModalMulti.find("#details_container");
        statusModalContainer.html("");

        if ((errorMultiSelected == "ERROR") || (errorMultiSelected == "WARNING"))
        {
            if(errorMultiSelected == "ERROR")
            {
                statusModalMulti.find(".eq-ui-modal-footer .status_accept").hide();
                statusModalMulti.find(".eq-ui-modal-footer .status_reject").hide();
            }
            else
            {
                statusModalMulti.find(".eq-ui-modal-footer .status_accept").show();
                statusModalMulti.find(".eq-ui-modal-footer .status_reject").show();
            }

            statusModalMulti.find(".eq-ui-modal-footer").show();
            statusModalMulti.find(".eq-ui-form-group").show();
        }
        else
        {
            statusModalMulti.find(".eq-ui-modal-footer").hide();
            statusModalMulti.find(".eq-ui-form-group").hide();
        }

        statusModalMulti.openModal();
    });

    $(".container-buttons-bar .buttons-list").on('click', '.select-all-btn', function(e) {
        var thisTotalToSelect = lineCount+1;
        var selectAllCol = "A2:"+last_col+thisTotalToSelect;
        spreadsheet.selection.setSelectedCell(selectAllCol);
        toastr.success('All '+ lineCount +' entries have been selected');
    });

    $(".pagination-button").on('click', '.pag-button', function(e) {
        // console.log("Paginate!");
        pageIndex ++;
        // console.log(pageIndex);
        booleanOrdering = false;

        if(pageIndex == maxPageIndex)
        {
            $(this).hide();
        }
        // console.log(filter_params_values);
        
        if(filteredContent == true)
        {
            paginationIndex ++;
            pageIndex = 1; 
        }

        // console.log(paginationIndex);
        // console.log(paginationMaxIndex);
        if(paginationIndex == paginationMaxIndex)
        {
            $(this).hide();
        }

        loadSpreadsheet(filter_params_values, orderedElements);
    });
});

function loadErrorInfos()
{
    $.get(base_url + "/api/metadata/errors", function(result){
        var errorSideMenu = $(".errors-sidemenu table tbody");
        errorSideMenu.find(".error-item").remove();

        for (var i = 0; i < result.length; i++)
        {
            var template = errorSideMenu.find(".error-template").clone();
            template.addClass("error-item").removeClass("error-template");
            template.find(".code-error").text(result[i].code);
            template.find(".code-desc").text(result[i].name);
            template.show();
            errorSideMenu.append(template);
        }
    });
}

function callBackSingleAction(filterParamsAfterAction, orderedElementsAfterAction, selectedAction)
{
    filter_params_values = filterParamsAfterAction;
    orderedElements = orderedElementsAfterAction;
    var cells = spreadsheet.selection.getSelectedCell();
    var row  = cells.split(':')[0].replace(/[a-zA-Z]/g, '');
    var valueToUpdate = statusPosition + row;

    if(selectedAction == "DISCARD")
    {
        spreadsheet.unlock(valueToUpdate);
        spreadsheet.setValue(valueToUpdate,'DISCARDED');
        spreadsheet.lock(valueToUpdate);
    }
    else if(selectedAction == "REJECT")
    {
        spreadsheet.unlock(valueToUpdate);
        spreadsheet.setValue(valueToUpdate,'REJECTED');
        spreadsheet.lock(valueToUpdate);
    }
    else if(selectedAction == "ACCEPT")
    {
        spreadsheet.unlock(valueToUpdate);
        spreadsheet.setValue(valueToUpdate,'CONFIRM');
        spreadsheet.lock(valueToUpdate);
    }
    duringMultiActionBoolean = false;
    dataContainer = saveActualJson();
}

var timer;

function callBackMultipleAction(filterParamsAfterAction, orderedElementsAfterAction, selectedAction)
{
    filter_params_values = filterParamsAfterAction;
    orderedElements = orderedElementsAfterAction;
    //console.log(selectedAction);
    //console.log(allRowSelected);

    for (var i = 0; i < allRowSelected.length; i++)
    {
        var selected = allRowSelected[i].rowPosition;
        var row  = selected.split(':')[0].replace(/[a-zA-Z]/g, '');

        console.log(row);
        var valueToUpdate = statusPosition + row;

        if(selectedAction == "DISCARD")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'DISCARDING');
            spreadsheet.lock(valueToUpdate);
        }
        else if(selectedAction == "REJECT")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'REJECTING');
            spreadsheet.lock(valueToUpdate);
        }
        else if(selectedAction == "ACCEPT")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'CONFIRMING');
            spreadsheet.lock(valueToUpdate);
        }
    }

    dataContainer = saveActualJson();

    timer = setInterval(function() { showBoxProgress(selectedAction) }, 1000);
}

function showBoxProgress(selectedAction)
{
    var totalNumber = allRowSelected.length;
    //console.log("ARRAY DI ROW AL CALLBACK", arrayForNonEditableRowsMultiaction);

    $.ajax({
        url: sheets_url+"/jobs",
        type: 'POST',
        data: listOfIdForMulti,
        success: function(result) {
            console.log(result);
            var currentAction;
            var numberOfElements;
            console.log(selectedAction);
            if(selectedAction == "ACCEPT")
            {
                currentAction = "Confirm";
                numberOfElements = result.CONFIRMING;
            }
            else if(selectedAction == "REJECT")
            {
                currentAction = "Rejected";
                numberOfElements = result.REJECTING;
            }
            else if(selectedAction == "DISCARD")
            {
                currentAction = "Discarded";
                numberOfElements = result.DISCARDING;
            }

            console.log(numberOfElements);
            var perc = numberOfElements * 100 / totalNumber;
            perc = 100 - parseInt(perc);
            
            $('#box-progress-element').find('.inprogressall').show();
            $('#box-progress-element').find('.completedall').hide(); 
            $('#box-progress-element').find('.progress-bar span').text(perc+'%');
            $('#box-progress-element').find('.progress-bar-line').css("width", perc+'%');
            $('#box-progress-element').find('.filestatus span').text(currentAction);
            $('#box-progress-element').find('.currentdiscarted').text(numberOfElements);
            $('#box-progress-element').find('.filetotal').text(totalNumber);
            $('#box-progress-element').show();

            if(numberOfElements == 0)
            {
                $('#box-progress-element').find('.inprogressall').hide();
                $('#box-progress-element').find('.completedall').show();  

                changeStatus(selectedAction);
                return;
            }
        }
    });

}

function changeStatus(selectedAction)
{
    clearInterval(timer);

    for (var i = 0; i < allRowSelected.length; i++)
    {
        var selected = allRowSelected[i].rowPosition;
        var row  = selected.split(':')[0].replace(/[a-zA-Z]/g, '');

        var valueToUpdate = statusPosition + row;

        if(selectedAction == "DISCARD")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'DISCARDED');
            spreadsheet.lock(valueToUpdate);
        }
        else if(selectedAction == "REJECT")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'REJECTED');
            spreadsheet.lock(valueToUpdate);
        }
        else if(selectedAction == "ACCEPT")
        {
            spreadsheet.unlock(valueToUpdate);
            spreadsheet.setValue(valueToUpdate,'CONFIRM');
            spreadsheet.lock(valueToUpdate);
        }

        //arrayForNonEditableRowsMultiaction.splice( arrayForNonEditableRowsMultiaction.indexOf(row), 1 );
    }

    duringMultiActionBoolean = false;
    dataContainer = saveActualJson();

}