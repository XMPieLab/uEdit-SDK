

$(document).ready(function()
{

	$('#uedit-control').UEdit({
                                width:700, 
                                height:500                               
                            });


	function uEditObject()
	{
		return $('#uedit-control').data('UEdit');
	}

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

	$('#btn-load').click(function()
	{
	    $.ajax({
	        url: './document/basic.xlim',
	        beforeSend: function (xhr) { xhr.overrideMimeType('text/xml;'); },
	        async: true,
	        dataType: "text",
	        success: function (data, status,xhr) {
	            if (!xhr.responseText == null)
	            	return; 


	            setupContentReferences();
			    $(uEditObject()).one('documentReady',
			                        function() {
			                        		uEditObject().fitToPage();
			                                    });
                uEditObject().setupFromXLIM(xhr.responseText);
	        }
	    });

	});	

	function setupContentReferences()
	{
		uEditObject().addImageMapping('Resources/xmpieLogo.jpg','./document/resources/xmpieLogo.jpg');

		uEditObject().addFontMapping(
        {
            fontFamily: 'Times New Roman', 
            fontFace: 'Regular'
        },
        {
            css:
            {
                fontFace: {fontFamily: "Times New Roman1", src: './document/fonts/times.ttf'},
                fontFamily: 'Times New Roman1'
            }
        });
	}
});