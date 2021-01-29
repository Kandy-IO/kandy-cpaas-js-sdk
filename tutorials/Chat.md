---
layout: page
categories: quickstarts-javascript
title: Chat
permalink: /quickstarts/javascript/cpaas/Chat
position: 6
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

To learn more about configuration, refer to the [Configurations Quickstart](configurations).

Once we have authenticated, we need to subscribe for notifications on the services we care about.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to reload this tutorial page as this particular tutorial example does not provide an unsubscribe button.

In this case, we are subscribing to the `chat` Service on the `websocket` Channel.

```javascript
function subscribe () {
  const services = ['chat']
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

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](authentication)

#### HTML

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple.

First we have some fields for the user to input their credentials and to subscribe to the chat service on the websocket channel.

```html
<fieldset>
  <legend>Authenticate using your account information</legend>
  Client ID: <input type="text" id="clientId" /> User Email: <input type="text" id="userEmail" /> Password:
  <input type="password" id="password" />
  <input type="button" id="loginBtn" value="Login" onclick="login();" />
</fieldset>
<fieldset>
  <legend>Subscribe to Chat Service on Websocket Channel</legend>
  <input type="button" id="subscribeBtn" disabled value="Subscribe" onclick="subscribe();" />
</fieldset>
```

Next, we have a fieldset that contains all the actions we will perform for messaging. We have a button and input field to create conversations, as well as a button and input field to create and send messages.

```html
<fieldset>
  <legend>Conversations</legend>

  Step 1: If you want to create a one-to-one conversation, then enter their User ID. <br />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Otherwise enter the ID of the group created in
  Group Chat tutorial:
  <input type="text" id="convo-participant" />
  <br />
  <sub><i>example:</i></sub>
  <br />
  <sub><i>User ID: janedoe@somedomain.com ([userId]@[domain])</i></sub>
  <br /><br />

  Step 2: Specify the type of conversation by selecting the appropriate option:
  <div style="display:inline-block">
    <div>
      <input type="radio" id="oneToOne-chbox" name="conv-type" value="oneToOne-conv" checked />
      <label for="oneToOne-chbox">One-to-One type</label>
    </div>
    <div>
      <input type="radio" id="group-chbox" name="conv-type" value="group-conv" />
      <label for="group-chbox">Group type</label>
    </div>
  </div>
  <br /><br />

  Step 3: Create!
  <input type="button" value="Create" onclick="createConvo();" />
  <br />
  <hr />

  <input type="button" value="Send" onclick="sendMessage();" />
  message to send:
  <input type="text" placeholder="Test message" id="message-text" />
</fieldset>
```

Below that is a fieldset to hold the incoming and outgoing conversation messages.

```html
<fieldset>
  <legend>Messages</legend>
  <div id="convo-messages"></div>
