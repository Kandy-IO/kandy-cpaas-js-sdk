---
layout: page
categories: quickstarts-javascript
title: Voice and Video Calls
permalink: /quickstarts/javascript/cpaas/Voice%20and%20Video%20Calls
position: 3
categories:
  - voice
  - video
---

# Voice and Video Calls

In this quickstart, we will cover the basics of making IP calls with the Javascript SDK. Code snippets will be used to demonstrate call usage of the Javascript SDK and together these snippets will form a working demo application that you can modify and tinker with at the end.

For information about other call features, such as mid-call operations or screensharing, please refer to their respective quickstarts.

## Call Configs

When initializing the Javascript SDK there is no required parameters for calls, we just need to provide some authentication configuration:

```javascript
const client = Kandy.create({
  call: {
    // Specify the TURN/STUN servers that should be used.
    iceServers: [
      { urls: '$KANDYTURN1$' },
      { urls: '$KANDYSTUN1$' },
      { urls: '$KANDYTURN2$' },
      { urls: '$KANDYSTUN2$' }
    ],
    // Specify that credentials should be fetched from the server.
    serverTurnCredentials: true
  },

  // Required: Server connection configs.
  authentication: {
    server: {
      base: '$KANDYFQDN$'
    },
    clientCorrelator: 'sampleCorrelator'
  }
})
```

Even though call specific configuration is not mandatory, when it comes to making calls,
providing ICE servers is required if various network topologies need to be supported.
See section below for what those ICE servers need to be.

To learn more about call configs, refer to the [Configurations Quickstart](configurations).

## ICE Servers

ICE servers are needed to ensure that media (audio and video) can be established even when the call participants are on different networks or behind firewalls. The recommended configuration (see the "Call Config" section above) includes a primary and secondary server for redundancy.

### Primary ICE Server

- TURN URL: $KANDYTURN1$
- STUN URL: $KANDYSTUN1$

### Secondary ICE Server

- TURN URL: $KANDYTURN2$
- STUN URL: $KANDYSTUN2$

For further documentation on ICE Servers, see the `call.IceServer` API.

### Subscribing to Call Service

Once we have authenticated, we can subscribe for notifications on the services we care about.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to reload this tutorial page as this particular tutorial example does not provide an unsubscribe button.

In this case, we are subscribing to the `call` service on the `websocket` channel.

```javascript
/**
 * Subscribes to the call service on the websocket channel for notifications.
 * Do this after logging in.
 */
function subscribe () {
  const services = ['call']
  const subscriptionType = 'websocket'
  client.services.subscribe(services, subscriptionType)
}

// Listen for subscription changes.
client.on('subscription:change', function () {
  if (
    client.services.getSubscriptions().isPending === false &&
    client.services.getSubscriptions().subscribed.length > 0
  ) {
    document.getElementById('subscribeBtn').disabled = true
    log('Successfully subscribed')
  }
})
```

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](authentication)

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing calls and respond to incoming calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

```html
<div>
  <fieldset>
    <legend>Authenticate using your account information</legend>
    Client ID: <input type="text" id="clientId" /> User Email: <input type="text" id="userEmail" /> Password:
    <input type="password" id="password" />
    <input type="button" id="loginBtn" value="Login" onclick="login();" />
  </fieldset>
  <fieldset>
    <legend>Subscribe To Call Service Websocket Channel</legend>
    <input type="button" id="subscribeBtn" disabled value="Subscribe" onclick="subscribe();" />
  </fieldset>
  <fieldset>
    <legend>Make a Call</legend>
    <!-- User input for making a call. -->
    <input type="button" value="Make Call" onclick="makeCall();" />
    to <input type="text" id="callee" /> with video
    <input type="checkbox" id="make-with-video" checked />
    <br />
    <sub><i>Ex: janedoe@somedomain.com</i></sub>
  </fieldset>

  <fieldset>
    <legend>Respond to a Call</legend>
    <!-- User input for responding to an incoming call. -->
    <input type="button" value="Answer Call" onclick="answerCall();" />
    with video <input type="checkbox" id="answer-with-video" checked />
    <br />
    <input type="button" value="Reject Call" onclick="rejectCall();" />
  </fieldset>

  <fieldset>
    <legend>End a Call</legend>
    <!-- User input for ending an ongoing call. -->
    <input type="button" value="End Call" onclick="endCall();" />
  </fieldset>

  <fieldset>
    <!-- Message output container. -->
    <legend>Messages</legend>
    <div id="messages"></div>
  </fieldset>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

```javascript
// Utility function for appending messages to the message div.
function log (message) {
  // Wrap message in textNode to guarantee that it is a string
  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html
  const textNode = document.createTextNode(message)
  const divContainer = document.createElement('div')
  divContainer.appendChild(textNode)
  document.getElementById('messages').appendChild(divContainer)
}
```

An important part of the UI for calls are the media containers. These containers will be used to hold the media from both sides of our call. Without them, none of the medias for our call can be rendered. So while we can still have a call, we won't be able to see or hear the other person that we are calling. Therefore, we will _always_ need a remote media container for our call to be able to see and hear the other person, and a local media container will be needed if we would like to display the local video of our call. The HTML elements that the Javascript SDK will use as media containers are empty `<div>`s.

```html
<!-- Media containers. -->
Remote video:
<div id="remote-container"></div>
Local video:
<div id="local-container"></div>
```

With that, there is nothing more needed for the user interface.

## Step 1: Making a Call

When the user clicks on the 'Make Call' button, we want our `makeCall` function to retrieve the information needed for the call, then make the call.

Note that in order to be able to call PSTN destinations, your user/project should have at least one telephone number assigned. For WebRTC destinations telephone number, assignment is not required.

```javascript
/*
 *  Voice and Video Call functionality.
 */

