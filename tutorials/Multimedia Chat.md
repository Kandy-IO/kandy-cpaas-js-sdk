---
layout: page
categories: quickstarts-javascript
title: Multimedia Chat
permalink: /quickstarts/javascript/cpaas2/Multimedia%20Chat
position: 10
---

# Multimedia Chat

In this quickstart we will cover how to send and receive multimedia-based chat messages using the Javascript SDK. We will provide snippets of code below, which together will form a working demo application that you can modify and tinker with at the end.

The majority of the code needed for Multimedia Chat is the same as Simple Chat, however there are some key differences that will be highlighted below:

#### HTML

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

Below that is a fieldset to hold the incoming and outgoing conversation messages.

Finally, we have a div to display general messages (such as any errors that may occur).

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

The `messages:change` event is fired whenever a message is added to a conversation OR a message is updated. Any subscribers to this event will receive the conversation for which there is a new message.

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

This function receives the conversation object as input. It then grabs the messages via `convo.getMessages()`, then grabs the last message. The Message can have multiple parts, such as a text part and an file/image part. From the message parts it builds some html elements, like as text or placeholder image tags for images. These placeholders are updated soon after via `message.createImageLinks` and the `messages:change` event. Finally it formats and prints the message.

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

### Instructions For Demo
* Open two browser instances for this demo by clicking the link twice.
* Enter your Client ID for your account or project in both instances.
  * Enter the email address of User A in the first instance (account or project users).
  * Enter the email address of User B in the second instance (account or project users).
