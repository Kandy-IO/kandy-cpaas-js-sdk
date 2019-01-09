---
layout: page
categories: quickstarts-javascript
title: Presence
permalink: /quickstarts/javascript/cpaas2/Presence
position: 7
---

# Presence

In this quickstart, we will cover how to subscribe and retrieve users' Presence using the Javascript SDK. The presence service sends and receives information that represents whether someone is available to communicate over a network. We will provide snippets of code below, which together will form a working demo application that you can modify and experiment with.

## Configs

The presence feature doesn't have any required configuration. Simply creating an instance of the SDK and authenticating is sufficient to get started.

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

To learn more about configuration, refer to the [Configurations Quickstart](index.html#Configurations).

Once we have authenticated, we need to subscribe for presence on the services we care about. In this case, we are subscribing to the `presence` service on the `websocket` Channel.

```javascript
function subscribeService() {
  const services = ['presence']
  const subscriptionType = 'websocket'
  client.services.subscribe(services, subscriptionType)
  log('Subscribed to presence service (websocket channel)')
}
```

To learn more about authentication, services and channels, refer to the [Authentication Quickstart](index.html#Authentication)

#### HTML

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is relatively straight forward. There are number of text inputs and dropdown controls associated with a number of buttons which call javascript functions.

First we have some fields for the user to input their credentials to login and subscribe to the `presence` service on the `websocket` channel.

```html
<fieldset>
  <legend>Authenticate using your account information</legend>
  Client ID: <input type='text' id='clientId'/>
  Email: <input type='text' id='email'/>
  Password: <input type='password' id='password'/>
  <input type='button' value='Login' onclick='login();' />
  <input type='button' value='Subscribe to service' onclick='subscribeService();' />
  <input type='button' value='Populate dropdowns' onclick='populateDropdowns();' />
</fieldset>
```

Next, we have a number fieldsets that contains all the actions we will perform for presence. We have several buttons and input fields to manage this. There are buttons to update your presence, buttons to subscribe to other users' presence, and buttons to retrieve users' presence.

```html
<fieldset>
  <legend>Update your presence on Websocket Channel</legend>
  Status: <select class='content' id='statusesDropdown'></select>
  Activity: <select class='content' id='activitiesDropdown'></select>
  Note: <input type='text' id='note'/>
  <input type='button' value='update' onclick='updatePresence()' />
</fieldset>

<fieldset>
  <legend>Subscribe (watch) user</legend>
  UserId(s): <input type='text' id='userIdSubscribe'/>
  <input type='button' value='subscribe' onclick='subscribe()' />
  <input type='button' value='unsubscribe' onclick='unsubscribe()' />
</fieldset>

<fieldset>
  <legend>Fetch and Get presence</legend>
  UserId(s): <input type='text' id='userIdFetch'/>
  <input type='button' value='fetch' onclick='fetchPresence()' />
  <input type='button' value='get' onclick='getPresence()' />
  <input type='button' value='clear activities' onclick='clearActivities()' />
</fieldset>
```

```hidden javascript
// Utility function for appending activity messages to the activity div.
function log(message) {
  // Wrap message in textNode to guarantee that it is a string
  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html
  const textNode = document.createTextNode(message)
  const divContainer = document.createElement('div')
  divContainer.appendChild(textNode)
  document.getElementById('presence-activity').appendChild(divContainer)
}

// Utility function for clearing the activity messages
function clearActivities() {
  document.getElementById('presence-activity').innerHTML = ''
}
```

Below that is a fieldset to hold the presence activity messages.

```html
<fieldset>
  <legend>Presence activity</legend>
  <div id='presence-activity'></div>
</fieldset>
```

## Step 1: Updating your presence

There are several steps required to see the presence service in action. Firstly, you need to update (or publish) your own presence to the server in order for other user's to see your availability. Secondly, you need to subscribe (or watch) a particular user (or list of users) in order to see their availability. From this point you can fetch their presence to see their availability or use events to automatically see their availability whenever it changes. More on that later. For now, lets look at publishing your own presence using `update`.

Before we can update our presence, we need to know what the valid statuses and activities are. Rather than hard code these values, it is best to retrieve them from the javascript SDK to populate the HTML controls. The following helper function can be used to perform this function.

```javascript
// Helper functions to update the status and activities dropdown controls
function populateDropdownControls(target, values) {
  const selectCtrl = document.getElementById(target)
  selectCtrl.innerHTML = ''
  for (let value in values) {
    for (let opt of selectCtrl.options) {
      if (opt.value === values[value]) {
        selectCtrl.removeChild(opt)
      }
    }
    var opt = document.createElement('option')
    opt.value = opt.text = values[value]
    selectCtrl.appendChild(opt)
  }
}

function populateDropdowns() {
  populateDropdownControls('activitiesDropdown', client.presence.activities)
  populateDropdownControls('statusesDropdown', client.presence.statuses)
}
```

There are several functions available for presence. The `update()` function updates your status and availability and makes it available to other users to subscribe to. The following code gets your 'status', 'availability' and 'note' from the dropdown controls and calls `update()` with your presence. Note that the information in the 'Note' input box is only valid when the 'Activity' is set to 'ActivitiesOther'. Otherwise, it is ignored.

``` javascript
/*
 *  Update user's Presence.
 */
function updatePresence() {
  const status = document.getElementById('statusesDropdown').value
  const activity = document.getElementById('activitiesDropdown').value
  const note = document.getElementById('note').value
  // Pass in your current availability.
  const myStatus = client.presence.update(status, activity, note)
  log('Presence updated with: ' + status + ', ' + activity + ', ' + note)
}

```
## Step 2: Subscribing to other user's presence

Once your presence has been updated and is available for other users to subscribe to, you will want to subscribe to other users in order to see their presence. The `subscribe()` function is used for this. You can pass in a single user, or an array of valid usersIds. In this example, the values from the UserIds text box is used. For this exercise, subscribe to yourself using your userId. Although, this is not practical in a real world situation, it is still perfectly valid and will allow you to test the remaining presence features. For a more realistic scenario, use two browser instances and login as different users.

``` javascript
/*
 *  Subscribe to the presence of the given user(s).
 */
function subscribe() {
  const userIds = document.getElementById('userIdSubscribe').value
  client.presence.subscribe(userIds)
  log('Subscribing to: ' + userIds)
}
```

Unsubscribing is similar to subscribing and is performed with the following code. Unsubscribing from a user means that you will no longer receive their presence updates.

``` javascript
/*
 *  Unsubscribe from the presence of the given user(s).
 */
function unsubscribe() {
  const userIds = document.getElementById('userIdSubscribe').value
  client.presence.unsubscribe(userIds)
  log('Unsubscribing from: ' + userIds)
}
 ```

## Step 3: Presence Events

Once subscribed to a user or a number of users, an event is fired when a users presence is updated.

### `presence:change`

The `presence:change` event is fired whenever a user's presence is updated providing you are subscribed to that user. All subscribers to this user's presence will receive the presence for that user. The javascript SDK's state is automatically updated with this information. You can read more about this event [here](../docs#presence).

```javascript
/*
* Listen for change of subscribed users' presence
*/
client.on('presence:change', function(presence) {
  // When an event is received, output the users presence.
  log('Presence received for ' +  presence.userId)
  log('....Status: ' + presence.status)
  log('....Activity: ' + presence.activity)
  if (presence.note) {
    log('....Note: ' + presence.note)
  }
})
```

## Step 4: Fetching and getting presence

Using the `presence:change` event is the best way to monitor other users' presence. If however, you want to specifically get a user's presence, you can do so with the `fetch` function. The following javascript will accept a userId (or an array of userIds) and return those users' presence. Note that the function itself does not return the users' presence, it simply updates the Javascript SDK's state. To get the presence values from the Javascript SDK's state, use the `get` function. See next.

 ``` javascript
/*
 * Fetch (from the server) the presence for the given users. This will update the store with the
 * retrieved values.
 */
function fetchPresence() {
  const userIds = document.getElementById('userIdFetch').value
  client.presence.fetch(userIds)
  log('Fetching presence for: ' + userIds)
}
```

Once the users' presence has been fetched, you may use the `get` function to return the presence from the javascript SDK's state. The function returns an array of user's presence.

``` javascript
/*
* Get (from state) the presence for the given user(s)
*/
function getPresence() {
  const userIds = document.getElementById('userIdFetch').value
  const presence = client.presence.get(userIds)

  for (let i=0; i < presence.length; i++ ) {
    log('Presence for ' +  presence[i].userId)
    log('....Status: ' + presence[i].status)
    log('....Activity: ' + presence[i].activity)
    if (presence[i].note) {
      log('....Note: ' + presence[i].note)
    }
  }
}
```

### Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

```codepen
{
	"title": "Javascript SDK Presence Demo",
	"editors": "101",
	"js_external": "https://localhost:3000/kandy/kandy.cpaas2.js"
}
```