// Variable to keep track of the call.
let callId

// Get user input and make a call to the callee.
function makeCall () {
  // Gather call options.
  const destination = document.getElementById('callee').value
  const withVideo = document.getElementById('make-with-video').checked

  const mediaConstraints = {
    audio: true,
    video: withVideo
  }
  callId = client.call.make(destination, mediaConstraints)
}
```

The Javascript SDK's `make` will return a unique ID that is used to keep track of the call.
The `callId` will be provided in the event handler of call events (more details in Step 4). However, we do need to store it for use when ending a call.

## Step 2: Responding to a Call

Once we receive an incoming call, we will be able to either answer or reject it. Our `answerCall` and `rejectCall` functions will invoke the Javascript SDK functions of the same names.

Before answering the call, the application will have access to what media types have been offered by caller (as part of `call:receive` event's `mediaOffered` property). Currently two media types are supported: `audio` & `video`.

For simplicity, this tutorial application chooses to automatically disable 'with video' checkbox (for answering the call), if caller did not offer `video`.
However, a more elaborate application should present this information to user, in such a way that user can clearly understand what media are available for him/her to answer with.

```javascript
// Answer an incoming call.
function answerCall () {
  // Gather call options.
  const withVideo = document.getElementById('answer-with-video').checked

  log('Answering call')

  const mediaConstraints = {
    audio: true,
    video: withVideo
  }
  client.call.answer(callId, mediaConstraints)
}

