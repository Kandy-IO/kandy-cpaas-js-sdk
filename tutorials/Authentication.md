---
layout: page
categories: quickstarts-javascript
title: Authentication
permalink: /quickstarts/javascript/cpaas2/Authentication
position: 2
categories:
  - getting_started
---

# Authentication

In this quickstart we will cover how to authenticate and subscribe to services for $KANDY$ using the JavaScript SDK. We will provide snippets of code below, which together will form a working demo application.

The first step with the JavaScript SDK is always to initialize it. You will need to know the server information for the account that you are using for initialization as well as the websocket server. The only required configurations are the server base url and client correlator, as the others have generic defaults.

The client correlator is used by the $KANDY$ backend to uniquely identify a specific application on a specific device in order to know where to deliver notifications. You should provide a unique value per application and device.

```javascript
const client = Kandy.create({
  subscription: {
    expires: 3600
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

To learn more about initializing the JavaScript SDK, see our [Configuration Quickstart](index.html#Configurations).

## Step 1: Getting the authentication tokens

$KANDY$ authentication is performed by using access tokens which are issued by an authentication server. Each user is provided with unique tokens which are included in each request for authentication. The REST API is used for this process. The [REST API Reference](/developer/references/rest-api/3.0#subscriptions) Authentication page describes the process for obtaining the Access Token and the Id Token. The access tokens provided establish what can be accessed by the SDK. The identity token represents who is authenticated.

In order get the authentication tokens, three pieces of information are required.
ClientId, User Email and Password are available on your [projects page](/portal/projects/overview).

The following code sets up a simple UI that separates the steps involved in authentication.

The first step is to retrieve the authentication tokens. Once the 'Client ID', 'User Email', and 'Password' inputs are filled in, the 'Get Tokens' button executes populateTokens() which retrieves the tokens, and populates the controls in the 'Set Tokens' section.

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple.

```hidden html
<div>
    <fieldset>
        <legend>Authenticate using your account information</legend>
        Client ID: <input type='text' id='clientId'/>
        User Email: <input type='text' id='userEmail'/>
        Password: <input type='password' id='password'/>
        <input type="submit" value="Get tokens" onclick="populateTokens();">
    </fieldset>
    <fieldset>
        <legend>Set tokens</legend>
        Access token: <input type='text' id='accessToken'/>
        Id token: <input type='text' id='idToken'/>
        <input type="submit" value="Set tokens" onclick="setTokens(accessToken, idToken);">
    </fieldset>
    <fieldset>
        <legend>Subscribe</legend>
        <input type="submit" value="Subscribe" onclick="subscribe();">
        <input type="submit" value="Unsubscribe" onclick="unsubscribe();">
    </fieldset>
    <div id="messages"> </div>
</div>
```

What we have is four buttons, and an element for logging messages to.

### Getting a token

Like we mentioned above, managing the tokens has to be done with the REST API, we do this next.

First we define a helper to transform a simple javascript key-value dictionary object into a string using the application/x-www-form-urlencoded mimetype.

```javascript
/**
 * Creates a form body from an dictionary
 */
function createFormBody(paramsObject) {
  const keyValuePairs = Object.entries(paramsObject).map(
    ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
  )
  return keyValuePairs.join('&')
}
```

Then we define a function for retrieving the tokens from the authentication server.

```javascript
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
  const cpaasAuthUrl = 'https://$KANDYFQDN$/cpaas/auth/v1/token'
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
```

Finally, we have a function to populate the tokens into a field so that we can set them later. Note that we do this for demonstration purposes only, this should not be an additional steps for your users and instead done automatically by your application.

```javascript
/**
 * Populate the tokens into the "set tokens" step.
 */
async function populateTokens() {
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('userEmail').value
  const password = document.getElementById('password').value

  try {
    const tokens = await getTokens({ clientId, username: userEmail, password })

    document.getElementById('accessToken').value = tokens.accessToken
    document.getElementById('idToken').value = tokens.idToken

    log('Successfully populated token controls')
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

Authentication is a bit more involved than what we show here, and it is the responsibility of the application to handle refreshing the authentication tokens to ensure the user can continue to make requests. All of this information can be seen in more detail in the REST API documentation and quickstarts [here](/developer/references/rest-api/3.0#subscriptions).

## Step 2: Setting the Tokens

Now that the authentication tokens have been retrieved, the second step is to tell the Javascript SDK platform about the authentication tokens. This is performed with the following code. This sets the tokens in the store to be used for authentication purposes. The `client.setTokens({accessToken, idToken})` function does not return a value.

```javascript
function setTokens() {
  const accessToken = document.getElementById('accessToken').value
  const idToken = document.getElementById('idToken').value

  client.setTokens({ accessToken, idToken })
  log('Successfully set tokens')
}
```

## Step 3: Service Subscriptions

At this point, you can call the subscribe function. The subscribe function takes an array of services that you would like to subscribe for and the channel type. Currently, the only channel type supported is 'websocket'.

```javascript
var servicesList = ['chat', 'call']
function subscribe() {
  client.services.subscribe(servicesList, 'websocket')
}
```

The `client.services.subscribe()` function does not return a value. Instead, the SDK uses events to tell you when something has changed.

In the above piece of code we subscribe an anonymous function to the `subscription:error` event. Now, whenever the SDK fires off a `subscription:error` event, that function will be called.

## Step 4: Unsubscribing

To unsubscribe, you simply call unsubscribe.

```javascript
function unsubscribe() {
  client.services.unsubscribe(servicesList, 'websocket')
}
```

Calling this function will trigger a change in the connection state, which in turn will trigger any listeners to the `subscription:change` event. You can therefore use your `subscription:change` listener to detect if the subscription was successful. Subscribing and unsubscribing are done per service. You can do partial subscriptions, add new subscriptions, or remove some subscriptions.

```javascript
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

```hidden javascript
// Utility function for appending messages to the message div.
function log(message) {
  document.getElementById('messages').innerHTML += '<div>' + message + '</div>';
}
```

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

```codepen
{
	"title": "$KANDY$ Authentication Demo",
	"editors": "101",
	"js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```
