var username;
var channelLimit;
var onlineIndex = 0;
var offlineIndex = 0;
var onlineFormatted = [];
var offlineFormatted = [];

window.onload = function() {
	
	document.getElementById("maxChannels").value = channelLimit;
	
	//user param
	if (getAllUrlParams().u != undefined && getAllUrlParams().u != "") {
		var urlUser = getAllUrlParams().u;
		document.getElementById("userInput").value = urlUser;
		fetchMods(urlUser);
		document.getElementById("goButton").disabled = true;
		setTimeout(function() {
			document.getElementById("goButton").disabled = false;
		}, 1000);
	}
	if (getAllUrlParams().u == undefined) {
		window.location.href = "?u=";
	}
	
	//limit param
	
	if (getAllUrlParams().limit != 250 && getAllUrlParams().limit != 500) {
		channelLimit = 100;
		document.getElementById("maxChannels").value = 100;
		document.getElementById("thisIs").textContent = $("#maxChannels option:selected").text();
	}
	else {
		channelLimit = getAllUrlParams().limit;
		document.getElementById("maxChannels").value = channelLimit
		document.getElementById("thisIs").textContent = $("#maxChannels option:selected").text();
	}
	
}

function newLimit() {
	var pendingLimit = $("#maxChannels option:selected").text();
	insertParam("limit", pendingLimit);
}

function buttonAction() {
	username = document.getElementById("userInput").value;
	insertParam("u", username);
}

function fetchMods(user) {
	$.ajax({
		url: "https://twitchstuff.3v.fi/modlookup/api/user/" + user + "?limit=" + channelLimit,
		success: function (data) {
			console.log(data);
			
			if (data.count == 0) {
				document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td><td></td></tr>";
				document.getElementById("offlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td><td></td></tr>";
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
				getTwitchData(modList[index], index);				
			}
			
		},
		});
}
function getTwitchData(tUser, i) {
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
			//onlineFormatted.push("<tr><td class='online'>" + tUser + "</td><td><a href='https://www.twitch.tv/" + tUser + "'>twitch.tv/" + tUser + "</a></td></tr>");
			//onlineFormatted.sort();
			//document.getElementById("onlineTable").innerHTML = onlineFormatted.join("");
			
			
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
				
				 
				onlineFormatted.push("<tr><td class='online'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'>" + data.display_name + "</a></td><td>" + truncatedTitle + "<br /><strong>Game: </strong>" + data.game + "</td><td>" + viewersCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " viewers<br />" + data.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " followers<br />" + data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " views</td></tr>");
				onlineFormatted.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
				document.getElementById("onlineTable").innerHTML = onlineFormatted.join("");
			 }
			});
			
			
		}
		
		
		else {
			offlineIndex++;
			//offlineFormatted.push("<tr><td class='offline'>" + tUser + "</td><td><a href='https://www.twitch.tv/" + tUser + "'>twitch.tv/" + tUser + "</a></td></tr>");
			//offlineFormatted.sort();
			//document.getElementById("offlineTable").innerHTML = offlineFormatted.join("");
			
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
				 
				 
				offlineFormatted.push("<tr><td class='offline'>" + "<a href='https://www.twitch.tv/" + tUser + "' target='_blank'>" + data.display_name + "</a></td><td>" + truncatedTitle + "<br /><strong>Game: </strong>" + data.game + "</td><td>" + data.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " followers<br />" + data.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " views</td></tr>");
				
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
			document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td><td></td></tr>";
		}
		
	 }
	});
}


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
	  paramName = paramName.toLowerCase();
	  paramValue = paramValue.toLowerCase();

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