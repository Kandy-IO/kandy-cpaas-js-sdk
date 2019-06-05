---
layout: page
categories: quickstarts-javascript
title: User Connect
permalink: /quickstarts/javascript/uc/User%20Connect
---

# Connecting and Disconnecting

In this quickstart we will cover how to connect and disconnect to the Kandy Platform using Kandy.js. We will provide snippets of code below, which together will form a working demo application.

The first step with Kandy.js is always to initialize it. You will need to know the server information for the Kandy platform that you are using for initialization. Depending on your platform, the only required configuration is the server address, as the others have generic defaults.

```  javascript
import { create } from kandy
const kandy = create({
    // Required: Server connection configs.
    authentication: {
        subscription: {
            server: ...,
            ...
        },
        websocket: {
            server: ...,
            ...
        }
    }
})
```

To learn more about initializing Kandy, see our [Configuration Quickstart](Configurations). __This example does not provide data for `authentication` but it is required.__

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple.

``` html
<div id='auth-state'>Connected: false</div>

<input type="submit" value="Login" onclick="login();">
<input type="submit" value="Logout" onclick="logout();">

<div id="messages"> </div>
```

What we have is a simple div containing the connected state of our app, two buttons, and an element for logging messages to.

## Step 1: Connecting

To connect using Kandy, you will need two things:
1. A username. This is the full username of a user on your domain. (Example: your-user@your-domain.kandy.io)
1. A password. Don't worry, its safe with us.

With these three things, you can call the connect function on Kandy.

``` javascript
function login() {
  kandy.connect({
    username: username,
    password: password
  });
}
```

## Step 2: Connection Events

The `kandy.connect()` function does not return a value. Instead, Kandy.js uses events to tell you when something has changed. You can find a list of the authentication events [here](../../references/uc#authentication).

To subscribe to these events, you use `kandy.on()`. Here is the example for our demo app:

``` javascript
kandy.on('auth:change', function() {
   let isConnected = kandy.getConnection().isConnected;
   document.getElementById('auth-state').innerHTML = 'Connected: ' + isConnected;
   log('Connection state changed.');
});
```

If something goes wrong when we try to connect (invalid credentials maybe), we want to know. Kandy.js has an `auth:error` event to support this.

``` javascript
// Listen for authentication errors.
kandy.on('auth:error', function(params) {
  log('Connect error: ' + params.error.message + ' (' + params.error.code + ')');
});
```

In the above piece of code we subscribe an anonymous function to the `auth:change` event. Now, whenever Kandy fires off an `auth:change` event, that function will be called. Inside this function we call `kandy.getConnection()`. This function returns an object that looks like so:

``` javascript 
{ isConnected: true, isPending: false, error: undefined }
```

To learn more about the response from this API checkout the documentation for `getConnection` [here](../../references/uc#authentication).

## Step 3: Disconnecting

To disconnect, you simply call disconnect.

``` javascript
function logout() {
  kandy.disconnect();
}
```

Calling this function will trigger a change in the connection state, which in turn will trigger any listeners to the `auth:change` event. You can therefore use your `auth:change` listener to detect if the disconnect was successful.

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Kandy.io Authentication Demo\n */\n\nconst { create } = Kandy\nconst kandy = create({\n    // Required: Server connection configs.\n    authentication: {\n        subscription: {\n            server: ...,\n            ...\n        },\n        websocket: {\n            server: ...,\n            ...\n        }\n    }\n})\n\nvar username = \&quot;UsernameHere\&quot;;\nvar password = \&quot;PasswordHere\&quot;;\n\nfunction login() {\n  kandy.connect({\n    username: username,\n    password: password\n  });\n}\n\nkandy.on(&apos;auth:change&apos;, function() {\n   let isConnected = kandy.getConnection().isConnected;\n   document.getElementById(&apos;auth-state&apos;).innerHTML = &apos;Connected: &apos; + isConnected;\n   log(&apos;Connection state changed.&apos;);\n});\n\n// Listen for authentication errors.\nkandy.on(&apos;auth:error&apos;, function(params) {\n  log(&apos;Connect error: &apos; + params.error.message + &apos; (&apos; + params.error.code + &apos;)&apos;);\n});\n\nfunction logout() {\n  kandy.disconnect();\n}\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;;\n}\n\n&quot;,&quot;html&quot;:&quot;<div id=&apos;auth-state&apos;>Connected: false</div>\n\n<input type=\&quot;submit\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot;>\n<input type=\&quot;submit\&quot; value=\&quot;Logout\&quot; onclick=\&quot;logout();\&quot;>\n\n<div id=\&quot;messages\&quot;> </div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Kandy.io Authentication Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://localhost:3000/kandy/kandy.uc.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>