/*
	Twitch Mod Dashboard
	app.js
	Copyright (C) Matt Jones - All Rights Reserved
*/

// global vars
var username, channelLimit, apiUrl, windowOnload, stopTimer, count;
var onlineIndex = 0;
var offlineIndex = 0;
var onlineFormatted = [];
var offlineFormatted = [];

// stuff that loads with page
window.onload = function () {
if (getAllUrlParams().u != undefined && getAllUrlParams().u != "") {
	setTimeout(function() {
		$('#loader').fadeOut(500);
	}, 1000);
}
else {
	setTimeout(function() {
		$('#loader').fadeOut(500);
	}, 200);
}
autoRefresh();

// stuff that loads with page, and whenever called
windowOnload = function() {
	$("#maxChannels").val(channelLimit);

	//limit param
	if (getAllUrlParams().limit != 250 && getAllUrlParams().limit != 500) {
		channelLimit = 100;
		$("#maxChannels").val(100);
	}
	else {
		channelLimit = getAllUrlParams().limit;
		$("#maxChannels").val(channelLimit);
	}

	//user param
	if (getAllUrlParams().u != undefined && getAllUrlParams().u != "") {
		var urlUser = getAllUrlParams().u;
		$("#userInput").val(urlUser);
		document.title = "Mod Dashboard - " + urlUser;
		fetchMods(urlUser);
	}
	if (getAllUrlParams().u == "" || getAllUrlParams().u == undefined) {
		// set visibility and display parameters to display nothing on default
		$(".default-h").css("visibility", "hidden");
		$(".default-n").css("display", "none");
		stopTimer = 1;
	}
} // end windowOnload
windowOnload();
}

// inserts new limit into URL (effectively reloads page)
function newLimit() {
	var pendingLimit = $("#maxChannels option:selected").text();
	insertParam("limit", pendingLimit);
}

// inserts name from textbox into url (effectively reloads page)
function buttonAction() {
	username = $("#userInput").val();
	insertParam("u", username);
}

// function that converts text in stream titles to clickable URLs
// may throw error if no URL found in title string
function convertToURL(text) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
}

// disable/enable auto refresh when checkbox is changed
$('#autoRefresh').on('change', disableRefresh);

function disableRefresh() {
	count = 60;
	$("#refreshingIn").html("&nbsp;");
	$("#refreshingIn").css("color", "rgba(255, 255, 255, 0.8)");
	$("#refreshingIn").css("font-weight", "normal");
	$("#refreshInterval").prop("disabled", !$("#refreshInterval").prop("disabled"));
}

function restartTimer() {
	if (document.getElementById('refreshInterval').value == 1) count = 60;
	else if (document.getElementById('refreshInterval').value == 5) count = 300;
	else if (document.getElementById('refreshInterval').value == 10) count = 600;
	else count = 60;
}

function autoRefresh() {
	restartTimer();
	var counter = setInterval(timer, 1000); //1000 will  run it every 1 second
	function timer() {
		if (stopTimer != 1 && document.getElementById("autoRefresh").checked) {
			count = count - 1;
			if(count <= 5) {
				$("#refreshingIn").css("color", "red");
				$("#refreshingIn").css("font-weight", "bold");
			}
			if (count <= 0) {
				clearInterval(counter);
				onlineIndex = 0;
				offlineIndex = 0;
				$('#body-wrapper').fadeOut(500);
				$('#loader').fadeIn(200);
				setTimeout(windowOnload, 1000);
				setTimeout(function() {
					$('#loader').fadeOut(200);
					$('#body-wrapper').fadeIn(500);
				}, 2000);

				autoRefresh();
				$("#refreshingIn").css("color", "rgba(255, 255, 255, 0.8)");
				$("#refreshingIn").css("font-weight", "normal");
				$("#refreshingIn").html("&nbsp;");
				return;
			}

			if (count < 60) {
				$("#refreshingIn").text("Refreshing in " + count + " seconds");
			}
			else {
				// pad time with leading zero
				function pad(num) {
					var s = num+"";
					while (s.length < 2) s = "0" + s;
					return s;
				}

				var totalSeconds = count;
				var seconds = totalSeconds % 60;
				var minutes = Math.floor(totalSeconds / 60);
				var time = minutes + ":" + pad(seconds);

				$("#refreshingIn").text("Refreshing in " + time);
			}
		}
		else {
			count = 60;
			$("#refreshingIn").html("&nbsp;");
			$("#refreshingIn").css("color", "rgba(255, 255, 255, 0.8)");
			$("#refreshingIn").css("font-weight", "normal");
		}

	}
}

