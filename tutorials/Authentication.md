---
layout: page
categories: quickstarts-javascript
title: Authentication
permalink: /quickstarts/javascript/cpaas/Authentication
position: 2
categories:
  - getting_started
---

# Authentication

In this quickstart we will cover how to authenticate and subscribe to services for $KANDY$ using the JavaScript SDK. We will provide snippets of code below, which together will form a working demo application.

The first step with the JavaScript SDK is always to initialize it. You will need to know the server information for the account that you are using for initialization as well as the websocket server. The only required configurations are the server base url and client correlator, as the others have generic defaults.

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

To learn more about initializing the JavaScript SDK, see our [Configuration Quickstart](configurations).

#### Client Correlator

The clientCorrelator is an identifier of the client device, application and user account combined. It is a required parameter. Thinking of this as a MAC address may be helpful as an analogy. The $KANDY$ server uses the clientCorrelator to uniquely identify a specific application on a specific device in order to know where to deliver notifications. This allows it to distinguish between different connected mobile devices, applications on these devices and user accounts on these applications. You should provide a unique value per application and device. Inconsistent values of this parameter within APIs can cause service processing failures.

A possible way of generating a clientCorrelator would be to use a hashing algorithm seeded with information about your user. For instance, here is one such repo for SHA-256 in JavaScript - <https://github.com/emn178/js-sha256>. Entering the string "ExampleProgramName MobileDevice1 Application1 User1" as a value in SHA-256 returns "5ea87ebe10d40830bbfaf3017005423f2274f6411d368dc68c5e87e5251e58db". This will aid in keeping the clientCorrelator IDs unique.

## Step 1: Getting the authentication tokens

