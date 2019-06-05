---
layout: page
categories: quickstarts-javascript
title: Voice and Video Calls
permalink: /quickstarts/javascript/uc/Voice%20%26%20Video%20Calls
---

# Voice and Video Calls

In this quickstart, we will cover the basics of making IP calls with Kandy. Code snippets will be used to demonstrate call usage of Kandy.js, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as mid-call operations or screensharing, please refer to their respective quickstarts.

## Call Configs

When initalizing Kandy.js, call configurations can be provided that act as a default if they are not provided when making a call. For this quickstart, we will specify that we want calls to default to being audio-only. This can be overridden by providing these options when making or answering the call, though. To learn more about call configs, refer to the [Configurations Quickstart](Configurations). __This example does not provide data for `authentication` but it is required.__

```  javascript
// Setup Kandy with "audio call by default" and server configurations.
import { create } from kandy
const kandy = create({
    call: {
        callDefaults: {
            sendInitialVideo: false
        }
    },
    authentication: {
        // Required: Server connection configs.
        ...
    }
});
```

After that, the user will need to connect to Kandy. We won't cover authentication in this quickstart, so we'll take a shortcut and steal the connect code from the [User Connection Quickstart](User%20Connect), except for the button part. So the user will automatically login after initialization.

## User Interface

To interact with our demo application, we will have a basic UI that allows us to make outgoing calls and respond to incoming calls. The UI will be kept very simple, as it is not the focus of this quickstart, so it will be a straightforward set of elements for user input.

``` html
<div>
    <fieldset>
        <legend>Make a Call</legend>
        <!-- User input for making a call. -->
        <input type='button' value='Make Call' onclick='makeCall();' />
        to <input type='text' id='callee' />
        with video <input type='checkbox' id='make-with-video' />
    </fieldset>

    <fieldset>
        <legend>Respond to a Call</legend>
        <!-- User input for responding to an incoming call. -->
        <input type='button' value='Answer Call' onclick='answerCall();' />
        with video <input type='checkbox' id='answer-with-video' />
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

An important part of the UI for calls are the media containers. These containers will be used to hold the media from both sides of the call. A remote media container will _always_ be needed for a call (both voice and video), and a local media container will be needed if you would like to display the local video of the call. The HTML elements that Kandy.js will use as media containers are empty `<div>`s.

``` html
<!-- Media containers. -->
Remote video: <div id="remote-container"></div>

Local video: <div id="local-container"></div>
```

With that, there is nothing more needed for the user interface.

## Step 1: Making a Call

When the user clicks on the 'Make Call' button, we want our `makeCall` function to retrieve the information needed for the call, then make the call. Since we did not specify default media containers on initialization, we will specify them as we make the call.

``` javascript
/*
 *  Voice and Video Call functionality.
 */

// Variable to keep track of the call.
let callId;

// Get user input and make a call to the callee.
function makeCall() {
    // Gather call options.
    let callee = document.getElementById('callee').value;
    let withVideo = document.getElementById('make-with-video').checked;

    // Gather media containers to be used for the call.
    let remoteContainer = document.getElementById('remote-container');
    let localContainer = document.getElementById('local-container');

    log('Making call to ' + callee);
    callId = kandy.call.make(callee, {
        sendInitialVideo: withVideo,
        remoteVideoContainer: remoteContainer,
        localVideoContainer: localContainer,
        normalizeAddress: true
    });
}
```

Kandy's `makeCall` will return a unique ID that is used to keep track of the call. This ID will be used to perform operations involving the call.

## Step 2: Responding to a Call

If our user receives an incoming call, they will be able to either answer or reject it with our demo application. Our demo's `answerCall` and `rejectCall` functions will invoke Kandy's functions of the same names.

``` javascript
// Answer an incoming call.
function answerCall() {
    // Gather call options.
    let withVideo = document.getElementById('answer-with-video').checked;

    // Gather media containers to be used for the call.
    let remoteContainer = document.getElementById('remote-container');
    let localContainer = document.getElementById('local-container');

    // Retrieve call state.
    let call = kandy.call.getById(callId);
    log('Answering call from ' + call.from);

    kandy.call.answer(callId, {
        sendInitialVideo: withVideo,
        remoteVideoContainer: remoteContainer,
        localVideoContainer: localContainer
    });
}

