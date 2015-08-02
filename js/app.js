$(function(){
	
$('input[type="text"]').focus();


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
		//Uses pause.js library to pause and resume progress bar animation
		$('.playing').resume()
		//Toggles the play button to allow user to pause and vice versa
		$(".play").find('span').removeClass().addClass("icon-pause-2");
	} else {
		scTogglePause()
		//Uses pause.js library to pause and resume progress bar animation
		$('.playing').pause()
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
				addSongMetaData(songPosition);

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
	addSongMetaData(0);
} //End initializePlaylist




/* AJAX request gets made when user
   submits form with the genre they want 
========================================================*/
function getPlaylist (tag) {
	$.ajax({
		url: "https://api.soundcloud.com/tracks.json?client_id=827d90477e86eb01e3dc6345c6272228&tags=" + tag + "&limit=50",
		
		//https://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=827d90477e86eb01e3dc6345c6272228
		dataType: "json",
		type : "GET"
	})
	.done(function(response){
		//reset scTracks and songPosition whenever new playlist is received
		scTracks.length = 0;
		songPosition = 0;

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
			//To start the progressbar for the first song of a new playlist
			songProgress(0);
		}); 

		$('.playButtonsWrapper').fadeIn();
		initializePlaylist();

		//Once everything is loaded, enable the inputs
		//And reset the submit button's value
		$searchField.prop("disabled", false);
		$submitBtn.attr("disabled", false).val("Get songs");
		
		console.log(response);
		
	}).fail( function(error) {
		console.log(error);

		//Reset the submit button's value
		$submitBtn.attr("disabled", false).val("Get songs");
	}
	);//End fail
} //End getRequest



/* When the user submits a tag,
   the Ajax call gets made and the playlist of tracks 
   is populated
=========================================================*/
$("#search-term").on('submit', function(event){
	event.preventDefault();

	// $searchField.prop("disabled", true);
	$submitBtn.val("Getting songs..");

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


//Function to add the uploader information of the song that's playing
function addSongMetaData (songPosition) {
	var songMetaData = "<ul>";
	songMetaData += "<li> <a href='"+ scTracks[songPosition].user.permalink_url +"' target='_blank'>";
	songMetaData += "<img src='" + scTracks[songPosition].user.avatar_url + "' class='albumArt' alt='Album art'></a></li>";
	songMetaData += "<li> Uploaded by: " + scTracks[songPosition].user.username + "</li>";
	songMetaData += "<li> On: " + scTracks[songPosition].created_at.slice(0, 10) + "</li>";
	songMetaData += "</ul";


	$('.scLogo').attr("href", scTracks[songPosition].user.permalink_url).fadeIn(170);
	$('#uploader').fadeOut(100, function() {
		$(this).html(songMetaData).fadeIn(170);
	});

	// Resets the songProgress bar
	$(".playing").finish();
	$(".playing").css("background-position", "100% 0%");
	
	// Calls the songProgress method to start tracking progress
	songProgress(songPosition);
}


//Function to break down the duration into steps for animating the song progress
function songProgress (i) {
	var songTime = scTracks[i].duration; //time in milliseconds
	$("li.playing").animate({
		"background-position": "0%"
	}, songTime, "linear");
}




/* UI additions s.a. using Sticky.js
========================================================*/
$('.playButtonsWrapper').sticky({
	topSpacing: 0
}).on('sticky-start', function(){
	$(this).css('background-color', 'rgba(28, 28, 31, 0.6)');
}).on('sticky-end', function(){
	$(this).css('background-color', 'transparent');
}); //End sticky

$('#uploader').sticky({
	topSpacing: 110
});

$('.soundCloudLogo').sticky({
	topSpacing: 330
});

//Main logo will go up once clicked on and the form will gain focus
$('#mainLogo').hover(function(){
	$(this).animate({
		top: "10px",
		left: "20px",
		fontSize: "60px",
		width: "150px"
	}, 700, function(){
		$('.instructions, #search-term').fadeIn(200, function(){
		$('#query').focus();
	})}//End nested animate function
	); //End animate
	
}); //End on click





});//End ready