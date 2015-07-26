// $(function(){
	
$('input[type="text"]').focus();

/* The user can look up a genre and hit submit
========================================================*/



/* When the user clicks on a genre, 
a list of songs should get populated
========================================================*/
var scTracks = [];
var songPosition = 0;
var currentSound = '';
var query = $("#query");


/* With Controls/functions to
   stop, play and go to the next song in the playlist
========================================================*/
function scStreamNext() {
	if(songPosition < scTracks.length - 1) {
		scStopCurrentStream();
		songPosition++;
		scStream(songPosition);
	} else {
		scStopCurrentStream();
		songPosition = 0;
		scStream(songPosition);
	}
} //End scStreamNext()

function scStreamPrev() {
	if(songPosition == 0) {
		scStopCurrentStream();
		scStream(songPosition);
	} else {
		scStopCurrentStream();
		songPosition--;
		scStream(songPosition);
	}
} //End scStreamPrev()


function scStopCurrentStream() {
		currentSound.stop();
} //End scStopCurrentStream()

function scTogglePause() {
	currentSound.togglePause();
}


function musicPauseAndPlay() {
	if(currentSound.paused) {
		scTogglePause();
	} else {
		scTogglePause()
	}

}


function scStream(songPosition) {
	SC.stream(scTracks[songPosition].stream_url, function(sound) {
				currentSound = sound;
				currentSound.play({
					onfinish: function() {
						scStreamNext();
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
	scStream(0);
} //End initializePlaylist




/* AJAX request gets made when user
   submits form with the genre they want 
========================================================*/
function getPlaylist (playlistID) {
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

		var statusHTML = "<ul>";
		$.each(response.tracks, function(i, track){
			statusHTML = "<li>" + scTracks[i].title + "</li>";
		}) //End $.each
		statusHTML = "</ul>";
		$('#playlistResults').html(statusHTML);
		console.log(response);
		
	});//End done
} //End getRequest




$("li.genre").on('click', function(){
	if(currentSound.playState) {
		getPlaylist($(this).text());
		scStopCurrentStream();
	} else {
		getPlaylist($(this).text());
	}

}); //End submit


/*Adding event listeners to the buttons
========================================================*/
$('.previous').on('click', function(){
	scStopCurrentStream();
	scStreamPrev();
}); //End on click next

$('.next').on('click', function(){
	scStopCurrentStream();
	scStreamNext();
}); //End on click next


$('.play').on('click', function(){
	musicPauseAndPlay();
}); //End on click play

$('.pause').on('click', function(){
	musicPauseAndPlay();
}); //End on click stop


$('.stop').on('click', function(){
	scStopCurrentStream();
}); //End on click stop



// });//End ready