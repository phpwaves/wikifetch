$("#button").click(function(e) {
	e.preventDefault();
	var input_string = $("#forminput").val();
	var token = $('input[name="csrfmiddlewaretoken"]').prop('value');
	$.ajax({
		url : "/ajax",
		type : "POST",
		dataType: "json",
		data : {
			'client_response' : input_string,
			'csrfmiddlewaretoken': token,
		},
		success : function(json) {
			$('#result').append( 'Server Response: ' + json.server_response);
		},
		error : function(xhr,errmsg,err) {
		alert(xhr.status + ": " + xhr.responseText);
		}
	});
	e.preventDefault();
    $("form").toggle(100);
});

