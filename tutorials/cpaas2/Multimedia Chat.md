---
layout: page
categories: quickstarts-javascript
title: Multimedia Chat
permalink: /quickstarts/javascript/cpaas2/Multimedia%20Chat
position: 9
---

# Multimedia Chat

In this quickstart we will cover how to send and receive multimedia-based chat messages using the Javascript SDK. We will provide snippets of code below, which together will form a working demo application that you can modify and tinker with at the end.

The majority of the code needed for Multimedia Chat is the same as Simple Chat, however there are some key differences that will be highlighted below:

```hidden javascript
const client = Kandy.create({
  subscription: {
    expires: 3600
  },
  // Required: Server connection configs.
  authentication: {
    // Required: Server connection configs.
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
  const userEmail = document.getElementById('email').value
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

```hidden javascript
function subscribe() {
  const services = ["chat"];
  const subscriptionType = "websocket";
  client.services.subscribe(services, subscriptionType);
  log("Subscribed to chat service (websocket channel)");
}
```

#### HTML

```hidden html
<fieldset>
  <legend>Authenticate using your account information</legend>
  Client ID: <input type="text" id="clientId" />
  Email <input type="text" id="email" placeholder='Email' />
  Password: <input type="password" id="password" />
  <input type="button" value="Login" onclick="login();" />
</fieldset>
<fieldset>
  <legend>Subscribe to Chat Service on Websocket Channel</legend>
  <input type="button" value="subscribe" onclick="subscribe();" />
</fieldset>
```

The first thing we're going to need is a file-upload widget, in conjunction with the Simple Chat example, we'll only need one additional line of html.

```html
<fieldset>
  <legend>Conversations</legend>

  Step 1: Enter their User Id:
  <input type="text" id="convo-participant" /> <br /><br />

  Step 2: Create! <input type="button" value="Create" onclick="createConvo();" /> <br />
  <hr />

  <input type="button" value="Send" onclick="sendMessage();" />
  <input type="text" placeholder="Test message" id="message-text" />
  <input type="file" id="file-upload" multiple onchange="handleFiles(this.files)" value="Upload File" />
</fieldset>
```

Now we'll need to implement handleFiles and add a filesForUpload array that will be accessed later.

```javascript
let filesForUpload = [];
function handleFiles(file) {
  if (file[0]) {
    filesForUpload.push(file[0]);
  } else {
    filesForUpload = []; // if the user cancels the prompt, clear filesForUpload
  }
}
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

```hidden html
<fieldset>
  <legend>Messages</legend>
  <div id="convo-messages"></div>
</fieldset>
```

Finally, we have a div to display general messages (such as any errors that may occur).

```hidden html
<div id="messages"></div>
```

```hidden javascript
/*
 *  Multimedia Chat functionality.
 */

// We will only track one conversation in this demo.
var currentConvo;

// Create a new conversation with another user.
function createConvo() {
  const participant = document.getElementById("convo-participant").value;

  // Pass in the full username of a user to create a conversation with them.
  currentConvo = client.conversation.create([participant], { type: "chat" });

  log("Conversation created with: " + participant);
}
```

## Creating and Sending a Message/Attachment

**_ Subject to change _**
From that `Conversation` object, we can create a `Message` object. A Message object represents the message being sent/received which, will be a Multimedia Message. To send the message and attachment, first we call createMessage(text) with the text we wish to send, then we add a file part for each file attachment we wish to send (for this example we're only allowing one attachment), we can do this using message.addPart({ type: 'file', file: file }). Finally, the message is ready and can be sent using message.send()

```javascript
// Create and send a message to the current conversation.
function sendMessage() {
  if (currentConvo) {
    var text = document.getElementById("message-text").value;

    // Create the message object, passing in the text for the message.
    var message = currentConvo.createMessage(text);

    // add a part to the message for each file attachment
    if (filesForUpload.length > 0) {
      for (let file of filesForUpload) {
        const part = {
          type: "file",
          file: file
        };
        message.addPart(part);
      }
    }

    // Send the message!
    message.send();
  } else {
    log("No current conversation to send message to.");
  }
}
```

## Messaging Events

There are a few messaging events we care about. We will go over two such events below.

### `messages:change`

The `messages:change` event is fired whenever a message is added to a conversation OR a message is updated. Any subscribers to this event will receive the conversation for which there is a new message. You can read more about this event [here](../docs#messaging).

```javascript
/*
 * Listen for new messages sent or received.
 * This event occurs when a new message is added to a conversation.
 */
client.on("messages:change", function(convo) {
  const destination = convo.destination[0];
  log("New message in conversation with " + destination);

  if (!currentConvo && ["im", "chat", "sms"].includes(convo.type)) {
    currentConvo = client.conversation.get(destination, { type: convo.type });
  }

  // If the message is in the current conversation, render it.
  if (currentConvo.destination[0] === destination) {
    renderConversation(client.conversation.get(currentConvo.destination, { type: convo.type }));
  }
});
```

When our event listeners receive an event, meaning our conversation has a new/updated message, we want to display that message to the user. Our listeners do this by calling a `renderConversation` function, which renders all the messages to the interface. Initially when we render a Multimedia Message to a page we render the attachment as a placeholder, then once our image has loaded it will receive its image/file and fill the placeholder.

```javascript
function renderConversation(conversation) {
  if (!conversation) {
    conversation = getSelectedConversationFromState();
  }

  document.getElementById("convo-messages").innerHTML = "";
  // Re-rendering the messages will allow us to populate the file/image placeholder
  const messages = conversation.getMessages();
  messages.forEach(message => {
    let text = "";
    // a message contains multiple parts, we need to sort through them and act accordingly
    message.parts.forEach(part => {
      if (part.type === "text") {
        // If the part is text we just append the text from the part to the interface
        text += message.sender + ":" + part.text;
      } else if (part.type === "file") {
        // Render our initial placeholder for files/images. We make the id = part.url for easy lookups later
        text += "<div id=" + part.rawURL + " class=message-file></div>";
      } else {
        console.log("Unrecognized part type!");
      }
    });

    // Display the message.
    document.getElementById("convo-messages").innerHTML += "<div>" + text + "</div>";
  });

  messages.forEach(message => {
    // It is only necessary to worry about the file parts from here on
    const messageFiles = message.parts.filter(part => part.type === "file");
    messageFiles.forEach(part => {
      const img = document.createElement("img");
      if (!part.url && !message.isFetchingLinks) {
        // If we find no image URL then we need to fetch the image from the API
        message.createImageLinks();
      } else if (part.url && !message.isFetchingLinks) {
        // Once the image url is available, add a src attribute and set it to the URL
        img.src = part.url;
      } else {
        console.log("fetching image links");
      }

      img.alt = part.name;
      document.getElementById(part.rawURL).appendChild(img);
    });
  });
}
```

This function receives the conversation object as input. It then grabs the messages via `convo.getMessages()`, then grabs the last message. The Message can have multiple parts, such as a text part and an file/image part. From the message parts it builds some html elements, like as text or placeholder image tags for images. These placeholders are updated soon after via `message.createImageLinks` and the `messages:change` event, see [here](../docs#messaging) for more details. Finally it formats and prints the message.

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

```codepen
{
	"title": "Javascript SDK Multimedia Chat Demo",
	"editors": "101",
	"js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```