// Reject an incoming call.
function rejectCall() {
    // Retrieve call state.
    let call = kandy.call.getById(callId);
    log('Rejecting call from ' + call.from);

    kandy.call.reject(callId);
}
```

Note that `callId` has not been defined above when receiving a call. The user will receive the `callId` from an event, which will be covered in Step 4.

## Step 3: Ending a Call

If our user has an ongoing call, they can end it by providing the call's ID to Kandy's `call.end` function, which is what our demo application will do.

``` javascript
// End an ongoing call.
function endCall() {
    // Retrieve call state.
    let call = kandy.call.getById(callId);
    log('Ending call with ' + call.from);

    kandy.call.end(callId);
}
```

## Step 4: Call Events

As we use Kandy's call functions, Kandy will emit events that provide feedback about the changes in call state. We will set listeners for these events to keep our demo application informed about Kandy state.

### `call:start`

The `call:start` event informs us that an outgoing call that we made has successfully been initialized, and the callee should receive a notification about the incoming call.

``` javascript
// Set listener for successful call starts.
kandy.on('call:start', function(params) {
    log('Call successfully started. Waiting for response.');
});
```

### `call:error` and `media:error`

The `call:error` event informs us that a problem was encountered with the call. The `media:error` event is more specialized in that it indicates that the call could not be made because webRTC media could not be initialized. Both events provide information about the error that occured.

``` javascript
// Set listener for generic call errors.
kandy.on('call:error', function(params) {
    log('Encountered error on call: ' + params.error.message);
});

