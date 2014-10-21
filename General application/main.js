

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

    // undo
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

});