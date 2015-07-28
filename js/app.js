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
					}
				}); //End play()

				//The following will give the song that's playing its CSS styling	
				$("#playlist").find("li").removeClass('playing');
				$("#playlist").find("li:eq(" + songPosition + ")").addClass('playing');
				
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
function getPlaylist (tag) {
	$.ajax({
		url: "https://api.soundcloud.com/tracks.json?client_id=827d90477e86eb01e3dc6345c6272228&tags="+tag+"&limit=20",
		
		//https://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=827d90477e86eb01e3dc6345c6272228
		dataType: "json",
		type : "GET"
	})
	.done(function(response){
		//reset scTracks whenever new playlist is received
		scTracks.length = 0;

		var statusHTML = "<ul>";
		$.each(response, function(i, value){
			scTracks.push(value);
			statusHTML += "<li class='tracks'>" + scTracks[i].title +  " Uploaded by: " + scTracks[i].user.username + "</li>";
		}) //End $.each
		statusHTML += "</ul>";
		$('#playlist p').html(statusHTML).fadeIn();
		$('ul.playButtons').fadeIn();
		initializePlaylist();

		//This adds the CSS to the first song that will play
		$("#playlist").find("li:eq(0)").addClass('playing'); //NEED TO ADD .FIND for FASTER PERFORMANCE
		console.log(response);
		
	});//End done
} //End getRequest


/* When the user clicks on a genre,
   the Ajax call gets made and the playlist is populated
=========================================================*/
$("#search-term").on('submit', function(event){
	event.preventDefault();
	if(currentSound.playState) {
		getPlaylist($('#query').val());
		scStopCurrentStream();
	} else {
		getPlaylist($('#query').val());
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


/*When a user double clicks on a song - it will play
========================================================*/
$('#playlist p').on('dblclick', 'ul li', function(event){
	scStopCurrentStream();
	scStream($(this).index());
}); //End on click



// });//End ready