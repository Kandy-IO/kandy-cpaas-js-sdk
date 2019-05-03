---
layout: page
categories: quickstarts-javascript
title: SMS Messaging
permalink: /quickstarts/javascript/cpaas2/SMS%20Messaging
position: 6
categories:
  - sms
---

# SMS Messaging

SMS Messaging is almost identical to [Chat](Chat). The only differences are as follows.

## Subscribing for the SMS services

Also, we will need to specify that we would like the subscribe for both 'smsinbound' and 'smsoutbound' services.

```javascript
function subscribe() {
  const services = ['smsinbound', 'smsoutbound']
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

## Creating a SMS Conversation

When creating or retrieving a SMS Conversation, you have to specify that it is of `type: 'sms'`, like so:

```javascript
/*
 *  Basic SMS functionality.
 */

// We will only track one conversation in this demo.
var currentConvo

// Create a new conversation with another user.
function createConvo() {
  const participant = document.getElementById('convo-participant').value

  // Pass in the SIP address of a user to create a conversation with them.
  currentConvo = client.conversation.create([participant], { type: 'sms' })

  log('Conversation created with: ' + participant)
}

```

In the above code, you can see that the destination phone number is validated for format.

If this is specified, then the conversation and all messages created from it will have a type of `sms`.

The rest of SMS messaging is the same as [Chat](Chat). All API functions and events will work the same.

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

### Instructions For Demo
* Enter your Client Id for your account or project in the "Client ID" field.
* Enter the email address of your user in the "User Email" field.
* Enter your user's password in the "Password" field.
* Enter your user's assigned phone number in the "Phone Number" field.
* Click __Login__ to get your time-limited access token.
* Click __Subscribe__ to receive notifications from the server.
* Enter the phone number you'd like to send an SMS to in the field for "Step 1"
* Click on __Create__ in "Step 2".
* Write the message in the "message to conversation" field that you want to send in your SMS.
* You should receive the SMS at the destination phone number.
* If you reply to that SMS, you should see the reply under Messages.

*Note: All phone numbers should follow the E164 format. Example: +12223334444 (+[countryCode][areaCode][subscriberNumber])*



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Basic SMS Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n// Create and send a message to the current conversation.\nfunction sendMessage() {\n  if (!currentConvo) {\n    log(&apos;No current conversation to send message to.&apos;)\n    return\n  }\n\n  var text = document.getElementById(&apos;message-text&apos;).value\n\n  // Create the message object, passing in the text for the message.\n  var message = currentConvo.createMessage(text)\n\n  // Send the message!\n  message.send()\n}\n\n/*\n * Listen for new messages sent or received.\n * This event occurs when a new message is added to a conversation.\n */\nclient.on(&apos;messages:change&apos;, function(convo) {\n  const destination = convo.destination[0]\n  log(&apos;New message in conversation with &apos; + destination)\n\n  if (!currentConvo && [&apos;im&apos;, &apos;chat&apos;, &apos;sms&apos;].includes(convo.type)) {\n    currentConvo = client.conversation.get(destination, { type: convo.type })\n  }\n\n  // If the message is in the current conversation, render it.\n  if (currentConvo.destination[0] === destination) {\n    renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))\n  }\n})\n\n// Display the latest message in the provided conversation.\nfunction renderLatestMessage(convo) {\n  // Retrieve the latest message from the conversation.\n  var messages = convo.getMessages()\n  var message = messages[messages.length - 1]\n\n  // Construct the text of the message.\n  var text = message.sender + &apos;: &apos; + message.parts[0].text\n\n  // Display the message.\n  var convoDiv = document.getElementById(&apos;convo-messages&apos;)\n  convoDiv.innerHTML += &apos;<div>&apos; + text + &apos;</div>&apos;\n}\n\n/*\n * Listen for a change in the list of conversations.\n * In our case, it will occur when we receive a message from a user that\n * we do not have a conversation created with.\n */\nclient.on(&apos;conversations:change&apos;, function(convos) {\n  log(&apos;New conversation&apos;)\n\n  // If we don&apos;t have a current conversation, assign the new one and render it.\n  if (!currentConvo && convos.length !== 0) {\n    currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })\n    renderLatestMessage(currentConvo)\n  }\n})\n\nfunction subscribe() {\n  const services = [&apos;smsinbound&apos;, &apos;smsoutbound&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function() {\n\n  if(\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    log(&apos;Successfully subscribed&apos;)\n    }\n})\n\nclient.on(&apos;subscription:error&apos;, function() {\n  log(&apos;Unable to subscribe&apos;)\n})\n\n/*\n *  Basic SMS functionality.\n */\n\n// We will only track one conversation in this demo.\nvar currentConvo\n\n// Create a new conversation with another user.\nfunction createConvo() {\n  const participant = document.getElementById(&apos;convo-participant&apos;).value\n\n  // Pass in the SIP address of a user to create a conversation with them.\n  currentConvo = client.conversation.create([participant], { type: &apos;sms&apos; })\n\n  log(&apos;Conversation created with: &apos; + participant)\n}\n\n\n/**\n * Creates a form body from an dictionary\n */\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\nasync function login() {\n  const smsFrom = document.getElementById(&apos;sms-number-from&apos;).value\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    client.updateConfig({messaging: { smsFrom }})\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n&quot;,&quot;html&quot;:&quot;<fieldset>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n    User Email: <input type=&apos;text&apos; id=&apos;userEmail&apos;/>\n    Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n    Phone Number: <input type=&apos;text&apos; id=&apos;sms-number-from&apos; placeholder=\&quot;+12223334444\&quot;/>\n    <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  <input type=&apos;button&apos; value=&apos;Subscribe&apos; onclick=&apos;subscribe();&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Conversations</legend>\n\n  Step 1: Enter their phone number in E164 format:\n  <input type=&apos;text&apos; id=&apos;convo-participant&apos; />\n  <br/>\n  <sub><i>example:</i></sub>\n  <br/>\n  <sub><i>Phone Number: +12223334444 (+[countryCode][areaCode][subscriberNumber])</i></sub>\n\n  <br/><br/>\n\n  Step 2: Create!\n  <input type=&apos;button&apos; value=&apos;Create&apos; onclick=&apos;createConvo();&apos; />\n  <br/><hr>\n\n  <input type=&apos;button&apos; value=&apos;Send&apos; onclick=&apos;sendMessage();&apos; />\n  message to conversation:\n  <input type=&apos;text&apos; placeholder=&apos;Test message&apos; id=&apos;message-text&apos; />\n\n</fieldset>\n\n<fieldset>\n  <legend>Messages</legend>\n  <div id=&apos;convo-messages&apos;></div>\n</fieldset>\n\n<div id=\&quot;messages\&quot;> </div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Basic SMS Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/npm/@kandy-io/cpaas-sdk@73666/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>