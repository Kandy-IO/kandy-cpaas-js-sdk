---
layout: page
categories: quickstarts-javascript
title: Chat History
permalink: /quickstarts/javascript/cpaas/Chat%20History
position: 6
categories:
  - chat
---

# Chat History

Chat History is a follow-up tutorial from [Chat](Chat) tutorial, meaning that you must use the Chat tutorial first, in order to create at least one conversation with some messages being sent back & forth between two users, as this tutorial does not allow creating conversations or sending of messages.

Assuming you have done it, this tutorial will just showcase how to fetch/delete conversations/messages (stored on the server) involving this user.
(But first you need to login successfully with this user. For the login exercise, we'll just reuse the same code in this CodePen example.)

## Configs

Like the chat feature, this one doesn't have any required configuration and authentication is done the same way. 

```javascript 
const client = Kandy.create({
  // ... Only other configuration necessary
})
```

#### HTML

Since we're going to be making a working demo, we also need some HTML.

First we have some fields for the user to input their credentials:

```html
<fieldset>
  <legend>Authenticate using your account information</legend>
  Client ID: <input type='text' id='clientId'/>
  User Email: <input type='text' id='userEmail'/>
  Password: <input type='password' id='password'/>
  <input type='button' value='Login' onclick='login();' />
</fieldset>
```

Next, this demo will involve demonstrating several capabilities.

## Step 1: Setting up listeners for any changes in conversations

Before fetching any conversations, we'll setup our listener.

This way, any change in conversations content (e.g. as a result of fetching conversations) will trigger a 'conversations:change' event for which we register to listen and act upon getting such event:

```javascript
// Listen for the event that tells us conversations have been fetched.
client.on('conversations:change', function(params) {
  // If there are any errors, display them in status area
  if(params.error && params.error.message) {
    log('Error: ' + params.error.message)
  }

  // Refresh list of conversations based our internal array.
  refreshConversationsList();

  // Clear list of messages, since we now have a new list of conversations.
  clearMessagesList();
})
```

## Step 2: Fetching Conversations

Fetching all conversations (for this user) is the first capability we'll demonstrate.
This capability retrieves any previously created conversation for the user that are stored on the server.

We provide a button for actual fetching this data from server side and a 'div' element (with id: list_of_conversations_container) for displaying the resuts.

```html
<fieldset>
  <legend>Current Conversations</legend>

  <br/>
  Step 1: Get all existing conversations related to our user:
  <br/><br/>
  <input type='button' value='Fetch Conversations' onclick='fetchConversations();' />
  <br/><br/>
  <div id="list_of_conversations_container"> </div>

</fieldset>
```

When the above button is clicked we invoke this method to retrieve all conversations:

```javascript
function fetchConversations() {
  log('Fetching conversations...')
  client.conversation.fetch()
}
```

This is how we refresh list of conversations:

```javascript
// This is how we get user selecting aconversation

function refreshConversationsList() {
  const conversations = client.conversation.getAll()

  // Remove whatever list items were displayed before
  const listOfConversationsElement = document.getElementById('list_of_conversations_container')
  listOfConversationsElement.innerHTML = ''

  // Now populate the list with new content
  if (conversations.length > 0) {
    log('Got an update. There are now ' + conversations.length + ' conversations available.')
    const selectElement = document.createElement("select")
    selectElement.id = "list_of_conversations"
    selectElement.size = 4

    log('Loading ...')
    for (const conversation of conversations){
      const labelValue = 'Conversation ('+ conversation.type + ') with ' + conversation.destination[0]

      const optionElement = document.createElement("option")
      // Use 'HTML entities' encoder/decoder to escape whatever value we supply to the <option> element
      // This way we're not vulnerable to XSS injection attacks.
      optionElement.value = he.escape(conversation.destination[0])
      optionElement.label = labelValue

      selectElement.appendChild(optionElement)
    }

    listOfConversationsElement.appendChild(selectElement)
    listOfConversationsElement.appendChild(document.createElement("br"))
  } else {
    log('Got an update. No conversations available.')
  }
}
```

This is how we clear any stale information in the messages list. Note that this code is all about HTML element manipulations, so it does not exercise any public API:

```javascript

function clearMessagesList() {
  // Regardless of whether we now have any conversations left, we need to update the messages section in this tutorial.
  const listOfMessagesElement = document.getElementById('list_of_messages')
  if (listOfMessagesElement) {
     // wipe any previous content displayed under div: list_of_messages
     listOfMessagesElement.innerHTML = ''

     // also clear the text field where user provides any message IDs that need to be deleted
     document.getElementById('message_IDs').value = ''
  }
}
```

## Step 3: Deleting a Conversation

This capability will remove the conversation instance from server side.

If the attempt to get conversations returns something, then you can go this step which deletes a given
conversation (from the above list displayed to user). 

First we'll provide an utility function to return a selected conversation

```javascript
function getSelectedConversation() {
  const selectedConversationOption = document.getElementById('list_of_conversations').value
  return client.conversation.get(selectedConversationOption, {type: client.conversation.chatTypes.ONETOONE})
}
```

```html
<fieldset>
  <legend>Deleting Conversations</legend>

  <br/>
  Step 2: Click this button to delete a selected conversation:
  <br/><br/>
  <input type='button' value='Delete a conversation' onclick='deleteAConversation();' />
  <br/>
</fieldset>
```

When user click the delete button, this function is invoked, requesting a delete operation on server side:

```javascript
function deleteAConversation() {
  const conversation = getSelectedConversation()
  if (!conversation) {
    log('Error: Cannot delete a conversation. First select one.')
    return
  }

  log('Deleting conversation with: ' + conversation.destination[0])
  // Make request to server to delete the conversation.
  conversation.delete()
}
```

As user deletes a given conversation, the list of outstanding conversations will be refreshed to reflect that.

## Step 4: Setting up listeners for any changes in messages

Before fetching any messages, we'll setup our listener.

This way, any change in messages content (e.g. as a result of fetching messages) will trigger a 'messages:change' event for which we register to listen and act upon getting such event:

```javascript
// Listen for the event that tells us messages (for a selected conversation) have changed.
client.on('messages:change', function(params) {
  // If there are any errors, display them in status area
  if(params.error && params.error.message) {
    log('Error: ' + params.error.message)
  }

  // Refresh the messages list using our internal array
  refreshMessagesList()
})
```

## Step 5: Fetching Messages

The next capability we'll demonstrate is to allow user to fetch all messages (for a given conversation). 
This capability retrieves any previously sent messages for the user that are stored on the server.

Go to this step if you got at least one fetched conversation.
To fetch messages user will need to select a conversation and then click on 'Fetch message(s)' button.

```html
<fieldset>
  <legend>Fetching Messages</legend>

  <br/>
  Step 3: Get all messages for a selected conversation.
  <br/><br/>

  <input type='button' value='Fetch message(s)' onclick='fetchMessages()' />
  <br/> <br/>
  <div id="list_of_messages" class='list-content'> </div>
</fieldset>
```

Clicking the 'Fetch message(s)' button calls this function:

```javascript
function fetchMessages() {
  const conversation = getSelectedConversation()
  if (!conversation) {
    log('Error: Cannot fetch messages. First select a conversation.')
    return
  }
  log('Fetching all messages for conversation with: ' + conversation.destination[0])
  conversation.fetchMessages()
}
```

If there are any messages, they will be displayed in a list below the 'Fetch messages' button.

Refreshing the list of messages is done by this function:

```javascript
function refreshMessagesList() {
  // wipe any previous content displayed under div: list_of_messages
  const lisOfMessagesElement = document.getElementById('list_of_messages')
  lisOfMessagesElement.innerHTML = ''

  const convValue = document.getElementById('list_of_conversations').value
  let messages
  if (convValue) {
    const conversation = client.conversation.get(convValue, {type: client.conversation.chatTypes.ONETOONE})
    messages = conversation.getMessages()
  }

  // Now populate the list with new content
  if (messages && messages.length > 0) {
    log('Got an update. There are now ' + messages.length + ' messages available.')
    let index = 1
    for (const message of messages){
      lisOfMessagesElement.appendChild(document.createTextNode(index + ': Msg ID: '))
      const boldText = document.createElement("b")
      boldText.innerHTML = message.messageId
      lisOfMessagesElement.appendChild(boldText)
      lisOfMessagesElement.appendChild(document.createTextNode(' whose content is: ' + message.parts[0].text))
      lisOfMessagesElement.appendChild(document.createElement("br"))
      index++
    }
  } else {
    log('Got an update. No messages available (for currently selected conversation).')
  }
}
```

## Step 6: Deleting Messages

Also, we'll provide a way to delete messages, by providing an input field and a button to trigger deletion.
This capability will remove the specified messages from server side.

Go to this step if you got at least one fetched message (for a selected conversation).

Deleting a message is done by specifying a message ID in the text field. For deleting multiple messages at once,
user will need to enter all the message IDs he/she wants to delete, by comma separating them.

```html
<fieldset>
  <legend>Deleting Messages</legend>

  <br/>
  Step 4: Enter the message IDs you want to delete (comma separated):
  <br/><br/>

  <input type='text' id='message_IDs' />
  <input type='button' value='Delete message(s)' id='delete_messages_button'  onclick='deleteMessages();' />
  <br/>
</fieldset>
```

Clicking 'Delete message(s)' button calls this function:

```javascript
function deleteMessages() {
  const messageIDsTxt = document.getElementById('message_IDs').value
  if (!messageIDsTxt) {
      log('Error: Cannot delete message: Must provide at least one message ID.')
      return
  }
  const messageIDs = messageIDsTxt.split(',')

  const conversation = getSelectedConversation()
  if (!conversation) {
      log('Error: Cannot delete message. First select a conversation')
      return
  }
  log('Deleting ' + messageIDs.length + ' messages for conversation with: ' + conversation.destination[0] + '. IDs to delete are: ' + messageIDsTxt)

    // Make request to server..
  conversation.deleteMessages(messageIDs)

  // also clear the text field (containing the message IDs) because we sent the request
  // so no need to display stale information ..
  document.getElementById('message_IDs').value = ''
}
```

Note that server will notify this CodePen example for every single deletion that occurred successfully, so for a multiple-message deletion,
the current list will be updated by refreshing its contents several times.

## Step 7: Status Section

Finally, we have a div to separately display any general messages (such as status information or any errors that may occur).

```html
<div id="status_messages"> </div>
```

### Instructions For Demo
* Open one browser instance of Google Chrome®, or [another supported browser](Get%20Started), by clicking __Try it__.
* Enter your Client ID for your account or project in that browser instance.
* Enter the email address of user whose chat history you want to view. The user should be associated with your account.
* Enter the password for that user.
* Click __Login__ to get your time-limited access token in that browser instance.
  * Note: If the token expires, you’ll need to login again.
* Retrieve all existing conversation belonging to your user by clicking __Fetch Conversations__ button.
* Once the list of conversations have been retrieved and displayed, you can delete a conversation by specifying the conversation item number and clicking __Delete a conversation__ button. Any time a conversation has been succesfully deleted, the list of existing conversations will be automatically updated.
* Furthermore, you can fetch all messages for a given conversation by specifying the conversation item number and clicking __Fetch message(s)__ button. 
* Once the list of messages have been retrieved and displayed, you can delete a set of messages by specifying their IDs in the text field provided and clicking __Delete message(s)__ button. The ID for each message is displayed in the list. If you specify more then one ID in the text field, you need to comma separate them. Any time a message has been succesfully deleted, the list of existing messages will be automatically updated.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Chat History Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from a dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token, expiresIn: data.expires_in }\n}\n\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const {accessToken, idToken, expiresIn} = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens({accessToken, idToken})\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn/60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n\n\n// Utility function for appending messages to the message div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;status_messages&apos;).appendChild(divContainer)\n}\n\n// Handling any message related errors: we simply issue a log, for simplicity.\nclient.on(&apos;messages:error&apos;, function(error) {\n  log(&apos;Error: Got an error (as part of messages:error event). Error content is: &apos; + JSON.stringify(error))\n})\n\n// Listen for the event that tells us conversations have been fetched.\nclient.on(&apos;conversations:change&apos;, function(params) {\n  // If there are any errors, display them in status area\n  if(params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n\n  // Refresh list of conversations based our internal array.\n  refreshConversationsList();\n\n  // Clear list of messages, since we now have a new list of conversations.\n  clearMessagesList();\n})\n\nfunction fetchConversations() {\n  log(&apos;Fetching conversations...&apos;)\n  client.conversation.fetch()\n}\n\n// This is how we get user selecting aconversation\n\nfunction refreshConversationsList() {\n  const conversations = client.conversation.getAll()\n\n  // Remove whatever list items were displayed before\n  const listOfConversationsElement = document.getElementById(&apos;list_of_conversations_container&apos;)\n  listOfConversationsElement.innerHTML = &apos;&apos;\n\n  // Now populate the list with new content\n  if (conversations.length > 0) {\n    log(&apos;Got an update. There are now &apos; + conversations.length + &apos; conversations available.&apos;)\n    const selectElement = document.createElement(\&quot;select\&quot;)\n    selectElement.id = \&quot;list_of_conversations\&quot;\n    selectElement.size = 4\n\n    log(&apos;Loading ...&apos;)\n    for (const conversation of conversations){\n      const labelValue = &apos;Conversation (&apos;+ conversation.type + &apos;) with &apos; + conversation.destination[0]\n\n      const optionElement = document.createElement(\&quot;option\&quot;)\n      // Use &apos;HTML entities&apos; encoder/decoder to escape whatever value we supply to the <option> element\n      // This way we&apos;re not vulnerable to XSS injection attacks.\n      optionElement.value = he.escape(conversation.destination[0])\n      optionElement.label = labelValue\n\n      selectElement.appendChild(optionElement)\n    }\n\n    listOfConversationsElement.appendChild(selectElement)\n    listOfConversationsElement.appendChild(document.createElement(\&quot;br\&quot;))\n  } else {\n    log(&apos;Got an update. No conversations available.&apos;)\n  }\n}\n\n\nfunction clearMessagesList() {\n  // Regardless of whether we now have any conversations left, we need to update the messages section in this tutorial.\n  const listOfMessagesElement = document.getElementById(&apos;list_of_messages&apos;)\n  if (listOfMessagesElement) {\n     // wipe any previous content displayed under div: list_of_messages\n     listOfMessagesElement.innerHTML = &apos;&apos;\n\n     // also clear the text field where user provides any message IDs that need to be deleted\n     document.getElementById(&apos;message_IDs&apos;).value = &apos;&apos;\n  }\n}\n\nfunction getSelectedConversation() {\n  const selectedConversationOption = document.getElementById(&apos;list_of_conversations&apos;).value\n  return client.conversation.get(selectedConversationOption, {type: client.conversation.chatTypes.ONETOONE})\n}\n\nfunction deleteAConversation() {\n  const conversation = getSelectedConversation()\n  if (!conversation) {\n    log(&apos;Error: Cannot delete a conversation. First select one.&apos;)\n    return\n  }\n\n  log(&apos;Deleting conversation with: &apos; + conversation.destination[0])\n  // Make request to server to delete the conversation.\n  conversation.delete()\n}\n\n// Listen for the event that tells us messages (for a selected conversation) have changed.\nclient.on(&apos;messages:change&apos;, function(params) {\n  // If there are any errors, display them in status area\n  if(params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n\n  // Refresh the messages list using our internal array\n  refreshMessagesList()\n})\n\nfunction fetchMessages() {\n  const conversation = getSelectedConversation()\n  if (!conversation) {\n    log(&apos;Error: Cannot fetch messages. First select a conversation.&apos;)\n    return\n  }\n  log(&apos;Fetching all messages for conversation with: &apos; + conversation.destination[0])\n  conversation.fetchMessages()\n}\n\nfunction refreshMessagesList() {\n  // wipe any previous content displayed under div: list_of_messages\n  const lisOfMessagesElement = document.getElementById(&apos;list_of_messages&apos;)\n  lisOfMessagesElement.innerHTML = &apos;&apos;\n\n  const convValue = document.getElementById(&apos;list_of_conversations&apos;).value\n  let messages\n  if (convValue) {\n    const conversation = client.conversation.get(convValue, {type: client.conversation.chatTypes.ONETOONE})\n    messages = conversation.getMessages()\n  }\n\n  // Now populate the list with new content\n  if (messages && messages.length > 0) {\n    log(&apos;Got an update. There are now &apos; + messages.length + &apos; messages available.&apos;)\n    let index = 1\n    for (const message of messages){\n      lisOfMessagesElement.appendChild(document.createTextNode(index + &apos;: Msg ID: &apos;))\n      const boldText = document.createElement(\&quot;b\&quot;)\n      boldText.innerHTML = message.messageId\n      lisOfMessagesElement.appendChild(boldText)\n      lisOfMessagesElement.appendChild(document.createTextNode(&apos; whose content is: &apos; + message.parts[0].text))\n      lisOfMessagesElement.appendChild(document.createElement(\&quot;br\&quot;))\n      index++\n    }\n  } else {\n    log(&apos;Got an update. No messages available (for currently selected conversation).&apos;)\n  }\n}\n\nfunction deleteMessages() {\n  const messageIDsTxt = document.getElementById(&apos;message_IDs&apos;).value\n  if (!messageIDsTxt) {\n      log(&apos;Error: Cannot delete message: Must provide at least one message ID.&apos;)\n      return\n  }\n  const messageIDs = messageIDsTxt.split(&apos;,&apos;)\n\n  const conversation = getSelectedConversation()\n  if (!conversation) {\n      log(&apos;Error: Cannot delete message. First select a conversation&apos;)\n      return\n  }\n  log(&apos;Deleting &apos; + messageIDs.length + &apos; messages for conversation with: &apos; + conversation.destination[0] + &apos;. IDs to delete are: &apos; + messageIDsTxt)\n\n    // Make request to server..\n  conversation.deleteMessages(messageIDs)\n\n  // also clear the text field (containing the message IDs) because we sent the request\n  // so no need to display stale information ..\n  document.getElementById(&apos;message_IDs&apos;).value = &apos;&apos;\n}\n\n&quot;,&quot;html&quot;:&quot;<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n  User Email: <input type=&apos;text&apos; id=&apos;userEmail&apos;/>\n  Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n  <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Current Conversations</legend>\n\n  <br/>\n  Step 1: Get all existing conversations related to our user:\n  <br/><br/>\n  <input type=&apos;button&apos; value=&apos;Fetch Conversations&apos; onclick=&apos;fetchConversations();&apos; />\n  <br/><br/>\n  <div id=\&quot;list_of_conversations_container\&quot;> </div>\n\n</fieldset>\n\n<fieldset>\n  <legend>Deleting Conversations</legend>\n\n  <br/>\n  Step 2: Click this button to delete a selected conversation:\n  <br/><br/>\n  <input type=&apos;button&apos; value=&apos;Delete a conversation&apos; onclick=&apos;deleteAConversation();&apos; />\n  <br/>\n</fieldset>\n\n<fieldset>\n  <legend>Fetching Messages</legend>\n\n  <br/>\n  Step 3: Get all messages for a selected conversation.\n  <br/><br/>\n\n  <input type=&apos;button&apos; value=&apos;Fetch message(s)&apos; onclick=&apos;fetchMessages()&apos; />\n  <br/> <br/>\n  <div id=\&quot;list_of_messages\&quot; class=&apos;list-content&apos;> </div>\n</fieldset>\n\n<fieldset>\n  <legend>Deleting Messages</legend>\n\n  <br/>\n  Step 4: Enter the message IDs you want to delete (comma separated):\n  <br/><br/>\n\n  <input type=&apos;text&apos; id=&apos;message_IDs&apos; />\n  <input type=&apos;button&apos; value=&apos;Delete message(s)&apos; id=&apos;delete_messages_button&apos;  onclick=&apos;deleteMessages();&apos; />\n  <br/>\n</fieldset>\n\n<div id=\&quot;status_messages\&quot;> </div>\n\n&quot;,&quot;css&quot;:&quot;.list-content {\n  background-color: lightgrey;\n  overflow-y: auto;\n  overflow-x: auto;\n  max-height: 100px;\n  max-width: 800px;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Chat History Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@173/dist/kandy.js;https://unpkg.com/he@1.2.0/he.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

*Note: You’ll be sent to an external website.*

