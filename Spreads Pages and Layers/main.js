

$(document).ready(function()
{

	$('#uedit-control').UEdit({
                                width:700, 
                                height:500,
                                showProgressOnRead:false,
                                readyFontTimeout:5000                               
                            });


	function uEditObject()
	{
		return $('#uedit-control').data('UEdit');
	}

	// document creation
	$('#btn-create').click(function()
	{
		uEditObject().setupDocument(createEmptyDocument(595,842));
		uEditObject().fitToPage();
	});

	function createEmptyDocument(inPageWidth,inPageHeight)
	{
		var result = new UEditDocument();

		// setup default master spread
		var master = new UEditMaster(result);
		master.name = 'default';
		master.pageWidth = inPageWidth;
		master.pageHeight = inPageHeight;
		result.addMaster(master);

		// setup 1st spread
		result.insertSpread(new UEditSpread(),0);

		// setup 1st page
		result.spreads[0].insertPage(new UEditPage(),0);

		// setup 1st layer
		var layer = new UEditLayer();
		layer.name = 'layer 1';
		layer.color = new XLIMColor(UXLIMAttribute.eColor, null, false, XLIMColor.eGreen);
		result.insertLayer(layer,0);

		return result;
	}	

	// XLIM file loading
	$('#btn-load').click(function()
	{
	    uEditObject().startProgressDialog("Loading XLIM Document...");

	    $.ajax({
	        url: './document/basic.xlim',
	        beforeSend: function (xhr) { xhr.overrideMimeType('text/xml;'); },
	        async: true,
	        dataType: "text",
	        success: function (data, status,xhr) {
	            if (!xhr.responseText)
	            	return; 

                uEditObject().updateProgressTitle("Setting up uEdit...");
                uEditObject().updateProgress(50);

	            setupContentReferences();
	            setupPreviewData();
			    $(uEditObject()).on('documentReadProgress',
			                        function(inEvent,inProgress,inTotal) {
			                                        uEditObject().updateProgress(50 + inProgress*50 /inTotal);
			                                    });

			    $(uEditObject()).one('documentReady',
			                        function() {
			                        		uEditObject().fitToPage();
			                        		uEditObject().hideProgressDialog();
			                                    });
                uEditObject().setupFromXLIM(xhr.responseText);
	        }
	    });

	});	

	function setupContentReferences()
	{

		// general methods for resources
		uEditObject().setImageMappingMethod(
			function(inImageLabel)
			{
				// check if starts with "resources" or "Resources"
				if(!inImageLabel.match(/^[r|R]esources*/))
					return null;

				// if so, grab the last item in the label and find it in "document/resources/"
				var labelItems = inImageLabel.match(/\/?[^\/]+/g);
				if(labelItems)
					return '/document/resources/' + labelItems[labelItems.length-1];
				else
					return null;
			});

		// add a single image mapping
		uEditObject().addImageMapping('logo','./document/otherImages/xmpieLogo.jpg');


		uEditObject().addFontMapping(
        {
            fontFamily: 'Times New Roman', 
            fontFace: 'Regular'
        },
        {
            css:
            {
                fontFace: {fontFamily: "Times New Roman Regular", src: './document/fonts/times.ttf'},
                fontFamily: 'Times New Roman Regular'
            }
        });
	}

	// XLIM file saving
	$('#btn-save').click(function()
	{
	    var xlimContent = uEditObject().writeToXLIM(true);	

	    console.log(xlimContent);
	});

	var maxZoomLevel = 4;
	var minZoomLevel = 0.3;

	// zoom
    $('#btn-zoom-in').click(function()
    {
    	if(uEditObject().zoom() < maxZoomLevel)
    		zoomAndCenter(uEditObject().zoom()+0.4);
    });

    $('#btn-zoom-out').click(function()
    {
    	if(uEditObject().zoom() > minZoomLevel)
	    	zoomAndCenter(uEditObject().zoom()-0.4);
    });

    function zoomAndCenter(inZoomLevel)
    {
        uEditObject().zoom(inZoomLevel);
        uEditObject().goToPage(uEditObject().getPageInView());
    }

	// Undo
    $('#btn-undo').click(function(inEvent)
    {
        uEditObject().getUndoService().undo();
    });
    $(uEditObject()).on('undoStackChanged',function(){
    	if(uEditObject().getUndoService().canUndo())
    		$('#btn-undo').removeAttr('disabled');
    	else
    		$('#btn-undo').attr('disabled','true');
    });

    // redo
    $('#btn-redo').click(function()
    {
        uEditObject().getUndoService().redo();
    });
    $(uEditObject()).on('redoStackChanged',function(){
    	if(uEditObject().getUndoService().canRedo())
    		$('#btn-redo').removeAttr('disabled');
    	else
    		$('#btn-redo').attr('disabled','true');


    });

    // go to page
    $('#btn-gotopage').click(function()
    {
    	var pageIndex =  parseInt($('#txt-gotopage').val(),10);
    	if(pageIndex>=1 && pageIndex<uEditObject().getDocument().getVisiblePagesCount()+1)
        	uEditObject().goToPage(pageIndex-1);
    });    
    $(uEditObject()).on('enterPage',function(event,inPageVisibleIndex){
    	$('#txt-gotopage').val(inPageVisibleIndex+1);
    });

    // show-hide frames
    $('#btn-showpreview').click(function()
    {
    	var $self = $(this);
    	if($self.hasClass('btn-img-off'))
        	uEditObject().setViewMode('normal');
        else
            uEditObject().setViewMode('preview');
        $self.toggleClass('btn-img-off')
    });


    // underline
    $(uEditObject()).on('itemSelected.underline',function()
    {
    	var selection = uEditObject().getSelection();

    	if(selection.length == 0 || selection[0].type != UEditBox.eTypeText)
    		$('#btn-underline').attr('disabled','true');
    	else
    		$('#btn-underline').removeAttr('disabled');
    });

	$('#btn-underline').click(function()
	{
		var tp = new UEditTextProperties();
		tp.underlineDescriptor = {enable:!$(this).hasClass('active')};
	    uEditObject().applyTextOverridesOnSelection(tp);
		$(this).toggleClass('active');
	});

   $(uEditObject()).on('textSelected.underline',function()
    {
		var selection = uEditObject().getTextSelection();
	    if(!selection)
	    {
	        var selectionBox = uEditObject().getSelection();
	        if(selectionBox.length === 0)
	            return;
	            
	        if(selectionBox[0].textContent)
	            selection = {start:0,length:selectionBox[0].textContent.getTextLength()};
	        else
	            return;
	    }

	    var affectiveTextProperties = uEditObject().getTextPropertiesOnRange(selection.start,selection.length);

		if(affectiveTextProperties.common.underlineDescriptor)	
		{
			if(affectiveTextProperties.properties.underlineDescriptor &&
					affectiveTextProperties.properties.underlineDescriptor.enable)
				$('#btn-underline').addClass('active');
			else
				$('#btn-underline').removeClass('active');
		}   
		else
			 $('#btn-underline').removeClass('active');


    });


    // preview data setup
    function setupPreviewData()
    {
    	// add records
    	var valuesArray = uEditObject().getPreviewValuesObject().values;
	    valuesArray.push(
	            {
	                'first': 'Herbert',
	                'image' : 'a.jpg',
	                'file' : 'hello.txt'
	            });
	    valuesArray.push(
	            {
	                'first': 'Egbert',
	                'image' : 'b.jpg',
	                'file' : 'welcome.txt'
	            });
	    valuesArray.push(
	            {
	                'first': 'Tierry',
	                'image' : 'c.jpg',
	                'file' : 'hello.txt'
	            });
	    valuesArray.push(
	            {
	                'first': 'Jeffrey',
	                'image' : 'd.jpg',
	                'file' : 'welcome.txt'
	            });


	    // add image mapping for the image assets
		uEditObject().addImageMapping('a.jpg','./document/Assets/a.jpg');
		uEditObject().addImageMapping('b.jpg','./document/Assets/b.jpg');
		uEditObject().addImageMapping('c.jpg','./document/Assets/c.jpg');
		uEditObject().addImageMapping('d.jpg','./document/Assets/d.jpg');

		// add text file mapping for the text assets
	    uEditObject().addTextFileMapping('hello.txt','./document/Assets/hello.txt');
	    uEditObject().addTextFileMapping('welcome.txt','./document/Assets/welcome.txt');

    }

    // preview controls setup
    $('#btn-show-preview').click(function()
    {
    	if($(this).hasClass('active'))
    	{
    		$(this).removeClass('active');
    		uEditObject().showDefaultValues();
	    	$('#btn-record-down,#btn-record-up').attr('disabled','true');
    	}
    	else
    	{
    		$(this).addClass('active');
    		uEditObject().showPreviewValues();
	    	$('#btn-record-down,#btn-record-up').removeAttr('disabled');
    	}

    });

    $('#btn-record-up').click(function(){
	    	uEditObject().getPreviewValuesObject().index += 1;
	    	if(uEditObject().getPreviewValuesObject().index == uEditObject().getPreviewValuesObject().values.length)
	    			uEditObject().getPreviewValuesObject().index = 0;
	    	uEditObject().showPreviewValues();
	});

    $('#btn-record-down').click(function(){
    	uEditObject().getPreviewValuesObject().index -= 1;
    	if(uEditObject().getPreviewValuesObject().index == -1)
    			uEditObject().getPreviewValuesObject().index = uEditObject().getPreviewValuesObject().values.length-1;
    	uEditObject().showPreviewValues();
	});


    $('#btn-add-text-box').click(function(){
		var uEdit = uEditObject();
	    var theDocument = uEdit.getDocument();

        // create a new box, set its type to a text box
        var newBox = new UEditBox();
        newBox.width = newBox.height = 200;
	    newBox.left = newBox.top = 0;
        newBox.type = UEditBox.eTypeText;
        
        // start a transaction on the undo service, from now on making changes on the document
        uEdit.getUndoService().pushUndoTransaction('add text box');

        // attach box to the currently displayed page
        theDocument.getPages()[uEdit.getActualPageInView()].attachBox(newBox);
        // connect it to the top [visible] layer
        newBox.layer = getTopVisibleLayer(theDocument);

        // create a new text object, attach to document and setup the new box as its only frame
        var newText = new UEditText();
        theDocument.appendText(newText);
        newText.appendFrame(newBox);

        // finish undo transaction
        uEdit.getUndoService().popUndoTransaction();

        // focus on new box and let's start editing
        uEdit.focusOnBox(newBox,true);
        uEdit.select(newBox);
        uEdit.getDocumentView().startTextEditModeOnSelection();

	});

	function getTopVisibleLayer(inDocument)
	{
		var i=inDocument.layers.length-1;
		var result = null;

		for(;i>=0 && !result;--i)
		{
			if(inDocument.layers[i].visible)
				result = inDocument.layers[i];
		}
		return result;
	}


});