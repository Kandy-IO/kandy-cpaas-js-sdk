---
layout: page
categories: quickstarts-javascript
title: Anonymous Calls
permalink: /quickstarts/javascript/cpaas/Anonymous%20Calls
position: 5
categories:
  - voice
---

# Anonymous Calls

In this quickstart, we will cover making an anonymous call with the Javascript SDK. Code snippets will be used to demonstrate call usage of the Javascript SDK and together these snippets will form a working demo application that you can modify and tinker with at the end.

The working demo code will be very similar to the demo used in [Voice & Video Calls](voice-and-video-calls) quickstart. The only difference is that we can log in as an anonymous user by setting our own access and Id tokens.

## Anonymous User

To acquire access and Id tokens for our anonymous user, we must do the following when requesting the tokens:

- Use a `grant_type` of `client_credentials`.
- Set our Client ID & Client Secret.

The following project details will be used as credentials:

- The project's "Private Project key" will be used as the Client ID.
- The project's "Private Project secret" will be used as the Client Secret.

_For more information, please consult the REST API documentation._

A username and password is not needed when logging in as an anonymous user.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to reload this tutorial page as this particular tutorial example does not provide an unsubscribe button.

Once we have acquired our access & Id tokens for our anonymous user, we can set it by invoking our `setTokens` function which will invoke the Javascript SDK function of the same name.

```javascript
function setTokens () {
  const tokens = {
    accessToken: document.getElementById('accessToken').value,
    idToken: document.getElementById('idToken').value
  }
  if (!tokens.accessToken || !tokens.idToken) {
    log('Both access and id tokens are required.')
    return
  }
  try {
    client.setTokens(tokens)
    document.getElementById('subscribeBtn').disabled = false
    log('Successfully set tokens')
  } catch (error) {
    log('Error: Failed to set authentication tokens. Error: ' + error)
  }
}
```

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing calls and respond to incoming calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

