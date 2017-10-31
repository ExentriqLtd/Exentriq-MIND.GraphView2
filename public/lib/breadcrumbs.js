;var hariBreadcrumbs = (function() {

  var
    settings = {
      'domSelector' : "#breadcrumbs",
      'storageKeyBase' : "hariBC",
      "itemIdBase" : "hari-bc-item-",
      "itemIdAttrName" : "data-hari-bc-item-id",
      "itemLinkIdBase" : "hari-bc-item-link-",
      'activeItemClass' : "active"
    },
    keyCount = settings.storageKeyBase + 'Count',
    keyDataBase = settings.storageKeyBase + "Data",
    keyTitleBase = settings.storageKeyBase + "Title",
    keyCurrent = settings.storageKeyBase + "Current",
    callbackFn,

    getCurCount = function() {
      return parseInt(localStorage.getItem(keyCount), 10);
    },

    getCurrentId = function() {
      return parseInt(localStorage.getItem(keyCurrent), 10);
    },

    redrawItemAsNotCurrent = function(id) {
      var
        item = $("#" + settings.itemIdBase + id),
        link = $("<a/>", {
          "id": settings.itemLinkIdBase + id,
          "href": "#", "text": localStorage.getItem(keyTitleBase + id),
          click: processClick
        });
      item.empty();
      item.removeClass();
      //$("<span/>", { "class": "divider", "text": "/" }).appendTo(item);
      link.attr(settings.itemIdAttrName, id);
      link.appendTo(item);
    },

    redrawItemAsCurrent = function(id) {
      var item = $("#" + settings.itemIdBase + id);
      item.empty();
      item.removeClass();
      item.addClass(settings.activeItemClass);
      //$("<span/>", { "class": "divider", "text": "/" }).appendTo(item);
      $("<span/>", { "text": localStorage.getItem(keyTitleBase + id) }).appendTo(item);
    },

    drawNewItem = function(id, isCurrent) {
      $("<li/>", { "id": settings.itemIdBase + id }).appendTo($(settings.domSelector));
      if (isCurrent) {
        redrawItemAsCurrent(id);
      }
      else {
        redrawItemAsNotCurrent(id);
      }
    },

    setCurrent = function(id) {
      var oldCurId = localStorage.getItem(keyCurrent);
      if (id == oldCurId) {
        return;
      }
      localStorage.setItem(keyCurrent, id);
      redrawItemAsNotCurrent(oldCurId);
      redrawItemAsCurrent(id);
    },

    processClick = function() {
      var clickedId = this.getAttribute(settings.itemIdAttrName);
      //setCurrent(clickedId);
      callbackFn(JSON.parse(localStorage.getItem(keyDataBase + clickedId)));
    },

    init = function(callback) {
      var count, currentId, i;

      callbackFn = callback;
      if (localStorage.getItem(keyCount) == null) {
        localStorage.setItem(keyCount, 0);
      }

      count = getCurCount();
      if (count > 0) {
        currentId = getCurrentId();
        for (i = 1; i <= count; i++) {
          drawNewItem(i, i == currentId);
        }
      }
    },

    getCurrentData = function() {
      return JSON.parse(localStorage.getItem(keyDataBase + localStorage.getItem(keyCurrent)));
    },

    resetAll = function() {
      $(settings.domSelector).empty();
      var
        count = getCurCount(),
        i;
      for (i = 1; i <= count; i++) {
        localStorage.removeItem(keyDataBase + i);
        localStorage.removeItem(keyTitleBase + i);
        localStorage.removeItem(keyCurrent);
      }
      localStorage.setItem(keyCount, 0);
    },

    deleteFromCurrent = function() {
      var
        count = getCurCount(),
        current = getCurrentId(),
        i;
      if (count == 0) {
        return;
      }
      for (i = count; i > current; i--) {
        $("#" + settings.itemIdBase + i).remove();
        localStorage.removeItem(keyDataBase + i);
        localStorage.removeItem(keyTitleBase + i);
      }
      localStorage.setItem(keyCount, current);
    },

    addItem = function(name, data) {
      var
        count = getCurCount() + 1,
        oldCurrent = getCurrentId();
      localStorage.setItem(keyDataBase + count, JSON.stringify(data));
      localStorage.setItem(keyTitleBase + count, name);
      localStorage.setItem(keyCurrent, count);
      localStorage.setItem(keyCount, count);
      drawNewItem(count, false);
      //if (count > 1) 
      //	{
       // redrawItemAsNotCurrent(oldCurrent);
		//}
    };

  return {
    'init': init,
    'getCurrentData': getCurrentData,
    'resetAll': resetAll,
    'addItem': addItem,
    'deleteFromCurrent': deleteFromCurrent
  };

})();