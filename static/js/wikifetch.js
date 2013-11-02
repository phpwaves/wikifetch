//code block to populate version history
$("#button").click(function(e) {
	var wiki_url = $( "#wikiurl" ).val();
	var res = wiki_url.replace("http://en.wikipedia.org/wiki/",'');
	$.ajax({
		type: "GET",
		url: "fetchWiki/?wiki="+decodeURI(res),
		dataType: "json",
		success : function(data) {
			var options = '<b>Select version to view article info : </b><select id="article" name="article" onchange=viewArticle();>';
			options += '<option value="">select wiki revision</optoin>';
			for(var i in data){
				options += '<option value='+data[i].url+' >' + data[i].title + '</option>';
			}
			options += '</select>';

			$('#result').html(options);
		},
		error : function(xhr,errmsg,err) {
			alert(xhr.status + ": " + xhr.responseText);
		}
	});
});

//function to load vesrion histroy article content
function viewArticle(){
	var id = $( "#article" ).val();
	var wiki_version_url = "http://en.wikipedia.org"+id
	$.ajax({
		type: "GET",
		url: "fetchArticle/?url="+wiki_version_url,
		dataType: "json",
		success : function(data) {
			var options = '';
			for(var i in data){
				options += data[i];
			}
			$('#article1').html(options);
		},
		error : function(xhr,errmsg,err) {
			alert(xhr.status + ": " + xhr.responseText);
		}
	});
}