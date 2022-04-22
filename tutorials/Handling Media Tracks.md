---
layout: page
categories: quickstarts-javascript
title: Handling Media Tracks
permalink: /quickstarts/javascript/link/Handling%20%26%20Media%20Tracks
---

# Handling Media Tracks

In this quickstart we will cover how to handle media during an ongoing call with Kandy.js. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## User Interface

To interact with our demo application, we will have a UI that allows us to make outgoing calls and respond to incoming calls. For this tutorial, we will add the ability to do the following to the UI:

- Start / Stop Video
- Add / Remove media

```html
<div>
  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Start/Stop Video</legend>
    <fieldset>
      <div style="margin-bottom: 15px">
        <!-- User input for starting a video during an ongoing call. -->
        <input type="button" value="Start Video" onclick="startVideo();" />
      </div>
      <div>
        <!-- User input for stopping a video during an ongoing call. -->
        <input type="button" value="Stop Video" onclick="stopVideo();" />
      </div>
    </fieldset>
  </fieldset>

  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Add/Remove Media</legend>
    <fieldset>
      <div class="add-remove" style="margin-bottom: 15px">
        <!-- User input for making a call. -->
        Audio: <input type="checkbox" id="make-with-audio" /> Video:
        <input type="checkbox" id="make-with-video" /> ScreenShare: <input type="checkbox" id="make-with-screen" />
        <input type="button" value="Add Media(s)" onclick="addMedia();" />
        <fieldset>
          Added Track(s):
          <div id="add-media"></div>
        </fieldset>
        <br />
        <fieldset>
          Remove Track(s):
          <div id="remove-media"></div>
        </fieldset>
        <input type="button" value="Remove Media(s)" onclick="removeMedia();" />
      </div>
    </fieldset>
  </fieldset>
  <!-- Media containers. -->
  Remote video:
  <div id="remote-container"></div>
  Local video:
  <div id="local-container"></div>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

## Start / Stop Video

### Start Video

To add video to a call, we'll have the user click the 'Start Video' button. This will trigger the `startVideo` function shown below. This function does two simple steps to start the video:

1. Set the options for the video (e.g., dimensions) we want to send to the remote participant.
2. Use the `call.startVideo` API to start sending the video.

This can only be used in a basic media scenario, where the call does not have video. By default, calls will be made with audio-only.

```javascript
/*
 * Functionality for starting video on ongoing call.
 */
function startVideo () {
  log('Adding video to the ongoing call' + callId)

  let videoOptions = { width: 50, height: 50 }

  client.call.startVideo(callId, videoOptions)
}
```

### Stop Video

Similar to starting a video, if we want to stop the video, the user can click the 'Stop Video' button, and our `stopVideo` function will remove the local video and stop it from being sent to the remote participant using the `call.stopVideo` API. This can also only be used in a basic media scenario, where the call has only one video track.

```javascript
/*
 *  Functionality for Stopping video on ongoing call.
 */
function stopVideo () {
  log('Removing the video from the ongoing call' + callId)

  client.call.stopVideo(callId)
}
```

## Add / Remove Media

### Add Media(s)

To add multiple media to an ongoing call, the `call.addMedia` API can be used. Our `addMedia` function shown below (triggered when the user clicks "Add Media"), adds the specified media track(s) to the Call and sends the media(s) to the remote participant(s) by using the `call.addMedia` API.

```javascript
/*
 *  Add media on ongoing Call functionality.
 */
function addMedia () {
  log('Adding media track(s) to ongoing call' + callId)

  // true if the input checkboxes are checked or false otherwise
  let withAudio = document.getElementById('make-with-audio').checked
  let withVideo = document.getElementById('make-with-video').checked
  let withScreenshare = document.getElementById('make-with-screen').checked

  let media = {
    audio: withAudio,
    video: withVideo,
    screen: withScreenshare
  }

  client.call.addMedia(callId, media)

  document.getElementById('make-with-audio').checked = false
  document.getElementById('make-with-video').checked = false
  document.getElementById('make-with-screen').checked = false
}
```

### Remove Media(s)

To remove media from an ongoing, when the user clicks on the 'Remove Media' button, our `removeMedia` function will:

1. Retrieve the information of the ongoing call
2. Create a list of media track IDs that we want to remove.
3. Use the `call.removeMedia` API to remove the tracks from the call and stop being sent to the remote participant(s).

Similarly to the `call.addMedia` API, this API can also be used to remove multiple tracks

```javascript
/*
 *  Remove media(s) from ongoing Call functionality.
 */
