$(function(){
	
$('input[type="text"]').focus();

/* The user can look up a genre and hit submit
========================================================*/


/* TODO: 

2. Need to add uploader of song with link and soundcloud logo




/* When the user clicks on a genre, 
a list of songs should get populated
========================================================*/
var scTracks = [];
var songPosition = 0;
var currentSound = '';
var $searchField = $('#query');
var $submitBtn = $('#submit');
$submitBtn.val("Get songs");

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
	//Toggles the play button to allow user to pause and vice versa
	$(".play").find('span').removeClass().addClass("icon-play-2");
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
				
				//Toggles the play button to allow user to pause and vice versa
				$(".play").find('span').removeClass().addClass("icon-pause-2");
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
		url: "https://api.soundcloud.com/tracks.json?client_id=827d90477e86eb01e3dc6345c6272228&tags="+tag+"&limit=30",
		
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
			statusHTML += "<li class='tracks'>" + scTracks[i].title + "</li>";
		}) //End $.each
		statusHTML += "</ul>";

		//We'll fade out the old playlist
		//and fade in the new one
		$('#playlist p').fadeOut(function(){
			$(this).html(statusHTML).fadeIn();
			//This adds the CSS to the first song that will play
			$("#playlist").find("li.tracks:eq(0)").addClass('playing');
		}); 

		$('ul.playButtons').fadeIn();
		initializePlaylist();

		//Once everything is loaded, enable the inputs
		//And reset the submit button's value
		$searchField.prop("disabled", false);
		$submitBtn.attr("disabled", false).val("Get songs");
		
		console.log(response);
		
	});//End done
} //End getRequest


/* When the user clicks on a genre,
   the Ajax call gets made and the playlist is populated
=========================================================*/
$("#search-term").on('submit', function(event){
	event.preventDefault();

	$searchField.prop("disabled", true);
	$submitBtn.attr("disabled", true).val("Getting songs..");

	if(currentSound.playState) {
		scStopCurrentStream();
		getPlaylist($('#query').val());
	} else {
		getPlaylist($('#query').val());
	}

}); //End submit




/*Adding event listeners to the buttons
========================================================*/
$('.previous').on('click', function() {
	scStopCurrentStream();
	scStreamPrev();
}); //End on click next

$('.next').on('click', function() {
	scStopCurrentStream();
	scStreamNext();
}); //End on click next


//Toggle play button to pause and back
$('.play').on('click', function() {	
	musicPauseAndPlay();
}); //End on click play



/*When a user double clicks on a song - it will play
========================================================*/
$('#playlist p').on('dblclick', 'ul li.tracks', function(event){
	scStopCurrentStream();
	songPosition = $(this).index();
	scStream(songPosition);
}); //End on click




});//End ready