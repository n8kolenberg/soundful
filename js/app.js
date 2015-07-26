$(function() {

$('#query').focus();



function showResults(results) {
	var statusHTML = "<ul>";
	$.each(results, function(index, value){
			statusHTML += "<li>" + value.snippet.title + "</li>";
			statusHTML += "<ul class='more-info'> <li>" + value.snippet.description + "</li>";
			statusHTML += "<li class= 'thumbnail'> <a href='http://www.youtube.com/watch?v=" + value.id.videoId + "' target=_blank> <img src='" + value.snippet.thumbnails.medium.url + "'alt='thumbnail'> </a> </li>"
			statusHTML += "</ul>";
	}); //End each
	statusHTML += "</ul>";
	$('#search-results').html(statusHTML);
}; //End showResults


function getRequest (searchTerm) {
	var url = "https://www.googleapis.com/youtube/v3/search";
	var params = {
		part : 'id,snippet',
		key : "AIzaSyBXRNgdiVy09x47yBxaUNGbwDFdb5EblvQ",
		maxResults : 10,
		q : searchTerm
	};

	$.getJSON(url, params, function(data){
		showResults(data.items);
		console.log(data);
	});//End getJSON
} //End getRequest



$("form#search-term").submit(function(event){
	event.preventDefault();
	var query = $("#query").val();
	getRequest(query);

}); //End submit
	







}); //End ready