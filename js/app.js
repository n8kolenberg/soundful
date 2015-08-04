$(function(){
	
$('input[type="text"]').focus();

//This changes the placeholder value showing users
//examples of what they can search for
var inputPlaceholder = ["Bob Marley", "Sway", "Folk Pop", "Dancehall", "Classic Rock", "Chill", "Ambient", "House", "Electronic Dance", "Folk", "Indie Rock", "Remix", "HipHop", "R&B", "Soul", "Funk", "Michael Jackson", "Rock", "Rolling Stones"];
setInterval(function() {
    $("input[type='text']").attr("placeholder", inputPlaceholder[inputPlaceholder.push(inputPlaceholder.shift())-1]);
}, 3000);



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
	//Stop the first song from playing
	musicPauseAndPlay();
} //End initializePlaylist




/* AJAX request gets made when user
   submits form with the genre they want 
========================================================*/
function getPlaylist (tag) {
	$.ajax({
		url: "https://api.soundcloud.com/tracks.json?client_id=827d90477e86eb01e3dc6345c6272228&tags=" + tag + "&limit=100",
		
		//https://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=827d90477e86eb01e3dc6345c6272228
		dataType: "json",
		type : "GET"
	})
	.done(function(response){
		//reset scTracks and songPosition whenever new playlist is received
		scTracks.length = 0;
		songPosition = 0;

		var statusHTML = "<ul>";	
		if (response.length) {		
			$.each(response, function(i, value){
				//We're now going to filter out 50 streamable tracks and
				//add them to scTracks
				if (value.streamable !== false && scTracks.length < 51) {
				scTracks.push(value);
				statusHTML += "<li class='tracks'>" + value.title + "</li>";
			} 
			}); //End $.each
			statusHTML += "</ul>";

			//We'll fade out the old playlist
			//and fade in the new one
			$('#playlist p').fadeOut(function(){
				$(this).html(statusHTML).fadeIn();
				//This adds the CSS to the first song that will play
				$("#playlist").find("li.tracks:eq(0)").addClass('playing');
				initializePlaylist();
			}); //End fadeOut - fadeIn

			$('.playButtonsWrapper').fadeIn();
		
			} else {
				statusHTML += "<li>Well this is embarrassing... Looks like your search didn't return any results! </li>";
				statusHTML += "<li>Why don't you try searching for something else?</li>";
				statusHTML += "</ul>"
				//We'll fade out the old playlist and uploader meta data,
				//the play buttons and fade in the error message
				$('#playlist p').fadeOut(function(){
					$('#uploader').hide();
					$('.scLogo').hide();
					$('.playButtonsWrapper').fadeOut();
					$(this).html(statusHTML).fadeIn();
			}); 
			}//End if statement to check whether the response has a length 
			
			//Once everything is loaded, enable the inputs
			//And reset the submit button's value
			$submitBtn.attr("disabled", false).val("Get songs");

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
$('#playlist p').on('click', 'ul li.tracks', function(event){
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
var flag = false;
$('#mainLogo').hover(function(){
	if(!flag) {
		$(this).animate({
			top: "0px",
			left: "40px",
			fontSize: "80px",
			width: "175px"
		}, 700, function(){
			$('.instructions, #search-term').fadeIn(200, function(){
			$('#query').focus();
		})}//End nested animate function
		); //End animate
	flag = true;
	} //End if statement
}).end(); //End on hover





});//End ready