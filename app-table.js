var username;
var onlineFormatted = [];
var offlineFormatted = [];
function buttonAction() {
	username = document.getElementById("userInput").value;
	fetchMods(username);
	document.getElementById("goButton").disabled = true;
}

function fetchMods(user) {
	$.ajax({
		url: "https://twitchstuff.3v.fi/modlookup/api/user/" + user,
		success: function (data) {
			console.log(data);
			
			var modList = [];
			
			for(var index = 0;  index < data.channels.length; index++) {
				modList[modList.length] = data.channels[index].name;
			}
			sortedModList = modList.sort();
			
			for(var index=0; index < modList.length; index++) {
				//document.getElementById("channels").innerHTML = document.getElementById("channels").innerHTML + modList[index] + "<br />";
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
		
		if (data.stream) {
			onlineFormatted.push("<tr><td><span class='online'>" + tUser + "</span></td><td>link here</td></tr>");
			onlineFormatted.sort();
			document.getElementById("onlineTable").innerHTML = document.getElementById("onlineTable").innerHTML + onlineFormatted.join("");
		}
		
		
		else {
			offlineFormatted.push("<tr><td><span class='offline'>" + tUser + "</span></td><td>link here</td></tr>");
			offlineFormatted.sort();
			document.getElementById("offlineTable").innerHTML = document.getElementById("offlineTable").innerHTML + offlineFormatted.join("");
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
	 }
	});
}