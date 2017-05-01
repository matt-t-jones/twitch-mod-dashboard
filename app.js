var username;
var channelLimit;
var apiUrl;
var onlineIndex = 0;
var offlineIndex = 0;
var onlineFormatted = [];
var offlineFormatted = [];
var windowOnload;
var stopTimer;

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

    windowOnload = function() {

        document.getElementById("maxChannels").value = channelLimit;


        //limit param

        if (getAllUrlParams().limit != 250 && getAllUrlParams().limit != 500) {
            channelLimit = 100;
            document.getElementById("maxChannels").value = 100;
        }
        else {
            channelLimit = getAllUrlParams().limit;
            document.getElementById("maxChannels").value = channelLimit;
        }

        //user param
        if (getAllUrlParams().u != undefined && getAllUrlParams().u != "") {
            var urlUser = getAllUrlParams().u;
            document.getElementById("userInput").value = urlUser;
            document.title = "Mod Dashboard - " + urlUser;
            fetchMods(urlUser);
        }
        if (getAllUrlParams().u == "" || getAllUrlParams().u == undefined) {
            document.getElementsByClassName("headerBody")[0].style.visibility = "hidden";
            document.getElementsByClassName("headerBody")[1].style.visibility = "hidden";
            document.getElementById("refreshingIn").style.visibility = "hidden";
            document.getElementById("totalChannels").style.visibility = "hidden";
			document.getElementsByTagName("hr")[0].style.visibility = "hidden";
			document.getElementsByTagName("hr")[1].style.visibility = "hidden";
			document.getElementById("maxChannels").style.display = "none";
			document.getElementById("maxChannelsSpan").style.display = "none";
			document.getElementById("maxExceed").style.display = "none";
			document.getElementById("autoRefreshSpan").style.display = "none";
			document.getElementById("refreshInterval").style.display = "none";
			document.getElementById("refreshIntervalSpan").style.display = "none";
			
            stopTimer = 1;
        }

    }
    windowOnload();
	

}

function newLimit() {
	var pendingLimit = $("#maxChannels option:selected").text();
	insertParam("limit", pendingLimit);
}

function buttonAction() {
	username = document.getElementById("userInput").value;
	insertParam("u", username);
}

function convertToURL(text) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

var refreshingIn = document.getElementById("refreshingIn");

$('#autoRefresh').on('change', disableRefresh);

function disableRefresh() {
	document.getElementById("refreshingIn").innerHTML = "&nbsp;";
	count = 60;
	refreshingIn.style.color = "rgba(255, 255, 255, 0.8)";
	refreshingIn.style.fontWeight = "normal";
}

var count;

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
				refreshingIn.style.color = "red";
				refreshingIn.style.fontWeight = "bold";
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
				refreshingIn.style.color = "rgba(255, 255, 255, 0.8)";
				refreshingIn.style.fontWeight = "normal";
				refreshingIn.innerHTML = "&nbsp;";
                return;
            }
			
			if (count < 60) {
				refreshingIn.textContent = "Refreshing in " + count + " seconds";
			}
			else {
			
				function pad(num) {
					var s = num+"";
					while (s.length < 2) s = "0" + s;
					return s;
				}
			
				var totalSeconds = count;
				var seconds = totalSeconds % 60;
				var minutes = Math.floor(totalSeconds / 60);
				var time = minutes + ":" + pad(seconds);

				refreshingIn.textContent = "Refreshing in " + time;
			}
        }
		else {
			refreshingIn.innerHTML = "&nbsp;";
			count = 60;
			refreshingIn.style.color = "rgba(255, 255, 255, 0.8)";
			refreshingIn.style.fontWeight = "normal";
		}
		
    }
}