// Set listener for call media errors.
kandy.on('media:error', function(params) {
    log('Call encountered media error: ' + params.error.message);
});
```

### `call:stateChange`

As the call is acted upon (such as answered or rejected), its state will change. We can react to changes in the call by listening for the `call:stateChange` event. For our demo application, we will only act if the call was ended.

``` javascript
// Set listener for changes in a call's state.
kandy.on('call:stateChange', function(params) {
    log('Call state changed to: ' + params.state);

    // If the call ended, stop tracking the callId.
    if(params.state === 'ENDED') {
        callId = null;
    }
});
```

### `call:receive`

The `call:receive` event informs us that we have received an incoming call. The event provides the ID of the call, then we can get more information about it from Kandy state.

``` javascript
// Set listener for incoming calls.
kandy.on('call:receive', function(params) {
    // Keep track of the callId.
    callId = params.callId;

    // Retrieve call information.
    call = kandy.call.getById(params.callId);
    log('Received incoming call from ' + call.from);
});
```

We can now call the demo application done. We've covered the basics of what is needed to allow a user to use call functionality.

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Kandy.io Voice and Video Call Demo\n */\n\n// Variables for connecting.\nvar username = \&quot;UsernameHere\&quot;;\nvar password = \&quot;PasswordHere\&quot;;\n\n// Setup Kandy with \&quot;audio call by default\&quot; and server configurations.\nconst { create } = Kandy\nconst kandy = create({\n    call: {\n        callDefaults: {\n            sendInitialVideo: false\n        }\n    },\n    authentication: {\n        // Required: Server connection configs.\n        ...\n    }\n});\n\n/*\n *  Authentication functionality.\n */\n\n// Authenticate, and connect, the user with Kandy.\nkandy.connect({\n    username: username,\n    password: password\n});\n\n// Setup a listener for changes in the connection state.\nkandy.on(&apos;auth:change&apos;, function() {\n   let isConnected = kandy.getConnection().isConnected;\n   document.getElementById(&apos;auth-state&apos;).innerHTML = &apos;Connected: &apos; + isConnected;\n   log(&apos;Connection state changed.&apos;);\n});\n\n// Setup a listener for authentication errors.\nkandy.on(&apos;auth:error&apos;, function(error) {\n    log(&apos;Connect error: &apos; + error.message + &apos; (&apos; + error.code + &apos;)&apos;);\n});\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n    document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;;\n}\n\n/*\n *  Voice and Video Call functionality.\n */\n\n// Variable to keep track of the call.\nlet callId;\n\n// Get user input and make a call to the callee.\nfunction makeCall() {\n    // Gather call options.\n    let callee = document.getElementById(&apos;callee&apos;).value;\n    let withVideo = document.getElementById(&apos;make-with-video&apos;).checked;\n\n    // Gather media containers to be used for the call.\n    let remoteContainer = document.getElementById(&apos;remote-container&apos;);\n    let localContainer = document.getElementById(&apos;local-container&apos;);\n\n    log(&apos;Making call to &apos; + callee);\n    callId = kandy.call.make(callee, {\n        sendInitialVideo: withVideo,\n        remoteVideoContainer: remoteContainer,\n        localVideoContainer: localContainer,\n        normalizeAddress: true\n    });\n}\n\n// Answer an incoming call.\nfunction answerCall() {\n    // Gather call options.\n    let withVideo = document.getElementById(&apos;answer-with-video&apos;).checked;\n\n    // Gather media containers to be used for the call.\n    let remoteContainer = document.getElementById(&apos;remote-container&apos;);\n    let localContainer = document.getElementById(&apos;local-container&apos;);\n\n    // Retrieve call state.\n    let call = kandy.call.getById(callId);\n    log(&apos;Answering call from &apos; + call.from);\n\n    kandy.call.answer(callId, {\n        sendInitialVideo: withVideo,\n        remoteVideoContainer: remoteContainer,\n        localVideoContainer: localContainer\n    });\n}\n\n// Reject an incoming call.\nfunction rejectCall() {\n    // Retrieve call state.\n    let call = kandy.call.getById(callId);\n    log(&apos;Rejecting call from &apos; + call.from);\n\n    kandy.call.reject(callId);\n}\n\n// End an ongoing call.\nfunction endCall() {\n    // Retrieve call state.\n    let call = kandy.call.getById(callId);\n    log(&apos;Ending call with &apos; + call.from);\n\n    kandy.call.end(callId);\n}\n\n// Set listener for successful call starts.\nkandy.on(&apos;call:start&apos;, function(params) {\n    log(&apos;Call successfully started. Waiting for response.&apos;);\n});\n\n// Set listener for generic call errors.\nkandy.on(&apos;call:error&apos;, function(params) {\n    log(&apos;Encountered error on call: &apos; + params.error.message);\n});\n\n// Set listener for call media errors.\nkandy.on(&apos;media:error&apos;, function(params) {\n    log(&apos;Call encountered media error: &apos; + params.error.message);\n});\n\n// Set listener for changes in a call&apos;s state.\nkandy.on(&apos;call:stateChange&apos;, function(params) {\n    log(&apos;Call state changed to: &apos; + params.state);\n\n    // If the call ended, stop tracking the callId.\n    if(params.state === &apos;ENDED&apos;) {\n        callId = null;\n    }\n});\n\n// Set listener for incoming calls.\nkandy.on(&apos;call:receive&apos;, function(params) {\n    // Keep track of the callId.\n    callId = params.callId;\n\n    // Retrieve call information.\n    call = kandy.call.getById(params.callId);\n    log(&apos;Received incoming call from &apos; + call.from);\n});\n\n&quot;,&quot;html&quot;:&quot;<div id=&apos;auth-state&apos;>Connected: false</div>\n\n<div>\n    <fieldset>\n        <legend>Make a Call</legend>\n        <!-- User input for making a call. -->\n        <input type=&apos;button&apos; value=&apos;Make Call&apos; onclick=&apos;makeCall();&apos; />\n        to <input type=&apos;text&apos; id=&apos;callee&apos; />\n        with video <input type=&apos;checkbox&apos; id=&apos;make-with-video&apos; />\n    </fieldset>\n\n    <fieldset>\n        <legend>Respond to a Call</legend>\n        <!-- User input for responding to an incoming call. -->\n        <input type=&apos;button&apos; value=&apos;Answer Call&apos; onclick=&apos;answerCall();&apos; />\n        with video <input type=&apos;checkbox&apos; id=&apos;answer-with-video&apos; />\n        <input type=&apos;button&apos; value=&apos;Reject Call&apos; onclick=&apos;rejectCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <legend>End a Call</legend>\n        <!-- User input for ending an ongoing call. -->\n        <input type=&apos;button&apos; value=&apos;End Call&apos; onclick=&apos;endCall();&apos; />\n    </fieldset>\n\n    <fieldset>\n        <!-- Message output container. -->\n        <legend>Messages</legend>\n        <div id=&apos;messages&apos;></div>\n    </fieldset>\n</div>\n\n<!-- Media containers. -->\nRemote video: <div id=\&quot;remote-container\&quot;></div>\n\nLocal video: <div id=\&quot;local-container\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Kandy.io Voice and Video Call Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://localhost:3000/kandy/kandy.uc.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>