$KANDY$ authentication is performed by using access tokens which are issued by an authentication server. Each user is provided with unique tokens which are included in each request for authentication. The REST API is used for this process. The [REST API Reference](/developer/references/rest-api/1.0.0#authentication-token) Authentication page describes the process for obtaining the Access Token and the Id Token. The access tokens provided establish what can be accessed by the SDK. The identity token represents who is authenticated.

In this tutorial, we will be using 'Password Grant Flow' in order get the authentication tokens. This flow requires three pieces of information.

This information can be obtained from your CPaaS account, specifically from the Developer Portal.

More exactly, if you are using CPaaS APIs with your CPaaS user, the three pieces of information (required to be authenticated) will be under:

- `Home` -> `Personal Profile` (top right corner) -> `Details`
  - `Email` should be mapped to `username`
  - Your account password should be mapped to `password`
  - `Account client ID` should be mapped to `client_id`
    - Alternatively, a project's `Public Project Key` can be used as the `client_id` (see below)

However, if you are building a server-side app where there is no user, the information required to be authenticated will be under:

- `Projects` -> `{your project}` -> `Project info`/`Project secret`
  - `Private Project key` should be mapped to `client_id`
  - `Private Project secret` should be mapped to `client_secret`

If your server-side app requires user authentication:

- `Public project key` under your project is required when you develop public clients under your project that users are getting authenticated and utilizing the app.

However, for the scope of this tutorial, we'll make use of the first described scenario, which means using information such as `username`, `password` and `client_id`.

The following code sets up a simple UI that separates the steps involved in authentication.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to unsubscribe the previous user.

The first step is to retrieve the authentication tokens. Once the 'Client ID', 'User Email', and 'Password' inputs are filled in, the 'Get Tokens' button executes populateTokens() which retrieves the tokens, and populates the controls in the 'Set Tokens' section.

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple.

What we have is four buttons, and an element for logging messages to.

### Getting a token

Like we mentioned above, managing the tokens has to be done with the REST API, we do this next.

First we define a helper to transform a simple javascript key-value dictionary object into a string using the application/x-www-form-urlencoded mimetype.

```javascript
/**
 * Creates a form body from an dictionary
 */
function createFormBody (paramsObject) {
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
async function getTokens ({ clientId, username, password }) {
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
async function populateTokens () {
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('userEmail').value
  const password = document.getElementById('password').value

  try {
    const tokens = await getTokens({ clientId, username: userEmail, password })

    if (!tokens.accessToken || !tokens.idToken) {
      log('Error: Failed to get valid authentication tokens. Please check the credentials provided.')
      return
    }

    document.getElementById('accessToken').value = tokens.accessToken
    document.getElementById('idToken').value = tokens.idToken

    document.getElementById('getTokenBtn').disabled = true
    document.getElementById('setTokenBtn').disabled = false

    log('Successfully populated token controls')
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

Authentication is a bit more involved than what we show here, and it is the responsibility of the application to handle refreshing the authentication tokens to ensure the user can continue to make requests. All of this information can be seen in more detail in the REST API documentation and quickstarts [here](/developer/references/rest-api/1.0.0#authentication-token).

#### Client Credential Grant Flow

In addition to password grant flow seen in this tutorial, users can be authenticated using something called Client Credential Grant Flow. The flow is useful for a project to authenticate without an explicit $KANDY$ user. You can find more information on [the REST API documentation](/developer/quickstarts/rest-api/get-started#get-started-authentication-and-authorization), under Client Credential Grant Flow.

Client Credential Grant Flow is useful when you do not have a particular user to authenticate with and wish to use your project to authenticate anonymously. This allows functionality such as anonymous calls, sending/verifying 2FA, sending/receiving SMS, and opening notification channels.

Password grant flow is useful when you do not need to do the activities above, and want to track your users in a more fine-grained manner. If you are in a situation where you do not need to use client credential flow, password flow is preferred.

## Step 2: Setting the Tokens

Now that the authentication tokens have been retrieved, the second step is to tell the Javascript SDK platform about the authentication tokens. This is performed with the following code. This sets the tokens in the store to be used for authentication purposes. The `client.setTokens({accessToken, idToken})` function does not return a value.

```javascript
function setTokens () {
  const accessToken = document.getElementById('accessToken').value
  const idToken = document.getElementById('idToken').value

  client.setTokens({ accessToken, idToken })

  document.getElementById('setTokenBtn').disabled = true
  document.getElementById('subscribeBtn').disabled = false
  log('Successfully set tokens')
}
```

## Step 3: Service Subscriptions

At this point, you can call the subscribe function. The subscribe function takes an array of services that you would like to subscribe for and the channel type. Currently, the only channel type supported is 'websocket'.

```javascript
var servicesList = ['chat', 'call']
function subscribe () {
  log('Subscribing for ' + servicesList.toString() + ' services, using websocket channel...')
  client.services.subscribe(servicesList, 'websocket')
}
```

The `client.services.subscribe()` function does not return a value. Instead, the SDK uses events to tell you when something has changed.

Calling this function will trigger a change in the connection state, which in turn will trigger any listeners to the `subscription:change` event. You can therefore use your `subscription:change` listener to detect if the subscription was successful. Subscribing and unsubscribing are done per service. You can do partial subscriptions, add new subscriptions, or remove some subscriptions.

```javascript
// Listen for subscription changes.
client.on('subscription:change', function () {
  if (!client.services.getSubscriptions().isPending) {
    if (client.services.getSubscriptions().subscribed.length > 0) {
      document.getElementById('subscribeBtn').disabled = true
      document.getElementById('unsubscribeBtn').disabled = false

      log('Successfully subscribed to following services: ' + client.services.getSubscriptions().subscribed.toString())
    } else {
      document.getElementById('subscribeBtn').disabled = false
      document.getElementById('unsubscribeBtn').disabled = true

      log('Successfully unsubscribed from service subscriptions.')
    }
  }
})
```

If something goes wrong when we try to subscribe (invalid services maybe), we want to know. The Javascript SDK has a `subscription:error` event to support this.

```javascript
// Listen for subscription errors.
client.on('subscription:error', function (params) {
  log('Unable to subscribe. Error: ' + params.error.message)
})
```

In addition to subscription errors, the SDK will emit an `request:error` event for REST authorization errors. This event is specific for authorization issues when communicating with the server. If there is an issue with the user credentials, during subscription or any other feature, this event will let us know about it. (Note: This event will be emitted _in addition_ to the regular error event for a feature.)

```javascript
// Listen for authorization errors.
client.on('request:error', function (params) {
  log(params.error.message)
})
```

## Step 4: Unsubscribing

To unsubscribe, you simply call unsubscribe.

```javascript
function unsubscribe () {
  log('Unsubscribing from ' + servicesList.toString() + ' services, using websocket channel...')
  client.services.unsubscribe(servicesList, 'websocket')
}
```

Similarly for the subscribe API, the unsubscribe API will also trigger the `subscription:change` event. Hence, our listener for that event will also check if the subscribed services have been removed.

### Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions For Demo

- Open a browser instance of Google Chrome®, or [another supported browser](get-started), by clicking **Try it**.
- Enter your Client Id for your account or project in the _Client ID_ field.
- Enter the email address of your user in the _User Email_ field.
- Enter your user's password in the _Password_ field.
- Click **Login** to get your time-limited access token.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive notifications from the server.
- Click **Unsubscribe** to stop notifications from the server.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * $KANDY$ Authentication Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\n\n/**\n * Populate the tokens into the \&quot;set tokens\&quot; step.\n */\nasync function populateTokens () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n\n    if (!tokens.accessToken || !tokens.idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n\n    document.getElementById(&apos;accessToken&apos;).value = tokens.accessToken\n    document.getElementById(&apos;idToken&apos;).value = tokens.idToken\n\n    document.getElementById(&apos;getTokenBtn&apos;).disabled = true\n    document.getElementById(&apos;setTokenBtn&apos;).disabled = false\n\n    log(&apos;Successfully populated token controls&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction setTokens () {\n  const accessToken = document.getElementById(&apos;accessToken&apos;).value\n  const idToken = document.getElementById(&apos;idToken&apos;).value\n\n  client.setTokens({ accessToken, idToken })\n\n  document.getElementById(&apos;setTokenBtn&apos;).disabled = true\n  document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n  log(&apos;Successfully set tokens&apos;)\n}\n\nvar servicesList = [&apos;chat&apos;, &apos;call&apos;]\nfunction subscribe () {\n  log(&apos;Subscribing for &apos; + servicesList.toString() + &apos; services, using websocket channel...&apos;)\n  client.services.subscribe(servicesList, &apos;websocket&apos;)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (!client.services.getSubscriptions().isPending) {\n    if (client.services.getSubscriptions().subscribed.length > 0) {\n      document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n      document.getElementById(&apos;unsubscribeBtn&apos;).disabled = false\n\n      log(&apos;Successfully subscribed to following services: &apos; + client.services.getSubscriptions().subscribed.toString())\n    } else {\n      document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n      document.getElementById(&apos;unsubscribeBtn&apos;).disabled = true\n\n      log(&apos;Successfully unsubscribed from service subscriptions.&apos;)\n    }\n  }\n})\n\n// Listen for subscription errors.\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\n// Listen for authorization errors.\nclient.on(&apos;request:error&apos;, function (params) {\n  log(params.error.message)\n})\n\nfunction unsubscribe () {\n  log(&apos;Unsubscribing from &apos; + servicesList.toString() + &apos; services, using websocket channel...&apos;)\n  client.services.unsubscribe(servicesList, &apos;websocket&apos;)\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@5.3.0-beta.944/dist/kandy.js\&quot;></script>\n<div>\n  <fieldset>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;submit\&quot; id=\&quot;getTokenBtn\&quot; value=\&quot;Get tokens\&quot; onclick=\&quot;populateTokens();\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Set tokens</legend>\n    Access token: <input type=\&quot;text\&quot; id=\&quot;accessToken\&quot; /> Id token: <input type=\&quot;text\&quot; id=\&quot;idToken\&quot; />\n    <input type=\&quot;submit\&quot; id=\&quot;setTokenBtn\&quot; disabled value=\&quot;Set Tokens\&quot; onclick=\&quot;setTokens(accessToken, idToken);\&quot; />\n  </fieldset>\n  <fieldset>\n    <legend>Subscribe</legend>\n    <input type=\&quot;submit\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n    <input type=\&quot;submit\&quot; id=\&quot;unsubscribeBtn\&quot; disabled value=\&quot;Unsubscribe\&quot; onclick=\&quot;unsubscribe();\&quot; />\n  </fieldset>\n  <div id=\&quot;messages\&quot;></div>\n</div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;$KANDY$ Authentication Demo&quot;,&quot;editors&quot;:&quot;101&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