function removeMedia () {
  log('Removing media track(s) to ongoing call' + callId)
  let checkBoxes = document.getElementsByName('removeMedia')

  let removedTracks = []
  // Retrieves the trackIds from the checked tracks to be removed
  // Stored the id in an array
  for (var i = 0; i < checkBoxes.length; i++) {
    // checks to see which checkbox is clicked and gets the value from it
    // Each checkbox value contain the trackIds of a particular media
    if (checkBoxes[i].checked) {
      removedTracks.push(checkBoxes[i].value)
      // Disables the displayed selected tracks to be removed.
      checkBoxes[i].disabled = true
      document.getElementById(checkBoxes[i].id).innerHTML = ''
    }
  }
  client.call.removeMedia(callId, removedTracks)
}
```

## Events

The `call:newTrack` event will be emitted for both local and remote users. It informs us that a new Track has been added to the ongoing call. The Track may have been added by either the local user or remote user. More information on the track can be retrieved by using the `media.getTrackById` API.

We will use this event to render local visual media and remote audio/visual media into their respective containers whenever a new track is added to the call. See below.

```javascript
/**
 * Set listener for new tracks.
 * When a new Track is added to the call,information about the Track can be retrieved using the
 * `media.getTrackById` API. This information helps determine the type of track we are
 * rendering i.e., local or remote track, audio or video track, etc.
 */
client.on('call:newTrack', function (params) {
  // Check whether the new track was a local track or not.
  if (params.local) {
    // Only render local visual media into the local container.
    const localTrack = client.media.getTrackById(params.trackId)
    if (localTrack.kind === 'video') {
      client.media.renderTracks([params.trackId], '#local-container')
    }
  } else {
    // Render the remote media into the remote container.
    client.media.renderTracks([params.trackId], '#remote-container')
  }
  // retrieves the information about the call
  let callId = params.callId

  let call = client.call.getById(callId)

  let localTracks = call.localTracks

  localTracks.forEach(track => {
    let { trackId, kind } = client.media.getTrackById(track)

    // Ensure we're not dealing with an ID already rendered
    if (!allTracks.includes(trackId)) {
      allTracks.push(trackId)
      // Displays the list of tracks
      // New tracks added to the call will be displayed
      createHTMLElements(trackId, kind)
    }
  })
})

/*
 * When a new Track is added,
 * A new section for add and remove media is created
 * with the list of track present and can be removed
 * to add
 */
