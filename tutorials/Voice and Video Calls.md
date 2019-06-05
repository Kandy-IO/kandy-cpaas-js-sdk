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
  // No call specific configuration required. Using defaults.

  // Required: Server connection configs.
  authentication: {
    server: {
      base: '$KANDYFQDN$'
    },
    clientCorrelator: 'sampleCorrelator'
  }
})
```

To learn more about call configs, refer to the [Configurations Quickstart](Configurations).

Once we have authenticated, we need to provide our client ID, user email, and password and subscribe for notifications on the services we care about. In this case, we are subscribing to the `call` service on the `websocket` channel.

```javascript
/**
 * Subscribes to the call service on the websocket channel for notifications.
 * Do this after logging in.
 */
function subscribe() {
  const services = ['call']
  const subscriptionType = 'websocket'
  client.services.subscribe(services, subscriptionType)
}

// Listen for subscription changes.
client.on('subscription:change', function() {

  if (
    client.services.getSubscriptions().isPending === false &&
    client.services.getSubscriptions().subscribed.length > 0
  ) {
    log('Successfully subscribed')
  }
})
```

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](Authentication)

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing calls and respond to incoming calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

```html
<div>
    <fieldset>
        <legend>Authenticate using your account information</legend>
        Client ID: <input type='text' id='clientId'/>
        User Email: <input type='text' id='userEmail'/>
        Password: <input type='password' id='password'/>
        <input type='button' value='Login' onclick='login();' />
    </fieldset>
    <fieldset>
        <legend>Subscribe To Call Service Websocket Channel</legend>
        <input type='button' value='Subscribe' onclick='subscribe();' />
    </fieldset>
    <fieldset>
        <legend>Make a Call</legend>
        <!-- User input for making a call. -->
        <input type='button' value='Make Call' onclick='makeCall();' />
        to <input type='text' id='callee' />
        with video <input type='checkbox' id='make-with-video' checked/>
        <br/>
        <sub><i>Ex: janedoe@somedomain.com</i></sub>
    </fieldset>

    <fieldset>
        <legend>Respond to a Call</legend>
        <!-- User input for responding to an incoming call. -->
        <input type='button' value='Answer Call' onclick='answerCall();' />
        with video <input type='checkbox' id='answer-with-video' checked/>
        <br/>
        <input type='button' value='Reject Call' onclick='rejectCall();' />
    </fieldset>

    <fieldset>
        <legend>End a Call</legend>
        <!-- User input for ending an ongoing call. -->
        <input type='button' value='End Call' onclick='endCall();' />
    </fieldset>

    <fieldset>
        <!-- Message output container. -->
        <legend>Messages</legend>
        <div id='messages'></div>
    </fieldset>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

```javascript
// Utility function for appending messages to the message div.
function log(message) {
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
Remote video: <div id="remote-container"></div>
Local video: <div id="local-container"></div>
```

With that, there is nothing more needed for the user interface.

## Step 1: Making a Call

When the user clicks on the 'Make Call' button, we want our `makeCall` function to retrieve the information needed for the call, then make the call.

