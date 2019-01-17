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

```javascript exclude
const client = Kandy.create({
  // ... Only other configuration necessary
})
```

```hidden javascript
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

const cpaasAuthUrl = 'https://$KANDYFQDN$/cpaas/auth/v1/token'

/**
 * Creates a form body from an dictionary
 */
function createFormBody(paramsObject) {
  const keyValuePairs = Object.entries(paramsObject).map(
    ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
  )
  return keyValuePairs.join('&')
}
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
async function login() {
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('userEmail').value
  const password = document.getElementById('password').value
  try {
    const tokens = await getTokens({ clientId, username: userEmail, password })
    client.setTokens(tokens)
    log('Successfully logged in as ' + userEmail)
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

To learn more about configuration, refer to the [Configurations Quickstart](index.html#Configurations).

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

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](index.html#Authentication)

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

```hidden javascript
// Utility function for appending messages to the message div.
function log(message) {
  // Wrap message in textNode to guarantee that it is a string
  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html
  const textNode = document.createTextNode(message)
  const divContainer = document.createElement('div')
  divContainer.appendChild(textNode)
  document.getElementById('messages').appendChild(divContainer)
}
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

A `Conversation` has a few functions on it, such as `getMessages()`. To learn more about these functions, go [here](../docs#conversation).

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

The `messages:change` event is fired whenever a message is added to a conversation that is present in the Javascript SDK's state (including outgoing messages). Any subscribers to this event will receive the conversation for which there is a new message. You can read more about this event [here](../docs#messaging).

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

The `conversations:change` event is fired whenever a new conversation is added to the conversation list in the Javascript SDK's store. One such example of this occurring is when the Javascript SDK receives a message from a conversation it does not yet have a record for. In this instance, the Javascript SDK will create a representation of the new conversation in the store and emit this event. You can read more about this event [here](../docs#messaging).

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

```codepen
{
	"title": "Javascript SDK Basic Chat Demo",
	"editors": "101",
	"js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```