* Enter the passwords for each user.
* Click __Login__ to get your time-limited access token in both instances.
* Click __Subscribe__ in both instances to receive notifications from the server.
* Enter the User Id of User B in the text field in "Step 1" of User A's instance. Enter the User Id in the format [userId]@[domain].
* Click on __Create__ in "Step 2".
* Enter a message to send to User B.
* Click the file input button and attach a file.
* Click __Send__ to send the message to User B.
  * User B should receive the chat message in the other instance.
  * If User B replies to the Chat message, User A should receive the reply under Messages.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Multimedia Chat Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    // Required: Server connection configs.\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;email&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction subscribe() {\n  const services = [\&quot;chat\&quot;];\n  const subscriptionType = \&quot;websocket\&quot;;\n  client.services.subscribe(services, subscriptionType);\n}\n\nclient.on(&apos;subscription:change&apos;, function() {\n\n  if(\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    log(&apos;Successfully subscribed&apos;)\n    }\n})\n\nlet filesForUpload = [];\nfunction handleFiles(file) {\n  if (file[0]) {\n    filesForUpload.push(file[0]);\n  } else {\n    filesForUpload = []; // if the user cancels the prompt, clear filesForUpload\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Multimedia Chat functionality.\n */\n\n// We will only track one conversation in this demo.\nvar currentConvo;\n\n// Create a new conversation with another user.\nfunction createConvo() {\n  const participant = document.getElementById(\&quot;convo-participant\&quot;).value;\n\n  // Pass in the full username of a user to create a conversation with them.\n  currentConvo = client.conversation.create([participant], { type: \&quot;chat\&quot; });\n\n  log(\&quot;Conversation created with: \&quot; + participant);\n}\n\n// Create and send a message to the current conversation.\nfunction sendMessage() {\n  if (currentConvo) {\n    var text = document.getElementById(\&quot;message-text\&quot;).value;\n\n    // Create the message object, passing in the text for the message.\n    var message = currentConvo.createMessage(text);\n\n    // add a part to the message for each file attachment\n    if (filesForUpload.length > 0) {\n      for (let file of filesForUpload) {\n        const part = {\n          type: \&quot;file\&quot;,\n          file: file\n        };\n        message.addPart(part);\n      }\n    }\n\n    // Send the message!\n    message.send();\n  } else {\n    log(\&quot;No current conversation to send message to.\&quot;);\n  }\n}\n\n/*\n * Listen for new messages sent or received.\n * This event occurs when a new message is added to a conversation.\n */\nclient.on(\&quot;messages:change\&quot;, function(convo) {\n  const destination = convo.destination[0];\n  log(\&quot;New message in conversation with \&quot; + destination);\n\n  if (!currentConvo && [\&quot;im\&quot;, \&quot;chat\&quot;, \&quot;sms\&quot;].includes(convo.type)) {\n    currentConvo = client.conversation.get(destination, { type: convo.type });\n  }\n\n  // If the message is in the current conversation, render it.\n  if (currentConvo.destination[0] === destination) {\n    renderConversation(client.conversation.get(currentConvo.destination, { type: convo.type }));\n  }\n});\n\nfunction renderConversation(conversation) {\n  if (!conversation) {\n    conversation = getSelectedConversationFromState();\n  }\n\n  document.getElementById(\&quot;convo-messages\&quot;).innerHTML = \&quot;\&quot;;\n  // Re-rendering the messages will allow us to populate the file/image placeholder\n  const messages = conversation.getMessages();\n  messages.forEach(message => {\n    let text = \&quot;\&quot;;\n    // a message contains multiple parts, we need to sort through them and act accordingly\n    message.parts.forEach(part => {\n      if (part.type === \&quot;text\&quot;) {\n        // If the part is text we just append the text from the part to the interface\n        text += message.sender + \&quot;:\&quot; + part.text;\n      } else if (part.type === \&quot;file\&quot;) {\n        // Render our initial placeholder for files/images. We make the id = part.url for easy lookups later\n        text += \&quot;<div id=\&quot; + part.rawURL + \&quot; class=message-file></div>\&quot;;\n      } else {\n        console.log(\&quot;Unrecognized part type!\&quot;);\n      }\n    });\n\n    // Display the message.\n    document.getElementById(\&quot;convo-messages\&quot;).innerHTML += \&quot;<div>\&quot; + text + \&quot;</div>\&quot;;\n  });\n\n  messages.forEach(message => {\n    // It is only necessary to worry about the file parts from here on\n    const messageFiles = message.parts.filter(part => part.type === \&quot;file\&quot;);\n    messageFiles.forEach(part => {\n      const img = document.createElement(\&quot;img\&quot;);\n      if (!part.url && !message.isFetchingLinks) {\n        // If we find no image URL then we need to fetch the image from the API\n        message.createImageLinks();\n      } else if (part.url && !message.isFetchingLinks) {\n        // Once the image url is available, add a src attribute and set it to the URL\n        img.src = part.url;\n      } else {\n        console.log(\&quot;fetching image links\&quot;);\n      }\n\n      img.alt = part.name;\n      document.getElementById(part.rawURL).appendChild(img);\n    });\n  });\n}\n\n&quot;,&quot;html&quot;:&quot;<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; />\n  Email <input type=\&quot;text\&quot; id=\&quot;email\&quot; placeholder=&apos;Email&apos; />\n  Password: <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n  <input type=\&quot;button\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  <input type=\&quot;button\&quot; value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Conversations</legend>\n\n  Step 1: Enter their User Id:\n  <input type=\&quot;text\&quot; id=\&quot;convo-participant\&quot; /> <br /><br />\n\n  Step 2: Create! <input type=\&quot;button\&quot; value=\&quot;Create\&quot; onclick=\&quot;createConvo();\&quot; /> <br />\n  <hr />\n\n  <input type=\&quot;button\&quot; value=\&quot;Send\&quot; onclick=\&quot;sendMessage();\&quot; />\n  <input type=\&quot;text\&quot; placeholder=\&quot;Test message\&quot; id=\&quot;message-text\&quot; />\n  <input type=\&quot;file\&quot; id=\&quot;file-upload\&quot; multiple onchange=\&quot;handleFiles(this.files)\&quot; value=\&quot;Upload File\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Messages</legend>\n  <div id=\&quot;convo-messages\&quot;></div>\n</fieldset>\n\n<div id=\&quot;messages\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Multimedia Chat Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@66158/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>