function fetchMods(user) {
	$.ajax({
		url: "https://twitchstuff.3v.fi/modlookup/api/user/" + user + "?limit=" + channelLimit,
		success: function (data) {
		    console.log(data);
		    document.getElementById("totalChannels").innerHTML = data.user + " moderates a total of " + data.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " channels"
			+ "<br />Displaying " + data.channels.length + " of " + data.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			if (data.count > 500) {
				document.getElementById("maxExceed").classList.remove("hideMe");
				document.getElementById("refreshingIn").textContent = "";
				document.getElementById("autoRefresh").checked = false;
				document.getElementById("autoRefresh").disabled = true;
			}
			
			if (data.count == 0) {
				document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td class='empty'>-</td><td>no channels found for this user.</td><td>-</td></tr>";
				document.getElementById("offlineTable").innerHTML = "<tr class='noChannels'><td class='empty'>-</td><td>no channels found for this user.</td><td>-</td></tr>";
			}
			
			var modList = [];
			
			for(var index = 0;  index < data.channels.length; index++) {
				modList[modList.length] = data.channels[index].name;
			}
			sortedModList = modList.sort();
			
			for(var index=0; index < modList.length; index++) {
				document.getElementById("onlineTable").innerHTML = "";
				document.getElementById("offlineTable").innerHTML = "";
				onlineFormatted = [];
				offlineFormatted = [];	
				getTwitchData(modList[index]);				
			}
			
		},
		});
}
function getTwitchData(tUser) {
	$.ajax({
	 type: 'GET',
	 url: 'https://api.twitch.tv/kraken/streams/' + tUser,
	 headers: {
	   'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
	 },
	 success: function(data) {
		
		console.log(data);
		var channelAPI = data._links.channel;
		
		if (data.stream != null) {
			onlineIndex++;
			var viewersCount = data.stream.viewers;

			$.ajax({
			 type: 'GET',
			 url: "https://api.twitch.tv/kraken/channels/" + tUser,
			 headers: {
			   'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
			 },
			 success: function(data) {
				if (data.status) {
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
				 
				onlineFormatted.push("<tr><td class='online'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'><img src='" + userLogo + "' />" + data.display_name + "</a></td><td class='center'><span class='truncatedTitle'>" + truncatedTitle + "</span><span class='fullTitle'>" + fullTitle + "</span><br /><strong>Game: </strong>" + data.game + "</td><td><i class='fa fa-user'></i> " + viewersCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-heart'></i> " + data.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-eye'></i> " + data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</td></tr>");
				onlineFormatted.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
				document.getElementById("onlineTable").innerHTML = onlineFormatted.join("");
			 }
			});
			
			
		}
		
		
		else {
			offlineIndex++;
			
			$.ajax({
			 type: 'GET',
			 url: "https://api.twitch.tv/kraken/channels/" + tUser,
			 headers: {
			   'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
			 },
			 success: function(data) {
				 
				if (data.status) {
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
				
				var userLogo
				if (data.logo != null) {
				    userLogo = data.logo;
				}
				else userLogo = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";
				 
				offlineFormatted.push("<tr><td class='offline'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'><img src='" + userLogo + "' />" + data.display_name + "</a></td><td class='center'><span class='truncatedTitle'>" + truncatedTitle + "</span><span class='fullTitle'>" + fullTitle + "</span><br /><strong>Game: </strong>" + data.game + "</td><td><i class='fa fa-heart'></i> " + data.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "<br /><i class='fa fa-eye'></i> " + data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</td></tr>");
				
				offlineFormatted.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
				document.getElementById("offlineTable").innerHTML = offlineFormatted.join("");
				//document.getElementById("printedArray").innerHTML = offlineFormatted.join ("<br />");
			 }
			});
			
		}
		if (onlineIndex == 1) {
			document.getElementById("onlineIndex").textContent = onlineIndex + " online channel";
		}
		else {
			document.getElementById("onlineIndex").textContent = onlineIndex + " online channels";
		}
		if (offlineIndex == 1) {
			document.getElementById("offlineIndex").textContent = offlineIndex + " offline channel";
		}
		else {
			document.getElementById("offlineIndex").textContent = offlineIndex + " offline channels";
		}
		
		
		if (onlineIndex < 1) {
			document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td class='empty'>-</td><td>-</td><td>-</td></tr>";
		}
		
		if (offlineIndex < 1) {
			document.getElementById("offlineTable").innerHTML = "<tr class='noChannels'><td class='empty'>-</td><td>-</td><td>-</td></tr>";
		}
	 }
	});
}

// not my code vvv
function insertParam(key, value)
{
    key = encodeURI(key); value = encodeURI(value);

    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--) 
    {
        x = kvp[i].split('=');

        if (x[0]==key)
        {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&'); 
}


// not my code vvv
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