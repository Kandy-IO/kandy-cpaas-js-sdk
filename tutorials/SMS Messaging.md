---
layout: page
categories: quickstarts-javascript
title: SMS Messaging
permalink: /quickstarts/javascript/cpaas2/SMS%20Messaging
position: 5
categories:
  - sms
---

# SMS Messaging

SMS Messaging is almost identical to [Chat](index.html#Chat). The only differences are as follows.

## Subscribing for the SMS services

Also, we will need to specify that we would like the subscribe for both 'smsinbound' and 'smsoutbound' services.

```javascript
function subscribe() {
  const services = ['smsinbound', 'smsoutbound']
  const subscriptionType = 'websocket'
  client.services.subscribe(services, subscriptionType)
  log('Subscribed to SMS service (websocket channel)')
}
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

```hidden javascript
/**
 * Creates a form body from an dictionary
 */
const cpaasAuthUrl = 'https://$KANDYFQDN$/cpaas/auth/v1/token'

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
  const smsFrom = document.getElementById('sms-number-from').value
  const clientId = document.getElementById('clientId').value
  const userEmail = document.getElementById('userEmail').value
  const password = document.getElementById('password').value
  try {
    client.updateConfig({messaging: { smsFrom }})
    const tokens = await getTokens({ clientId, username: userEmail, password })
    client.setTokens(tokens)
    log('Successfully logged in as ' + userEmail)
  } catch (error) {
    log('Error: Failed to get authentication tokens. Error: ' + error)
  }
}
```

If this is specified, then the conversation and all messages created from it will have a type of `sms`.

The rest of SMS messaging is the same as [Chat](index.html#Chat). All API functions and events will work the same.

```hidden html
<fieldset>
    <legend>Authenticate using your account information</legend>
    Client ID: <input type='text' id='clientId'/>
    User Email: <input type='text' id='userEmail'/>
    Password: <input type='password' id='password'/>
    Phone Number: <input type='text' id='sms-number-from' />
    <input type='button' value='Login' onclick='login();' />
</fieldset>
<fieldset>
  <legend>Subscribe to Chat Service on Websocket Channel</legend>
  <input type='button' value='subscribe' onclick='subscribe();' />
</fieldset>

<fieldset>
  <legend>Conversations</legend>

  Step 1: Enter their phone number in E164 format:
  <input type='text' id='convo-participant' />
  <br/>
  <sub><i>example:</i></sub>
  <br/>
  <sub><i>Phone Number: +12223334444 (+[countryCode][areaCode][subscriberNumber])</i></sub>

  <br/><br/>

  Step 2: Create!
  <input type='button' value='Create' onclick='createConvo();' />
  <br/><hr>

  <input type='button' value='Send' onclick='sendMessage();' />
  message to conversation:
  <input type='text' placeholder='Test message' id='message-text' />

</fieldset>

<fieldset>
  <legend>Messages</legend>
  <div id='convo-messages'></div>
</fieldset>

<div id="messages"> </div>
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

// Utility function for appending messages to the message div.
function log(message) {
  // Wrap message in textNode to guarantee that it is a string
  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html
  const textNode = document.createTextNode(message)
  const divContainer = document.createElement('div')
  divContainer.appendChild(textNode)
  document.getElementById('messages').appendChild(divContainer)
}

// Create and send a message to the current conversation.
function sendMessage() {
  if (!currentConvo) {
    log('No current conversation to send message to.')
    return
  }

  var text = document.getElementById('message-text').value

  // Create the message object, passing in the text for the message.
  var message = currentConvo.createMessage(text)

  // Send the message!
  message.send()
}

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

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

```codepen
{
	"title": "Javascript SDK Basic SMS Demo",
	"editors": "101",
	"js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```

### Instructions For Demo
* Enter your Client ID for your account or project in the "Client ID" field.
* Enter the email address of your user in the "User Email" field.
* Enter your user's password in the "Password" field.
* Enter your user's assigned Phone Number in the "Phone Number" field.
* Click Login to get your time-limited access token.
* Click "Subscribe" to receive notifications from the backend.
* Enter the phone number you'd like to send an SMS to in the field for "Step 1"
* Click on "Create" in "Step 2"
* Write the message in the "message to conversation" field that you want to send in your SMS.
* You should receive the SMS at the destination phone number.
* If you reply to that SMS, you should see the reply under Messages.

*Note: All phone numbers should follow the E164 format. Example: +12223334444 (+[countryCode][areaCode][subscriberNumber])*
