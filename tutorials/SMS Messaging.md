---
layout: page
categories: quickstarts-javascript
title: SMS Messaging
permalink: /quickstarts/javascript/cpaas/SMS%20Messaging
position: 9
categories:
  - sms
---

# SMS Messaging

SMS Messaging is almost identical to [Chat](chat). The only differences are as follows.

## Subscribing for the SMS services

Also, we will need to specify that we would like the subscribe for the 'smsinbound' service.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to reload this tutorial page as this particular tutorial example does not provide an unsubscribe button.

```javascript
function subscribe () {
  const smsFrom = document.getElementById('sms-number-from').value
  if (!smsFrom) {
    log('Error: Must provide a phone number so that the logged user can receive sms messages.')
    return
  }

  const services = [{ service: 'smsinbound', params: { destinationAddress: smsFrom } }]
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

## Creating a SMS Conversation

When creating or retrieving a SMS Conversation, you have to specify that it is of `type: 'sms'`, like so:

```javascript
/*
 *  Basic SMS functionality.
 */

// We will only track one conversation in this demo.
var currentConvo

// Create a new conversation with another user.
function createConvo () {
  const participant = document.getElementById('convo-participant').value

  // Pass in the SIP address of a user to create a conversation with them.
  currentConvo = client.conversation.create([participant], { type: 'sms' })

  log('Conversation created with: ' + participant)
}
```

In the above code, you can see that the destination phone number is validated for format.

If this is specified, then the conversation and all messages created from it will have a type of `sms`.

The rest of SMS messaging is the same as [Chat](chat). All API functions and events will work the same.

### Live Demo

Do you want to try this example for yourself? Click the button below to get started.

### Instructions For Demo

- Open a browser instance of Google Chrome®, or [another supported browser](get-started), by clicking **Try it**.
- Enter your Client Id for your account or project in the _Client ID_ field.
- Enter the email address of your user in the _User Email_ field.
- Enter your user's password in the _Password_ field.
- Click **Login** to get your time-limited access token.
  - Note: If the token expires, you’ll need to login again.
- Enter your user's assigned phone number in the _Phone Number_ field.
- Click **Subscribe** to receive notifications from the server for the above phone number.
- Enter the phone number you'd like to send an SMS to in the field for _Step 1_
- Click on **Create** in _Step 2_.
- Write the message in the _message to send_ field that you want to send in your SMS.
- You should receive the SMS at the destination phone number.
- If you reply to that SMS, you should see the reply under Messages.

_Note: All phone numbers should follow the E164 format. Example: +12223334444 (+[countryCode][areacode][subscriberNumber])_

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Basic SMS Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n// Create and send a message to the current conversation.\nfunction sendMessage () {\n  if (!currentConvo) {\n    log(&apos;No current conversation to send message to.&apos;)\n    return\n  }\n\n  var text = document.getElementById(&apos;message-text&apos;).value\n\n  // Create the message object, passing in the text for the message.\n  var message = currentConvo.createMessage(text)\n\n  // Send the message!\n  message.send()\n}\n\n/*\n * Listen for new messages sent or received.\n * This event occurs when a new message is added to a conversation.\n */\nclient.on(&apos;messages:change&apos;, function (event) {\n  const destination = event.destination[0]\n  log(&apos;New message in conversation with &apos; + destination)\n\n  currentConvo = client.conversation.get(destination, { type: event.type })\n\n  // If the message is in the current conversation, render it.\n  if (currentConvo.destination[0] === destination) {\n    renderMessage(client.conversation.get(currentConvo.destination, { type: event.type }), event.messageId)\n  }\n})\n\n// Display a particular message in the provided conversation.\nfunction renderMessage (convo, messageId) {\n  let message = convo.getMessage(messageId)\n\n  // Construct the text of the message to be displayed under &apos;Messages&apos; section.\n  var text = message.sender + &apos;: &apos; + message.parts[0].text\n\n  // Display the message.\n  var convoDiv = document.getElementById(&apos;convo-messages&apos;)\n  convoDiv.innerHTML += &apos;<div>&apos; + text + &apos;</div>&apos;\n}\n\n/*\n * Listen for a change in the list of conversations.\n * In our case, it will occur when we receive a message from a user that\n * we do not have a conversation created with.\n */\nclient.on(&apos;conversations:change&apos;, function (convos) {\n  log(&apos;New conversation&apos;)\n\n  if (!currentConvo) {\n    currentConvo = client.conversation.get(convos.destination[0], { type: convos.type })\n    renderMessage(currentConvo, convos.messageId)\n  }\n})\n\nfunction subscribe () {\n  const smsFrom = document.getElementById(&apos;sms-number-from&apos;).value\n  if (!smsFrom) {\n    log(&apos;Error: Must provide a phone number so that the logged user can receive sms messages.&apos;)\n    return\n  }\n\n  const services = [{ service: &apos;smsinbound&apos;, params: { destinationAddress: smsFrom } }]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\n/*\n *  Basic SMS functionality.\n */\n\n// We will only track one conversation in this demo.\nvar currentConvo\n\n// Create a new conversation with another user.\nfunction createConvo () {\n  const participant = document.getElementById(&apos;convo-participant&apos;).value\n\n  // Pass in the SIP address of a user to create a conversation with them.\n  currentConvo = client.conversation.create([participant], { type: &apos;sms&apos; })\n\n  log(&apos;Conversation created with: &apos; + participant)\n}\n\n/**\n * Creates a form body from an dictionary\n */\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n  return { accessToken: data.access_token, idToken: data.id_token, expiresIn: data.expires_in }\n}\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({ clientId, username: userEmail, password })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@840/dist/kandy.js\&quot;></script>\n<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n  <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n  <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  Your Phone Number: <input type=\&quot;text\&quot; id=\&quot;sms-number-from\&quot; placeholder=\&quot;+12223334444\&quot; />\n  <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Conversations</legend>\n\n  Step 1: Enter their phone number in E164 format:\n  <input type=\&quot;text\&quot; id=\&quot;convo-participant\&quot; />\n  <br />\n  <sub><i>example:</i></sub>\n  <br />\n  <sub><i>Phone Number: +12223334444 (+[countryCode][areaCode][subscriberNumber])</i></sub>\n\n  <br /><br />\n\n  Step 2: Create!\n  <input type=\&quot;button\&quot; value=\&quot;Create\&quot; onclick=\&quot;createConvo();\&quot; />\n  <br />\n  <hr />\n\n  <input type=\&quot;button\&quot; value=\&quot;Send\&quot; onclick=\&quot;sendMessage();\&quot; />\n  message to send:\n  <input type=\&quot;text\&quot; placeholder=\&quot;Test message\&quot; id=\&quot;message-text\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Messages</legend>\n  <div id=\&quot;convo-messages\&quot;></div>\n</fieldset>\n\n<div id=\&quot;messages\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Basic SMS Demo&quot;,&quot;editors&quot;:&quot;101&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

