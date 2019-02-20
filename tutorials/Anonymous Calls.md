---
layout: page
categories: quickstarts-javascript
title: Anonymous Calls
permalink: /quickstarts/javascript/cpaas2/Anonymous%20Calls
position: 4
categories:
  - voice
---

# Anonymous Calls

In this quickstart, we will cover making an anonymous call with the Javascript SDK. Code snippets will be used to demonstrate call usage of the Javascript SDK and together these snippets will form a working demo application that you can modify and tinker with at the end.

The working demo code will be very similar to the demo used in [Voice & Video Calls](Voice%20%26%20Video%20Calls) quickstart. The only difference is that we can log in as an anonymous user by setting our own access and Id tokens.

## Anonymous User
To acquire access and Id tokens for our anonymous user, we must do the following when requesting the tokens:
- Use a `grant_type` of `client_credentials`.
- Set our Client ID & Client Secret.

The following project details will be used as credentials:
- The project's "Private Project key" will be used as the Client ID.
- The project's "Private Project secret" will be used as the Client Secret.

*For more information, please consult the REST API documentation.*

A username and password is not needed when logging in as an anonymous user.

Once we have acquired our access & Id tokens for our anonymous user, we can set it by invoking our `setTokens` function which will invoke the Javascript SDK function of the same name.