function createHTMLElements (id, kind) {
  let input = document.createElement('input')
  let listAllTracks = document.createElement('div')
  let label = document.createElement('label')
  let lineBreak = document.createElement('br')

  listAllTracks.innerHTML = kind + ':' + ' ' + id
  listAllTracks.id = id
  input.type = 'checkbox'
  input.id = id
  input.value = id
  input.name = 'removeMedia'

  label.appendChild(document.createTextNode(id))
  document.getElementById('add-media').appendChild(listAllTracks)
  document.getElementById('remove-media').appendChild(input)
  document.getElementById('remove-media').appendChild(label)
  document.getElementById(id).innerHTML = track.kind + ':' + id
  document.getElementById('remove-media').appendChild(lineBreak)
}
```

The `call:trackEnded` event will be emitted for both local and remote users. This event informs us that a Track has been removed from a Call. The Track may have been removed by either the local user or remote user. See Below.

```javascript
// Set listener for ended tracks.
client.on('call:trackEnded', function (params) {
  // Check whether the ended track was a local track or not.
  if (params.local) {
    // Remove the track from the local container.
    client.media.removeTracks([params.trackId], '#local-container')
  } else {
    // Remove the track from the remote container.
    client.media.removeTracks([params.trackId], '#remote-container')
  }
})
```

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

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Call Statistics Demo\n */\n\nconst { create } = Kandy\n\nconst client = create({\n  call: {\n    // Specify the TURN/STUN servers that should be used.\n    iceServers: [\n      { urls: &apos;$KANDYTURN1$&apos; },\n      { urls: &apos;$KANDYSTUN1$&apos; },\n      { urls: &apos;$KANDYTURN2$&apos; },\n      { urls: &apos;$KANDYSTUN2$&apos; }\n    ],\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return {\n    accessToken: data.access_token,\n    idToken: data.id_token,\n    expiresIn: data.expires_in\n  }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({\n      clientId,\n      username: userEmail,\n      password\n    })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\nlet callId\n// Keep track of all the media tracks added to the call\nlet allTracks = []\n// Get user input and make a call to the callee.\nfunction makeCall () {\n  // Gather call options.\n  const callee = document.getElementById(&apos;callee&apos;).value\n  // Call will only start with audio\n  const mediaConstraints = {\n    audio: true\n  }\n  callId = client.call.make(callee, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall () {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n  // Call will only be answered with audio\n  const mediaConstraints = {\n    audio: true\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n// Handles removing all the list of tracks rendered\nfunction removeAllTracks (parent) {\n  while (parent.firstChild) {\n    parent.removeChild(parent.firstChild)\n  }\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n\n  log(&apos;Ending call with &apos; + call.from)\n  client.call.end(callId)\n}\n\n/*\n * Functionality for starting video on ongoing call.\n */\nfunction startVideo () {\n  log(&apos;Adding video to the ongoing call&apos; + callId)\n\n  let videoOptions = { width: 50, height: 50 }\n\n  client.call.startVideo(callId, videoOptions)\n}\n\n/*\n *  Functionality for Stopping video on ongoing call.\n */\nfunction stopVideo () {\n  log(&apos;Removing the video from the ongoing call&apos; + callId)\n\n  client.call.stopVideo(callId)\n}\n\n/*\n *  Add media on ongoing Call functionality.\n */\nfunction addMedia () {\n  log(&apos;Adding media track(s) to ongoing call&apos; + callId)\n\n  // true if the input checkboxes are checked or false otherwise\n  let withAudio = document.getElementById(&apos;make-with-audio&apos;).checked\n  let withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n  let withScreenshare = document.getElementById(&apos;make-with-screen&apos;).checked\n\n  let media = {\n    audio: withAudio,\n    video: withVideo,\n    screen: withScreenshare\n  }\n\n  client.call.addMedia(callId, media)\n\n  document.getElementById(&apos;make-with-audio&apos;).checked = false\n  document.getElementById(&apos;make-with-video&apos;).checked = false\n  document.getElementById(&apos;make-with-screen&apos;).checked = false\n}\n\n/*\n *  Remove media(s) from ongoing Call functionality.\n */\nfunction removeMedia () {\n  log(&apos;Removing media track(s) to ongoing call&apos; + callId)\n  let checkBoxes = document.getElementsByName(&apos;removeMedia&apos;)\n\n  let removedTracks = []\n  // Retrieves the trackIds from the checked tracks to be removed\n  // Stored the id in an array\n  for (var i = 0; i < checkBoxes.length; i++) {\n    // checks to see which checkbox is clicked and gets the value from it\n    // Each checkbox value contain the trackIds of a particular media\n    if (checkBoxes[i].checked) {\n      removedTracks.push(checkBoxes[i].value)\n      // Disables the displayed selected tracks to be removed.\n      checkBoxes[i].disabled = true\n      document.getElementById(checkBoxes[i].id).innerHTML = &apos;&apos;\n    }\n  }\n  client.call.removeMedia(callId, removedTracks)\n}\n\n/**\n * Set listener for new tracks.\n * When a new Track is added to the call,information about the Track can be retrieved using the\n * `media.getTrackById` API. This information helps determine the type of track we are\n * rendering i.e., local or remote track, audio or video track, etc.\n */\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Only render local visual media into the local container.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n  // retrieves the information about the call\n  let callId = params.callId\n\n  let call = client.call.getById(callId)\n\n  let localTracks = call.localTracks\n\n  localTracks.forEach(track => {\n    let { trackId, kind } = client.media.getTrackById(track)\n\n    // Ensure we&apos;re not dealing with an ID already rendered\n    if (!allTracks.includes(trackId)) {\n      allTracks.push(trackId)\n      // Displays the list of tracks\n      // New tracks added to the call will be displayed\n      createHTMLElements(trackId, kind)\n    }\n  })\n})\n\n/*\n * When a new Track is added,\n * A new section for add and remove media is created\n * with the list of track present and can be removed\n * to add\n */\nfunction createHTMLElements (id, kind) {\n  let input = document.createElement(&apos;input&apos;)\n  let listAllTracks = document.createElement(&apos;div&apos;)\n  let label = document.createElement(&apos;label&apos;)\n  let lineBreak = document.createElement(&apos;br&apos;)\n\n  listAllTracks.innerHTML = kind + &apos;:&apos; + &apos; &apos; + id\n  listAllTracks.id = id\n  input.type = &apos;checkbox&apos;\n  input.id = id\n  input.value = id\n  input.name = &apos;removeMedia&apos;\n\n  label.appendChild(document.createTextNode(id))\n  document.getElementById(&apos;add-media&apos;).appendChild(listAllTracks)\n  document.getElementById(&apos;remove-media&apos;).appendChild(input)\n  document.getElementById(&apos;remove-media&apos;).appendChild(label)\n  document.getElementById(id).innerHTML = track.kind + &apos;:&apos; + id\n  document.getElementById(&apos;remove-media&apos;).appendChild(lineBreak)\n}\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n\n  if (call.state === &apos;Ended&apos;) {\n    // Removes the list of tracks displayed when the call ends\n    removeAllTracks(document.getElementById(&apos;add-media&apos;))\n    removeAllTracks(document.getElementById(&apos;remove-media&apos;))\n  }\n})\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@874/dist/kandy.js\&quot;></script>\n\n<div>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n  </fieldset>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n  <fieldset>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Call with audio</legend>\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for making a call. -->\n      <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeCall();\&quot; />\n      to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; />\n    </div>\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for responding to an incoming call. -->\n      <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n    </div>\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </div>\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n  </fieldset>\n</div>\n\n<div>\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Start/Stop Video</legend>\n    <fieldset>\n      <div style=\&quot;margin-bottom: 15px\&quot;>\n        <!-- User input for starting a video during an ongoing call. -->\n        <input type=\&quot;button\&quot; value=\&quot;Start Video\&quot; onclick=\&quot;startVideo();\&quot; />\n      </div>\n      <div>\n        <!-- User input for stopping a video during an ongoing call. -->\n        <input type=\&quot;button\&quot; value=\&quot;Stop Video\&quot; onclick=\&quot;stopVideo();\&quot; />\n      </div>\n    </fieldset>\n  </fieldset>\n\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Add/Remove Media</legend>\n    <fieldset>\n      <div class=\&quot;add-remove\&quot; style=\&quot;margin-bottom: 15px\&quot;>\n        <!-- User input for making a call. -->\n        Audio: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-audio\&quot; /> Video:\n        <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; /> ScreenShare: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-screen\&quot; />\n        <input type=\&quot;button\&quot; value=\&quot;Add Media(s)\&quot; onclick=\&quot;addMedia();\&quot; />\n        <fieldset>\n          Added Track(s):\n          <div id=\&quot;add-media\&quot;></div>\n        </fieldset>\n        <br />\n        <fieldset>\n          Remove Track(s):\n          <div id=\&quot;remove-media\&quot;></div>\n        </fieldset>\n        <input type=\&quot;button\&quot; value=\&quot;Remove Media(s)\&quot; onclick=\&quot;removeMedia();\&quot; />\n      </div>\n    </fieldset>\n  </fieldset>\n  <!-- Media containers. -->\n  Remote video:\n  <div id=\&quot;remote-container\&quot;></div>\n  Local video:\n  <div id=\&quot;local-container\&quot;></div>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Call Statistics Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

