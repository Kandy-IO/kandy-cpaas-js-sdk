---
layout: page
categories: quickstarts-javascript
title: Call Statistics
permalink: /quickstarts/javascript/cpaas/Call%20Statistics
---

# Call Statistics

In this quickstart we will cover the basics of retrieving call statistics with Kandy.js. Code snippets will be used to demonstrate this feature, and together these snippets will form a working demo application that can be viewed at the end.

## The need to collect & target audience

Call statistics can be extremely useful to help with debugging various call-related issues in the field. Collecting these statistics may also serve as a basis for some application features. For example, they can be used for displaying the health status of a live call as part of an application's monitoring panel.

Obtaining call statistics is a mid-call operation, therefore, there must be an established call in order to start collecting statistics. For this tutorial, we will assume you're familiar with making and establishing calls. Otherwise, please see [Voice and Video Calls Quickstart](Voice%20and%20Video%20Calls).

The call statistics we're about to capture in this tutorial are low level stats and won't be necessarily appropriate for the end users who make the calls. This tutorial is targeted for developers of call applications, and recommends a way on how to capture this data for call quality analysis.

## Requirements & the returned stats

Collecting Call statistics is done by invoking the [`call.getStats`](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#callgetstats) API.

At a minimum one must provide the `callId` associated with current call. This will return statistics about the call itself.

If a `trackId` is also provided, it can be used to obtain a more specific report (i.e. statistics about the track itself within that active call).
The supplied `trackId` may refer to locally created media tracks or remote tracks.

The returned statistics come from the WebRTC statistics monitoring model in the form of a RTCStatsReport. For further details on such report, see [RTCStatsReport](https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport). In addition to RTCStatsReport, there will also be a statistic report coming from Kandy.js.

Once the `call.getStats` API is invoked, there are two ways of obtaining the results:

- By using the returned Promise object.
- By implementing a handler function which listens to the `call:statsReceived` event.

For simplicity, this tutorial will showcase the first option.

## Collecting Call statistics

Once Call statistics have been collected, they can be further inspected.

For the purpose of collecting such stats, this tutorial is just showing augmented functionality already provided in the [Logging](Logging) tutorial where one can download the collected data, for convenience.

Application developers may choose to download statistics data along with log data.
However, for this tutorial we'll only provide the download of statistics data in order to demonstrate just the Call statistics.

To follow a typical use case, this tutorial binds the Call statistics collection to the lifetime of a single call.

Therefore, the collection of the statistics will start as soon as call is started by either party, and automatically end when either party hangs up the call. For simplicity, the collected stats are stored in an array and each participant in the call will collect its own statistics.

If a new call is started, this tutorial will append its collected stats to the previously collected stats. For this tutorial, we will store the stats for each call in a 2D array. The format of the array will be: `[ [callId, RTCStats], [callId, RTCStats], ... ]`, where `RTCStats` is an array of the collected stats.

```javascript
// Save the call statistics in this array
let callStats = []
```

To keep a simple bound on accumulated data, this array will store up to a maximum of 5 calls worth of statistics.

```javascript
// We'll store only this many calls worth of stats.
const MAX_STATS_LENGTH = 5
```

Once we collect stats for over 5 calls, the stats related to the oldest call will be automatically removed.

Application developers can choose to alter this behaviour of course, based on the application's needs.

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing calls and respond to incoming calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

Just like in [Voice and Video Calls Quickstart](Voice%20and%20Video%20Calls), you will need to fill in an appropriate Username & Password and then make a call to another user once subscribed.

We won't cover the widgets associated with these steps as they are covered in their respective tutorial sections.

The only new widget we'll add in this tutorial is a download button, which downloads whatever Call statistics have been accumulated so far.

```html
<input type="submit" value="Download Call Stats" onclick="downloadCallStats()" /> <br />
<br />
```

This follows very similar functionality showcased in [Logging Quickstart](Logging) where a download button was provided to get the log data.

Typically, application developers would likely combine these 2 sets of data (logs and call statistics) into one download option.

## Step 1: Making & Answering a Call

For this tutorial, calls are made with audio-only.
We won't go into details on how a call is made/answered, as this is covered in the Voice and Video Calls section.

Because we'll only have a voice call, we will only add a remote container so that each side can hear audio coming from remote peer, once the call is established.

## Step 2: Call Events & Triggering functions

The call events available during the life-cycle of a call are also mentioned in the Voice and Video Calls tutorial (including the ones responsible for rendering the media tracks) and can be referred to from there.

For this tutorial, we chose a few of these events & functions to be the triggers for the start of the Call statistics collection, as well as to mark the end of the collection. For the data collection, we'll use a timer variable which will trigger every 1 second, as follows:

```javascript
// Define our timer variable
let timer

const TIMEOUT_INTERVAL = 1000 // 1 second

// Implement our Call statistics collection
function retrieveCallStats () {
  // Get the stats by invoking the API.
  // For this example, we'll only get the stats
  // associated with the callId (i.e. no trackId is used as second parameter)
  client.call
    .getStats(callId)
    .then(stats => {
      // Use a boolean to track whether it's a new call's stats
      let newCall = true
      // Find the stats for the current call using the callId
      for (callStat of callStats) {
        if (callStat[0] === callId) {
          newCall = false
          // Add the stats from the RTCStatsReport Map object to this calls stats
          callStat[1].push(...stats.values())
          break
        }
      }
      // If the newCall boolean is still true, these stats are for a new call
      if (newCall) {
        // Before we store this calls stats, remove the oldest call's stats if we are beyond the max collection limit
        if (callStats.length === MAX_STATS_LENGTH) {
          log('Removing all call statistics associated with oldest call.')
          callStats = callStats.slice(1)
        }
        // Add the stats for this call to the collection of call stats
        callStats.push([callId, [...stats.values()]])
      }
    })
    .catch(error => {
      log('Stats collection failed. Error message: ', error.error.message)
      clearTimeout(timer)
    })
}
```

- Start call stats collection when caller gets a `call:start` event:

```javascript 
client.on('call:start', function (params) {
   log('Starting call stats collection.')
   timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second
}
```

- Start call stats collection when callee receives the call:

```javascript 
client.on('call:receive', function (params) {
  log('Starting call stats collection.')
  timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second
}
```

- Stop the 'local' call stats collection when user hangs up:

```javascript 
function endCall () {
  log('Stopping call stats collection.')
  clearTimeout(timer) // stop stats collection

  // Access call by the callId and end the call
  ...
}
```

- Stop the call stats collection when remote side hangs up.

```javascript 
client.on('call:stateChange', function (params) {
  // Retrieve call state using params.callId
  ...

  // If the call ended, stop stats collection.
  if (call.state === 'Ended') {
    log('Stopping call stats collection.')
    clearTimeout(timer) // stop stats collection

    // Reset callId
    ...
  }
})
```

## Step 3: Save Call Statistics to File

As mentioned earlier, the saving of Call statistics is done in a similar manner to the logs in the Logging tutorial section, and the functionality can be combined to download both types of data.

```javascript
/**
 * Function for providing the SDK call statistics to a user via a downloaded file.
 * @method downloadCallStats
 */
function downloadCallStats () {
  // Convert the saved call stats into a JSON blob.
  const blob = new Blob([JSON.stringify(callStats)], { type: 'application/json' })

  // Create a button that will save the Blob as a file when clicked.
  const button = document.createElement('a')
  button.href = URL.createObjectURL(blob)
  // Give the file a name.
  button.download = Date.now().toString() + '_sdk' + client.getVersion() + '_call_stats.json'

  // Auto-click the button.
  button.click()
}
```

We can now call the demo application done. We've covered the basics of what is needed to allow a user to collect call statistics.

## Live Demo

Want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

- Open two browser instances of Google Chrome®, or [another supported browser](Get%20Started), by clicking **Try it** two times.
  - One instance will start the call (User A) and the other instance will answer it (User B).
- Enter your Client ID for your account or project in both instances.
  - Enter the email address of User A in the first instance (account or project users).
  - Enter the email address of User B in the second instance (account or project users).
- Enter the passwords for each user.
- Click **Login** to get your time-limited access token in both instances.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive call notifications from the server for both users.
- Enter the User ID of User B in the _to_ field of User A's instance.
- Click **Make Call** to start the call from User A to User B.
- Click **Answer Call** to answer the call once User B has received the incoming call request.
  - You should see the text "Received incoming call" under Messages on User B's instance.
- After a short time, User A and User B should be in an established call and collection of call statistics should have started on both sides.
- Click **End Call** in either instance to end the call. Call statistics should have ended on both sides.
- Click **Download Call Stats** in either instance to download the statistics. Check your **Downloads** folder which should contain your downloaded file.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Call Statistics Demo\n */\n\n// Save the call statistics in this array\nlet callStats = []\n\n// We&apos;ll store only this many calls worth of stats.\nconst MAX_STATS_LENGTH = 5\n\nconst client = Kandy.create({\n  call: {\n    // Specify the TURN/STUN servers that should be used.\n    iceServers: [\n      { urls: &apos;$KANDYTURN1$&apos; },\n      { urls: &apos;$KANDYSTUN1$&apos; },\n      { urls: &apos;$KANDYTURN2$&apos; },\n      { urls: &apos;$KANDYSTUN2$&apos; }\n    ],\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return {\n    accessToken: data.access_token,\n    idToken: data.id_token,\n    expiresIn: data.expires_in\n  }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({\n      clientId,\n      username: userEmail,\n      password\n    })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n// Variable to keep track of the call.\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall () {\n  // Gather call options.\n  const callee = document.getElementById(&apos;callee&apos;).value\n\n  const mediaConstraints = {\n    audio: true,\n    video: false\n  }\n  callId = client.call.make(callee, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall () {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n  log(&apos;Answering call from &apos; + call.from)\n\n  const mediaConstraints = {\n    audio: true,\n    video: false\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n\n  log(&apos;Ending call with &apos; + call.from)\n  client.call.end(callId)\n}\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Error: Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;Ended&apos;) {\n    log(&apos;Stopping call stats collection.&apos;)\n    clearTimeout(timer) // stop stats collection\n\n    callId = null\n  }\n})\n\n// Set listener for successful call starts & triggering point for starting stats collection.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n\n  // Start Call statistics collection at this point\n  log(&apos;Starting call stats collection.&apos;)\n  timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  const call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n\n  log(&apos;Starting call stats collection.&apos;)\n  timer = setInterval(retrieveCallStats, TIMEOUT_INTERVAL) // trigger stats collection every 1 second\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (!params.local) {\n    // Only render the remote audio into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (!params.local) {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Define our timer variable\nlet timer\n\nconst TIMEOUT_INTERVAL = 1000 // 1 second\n\n// Implement our Call statistics collection\nfunction retrieveCallStats () {\n  // Get the stats by invoking the API.\n  // For this example, we&apos;ll only get the stats\n  // associated with the callId (i.e. no trackId is used as second parameter)\n  client.call\n    .getStats(callId)\n    .then(stats => {\n      // Use a boolean to track whether it&apos;s a new call&apos;s stats\n      let newCall = true\n      // Find the stats for the current call using the callId\n      for (callStat of callStats) {\n        if (callStat[0] === callId) {\n          newCall = false\n          // Add the stats from the RTCStatsReport Map object to this calls stats\n          callStat[1].push(...stats.values())\n          break\n        }\n      }\n      // If the newCall boolean is still true, these stats are for a new call\n      if (newCall) {\n        // Before we store this calls stats, remove the oldest call&apos;s stats if we are beyond the max collection limit\n        if (callStats.length === MAX_STATS_LENGTH) {\n          log(&apos;Removing all call statistics associated with oldest call.&apos;)\n          callStats = callStats.slice(1)\n        }\n        // Add the stats for this call to the collection of call stats\n        callStats.push([callId, [...stats.values()]])\n      }\n    })\n    .catch(error => {\n      log(&apos;Stats collection failed. Error message: &apos;, error.error.message)\n      clearTimeout(timer)\n    })\n}\n\n/**\n * Function for providing the SDK call statistics to a user via a downloaded file.\n * @method downloadCallStats\n */\nfunction downloadCallStats () {\n  // Convert the saved call stats into a JSON blob.\n  const blob = new Blob([JSON.stringify(callStats)], { type: &apos;application/json&apos; })\n\n  // Create a button that will save the Blob as a file when clicked.\n  const button = document.createElement(&apos;a&apos;)\n  button.href = URL.createObjectURL(blob)\n  // Give the file a name.\n  button.download = Date.now().toString() + &apos;_sdk&apos; + client.getVersion() + &apos;_call_stats.json&apos;\n\n  // Auto-click the button.\n  button.click()\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@633/dist/kandy.js\&quot;></script>\n<div>\n  <fieldset>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Make a Call</legend>\n    <!-- User input for making a call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeCall();\&quot; />\n    to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <legend>Respond to a Call</legend>\n    <!-- User input for responding to an incoming call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <legend>End a Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n  <div id=\&quot;remote-container\&quot;></div>\n\n  <br />\n  <div>Call Statistics</div>\n</div>\n\n<input type=\&quot;submit\&quot; value=\&quot;Download Call Stats\&quot; onclick=\&quot;downloadCallStats()\&quot; /> <br />\n<br />\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Application Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Call Statistics Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

