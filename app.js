window.onload = function() {
	if (getAllUrlParams().u != undefined && getAllUrlParams().u != "") {
		var urlUser = getAllUrlParams().u;
		document.getElementById("userInput").value = urlUser;
		fetchMods(urlUser);
		document.getElementById("goButton").disabled = true;
		setTimeout(function() {
			document.getElementById("goButton").disabled = false;
		}, 1000);
	}
	
}

var username;
var onlineIndex = 0;
var offlineIndex = 0;
var onlineFormatted = [];
var offlineFormatted = [];
function buttonAction() {
	username = document.getElementById("userInput").value;
	window.location.href = "?u=" + username;
}

function fetchMods(user) {
	$.ajax({
		url: "https://twitchstuff.3v.fi/modlookup/api/user/" + user + "?limit=200",
		success: function (data) {
			console.log(data);
			
			if (data.count == 0) {
				document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td></tr>";
				document.getElementById("offlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td></tr>";
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
		
		if (data.stream) {
			onlineIndex++;
			onlineFormatted.push("<tr><td class='online'>" + tUser + "</td><td><a href='https://www.twitch.tv/" + tUser + "'>twitch.tv/" + tUser + "</a></td></tr>");
			onlineFormatted.sort();
			document.getElementById("onlineTable").innerHTML = onlineFormatted.join("");
		}
		
		
		else {
			offlineIndex++;
			offlineFormatted.push("<tr><td class='offline'>" + tUser + "</td><td><a href='https://www.twitch.tv/" + tUser + "'>twitch.tv/" + tUser + "</a></td></tr>");
			offlineFormatted.sort();
			document.getElementById("offlineTable").innerHTML = offlineFormatted.join("");
			/*
			$.ajax({
			 type: 'GET',
			 url: channelAPI,
			 headers: {
			   'Client-ID': 'j87ocv1auj3pu0hiwjy2l43qalr4rh'
			 },
			 success: function(data) {
			 }
			});
			*/
		}
		document.getElementById("onlineIndex").textContent = onlineIndex + " online channels";
		document.getElementById("offlineIndex").textContent = offlineIndex + " offline channels";
		
		if (onlineIndex < 1) {
			document.getElementById("onlineTable").innerHTML = "<tr class='noChannels'><td>Error</td><td>no channels found for this user.</td></tr>";
		}
	 }
	});
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