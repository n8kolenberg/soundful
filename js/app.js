// $(function(){
	

/* The user can look up a genre and hit submit
========================================================*/



/* When the user clicks on a genre, 
a list of songs should get populated
========================================================*/
var scTracks = [];
var songPosition = 0;
var currentSound = '';


/* With Controls/functions to
   stop, play and go to the next song in the playlist
========================================================*/
function scStreamNext() {
	if(songPosition <= scTracks.length) {
		scStopCurrentStream();
		songPosition++
		scStream(songPosition);
	} else {
		scStopCurrentStream();
		songPosition = 0;
		scStream(songPosition);
	}
} //End scStreamNext()


function scStopCurrentStream() {
		currentSound.stop();
} //End scStopCurrentStream()



function scStream(songPosition) {
	SC.stream(scTracks[songPosition].stream_url, function(sound) {
				currentSound = sound;
				currentSound.play({
					onfinish: function() {
						scNextStream();
					} //End onfinish
				}); //End play() 
			}); //End callback function of SC.stream
}//End scSTream



/* The playlist gets initialized 
   and the first song should start playing
========================================================*/
function initializePlaylist() {
	SC.initialize({
	  client_id: '827d90477e86eb01e3dc6345c6272228'
	});
	scStopCurrentStream();
	scStream(0);
} //End initializePlaylist




/* AJAX request gets made when user
   submits form with the genre they want 
========================================================*/
function getPlaylist (playlistID, onFirstMusicLoad) {
	$.ajax({
		url: "https://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=827d90477e86eb01e3dc6345c6272228",
		dataType: "json",
		type : "GET"
	})
	.done(function(response){
		//reset scTracks whenever new playlist is received
		scTracks.length = 0;

		scTracks = response.tracks;
		initializePlaylist();
		
		console.log(response);
		
	});//End done
} //End getRequest




$("form#search-term").submit(function(event){
	event.preventDefault();
	var query = $("#query").val();
	getPlaylist(query);

}); //End submit


/*Adding event listeners to the buttons
========================================================*/
$('.next').on('click', function(){
	scStopCurrentStream();
	scStreamNext();
}); //End on click next


$('.play').on('click', function(){
	scStream(songPosition);
}); //End on click play

$('.stop').on('click', function(){
	scStopCurrentStream();
}); //End on click stop



// });//End ready