---
layout: page
categories: quickstarts-javascript
title: Chat
permalink: /quickstarts/javascript/cpaas2/Chat
position: 4
categories:
  - chat
---

# Chat

In this quickstart we will cover how to send and receive text-based chat messages using the Javascript SDK. We will provide snippets of code below, which together will form a working demo application that you can modify and tinker with at the end.

## Configs

The chat feature doesn't have any required configuration. Simply creating an instance of the SDK and authenticating is sufficient to get started.

```javascript 
const client = Kandy.create({
  // ... Only other configuration necessary
})
```

To learn more about configuration, refer to the [Configurations Quickstart](Configurations).

Once we have authenticated, we need to subscribe for notifications on the services we care about. In this case, we are subscribing to the `chat` Service on the `websocket` Channel.

```javascript
function subscribe() {
  const services = ['chat']
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

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](Authentication)

#### HTML

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple.

First we have some fields for the user to input their credentials and to subscribe to the chat service on the websocket channel.

```html
<fieldset>
  <legend>Authenticate using your account information</legend>
  Client ID: <input type='text' id='clientId'/>
  User Email: <input type='text' id='userEmail'/>
  Password: <input type='password' id='password'/>
  <input type='button' value='Login' onclick='login();' />
</fieldset>
<fieldset>
  <legend>Subscribe to Chat Service on Websocket Channel</legend>
  <input type='button' value='subscribe' onclick='subscribe();' />
</fieldset>
```

Next, we have a fieldset that contains all the actions we will perform for messaging. We have a button and input field to create conversations, as well as a button and input field to create and send messages.

```html
<fieldset>
  <legend>Conversations</legend>

  Step 1: Enter their User Id:
  <input type='text' id='convo-participant' />
  <br/>
  <sub><i>example:</i></sub>
  <br/>
  <sub><i>User ID: janedoe@somedomain.com ([userId]@[domain])</i></sub>
  <br/><br/>

  Step 2: Create!
  <input type='button' value='Create' onclick='createConvo();' />
  <br/><hr>

  <input type='button' value='Send' onclick='sendMessage();' />
  <input type='text' placeholder='Test message' id='message-text' />

</fieldset>
```

Below that is a fieldset to hold the incoming and outgoing conversation messages.

```html
<fieldset>
  <legend>Messages</legend>
  <div id='convo-messages'></div>
</fieldset>
```

Finally, we have a div to display general messages (such as any errors that may occur).

```html
<div id="messages"> </div>
```

## Step 1: Creating a Conversation

In the Javascript SDK, there is the concept of a `Conversation` as an object. A `Conversation` object keeps track of messaging state between the participants of that conversation, as well as information and utilities for the conversation itself. When we send or receive a message with another user, it is sent or received through the conversation with that user. To start messaging with a user, we need to create a Conversation with them first.

```javascript
/*
 *  Basic Chat functionality.
 */

// We will only track one conversation in this demo.
var currentConvo

// Create a new conversation with another user.
function createConvo() {
  const participant = document.getElementById('convo-participant').value

  // Pass in the SIP address of a user to create a conversation with them.
  currentConvo = client.conversation.create([participant], { type: 'chat' })

  log('Conversation created with: ' + participant)
}
```

A `Conversation` has a few functions on it, such as `getMessages()`. To learn more about these functions, go [here](../../references/cpaas2#conversation).

## Step 2: Creating and Sending a Message

From that `Conversation` object, we can create a `Message` object. A Message object represents the message being sent/received which, for now, will be a basic text message. To send the message, we simply call `send()` on the `Message` object.

```javascript
// Create and send a message to the current conversation.
function sendMessage() {
  if (currentConvo) {
    var text = document.getElementById('message-text').value

    // Create the message object, passing in the text for the message.
    var message = currentConvo.createMessage(text)

    // Send the message!
    message.send()
  } else {
    log('No current conversation to send message to.')
  }
}
```

## Step 3: Messaging Events

There are a few messaging events we care about. We will go over two such events below.

### `messages:change`

The `messages:change` event is fired whenever a message is added to a conversation that is present in the Javascript SDK's state (including outgoing messages). Any subscribers to this event will receive the conversation for which there is a new message. You can read more about this event [here](../../references/cpaas2#messaging).

```javascript
/*
 * Listen for new messages sent or received.
 * This event occurs when a new message is added to a conversation.
 */
client.on('messages:change', function(convo) {
  const destination = convo.destination[0]
  log('New message in conversation with ' + destination)

  if (!currentConvo && ['im', 'chat', 'sms'].includes(convo.type)) {
    currentConvo = client.conversation.get(destination, { type: convo.type })
  }

  // If the message is in the current conversation, render it.
  if (currentConvo.destination[0] === destination) {
    renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))
  }
})
```

### `conversations:change`

The `conversations:change` event is fired whenever a new conversation is added to the conversation list in the Javascript SDK's store. One such example of this occurring is when the Javascript SDK receives a message from a conversation it does not yet have a record for. In this instance, the Javascript SDK will create a representation of the new conversation in the store and emit this event. You can read more about this event [here](../../references/cpaas2#messaging).

```javascript
/*
 * Listen for a change in the list of conversations.
 * In our case, it will occur when we receive a message from a user that
 * we do not have a conversation created with.
 */
