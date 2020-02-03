// var sheets_url = '/api/ef/sheets';
var sheets_url = '/api/extractions/1';
var touch = {};

var formats = [
  {interval:'E2:E1001', format:'common'},
  {interval:'H2:H1001', format:'common'},
  {interval:'F2:F1001', format:'fiscal_year_period'},
  // {interval:'AC2:AC1001', format:'common'}
];


value_change_func = function(values, selection){

  var value = values[2];
  var id = values[7];

  var operation = 'insert';
  if(id && id != ''){
    operation = 'update';
  }

  var timestamp = new Date();

  var emission_factor = {
    sure_code: v(values,0),
    description: '',
    sap_code: v(values,1),
    last_updated: '',
    author: v(values,3),
    comments: '',
    prev_versions: '',
    fiscal_year:v(values,4),
    fiscal_year_period:v(values,5),
    value:v(values,2),
    source:'Editor',
    timestamp:timestamp.getTime(),
    timestamp_desc:timestamp.toISOString(),
  };

  var data = {id:id, value:value, emission_factor:emission_factor, operation:operation};

  if(!touch[selection]){
    touch[selection]=true;
    console.log("touch: " + selection);
    setTimeout(function(){ delete touch[selection] }, 500);
    $.ajax({
      type: "POST",
      url: sheets_url,
      data: data,
      beforeSend: function(request) {
        request.setRequestHeader("Authorization", "bearer "+session_token);
      },
      success: function(msg) {
        var row = Number(selection.split(":")[0].replace(/[^0-9]/g, ''));
        if(msg.result){
          initFilters();
          var focused = spreadsheet.selection.getFocusedCell();
          formats.forEach(function(f){
            spreadsheet.setFormat(f.interval,f.format);
          });
          if(msg.operation == 'update'){
            toastr.success('Record updated', 'The record was updated with the new value');
            spreadsheet.startEdit(focused);
            spreadsheet.endEdit();
          }
          else if(msg.operation == 'insert'){
            toastr.success('Record created', 'The record was created');
            setRowColor(row, success_color);
            var id = msg.details.insertId;
            spreadsheet.setValue("H"+row,id);
          }
          spreadsheet.selection.setFocusedCell(focused);
          spreadsheet.selection.setSelectedCell(focused);
        }
        else{
          setRowColor(row, error_color);
        }
      }
    });
  }
};

value_delete_func = function(values, selection){
  var row = Number(selection.split(":")[0].replace(/[^0-9]/g, ''));
  var id = values[7];
  if(id){
    var conf = confirm("Are you sure to delete this item?");
    if(conf){
      showLoader();
      $.ajax({
            type: "DELETE",
            url: sheets_url+'/'+id,
            beforeSend: function(request) {
              request.setRequestHeader("Authorization", "bearer "+session_token);
            },
            success: function(msg) {
              toastr.success('Record deleted', 'The record was deleted');
              spreadsheet.deleteRow(selection);
              resetRowColor(row);
              initFilters();
              hideLoader();
            }
          });
    }
  }
};

value_delete_all_func = function(values, selection){
  var filters = getFilters();
  var service_url = sheets_url+'/delete_by_filter';
  var conf = confirm("Are you sure to delete ALL filtered items?");
  if(conf){
    showLoader();
    $.ajax({
          type: "POST",
          url: service_url,
          data: filters,
          beforeSend: function(request) {
            request.setRequestHeader("Authorization", "bearer "+session_token);
          },
          success: function(msg) {
            toastr.success('All Records deleted', 'All filtered records were deleted');
            spreadsheet.deleteRow("A2:AC1001");
            resetRowsColor();
            for(var i=0;i<1000;i++){
              spreadsheet.addRow('A2');
            }
            initFilters();
            hideLoader();
          }
        });
  }
}

$( document ).ready(function() {
    initProperties();
    initSpreadsheet(sheets_url, value_change_func, formats, value_delete_func, value_delete_all_func, 'Z');
    initFilters();
    loadSpreadsheet([]);
});