</fieldset>
```

Finally, we have a div to display general messages (such as any errors that may occur).

```html
<div id="messages"></div>
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
function createConvo () {
  const participant = document.getElementById('convo-participant').value

  const isOneToOneSelected = document.getElementById('oneToOne-chbox').checked

  if (isOneToOneSelected) {
    // Pass in the SIP address (i.e. primary contact address) of a user to create a conversation with them.
    currentConvo = client.conversation.create([participant], { type: 'chat-oneToOne' })
    log('One-to-One conversation created with remote user: ' + participant)
  } else {
    // Assume we're creating a group conversation
    currentConvo = client.conversation.create(participant, { type: 'chat-group' })
    log('Group conversation created for Group ID: ' + participant)
  }
}
```

A `Conversation` has a few functions on it, such as `getMessages()`.

## Step 2: Creating and Sending a Message

From that `Conversation` object, we can create a `Message` object. A Message object represents the message being sent/received which, for now, will be a basic text message. To send the message, we simply call `send()` on the `Message` object.

```javascript
// Create and send a message to the current conversation.
function sendMessage () {
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

The `messages:change` event is fired whenever a message is added to a conversation that is present in the Javascript SDK's state (including outgoing messages). Any subscribers to this event will receive the conversation for which there is a new message.

```javascript
/*
 * Listen for new messages sent or received.
 * This event occurs when a new message is added to a conversation.
 */
client.on('messages:change', function (convo) {
  const destination = convo.destination[0]
  log('New message in conversation with ' + destination)

  // We'll update the currently used conversation object (for this logged-in user) if any of the two scenarios apply:
  // 1- There was no previous conversation and now we get a notification of a new message coming in (for this logged-in user).
  // 2- We had a previous conversation but its destination is not the same as the destination associated with this new incoming message.
  //    This is the case when sender of this message switched between a group conversation to a one-to-one conversation (and vice-versa)
  //    and then sent a new message.
  //    When this switching occurs, the destination is either the GroupId or UserID. No matter what is the current destination
  //    we want to show in this example that we can receive it.
  if (
    (!currentConvo || currentConvo.destination[0] != destination) &&
    ['chat-oneToOne', 'chat-group', 'sms'].includes(convo.type)
  ) {
    currentConvo = client.conversation.get(destination, { type: convo.type })
  }

  // If the message is in the current conversation, render it.
  if (currentConvo.destination[0] === destination) {
    renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))
  }
})
```

### `conversations:change`

The `conversations:change` event is fired whenever a new conversation is added to the conversation list in the Javascript SDK's store. One such example of this occurring is when the Javascript SDK receives a message from a conversation it does not yet have a record for. In this instance, the Javascript SDK will create a representation of the new conversation in the store and emit this event.

```javascript
/*
 * Listen for a change in the list of conversations.
 * In our case, it will occur when we receive a message from a user that
 * we do not have a conversation created with.
 */
client.on('conversations:change', function (convos) {
  log('New conversation')

  if (Array.isArray(convos)) {
    // If we don't have a current conversation, assign the new one and render it.
    if (!currentConvo && convos.length !== 0) {
      currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })
      renderLatestMessage(currentConvo)
    }
  } else {
    // Temporary fix: the first time a message is sent (as part of a new conversation), the 'convos' param is NOT an array
    currentConvo = client.conversation.get(convos.destination[0], { type: convos.type })
    renderLatestMessage(currentConvo)
  }
})
```

When our event listeners receive an event, meaning our conversation has a new message, we want to display that message to the user. Our listeners do this by calling a `renderLatestMessage` function, which adds the message to our interface, as can be seen below.

```javascript
// Display the latest message in the provided conversation.
function renderLatestMessage (convo) {
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

Do you want to try this example for yourself? Click the button below to get started.

### Instructions For Demo

- Browser instances to open:
  - For a one-to-one Chat demo, open two browser instances of Google Chrome®, or [another supported browser](get-started), by clicking **Try it** two times.
  - For a Group Chat demo, you may want to open as many browser instances as the number of user participants in that group.
- For any type of chat, enter your Client ID for your account or project in any browser instances.
  - Also enter the email address associated with each user in a given browser instance (account or project users).
- Enter the passwords for each user.
- Click **Login** to get your time-limited access token in all user instances.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive notifications from the server for all users.
- Creating a conversation instance between users:
  - For a one-to-one Chat demo, enter the User ID of User B in the text field in _Step 1_ of User A's instance. Enter the User ID in the format [userId]@[domain].
  - For a Group Chat demo, enter the group ID (as obtained from [Group Chat tutorial section](group-chat) ).
- Select the appropriate type of conversation in _Step 2_. If in the above step, you entered a User ID, then select 'One-to-One type', otherwise select 'Group type'.
- Click on **Create** in _Step 3_.
- Write the message in the _message to send_ field to send be sent. If you created a one-to-one conversation instance, the message will be sent to User B.
  If you created a group conversation instance, the message will be sent to all user participants in that group.
- Click **Send** to send the message.
  - The other user participant(s) should receive the chat message in the other browser instance(s), under Messages section.
  - If one user replies to the Chat message, the other(s) should receive the reply under Messages section.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Basic Chat Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token, expiresIn: data.expires_in }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({ clientId, username: userEmail, password })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction subscribe () {\n  const services = [&apos;chat&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Basic Chat functionality.\n */\n\n// We will only track one conversation in this demo.\nvar currentConvo\n\n// Create a new conversation with another user.\nfunction createConvo () {\n  const participant = document.getElementById(&apos;convo-participant&apos;).value\n\n  const isOneToOneSelected = document.getElementById(&apos;oneToOne-chbox&apos;).checked\n\n  if (isOneToOneSelected) {\n    // Pass in the SIP address (i.e. primary contact address) of a user to create a conversation with them.\n    currentConvo = client.conversation.create([participant], { type: &apos;chat-oneToOne&apos; })\n    log(&apos;One-to-One conversation created with remote user: &apos; + participant)\n  } else {\n    // Assume we&apos;re creating a group conversation\n    currentConvo = client.conversation.create(participant, { type: &apos;chat-group&apos; })\n    log(&apos;Group conversation created for Group ID: &apos; + participant)\n  }\n}\n\n// Create and send a message to the current conversation.\nfunction sendMessage () {\n  if (currentConvo) {\n    var text = document.getElementById(&apos;message-text&apos;).value\n\n    // Create the message object, passing in the text for the message.\n    var message = currentConvo.createMessage(text)\n\n    // Send the message!\n    message.send()\n  } else {\n    log(&apos;No current conversation to send message to.&apos;)\n  }\n}\n\n/*\n * Listen for new messages sent or received.\n * This event occurs when a new message is added to a conversation.\n */\nclient.on(&apos;messages:change&apos;, function (convo) {\n  const destination = convo.destination[0]\n  log(&apos;New message in conversation with &apos; + destination)\n\n  // We&apos;ll update the currently used conversation object (for this logged-in user) if any of the two scenarios apply:\n  // 1- There was no previous conversation and now we get a notification of a new message coming in (for this logged-in user).\n  // 2- We had a previous conversation but its destination is not the same as the destination associated with this new incoming message.\n  //    This is the case when sender of this message switched between a group conversation to a one-to-one conversation (and vice-versa)\n  //    and then sent a new message.\n  //    When this switching occurs, the destination is either the GroupId or UserID. No matter what is the current destination\n  //    we want to show in this example that we can receive it.\n  if (\n    (!currentConvo || currentConvo.destination[0] != destination) &&\n    [&apos;chat-oneToOne&apos;, &apos;chat-group&apos;, &apos;sms&apos;].includes(convo.type)\n  ) {\n    currentConvo = client.conversation.get(destination, { type: convo.type })\n  }\n\n  // If the message is in the current conversation, render it.\n  if (currentConvo.destination[0] === destination) {\n    renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))\n  }\n})\n\n/*\n * Listen for a change in the list of conversations.\n * In our case, it will occur when we receive a message from a user that\n * we do not have a conversation created with.\n */\nclient.on(&apos;conversations:change&apos;, function (convos) {\n  log(&apos;New conversation&apos;)\n\n  if (Array.isArray(convos)) {\n    // If we don&apos;t have a current conversation, assign the new one and render it.\n    if (!currentConvo && convos.length !== 0) {\n      currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })\n      renderLatestMessage(currentConvo)\n    }\n  } else {\n    // Temporary fix: the first time a message is sent (as part of a new conversation), the &apos;convos&apos; param is NOT an array\n    currentConvo = client.conversation.get(convos.destination[0], { type: convos.type })\n    renderLatestMessage(currentConvo)\n  }\n})\n\n// Display the latest message in the provided conversation.\nfunction renderLatestMessage (convo) {\n  // Retrieve the latest message from the conversation.\n  var messages = convo.getMessages()\n  var message = messages[messages.length - 1]\n\n  // Construct the text of the message.\n  var text = message.sender + &apos;: &apos; + message.parts[0].text\n\n  // Display the message.\n  var convoDiv = document.getElementById(&apos;convo-messages&apos;)\n  convoDiv.innerHTML += &apos;<div>&apos; + text + &apos;</div>&apos;\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@610/dist/kandy.js\&quot;></script>\n\n<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n  <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n  <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Conversations</legend>\n\n  Step 1: If you want to create a one-to-one conversation, then enter their User ID. <br />\n  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Otherwise enter the ID of the group created in\n  Group Chat tutorial:\n  <input type=\&quot;text\&quot; id=\&quot;convo-participant\&quot; />\n  <br />\n  <sub><i>example:</i></sub>\n  <br />\n  <sub><i>User ID: janedoe@somedomain.com ([userId]@[domain])</i></sub>\n  <br /><br />\n\n  Step 2: Specify the type of conversation by selecting the appropriate option:\n  <div style=\&quot;display:inline-block\&quot;>\n    <div>\n      <input type=\&quot;radio\&quot; id=\&quot;oneToOne-chbox\&quot; name=\&quot;conv-type\&quot; value=\&quot;oneToOne-conv\&quot; checked />\n      <label for=\&quot;oneToOne-chbox\&quot;>One-to-One type</label>\n    </div>\n    <div>\n      <input type=\&quot;radio\&quot; id=\&quot;group-chbox\&quot; name=\&quot;conv-type\&quot; value=\&quot;group-conv\&quot; />\n      <label for=\&quot;group-chbox\&quot;>Group type</label>\n    </div>\n  </div>\n  <br /><br />\n\n  Step 3: Create!\n  <input type=\&quot;button\&quot; value=\&quot;Create\&quot; onclick=\&quot;createConvo();\&quot; />\n  <br />\n  <hr />\n\n  <input type=\&quot;button\&quot; value=\&quot;Send\&quot; onclick=\&quot;sendMessage();\&quot; />\n  message to send:\n  <input type=\&quot;text\&quot; placeholder=\&quot;Test message\&quot; id=\&quot;message-text\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Messages</legend>\n  <div id=\&quot;convo-messages\&quot;></div>\n</fieldset>\n\n<div id=\&quot;messages\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Basic Chat Demo&quot;,&quot;editors&quot;:&quot;101&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