``` javascript
function setTokens () {
  const tokens = {
    accessToken: document.getElementById('accessToken').value,
    idToken: document.getElementById('idToken').value
  }
  try {
    client.setTokens(tokens)
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
        Client ID: <input type='text' id='clientId'/>
        User Email: <input type='text' id='userEmail'/>
        Password: <input type='password' id='password'/>
        <input type='button' value='Get Tokens' onclick='getUserTokens();' />
        <br>
        Access Token: <input type='text' id='accessToken'/>
        ID Token: <input type='text' id='idToken'/>
        <input type='button' value='Set Tokens' onclick='setTokens();' />
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
        <br/>
        <sub><i>ex: sip:janedoe@somedomain.com (sip:[userId]@[domain])</i></sub>
    </fieldset>

    <fieldset>
        <legend>Respond to a Call</legend>
        <!-- User input for responding to an incoming call. -->
        <input type='button' value='Answer Call' onclick='answerCall();' />
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

## Step 1: Making a Call

Make a call from your anonymous user to a regular user, setting the regular user's User Id as the destination of the call.

``` javascript
/*
 *  Call functionality.
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

  const mediaConstraints = {
    audio: true,
    video: false
  }
  callId = client.call.make(destination, mediaConstraints)
}
```

## Step 2: Responding to a Call

Once we receive an incoming call, we will be able to either answer or reject it. Our `answerCall` and `rejectCall` functions will invoke the Javascript SDK functions of the same names.

```javascript
// Answer an incoming call.
function answerCall() {
  // Retrieve call state.
  let call = client.call.getById(callId)
  log('Answering call')

  const mediaConstraints = {
    audio: true,
    video: false
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

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

### Instructions For Demo
* Open two tabs [in a supported WebRTC-enabled browser](Get%20Started) for this demo by clicking the link twice. One will start the call (User A) and the other will answer it (User B).
* Acquire your access & Id tokens for your anonymous user. This will be User A.
* Set your access & Id tokens on their corresponding fields and click on *Set Tokens* button.
* On the second tab, you can login with a regular user for User B.
* Enter User B's credentials on the second tab and click *Get Tokens* then click *Set Tokens* when the "Access Token" and "Id Token" fields have been populated.
* Click "Subscribe" to receive notifications from the backend. Do this on both tabs.
* Enter the a phone number from your project's Anonymous call destinations in the "to" field. Make sure to add "sip:" before the address. Ex: sip:phoneNumber@sipdomain.com
* Click *Make Call* to start the call from User A (anonymous user) to User B's User Id.
* Wait until User B receives the incoming call. You should see the text "Received incoming call" under Messages on User B's tab.
* Once User B has received the incoming call request, click *Answer Call* to answer the call.
* After a short time, User A and User B should be in an established call.
* You can end the call by clicking *End Call* in either tab.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Voice & Video Call Demo\n */\n\nconst client = Kandy.create({\n  // No call specific configuration required. Using defaults.\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe() {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n  log(&apos;Subscribed to call service (websocket channel)&apos;)\n}\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from a dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\n\nasync function getUserTokens() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    document.getElementById(&apos;accessToken&apos;).value = tokens.accessToken\n    document.getElementById(&apos;idToken&apos;).value = tokens.idToken\n\n    log(&apos;Successfully acquired tokens&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n\nfunction setTokens () {\n  const tokens = {\n    accessToken: document.getElementById(&apos;accessToken&apos;).value,\n    idToken: document.getElementById(&apos;idToken&apos;).value\n  }\n  try {\n    client.setTokens(tokens)\n    log(&apos;Successfully set tokens&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to set authentication tokens. Error: &apos; + error)\n  }\n}\n\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall() {\n  // Gather call options.\n  let destination = document.getElementById(&apos;callee&apos;).value\n\n  // Check that the destination is in the proper format.\n  var callDestRegex = RegExp(&apos;^sip:.*\\@.*$&apos;, &apos;g&apos;)\n  if(!callDestRegex.test(destination)) {\n    log(&apos;Destination is in incorrect format. Must be of the form \&quot;sip:<someName>@<someDomain>\&quot;&apos;)\n    return\n  }\n\n  const mediaConstraints = {\n    audio: true,\n    video: false\n  }\n  callId = client.call.make(destination, mediaConstraints)\n}\n\n// Answer an incoming call.\nfunction answerCall() {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Answering call&apos;)\n\n  const mediaConstraints = {\n    audio: true,\n    video: false\n  }\n  client.call.answer(callId, mediaConstraints)\n}\n\n// Reject an incoming call.\nfunction rejectCall() {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Rejecting call&apos;)\n\n  client.call.reject(callId)\n}\n\n// End an ongoing call.\nfunction endCall() {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call&apos;)\n\n  client.call.end(callId)\n}\n\nfunction renderMedia(callId) {\n  const call = client.call.getById(callId)\n\n  // Render the local media.\n  client.media.renderTracks(call.localTracks, &apos;#local-container&apos;)\n\n  // Render the remote media.\n  client.media.renderTracks(call.remoteTracks, &apos;#remote-container&apos;)\n}\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function(params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function(params) {\n  log(&apos;Encountered error on call: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function(params) {\n  const call = client.call.getById(params.callId)\n  log(&apos;Call state changed to: &apos; + call.state)\n\n  renderMedia(params.callId)\n\n  // If the call ended, stop tracking the callId.\n  if (call.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function(params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call&apos;)\n})\n\nclient.on(&apos;call:answered&apos;, params => {\n  renderMedia(params.callId)\n})\n\nclient.on(&apos;call:accepted&apos;, params => {\n  renderMedia(params.callId)\n})\n\n&quot;,&quot;html&quot;:&quot;<div>\n    <fieldset>\n        <legend>Authenticate using your account information</legend>\n        Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n        User Email: <input type=&apos;text&apos; id=&apos;userEmail&apos;/>\n        Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n        <input type=&apos;button&apos; value=&apos;Get Tokens&apos; onclick=&apos;getUserTokens();&apos; />\n        <br>\n        Access Token: <input type=&apos;text&apos; id=&apos;accessToken&apos;/>\n        ID Token: <input type=&apos;text&apos; id=&apos;idToken&apos;/>\n        <input type=&apos;button&apos; value=&apos;Set Tokens&apos; onclick=&apos;setTokens();&apos; />\n    </fieldset>\n    <fieldset>\n        <legend>Subscribe To Call Service Websocket Channel</legend>\n        <input type=&apos;button&apos; value=&apos;subscribe&apos; onclick=&apos;subscribe();&apos; />\n    </fieldset>\n    <fieldset>\n        <legend>Make a Call</legend>\n        <!-- User input for making a call. -->\n        <input type=&apos;button&apos; value=&apos;Make Call&apos; onclick=&apos;makeCall();&apos; />\n        to <input type=&apos;text&apos; id=&apos;callee&apos; />\n        <br/>\n        <sub><i>ex: sip:janedoe@somedomain.com (sip:[userId]@[domain])</i></sub>\n    </fieldset>\n\n    <fieldset>\n        <legend>Respond to a Call</legend>\n        <!-- User input for responding to an incoming call. -->\n        <input type=&apos;button&apos; value=&apos;Answer Call&apos; onclick=&apos;answerCall();&apos; />\n        <input type=&apos;button&apos; value=&apos;Reject Call&apos; onclick=&apos;rejectCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <legend>End a Call</legend>\n        <!-- User input for ending an ongoing call. -->\n        <input type=&apos;button&apos; value=&apos;End Call&apos; onclick=&apos;endCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <!-- Message output container. -->\n        <legend>Messages</legend>\n        <div id=&apos;messages&apos;></div>\n    </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote media: <div id=\&quot;remote-container\&quot;></div>\n\nLocal media: <div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Voice & Video Call Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@58675/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>