client.on('conversations:change', function(convos) {
  log('New conversation')

  // If we don't have a current conversation, assign the new one and render it.
  if (!currentConvo && convos.length !== 0) {
    currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })
    renderLatestMessage(currentConvo)
  }
})
```

When our event listeners receive an event, meaning our conversation has a new message, we want to display that message to the user. Our listeners do this by calling a `renderLatestMessage` function, which adds the message to our interface, as can be seen below.

```javascript
// Display the latest message in the provided conversation.
function renderLatestMessage(convo) {
  // Retrieve the latest message from the conversation.
  var messages = convo.getMessages()
  var message = messages[messages.length - 1]

  // Construct the text of the message.
  var text = message.sender + ': ' + message.parts[0].text

  // Display the message.
  var convoDiv = document.getElementById('convo-messages')
  convoDiv.innerHTML += '<div>' + text + '</div>'
}
```

This function receives the conversation object as input. It then grabs the messages via `convo.getMessages()`, then grabs the last message. From this message it grabs `message.parts[0]`. Messages can have multiple parts, such as a text part and an image part. Finally it formats and prints the message.

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Basic Chat Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction subscribe() {\n  const services = [&apos;chat&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function() {\n\n  if(\n    client.services.getSubscriptions().isPending === false && \n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    log(&apos;Successfully subscribed&apos;)\n    }\n})\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Basic Chat functionality.\n */\n\n// We will only track one conversation in this demo.\nvar currentConvo\n\n// Create a new conversation with another user.\nfunction createConvo() {\n  const participant = document.getElementById(&apos;convo-participant&apos;).value\n\n  // Pass in the SIP address of a user to create a conversation with them.\n  currentConvo = client.conversation.create([participant], { type: &apos;chat&apos; })\n\n  log(&apos;Conversation created with: &apos; + participant)\n}\n\n// Create and send a message to the current conversation.\nfunction sendMessage() {\n  if (currentConvo) {\n    var text = document.getElementById(&apos;message-text&apos;).value\n\n    // Create the message object, passing in the text for the message.\n    var message = currentConvo.createMessage(text)\n\n    // Send the message!\n    message.send()\n  } else {\n    log(&apos;No current conversation to send message to.&apos;)\n  }\n}\n\n/*\n * Listen for new messages sent or received.\n * This event occurs when a new message is added to a conversation.\n */\nclient.on(&apos;messages:change&apos;, function(convo) {\n  const destination = convo.destination[0]\n  log(&apos;New message in conversation with &apos; + destination)\n\n  if (!currentConvo && [&apos;im&apos;, &apos;chat&apos;, &apos;sms&apos;].includes(convo.type)) {\n    currentConvo = client.conversation.get(destination, { type: convo.type })\n  }\n\n  // If the message is in the current conversation, render it.\n  if (currentConvo.destination[0] === destination) {\n    renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))\n  }\n})\n\n/*\n * Listen for a change in the list of conversations.\n * In our case, it will occur when we receive a message from a user that\n * we do not have a conversation created with.\n */\nclient.on(&apos;conversations:change&apos;, function(convos) {\n  log(&apos;New conversation&apos;)\n\n  // If we don&apos;t have a current conversation, assign the new one and render it.\n  if (!currentConvo && convos.length !== 0) {\n    currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })\n    renderLatestMessage(currentConvo)\n  }\n})\n\n// Display the latest message in the provided conversation.\nfunction renderLatestMessage(convo) {\n  // Retrieve the latest message from the conversation.\n  var messages = convo.getMessages()\n  var message = messages[messages.length - 1]\n\n  // Construct the text of the message.\n  var text = message.sender + &apos;: &apos; + message.parts[0].text\n\n  // Display the message.\n  var convoDiv = document.getElementById(&apos;convo-messages&apos;)\n  convoDiv.innerHTML += &apos;<div>&apos; + text + &apos;</div>&apos;\n}\n\n&quot;,&quot;html&quot;:&quot;<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n  User Email: <input type=&apos;text&apos; id=&apos;userEmail&apos;/>\n  Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n  <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  <input type=&apos;button&apos; value=&apos;subscribe&apos; onclick=&apos;subscribe();&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Conversations</legend>\n\n  Step 1: Enter their User Id:\n  <input type=&apos;text&apos; id=&apos;convo-participant&apos; />\n  <br/>\n  <sub><i>example:</i></sub>\n  <br/>\n  <sub><i>User ID: janedoe@somedomain.com ([userId]@[domain])</i></sub>\n  <br/><br/>\n\n  Step 2: Create!\n  <input type=&apos;button&apos; value=&apos;Create&apos; onclick=&apos;createConvo();&apos; />\n  <br/><hr>\n\n  <input type=&apos;button&apos; value=&apos;Send&apos; onclick=&apos;sendMessage();&apos; />\n  <input type=&apos;text&apos; placeholder=&apos;Test message&apos; id=&apos;message-text&apos; />\n\n</fieldset>\n\n<fieldset>\n  <legend>Messages</legend>\n  <div id=&apos;convo-messages&apos;></div>\n</fieldset>\n\n<div id=\&quot;messages\&quot;> </div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Basic Chat Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://raw.githubusercontent.com/Kandy-IO/kandy-cpaas-js-sdk/53489/dist/kandy.cpaas2.js&quot;} '><input type="image" src="../../../assets/resources/TryItOn-CodePen.png"></form>