```html
<div>
  <fieldset>
    <legend>Authenticate using your account information</legend>
    Client ID: <input type="text" id="clientId" /> User Email: <input type="text" id="userEmail" /> Password:
    <input type="password" id="password" />
    <input type="button" id="getTokenBtn" value="Get Tokens" onclick="getUserTokens();" />
    <br />
    Access Token: <input type="text" id="accessToken" /> ID Token: <input type="text" id="idToken" />
    <input type="button" id="setTokenBtn" value="Set Tokens" onclick="setTokens();" />
  </fieldset>
  <fieldset>
    <legend>Subscribe To Call Service Websocket Channel</legend>
    <input type="button" id="subscribeBtn" disabled value="Subscribe" onclick="subscribe();" />
  </fieldset>
  <fieldset>
    <legend>Make a Call</legend>
    <!-- User input for making a call. -->
    <input type="button" value="Make Call" onclick="makeCall();" />
    to <input type="text" id="callee" /> with video <input type="checkbox" id="make-with-video" checked />
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

## Step 1: Making a Call

Make a call from your anonymous user to a regular user, setting the regular user's User ID as the destination of the call.

```javascript
/*
 *  Call functionality.
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

## Step 2: Responding to a Call

Once we receive an incoming call, we will be able to either answer or reject it. Our `answerCall` and `rejectCall` functions will invoke the Javascript SDK functions of the same names.

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

## Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions For Demo

- Open two browser instances of Google Chrome®, or [another supported browser](get-started), by clicking **Try it** two times.
  - One instance will start the call (User A) and the other instance will answer it (User B).
- Acquire your access & Id tokens for your anonymous user (User A).
- Set your access & Id tokens on their corresponding fields and click **Set Tokens**.
- In the second instance, you can login with a regular user for User B.
  - Enter User B's credentials in the second instance and click **Get Tokens** and then click **Set Tokens** when the _Access Token_ and _Id Token_ fields have been populated.
- Click **Subscribe** to receive notifications from the backend. Do this on both tabs.
- Enter the a phone number from your project's Anonymous call destinations in the _to_ field.
- Click **Make Call** to start the call from User A (anonymous user) to User B's User ID.
- Wait until User B receives the incoming call. You should see the text "Received incoming call" under Messages on User B's tab.
- Click **Answer Call** to answer the call once User B has received the incoming call request.
  - You should see the text "Received incoming call" under Messages on User B's instance.
- After a short time, User A and User B should be in an established call.
- Click **End Call** in either instance to end the call.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Voice & Video Call Demo\n */\n\nconst client = Kandy.create({\n  // No call specific configuration required. Using defaults.\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  },\n  defaultPeerConfig: {\n    iceServers: [\n      { urls: &apos;$KANDYTURN1$&apos; },\n      { urls: &apos;$KANDYSTUN1$&apos; },\n      { urls: &apos;$KANDYTURN2$&apos; },\n      { urls: &apos;$KANDYSTUN2$&apos; }\n    ]\n  }\n})\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  log(&apos;Subscribing to call service (websocket channel) ...&apos;)\n  client.services.subscribe(services, subscriptionType)\n}\n\n/**\n * Listen for subscription changes.\n */\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from a dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\n\nasync function getUserTokens () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n\n    if (!tokens.accessToken || !tokens.idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    document.getElementById(&apos;accessToken&apos;).value = tokens.accessToken\n    document.getElementById(&apos;idToken&apos;).value = tokens.idToken\n\n    document.getElementById(&apos;getTokenBtn&apos;).disabled = true\n    document.getElementById(&apos;setTokenBtn&apos;).disabled = false\n\n    log(&apos;Successfully acquired tokens&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction setTokens () {\n  const tokens = {\n    accessToken: document.getElementById(&apos;accessToken&apos;).value,\n    idToken: document.getElementById(&apos;idToken&apos;).value\n  }\n  if (!tokens.accessToken || !tokens.idToken) {\n    log(&apos;Both access and id tokens are required.&apos;)\n    return\n  }\n  try {\n    client.setTokens(tokens)\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully set tokens&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to set authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall () {\n  // Gather call options.\n  const destination = document.getElementById(&apos;callee&apos;).value\n  const withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  callId = client.call.make(destination, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall () {\n  // Gather call options.\n  const withVideo = document.getElementById(&apos;answer-with-video&apos;).checked\n\n  log(&apos;Answering call&apos;)\n\n  const mediaConstraints = {\n    audio: true,\n    video: withVideo\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n\n// Reject an incoming call.\nfunction rejectCall () {\n  log(&apos;Rejecting call&apos;)\n\n  client.call.reject(callId)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  log(&apos;Ending call&apos;)\n\n  client.call.end(callId)\n}\n\nfunction renderMedia (callId) {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n\n  // Retrieve the local track that belongs to video\n  const videoTrack = call.localTracks.find(trackId => {\n    return client.media.getTrackById(trackId).kind === &apos;video&apos;\n  })\n\n  // Render local visual media.\n  client.media.renderTracks([videoTrack], &apos;#local-container&apos;)\n\n  // Render the remote audio/visual media.\n  client.media.renderTracks(call.remoteTracks, &apos;#remote-container&apos;)\n}\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n  log(&apos;Call state changed to: &apos; + call.state)\n\n  renderMedia(params.callId)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call&apos;)\n})\n\nclient.on(&apos;call:answered&apos;, params => {\n  renderMedia(params.callId)\n})\n\nclient.on(&apos;call:accepted&apos;, params => {\n  renderMedia(params.callId)\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://unpkg.com/@kandy-io/cpaas-sdk@5.2.0/dist/kandy.js\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;getTokenBtn\&quot; value=\&quot;Get Tokens\&quot; onclick=\&quot;getUserTokens();\&quot; />\n    <br />\n    Access Token: <input type=\&quot;text\&quot; id=\&quot;accessToken\&quot; /> ID Token: <input type=\&quot;text\&quot; id=\&quot;idToken\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;setTokenBtn\&quot; value=\&quot;Set Tokens\&quot; onclick=\&quot;setTokens();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Make a Call</legend>\n    <!-- User input for making a call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeCall();\&quot; />\n    to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; /> with video <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; checked />\n    <br />\n    <sub><i>Ex: janedoe@somedomain.com</i></sub>\n  </fieldset>\n\n  <fieldset>\n    <legend>Respond to a Call</legend>\n    <!-- User input for responding to an incoming call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n    with video <input type=\&quot;checkbox\&quot; id=\&quot;answer-with-video\&quot; checked />\n    <br />\n    <input type=\&quot;button\&quot; value=\&quot;Reject Call\&quot; onclick=\&quot;rejectCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <legend>End a Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote media:\n<div id=\&quot;remote-container\&quot;></div>\nLocal media:\n<div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Voice & Video Call Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