```javascript
/*
 *  Voice and Video Call functionality.
 */

// Variable to keep track of the call.
let callId

// Get user input and make a call to the callee.
function makeCall() {
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

```javascript
// Answer an incoming call.
function answerCall() {
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
function rejectCall() {
  log('Rejecting call')

  client.call.reject(callId)
}
```

Note that for the callee, `callId` has not been defined above since they did not make the call. The callee will receive the `callId` from the `call:receive` event, which will be covered in Step 4.

## Step 3: Ending a Call

If our user has an ongoing call, they can end it by providing the call's ID to the Javascript SDK's `call.end` function, which is what our demo application will do.

```javascript
// End an ongoing call.
function endCall() {
  log('Ending call')

  client.call.end(callId)
}
```

## Step 4: Call Events

As we use the Javascript SDK's call functions, the Javascript SDK will emit events that provide feedback about the changes in call state. We will set listeners for these events to keep our demo application informed about the Javascript SDK state.

We will use this function to render local visual media and remote audio/visual media into their respective containers when the call state is updated.

```javascript
function renderMedia(callId) {
  // Retrieve call state.
  const call = client.call.getById(callId)

  // Retrieve the local track that belongs to video
  const videoTrack = call.localTracks.find(trackId => {
    return client.media.getTrackById(trackId).kind === 'video'
  })

  // Render local visual media.
  client.media.renderTracks([videoTrack], '#local-container')

  // Render the remote audio/visual media.
  client.media.renderTracks(call.remoteTracks, '#remote-container')
}
```

### `call:start`

The `call:start` event informs us that an outgoing call that we made has successfully been initialized, and the callee should receive a notification about the incoming call.

```javascript
// Set listener for successful call starts.
client.on('call:start', function(params) {
  log('Call successfully started. Waiting for response.')
})
```

### `call:error`

The `call:error` event informs us that a problem was encountered with the call.

```javascript
// Set listener for generic call errors.
client.on('call:error', function(params) {
  log('Encountered error on call: ' + params.error.message)
})
```

### `call:stateChange`

As the call is acted upon (such as answered or rejected), its state will change. We can react to changes in the call by listening for the `call:stateChange` event. This event includes the state that the call transitioned out of, and we can get the current call information to know what state the call is now in.

```javascript
// Set listener for changes in a call's state.
client.on('call:stateChange', function(params) {
  // Retrieve call state.
  const call = client.call.getById(params.callId)
  log('Call state changed from ' + params.previous.state + ' to ' + call.state)

  renderMedia(params.callId)

  // If the call ended, stop tracking the callId.
  if (call.state === 'ENDED') {
    callId = null
  }
})
```

### `call:receive`

The `call:receive` event informs us that we have received an incoming call. The event provides the ID of the call, then we can get more information about it from the Javascript SDK state.

```javascript
// Set listener for incoming calls.
client.on('call:receive', function(params) {
  // Keep track of the callId.
  callId = params.callId

  // Retrieve call information.
  call = client.call.getById(params.callId)
  log('Received incoming call')
})
```

We can now call the demo application done. We've covered the basics of what is needed to allow a user to use call functionality.

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

### Instructions For Demo
* Open two browser instances [in a supported WebRTC-enabled browser](Get%20Started) for this demo by clicking the link twice.
  * One instance will start the call (User A) and the other instance will answer it (User B).
* Enter your Client ID for your account or project in both instances.
  * Enter the email address of User A in the first instance (account or project users).
  * Enter the email address of User B in the second instance (account or project users).
* Enter the passwords for each user.
* Click __Login__ to get your time-limited access token in both instances.
* Click __Subscribe__ in both instances to receive notifications from the server.
* Enter the User Id of User B in the "to" field of User A's instance.
* Click __Make Call__ to start the call from User A to User B.
* Click __Answer Call__ to answer the call once User B has received the incoming call request.
  * You should see the text "Received incoming call" under Messages on User B's instance.
* After a short time, User A and User B should be in an established call.
* Click __End Call__ in either instance to end the call.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Voice and Video Call Demo\n */\n\nconst client = Kandy.create({\n  // No call specific configuration required. Using defaults.\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe() {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function() {\n\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function() {\n  log(&apos;Unable to subscribe&apos;)\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\n\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Voice and Video Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall() {\n  // Gather call options.\n  const destination = document.getElementById(&apos;callee&apos;).value\n  const withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  callId = client.call.make(destination, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall() {\n  // Gather call options.\n  const withVideo = document.getElementById(&apos;answer-with-video&apos;).checked\n\n  log(&apos;Answering call&apos;)\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n\n// Reject an incoming call.\nfunction rejectCall() {\n  log(&apos;Rejecting call&apos;)\n\n  client.call.reject(callId)\n}\n\n// End an ongoing call.\nfunction endCall() {\n  log(&apos;Ending call&apos;)\n\n  client.call.end(callId)\n}\n\nfunction renderMedia(callId) {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n\n  // Retrieve the local track that belongs to video\n  const videoTrack = call.localTracks.find(trackId => {\n    return client.media.getTrackById(trackId).kind === &apos;video&apos;\n  })\n\n  // Render local visual media.\n  client.media.renderTracks([videoTrack], &apos;#local-container&apos;)\n\n  // Render the remote audio/visual media.\n  client.media.renderTracks(call.remoteTracks, &apos;#remote-container&apos;)\n}\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function(params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function(params) {\n  log(&apos;Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function(params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  renderMedia(params.callId)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function(params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call&apos;)\n})\n\n&quot;,&quot;html&quot;:&quot;<div>\n    <fieldset>\n        <legend>Authenticate using your account information</legend>\n        Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n        User Email: <input type=&apos;text&apos; id=&apos;userEmail&apos;/>\n        Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n        <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n    </fieldset>\n    <fieldset>\n        <legend>Subscribe To Call Service Websocket Channel</legend>\n        <input type=&apos;button&apos; value=&apos;Subscribe&apos; onclick=&apos;subscribe();&apos; />\n    </fieldset>\n    <fieldset>\n        <legend>Make a Call</legend>\n        <!-- User input for making a call. -->\n        <input type=&apos;button&apos; value=&apos;Make Call&apos; onclick=&apos;makeCall();&apos; />\n        to <input type=&apos;text&apos; id=&apos;callee&apos; />\n        with video <input type=&apos;checkbox&apos; id=&apos;make-with-video&apos; checked/>\n        <br/>\n        <sub><i>Ex: janedoe@somedomain.com</i></sub>\n    </fieldset>\n\n    <fieldset>\n        <legend>Respond to a Call</legend>\n        <!-- User input for responding to an incoming call. -->\n        <input type=&apos;button&apos; value=&apos;Answer Call&apos; onclick=&apos;answerCall();&apos; />\n        with video <input type=&apos;checkbox&apos; id=&apos;answer-with-video&apos; checked/>\n        <br/>\n        <input type=&apos;button&apos; value=&apos;Reject Call&apos; onclick=&apos;rejectCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <legend>End a Call</legend>\n        <!-- User input for ending an ongoing call. -->\n        <input type=&apos;button&apos; value=&apos;End Call&apos; onclick=&apos;endCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <!-- Message output container. -->\n        <legend>Messages</legend>\n        <div id=&apos;messages&apos;></div>\n    </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote video: <div id=\&quot;remote-container\&quot;></div>\nLocal video: <div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Voice and Video Call Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://localhost:3000/kandy/kandy.cpaas.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>