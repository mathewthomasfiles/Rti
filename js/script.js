// TREE

var cssResources = 
{
	collapseImageUrl: 'url(images/collapse.gif)',
	expandImageUrl: 'url(images/expand.gif)'
};

function toggleRows(clickedButton) 
{
	var allRows = $('#tree').find('tr').get();
	clickedButton.style.backgroundImage = cssResources.expandImageUrl;
	var newDisplay = 'none';
	var clickedRowId = clickedButton.parentNode.parentNode.parentNode.id + '-';

	// Are we expanding or contracting? If the first child is hidden, we expand
	for(var testCollapseRowIndex = 0; testCollapseRowIndex < allRows.length; testCollapseRowIndex++) {
		var testCollapseRow = allRows[testCollapseRowIndex];
		if(matchesStart(testCollapseRow.id, clickedRowId, true)) {
			if(testCollapseRow.style.display === 'none') {
				newDisplay = '';
				clickedButton.style.backgroundImage = cssResources.collapseImageUrl;
			}
			break;
		}
	}

	// When expanding, only expand one level.  Collapse all descendants.
	var matchDirectChildrenOnly = (newDisplay !== 'none');

	for(var testExpandRowIndex = 0; testExpandRowIndex < allRows.length; testExpandRowIndex++) {
		var testExpandRow = allRows[testExpandRowIndex];
		if(matchesStart(testExpandRow.id, clickedRowId, matchDirectChildrenOnly)) {
			testExpandRow.style.display = newDisplay;
			var cell = testExpandRow.getElementsByTagName('td')[0];
			var tier = cell.getElementsByTagName('div')[0];
			var folder = tier.getElementsByTagName('a')[0];
			if(folder.getAttribute('onclick')) {
				folder.style.backgroundImage = cssResources.expandImageUrl;
			}
		}
	}
}

function matchesStart(target, pattern, matchDirectChildrenOnly) 
{
	var pos = target.indexOf(pattern);
	if(pos !== 0) {
		return false;
	}
	if(!matchDirectChildrenOnly) {
		return true;
	}

	return target.slice(pos + pattern.length, target.length).indexOf("-") < 0;
}

function expandRow(clickedButton, clickedRowId)
{
	if(!clickedButton) {
		return;
	}
	
	// expand parent first (recursive)
  var $tree = $('#tree');
	var $clickedButtonRow = $tree.find('tr[id=' + clickedRowId + ']').first();
	if($clickedButtonRow.css('display') === 'none')	{
		var parentId = $clickedButtonRow.attr('id').substr(0, $clickedButtonRow.attr('id').lastIndexOf('-'));
		var parentButton = $tree.find('tr[id=' + parentId + '] a.folder').get(0);
		expandRow(parentButton, parentId);
	}
	
	// show childs
	var $firstChild = $tree.find('tr[id*=' + clickedRowId + '-]').first();
	if($firstChild.css('display') === 'none') {
		toggleRows(clickedButton);
	}
}

function makeVisible($row)
{
	if($row.css('display') !== 'none') {
		return;
	}
		
	// expand all parents
	var parentId = $row.attr('id');
	parentId = parentId.substr(0, parentId.lastIndexOf('-'));
	expandRow($('#tree').find('tr[id=' + parentId + '] a.folder').get(0), parentId);
}

function collapseAllRows() 
{
	$('#tree').find('tr[id*="-"]').each(function(index, e)
	{
		e.style.display = 'none';
	});
}

// LOCAL CODE
function elementInViewport(element)
{
    var rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.body.clientHeight) &&
      rect.right <= (window.innerWidth || document.body.clientWidth));
}

function highlightElement($element)
{
  var $tree = $('#tree');
  $tree.find('tr.selected').removeClass('selected');

  var $siteTitle = $('#site-title');
	if(!$element || !$element.text()) {
		document.title = $siteTitle.text();
		return;
	}

	$element.parents('tr').addClass('selected');
	document.title = $element.text() + ' - ' + $siteTitle.text();
	
	makeVisible($element.parents('tr'));
	if(!elementInViewport($element.get(0))) {
    $tree.scrollTo($element);
	}
}

$(function()
{	
  if(/iPhone|iPod|iPad/.test(navigator.userAgent)) {
    $('#content-frame').css({ overflow: 'scroll' });
  }
    
    var initialSize = parseInt($('#tree').css('width'));
	$("#tree-pane").splitter(
	{
		outline: true,
		anchorToWindow: true,
		sizeLeft: initialSize,
		resizeToWidth: true,
		cookie: 'splitter',
		splitbarKey: 'S'
	});
	
	$.address.init(function() 
	{
	  var $contentFrame = $('iframe#content-frame');
		$contentFrame.data('originalSrc', $contentFrame.attr('src'));
	});
	
	$.address.change(function(e) 
	{
    var $contentFrame = $('iframe#content-frame');
		var url = e.value.substr(1);
		if(url) {
      $contentFrame.get(0).contentWindow.location.replace(url);
    }
		else {
      $contentFrame.get(0).contentWindow.location.replace($contentFrame.data('originalSrc'));
    }

		var $element = $('tr a.document[href$="' + url + '"]');
		highlightElement($element);
	});  
	
	$('tr a.document').address();
	
	$('iframe#content-frame').load(function() 
	{		
		$(this).contents().find('a:not([target])').click(function(e)
		{
			e.preventDefault();

			var url = $(this).attr('href');
			$.address.value(url);
		}); 
	});
    
    collapseAllRows();
});