function fetchMods(user) {
	$.ajax({
		url: "https://twitchstuff.3v.fi/modlookup/api/user/" + user + "?limit=" + channelLimit,
		success: function (data) {
			console.log(data);
			// set "total channels" html
			$("#totalChannels").html(data.user + " moderates a total of " + data.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " channels"
			+ "<br />Displaying " + data.channels.length + " of " + data.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

			// if more than 500 channels, disable auto refresh & display warning
			if (data.count > 500) {
				$("#maxExceed").removeClass("hideMe");
				$("#refreshingIn").text("");
				$("#autoRefresh").prop("checked", false);
				$("#autoRefresh").prop("disabled", true);
			}

			// show placeholders if no channels
			if (data.count == 0) {
				$("#onlineTable").html("<tr class='noChannels'><td class='empty'>-</td><td>no channels found for this user.</td><td>-</td></tr>");
				$("#offlineTable").html("<tr class='noChannels'><td class='empty'>-</td><td>no channels found for this user.</td><td>-</td></tr>");
			}

			var modList = [];

			for(var index = 0;  index < data.channels.length; index++) {
				modList[modList.length] = data.channels[index].name;
			}
			sortedModList = modList.sort();

			for(var index=0; index < modList.length; index++) {
				$("#onlineTable").html("");
				$("#offlineTable").html("");
				onlineFormatted = [];
				offlineFormatted = [];
				getTwitchData(modList[index]);
			}
		} // end success
	}); // end ajax
}

function getTwitchData(tUser) {
	$.ajax({
		type: 'GET',
		url: "https://api.twitch.tv/kraken/channels/" + tUser,
		headers: {
		'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
		},
		success: function(data) {
			var channelName = data.display_name;
			var channelStatus = data.status;
			var channelFollowers = data.followers;
			var channelViews = data.views;
			var channelGame = data.game;
			if (data.status) {
				// truncate title if more than 50 chars
				if (data.status.length > 50) {
					var truncatedTitle = data.status.substring(0, 50) + "&hellip;";
				}
				else {
					var truncatedTitle = data.status;
				}
			}
			else {
				var truncatedTitle = data.status;
			}
			var fullTitle = convertToURL(data.status);
			var userLogo;
			if (data.logo != null) userLogo = data.logo;
			else userLogo = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";

			$.ajax({
				type: 'GET',
				url: 'https://api.twitch.tv/kraken/streams/' + tUser,
				headers: {
				'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
				},
				success: function(data) {
					console.log(data);
					var channelAPI = data._links.channel;
					// if ONLINE
					if (data.stream != null) {
						var viewersCount = data.stream.viewers;

						onlineFormatted.push("<tr><td class='online'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'><img src='" + userLogo + "' />" + channelName + "</a></td><td class='center'><span class='truncatedTitle'>" + truncatedTitle + "</span><span class='fullTitle'>" + fullTitle + "</span><br /><strong>Game: </strong>" + channelGame + "</td><td><i class='fa fa-user'></i> " + viewersCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-heart'></i> " + channelFollowers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-eye'></i> " + channelViews.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</td></tr>");
						onlineIndex++

						onlineFormatted.sort(function (a, b) {
							return a.toLowerCase().localeCompare(b.toLowerCase());
						});
						$("#onlineTable").html(onlineFormatted.join(""));
					} // end if ONLINE

					// else OFFLINE
					else {
						offlineFormatted.push("<tr><td class='offline'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'><img src='" + userLogo + "' />" + channelName + "</a></td><td class='center'><span class='truncatedTitle'>" + truncatedTitle + "</span><span class='fullTitle'>" + fullTitle + "</span><br /><strong>Game: </strong>" + channelGame + "</td><td><i class='fa fa-heart'></i> " + channelFollowers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-eye'></i> " + channelViews.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</td></tr>");
						offlineIndex++;

						offlineFormatted.sort(function (a, b) {
							return a.toLowerCase().localeCompare(b.toLowerCase());
						});
						$("#offlineTable").html( offlineFormatted.join(""));
					} // end else OFFLINE

					if (onlineIndex == 1) {
						$("#onlineIndex").text(onlineIndex + " online channel");
					}
					else {
						$("#onlineIndex").text(onlineIndex + " online channels");
					}
					if (offlineIndex == 1) {
						$("#offlineIndex").text(offlineIndex + " offline channel");
					}
					else {
						$("#offlineIndex").text(offlineIndex + " offline channels");
					}
					if (onlineIndex < 1) {
						$("#onlineTable").html("<tr class='noChannels'><td class='empty'>-</td><td>-</td><td>-</td></tr>");
					}
					if (offlineIndex < 1) {
						$("#offlineTable").html("<tr class='noChannels'><td class='empty'>-</td><td>-</td><td>-</td></tr>");
					}
				} // end success
			}); // end ajax
		} // end success
	}); // end ajax

}

function insertParam(key, value) {
    key = encodeURI(key); value = encodeURI(value);

    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--) {
        x = kvp[i].split('=');

        if (x[0]==key) {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');
}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

	// stuff after # is not part of query string, so get rid of it
	queryString = queryString.split('#')[0];

	// split our query string into its component parts
	var arr = queryString.split('&');

	for (var i=0; i<arr.length; i++) {
	  // separate the keys and the values
	  var a = arr[i].split('=');

	  // in case params look like: list[]=thing1&list[]=thing2
	  var paramNum = undefined;
	  var paramName = a[0].replace(/\[\d*\]/, function(v) {
		paramNum = v.slice(1,-1);
		return '';
	  });

	  // set parameter value (use 'true' if empty)
	  var paramValue = typeof(a[1])==='undefined' ? true : a[1];

	  // (optional) keep case consistent
	  //paramName = paramName.toLowerCase();
	  //paramValue = paramValue.toLowerCase();

	  // if parameter name already exists
	  if (obj[paramName]) {
		// convert value to array (if still string)
		if (typeof obj[paramName] === 'string') {
		  obj[paramName] = [obj[paramName]];
		}
		// if no array index number specified...
		if (typeof paramNum === 'undefined') {
		  // put the value on the end of the array
		  obj[paramName].push(paramValue);
		}
		// if array index number specified...
		else {
		  // put the value at that index number
		  obj[paramName][paramNum] = paramValue;
		}
	  }
	  // if param name doesn't exist yet, set it
	  else {
		obj[paramName] = paramValue;
	  }
	}
  }

  return obj;
}
