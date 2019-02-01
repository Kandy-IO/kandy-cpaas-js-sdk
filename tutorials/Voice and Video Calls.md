---
layout: page
categories: quickstarts-javascript
title: Voice and Video Calls
permalink: /quickstarts/javascript/cpaas2/Voice%20%26%20Video%20Calls
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

To learn more about call configs, refer to the [Configurations Quickstart](index.html#Configurations).

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

  if(
    client.services.getSubscriptions().isPending === false &&
    client.services.getSubscriptions().subscribed.length > 0
  ) {
    log('Successfully subscribed')
    }
})
```

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](index.html#Authentication)

```hidden javascript
const cpaasAuthUrl = 'https://$KANDYFQDN$/cpaas/auth/v1/token'

/**
 * Creates a form body from an dictionary
 */
function createFormBody(paramsObject) {
  const keyValuePairs = Object.entries(paramsObject).map(
    ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
  )
  return keyValuePairs.join('&')
}

/**
 * Gets the tokens necessary for authentication to $KANDY$
 */
async function getTokens({ clientId, username, password }) {
  const formBody = createFormBody({
    client_id: clientId,
    username,
    password,
    grant_type: 'password',
    scope: 'openid'
  })

  // POST a request to create a new authentication access token.
  const fetchResult = await fetch(cpaasAuthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  })

  // Parse the result of the fetch as a JSON format.
  const data = await fetchResult.json()

  return { accessToken: data.access_token, idToken: data.id_token }
}

async function login() {
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('userEmail').value
  const password = document.getElementById('password').value

  try {
    const tokens = await getTokens({ clientId, username: userEmail, password })
    client.setTokens(tokens)

    log('Successfully logged in as ' + userEmail)
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

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
        <input type='button' value='subscribe' onclick='subscribe();' />
    </fieldset>
    <fieldset>
        <legend>Make a Call</legend>
        <!-- User input for making a call. -->
        <input type='button' value='Make Call' onclick='makeCall();' />
        to <input type='text' id='callee' />
        with video <input type='checkbox' id='make-with-video' checked/>
        <br/>
        <sub><i>ex: sip:janedoe@somedomain.com (sip:[userId]@[domain])</i></sub>
    </fieldset>

    <fieldset>
        <legend>Respond to a Call</legend>
        <!-- User input for responding to an incoming call. -->
        <input type='button' value='Answer Call' onclick='answerCall();' />
        with video <input type='checkbox' id='answer-with-video' checked/>
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
  let destination = document.getElementById('callee').value

  // Check that the destination is in the proper format.
  var callDestRegex = RegExp('^sip:.*\@.*$', 'g')
  if(!callDestRegex.test(destination)) {
    log('Destination is in incorrect format. Must be of the form "sip:<someName>@<someDomain>"')
    return
  }

  let withVideo = document.getElementById('make-with-video').checked
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
  let withVideo = document.getElementById('answer-with-video').checked

  // Retrieve call state.
  let call = client.call.getById(callId)
  log('Answering call')

  const mediaConstraints = {
    audio: true,
    video: withVideo
  }
  client.call.answer(callId, mediaConstraints)
}

// Reject an incoming call.
function rejectCall() {
  // Retrieve call state.
  let call = client.call.getById(callId)
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
  // Retrieve call state.
  let call = client.call.getById(callId)
  log('Ending call')

  client.call.end(callId)
}
```

## Step 4: Call Events

As we use the Javascript SDK's call functions, the Javascript SDK will emit events that provide feedback about the changes in call state. We will set listeners for these events to keep our demo application informed about the Javascript SDK state.

We will use this function to render local and remote media into their respective containers when the call state is updated.

```javascript
function renderMedia(callId) {
  const call = client.call.getById(callId)

  // Render the local media.
  client.media.renderTracks(call.localTracks, '#local-container')

  // Render the remote media.
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

```codepen
{
    "title": "Javascript SDK Voice and Video Call Demo",
    "editors": 101,
    "js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```

```hidden css
video {
  width: 50% !important;
}
```

### Instructions For Demo
* Open two tabs for this demo by clicking the link twice. One will start the call (User A) and the other will answer it (User B).
* Enter your Client ID for your account or project. Do this on both tabs.
* Enter the email address of User A in the first tab. User A will be one of your account or project's users.
* Enter the email address of User B in the second tab. User B will be one of your account or project's users.
* Enter the passwords for each user respectively.
* Click Login to get your time-limited access token in both tabs.
* Click "Subscribe" in both tabs to receive notifications from the backend.
* Enter the SIP address of User B in the "to" field of User A's tab. Make sure to add "sip:" before the address. Ex: sip:userb@sipdomain.com
* Click "Make Call" to start the call from User A to User B.
* Wait until User B receives the incoming call. You should see the text "Received incoming call" under "Messages" on User B's tab.
* Once User B has received the incoming call request, click "Answer Call" to answer the call.
* After a short time, User A and User B should be in an established call.
* You can end the call by clicking "End Call" in either tab.
