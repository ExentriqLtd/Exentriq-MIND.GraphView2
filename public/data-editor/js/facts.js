var sheets_url = '/api/sheets';
var touch = {};

var formats = [
  {interval:'K2:K1001', format:'common'},
  {interval:'N2:N1001', format:'common'},
  {interval:'D2:D1001', format:'sublass_detail'},
  {interval:'F2:F1001', format:'sublass_detail'},
  {interval:'G2:G1001', format:'sublass_detail'},
  {interval:'AC2:AC1001', format:'common'}
];

value_change_func = function(values, selection){

  console.log(selection);
  var value = values[1];
  var id = values[28];

  var operation = 'insert';
  if(id && id != ''){
    operation = 'update';
  }

  var timestamp = new Date();

  var fact = {
      family:v(values,2),
      id:v(values,0),
      group:v(values,3),
      class:v(values,4),
      subclass:v(values,5),
      subclass_detail:v(values,6),
      sure_code:v(values,7),
      sap_code:v(values,8),
      description:v(values,9),
      structure_code:v(values,10),
      structure_type:v(values,11),
      structure_name:v(values,12),
      fiscal_year:v(values,13),
      fiscal_year_period:v(values,14) || 'ALL',
      granularity:v(values,15),
      value:v(values,1),
      unit_of_measure:v(values,16),
      source:'Editor',
      timestamp:timestamp.getTime(),
      timestamp_desc:timestamp.toISOString(),
      cluster:null,
      notes:v(values,17),
      custom_fields:{
      }
  };

  var col = 18;
  for(var i=1;i<11;i++){
    fact.custom_fields['custom_'+i] = values[col++];
  }

  var data = {id:id, value:value, fact:fact, operation:operation};

  if(!touch[selection]){
    console.log("touch: " + selection);
    touch[selection]=true;
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
            spreadsheet.setValue("AC"+row,id);
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
  var id = values[28];
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
            resetRowsColor();
            spreadsheet.deleteRow("A2:AC1001");
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
    initSpreadsheet(sheets_url, value_change_func, formats, value_delete_func, value_delete_all_func, 'AC');
    initFilters();
    loadSpreadsheet([]);
});