// Reject an incoming call.
function rejectCall () {
  log('Rejecting call')

  client.call.reject(callId)
}
```

Note that for the callee, `callId` has not been defined above since they did not make the call. The callee will receive the `callId` from the `call:receive` event, which will be covered in Step 4.

## Step 3: Ending a Call

If our user has an ongoing call, they can end it by providing the call's ID to the Javascript SDK's `call.end` function, which is what our demo application will do.

```javascript
// End an ongoing call.
function endCall () {
  log('Ending call')

  client.call.end(callId)

  // Always re-enable this checkbox when call ends.
  document.getElementById('answer-with-video').disabled = false
}
```

## Step 4: Call Events

As we use the Javascript SDK's call functions, the Javascript SDK will emit events that provide feedback about the changes in call state. We will set listeners for these events to keep our demo application informed about the Javascript SDK state.

### `call:start`

The `call:start` event informs us that an outgoing call that we made has successfully been initialized, and the callee should receive a notification about the incoming call.

```javascript
// Set listener for successful call starts.
client.on('call:start', function (params) {
  log('Call successfully started. Waiting for response.')
})
```

### `call:error`

The `call:error` event informs us that a problem was encountered with the call.

```javascript
// Set listener for generic call errors.
client.on('call:error', function (params) {
  log('Error: Encountered error on call: ' + params.error.message)
})
```

### `call:stateChange`

As the call is acted upon (such as answered or rejected), its state will change. We can react to changes in the call by listening for the `call:stateChange` event. This event includes the state that the call transitioned out of, and we can get the current call information to know what state the call is now in.
To see all possible call states supported in this SDK, see `api.call.states` in API documentation.

```javascript
// Set listener for changes in a call's state.
client.on('call:stateChange', function (params) {
  // Retrieve call state.
  const call = client.call.getById(params.callId)

  if (params.error && params.error.message) {
    log('Error: ' + params.error.message)
  }
  log('Call state changed from ' + params.previous.state + ' to ' + call.state)

  // If the call ended, stop tracking the callId.
  if (call.state === 'Ended') {
    callId = null

    // Always re-enable this checkbox when call ends.
    document.getElementById('answer-with-video').disabled = false
  }
})
```

### `call:receive`

The `call:receive` event informs us that we have received an incoming call. The event provides the ID of the call, then we can get more information about it from the Javascript SDK state.

```javascript
// Set listener for incoming calls.
client.on('call:receive', function (params) {
  // Keep track of the callId.
  callId = params.callId

  // Retrieve call information.
  call = client.call.getById(params.callId)

  // Find out what media types have been offered by caller
  // We'll make the assumption here that audio media is always offered
  // while video is optional.
  const videoOffered = call.mediaOffered && call.mediaOffered.video
  const element = document.getElementById('answer-with-video')
  element.disabled = !videoOffered
  if (element.checked && !videoOffered) {
    // If caller did not offer video
    // .. then automatically uncheck the checkbox if it is checked
    element.checked = false
  }

  log('Received incoming call')
})
```

### `call:newTrack`

The `call:newTrack` event informs us that a new Track has been added to the call. The Track may have been added by either the local user or remote user. More information on the track can be retrieved by using the `media.getTrackById` API.

We will use this event to render local visual media and remote audio/visual media into the respective containers whenever a new track is added to the call.

```javascript
// Set listener for new tracks.
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
})
```

### `call:trackEnded`

The `call:trackEnded` event informs us that a Track has been removed from a Call. The Track may have been removed by either the local user or remote user using the {@link call.removeMedia} API. Tracks are also removed from Calls
automatically while the Call is on hold.

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

### `media:sourceUnmuted`

**Note**

This event is only required if you are using the `unified-plan` as the `sdpSemantics` setting in your configuration. This setting describes the formatting for the SDP to use for call control. If `sdpSemantics` isn't present in your configuration, the SDK will default to `unified-plan`.

The `media:sourceUnmuted` event informs us that a Track has resumed receiving media from it's source. Remote Tracks also resume receiving media from Calls automatically when the Call is taken off hold. It's recommended that you render the tracks in your rendering containers when you receive this event.

We will use this event to render remote audio/visual media and local audio from the media containers whenever a track is resumes receiving media on the call.

```javascript
// Set listener for new tracks.
client.on('media:sourceUnmuted', function (params) {
  // Render the remote media into the remote container.
  // Retrieve call and track state.
  let call = client.call.getById(callId)
  let track = client.media.getTrackById(params.trackId)

  // Re-render the media into the correct container.
  if (call.remoteTracks.includes(params.trackId)) {
    client.media.renderTracks([params.trackId], '#remote-container')
  } else if (call.localTracks.includes(params.trackId) && track.kind === 'video') {
    // We only want to render local video because local audio would cause an echo.
    client.media.renderTracks([params.trackId], '#local-container')
  }
})
```

### `media:sourceMuted`

**Note**

This event is only required if you are using the `unified-plan` as the `sdpSemantics` setting in your configuration. This setting describes the formatting for the SDP to use for call control. If `sdpSemantics` isn't present in your configuration, the SDK will default to `unified-plan`.

The `media:sourceMuted` event informs us that a Track has temporarily stopped receiving media from it's source. Remote Tracks also stop receiving media from Calls automatically while the Call is on hold. You don't need to remove these tracks when you get this event, however, you won't hear any audio and video will only show a black screen. It's recommended that you remove the tracks from your rendering containers.

We will use this event to remove remote audio/visual media and local audio from the media containers whenever a track is muted on the call.

```javascript
// Set listener for ended tracks.
client.on('media:sourceMuted', function (params) {
  // Remove the track from the remote container.
  // Retrieve call state.
  let call = client.call.getById(callId)

  // Unrender the media from the correct container.
  if (call.remoteTracks.includes(params.trackId)) {
    client.media.removeTracks([params.trackId], '#remote-container')
  } else if (call.localTracks.includes(params.trackId)) {
    client.media.removeTracks([params.trackId], '#local-container')
  }
})
```

We can now call the demo application done. We've covered the basics of what is needed to allow a user to use call functionality.

## Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions For Demo

- Open two browser instances of Google Chrome®, or [another supported browser](get-started), by clicking **Try it** two times.
  - One instance will start the call (User A) and the other instance will answer it (User B).
- Enter your Client ID for your account or project in both instances.
  - Enter the email address of User A in the first instance (account or project users).
  - Enter the email address of User B in the second instance (account or project users).
- Enter the passwords for each user.
- Click **Login** to get your time-limited access token in both instances.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive notifications from the server for both users.
- Enter the User ID of User B in the _to_ field of User A's instance.
- Click **Make Call** to start the call from User A to User B.
- Click **Answer Call** to answer the call once User B has received the incoming call request.
  - You should see the text "Received incoming call" under Messages on User B's instance.
- After a short time, User A and User B should be in an established call.
- Click **End Call** in either instance to end the call.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Voice and Video Call Demo\n */\n\nconst client = Kandy.create({\n  call: {\n    // Specify the TURN/STUN servers that should be used.\n    iceServers: [\n      { urls: &apos;$KANDYTURN1$&apos; },\n      { urls: &apos;$KANDYSTUN1$&apos; },\n      { urls: &apos;$KANDYTURN2$&apos; },\n      { urls: &apos;$KANDYSTUN2$&apos; }\n    ],\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return {\n    accessToken: data.access_token,\n    idToken: data.id_token,\n    expiresIn: data.expires_in\n  }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({\n      clientId,\n      username: userEmail,\n      password\n    })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Voice and Video Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall () {\n  // Gather call options.\n  const destination = document.getElementById(&apos;callee&apos;).value\n  const withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  callId = client.call.make(destination, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall () {\n  // Gather call options.\n  const withVideo = document.getElementById(&apos;answer-with-video&apos;).checked\n\n  log(&apos;Answering call&apos;)\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n\n// Reject an incoming call.\nfunction rejectCall () {\n  log(&apos;Rejecting call&apos;)\n\n  client.call.reject(callId)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  log(&apos;Ending call&apos;)\n\n  client.call.end(callId)\n\n  // Always re-enable this checkbox when call ends.\n  document.getElementById(&apos;answer-with-video&apos;).disabled = false\n}\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Error: Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;Ended&apos;) {\n    callId = null\n\n    // Always re-enable this checkbox when call ends.\n    document.getElementById(&apos;answer-with-video&apos;).disabled = false\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n\n  // Find out what media types have been offered by caller\n  // We&apos;ll make the assumption here that audio media is always offered\n  // while video is optional.\n  const videoOffered = call.mediaOffered && call.mediaOffered.video\n  const element = document.getElementById(&apos;answer-with-video&apos;)\n  element.disabled = !videoOffered\n  if (element.checked && !videoOffered) {\n    // If caller did not offer video\n    // .. then automatically uncheck the checkbox if it is checked\n    element.checked = false\n  }\n\n  log(&apos;Received incoming call&apos;)\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Only render local visual media into the local container.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n// Set listener for new tracks.\nclient.on(&apos;media:sourceUnmuted&apos;, function (params) {\n  // Render the remote media into the remote container.\n  // Retrieve call and track state.\n  let call = client.call.getById(callId)\n  let track = client.media.getTrackById(params.trackId)\n\n  // Re-render the media into the correct container.\n  if (call.remoteTracks.includes(params.trackId)) {\n    client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n  } else if (call.localTracks.includes(params.trackId) && track.kind === &apos;video&apos;) {\n    // We only want to render local video because local audio would cause an echo.\n    client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;media:sourceMuted&apos;, function (params) {\n  // Remove the track from the remote container.\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n\n  // Unrender the media from the correct container.\n  if (call.remoteTracks.includes(params.trackId)) {\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  } else if (call.localTracks.includes(params.trackId)) {\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@808/dist/kandy.js\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Make a Call</legend>\n    <!-- User input for making a call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeCall();\&quot; />\n    to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; /> with video\n    <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; checked />\n    <br />\n    <sub><i>Ex: janedoe@somedomain.com</i></sub>\n  </fieldset>\n\n  <fieldset>\n    <legend>Respond to a Call</legend>\n    <!-- User input for responding to an incoming call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n    with video <input type=\&quot;checkbox\&quot; id=\&quot;answer-with-video\&quot; checked />\n    <br />\n    <input type=\&quot;button\&quot; value=\&quot;Reject Call\&quot; onclick=\&quot;rejectCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <legend>End a Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote video:\n<div id=\&quot;remote-container\&quot;></div>\nLocal video:\n<div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Voice and Video Call Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

