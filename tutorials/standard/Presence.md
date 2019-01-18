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

```javascript 
const client = Kandy.create({
  // ... Only other configuration necessary
})
```

To learn more about configuration, refer to the [Configurations Quickstart](Configurations).

Once we have authenticated, we need to subscribe for presence on the services we care about. In this case, we are subscribing to the `presence` service on the `websocket` Channel.

```javascript
function subscribeService() {
  const services = ['presence']
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

The `presence:change` event is fired whenever a user's presence is updated providing you are subscribed to that user. All subscribers to this user's presence will receive the presence for that user. The javascript SDK's state is automatically updated with this information. You can read more about this event [here](../../references/cpaas2#presence).

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



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Presence Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody(paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n  return { accessToken: data.access_token, idToken: data.id_token }\n}\nasync function login() {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;email&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n  try {\n    const tokens = await getTokens({ clientId, username: userEmail, password })\n    client.setTokens(tokens)\n    log(&apos;Successfully logged in as &apos; + userEmail)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\nfunction subscribeService() {\n  const services = [&apos;presence&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType) \n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function() {\n\n  if(\n    client.services.getSubscriptions().isPending === false && \n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    log(&apos;Successfully subscribed&apos;)\n    }\n})\n\n// Utility function for appending activity messages to the activity div.\nfunction log(message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;presence-activity&apos;).appendChild(divContainer)\n}\n\n// Utility function for clearing the activity messages\nfunction clearActivities() {\n  document.getElementById(&apos;presence-activity&apos;).innerHTML = &apos;&apos;\n}\n\n// Helper functions to update the status and activities dropdown controls\nfunction populateDropdownControls(target, values) {\n  const selectCtrl = document.getElementById(target)\n  selectCtrl.innerHTML = &apos;&apos;\n  for (let value in values) {\n    for (let opt of selectCtrl.options) {\n      if (opt.value === values[value]) {\n        selectCtrl.removeChild(opt)\n      }\n    }\n    var opt = document.createElement(&apos;option&apos;)\n    opt.value = opt.text = values[value]\n    selectCtrl.appendChild(opt)\n  }\n}\n\nfunction populateDropdowns() {\n  populateDropdownControls(&apos;activitiesDropdown&apos;, client.presence.activities)\n  populateDropdownControls(&apos;statusesDropdown&apos;, client.presence.statuses)\n}\n\n/*\n *  Update user&apos;s Presence.\n */\nfunction updatePresence() {\n  const status = document.getElementById(&apos;statusesDropdown&apos;).value\n  const activity = document.getElementById(&apos;activitiesDropdown&apos;).value\n  const note = document.getElementById(&apos;note&apos;).value\n  // Pass in your current availability.\n  const myStatus = client.presence.update(status, activity, note)\n  log(&apos;Presence updated with: &apos; + status + &apos;, &apos; + activity + &apos;, &apos; + note)\n}\n\n\n/*\n *  Subscribe to the presence of the given user(s).\n */\nfunction subscribe() {\n  const userIds = document.getElementById(&apos;userIdSubscribe&apos;).value\n  client.presence.subscribe(userIds)\n  log(&apos;Subscribing to: &apos; + userIds)\n}\n\n/*\n *  Unsubscribe from the presence of the given user(s).\n */\nfunction unsubscribe() {\n  const userIds = document.getElementById(&apos;userIdSubscribe&apos;).value\n  client.presence.unsubscribe(userIds)\n  log(&apos;Unsubscribing from: &apos; + userIds)\n}\n\n/*\n* Listen for change of subscribed users&apos; presence\n*/\nclient.on(&apos;presence:change&apos;, function(presence) {\n  // When an event is received, output the users presence.\n  log(&apos;Presence received for &apos; +  presence.userId)\n  log(&apos;....Status: &apos; + presence.status)\n  log(&apos;....Activity: &apos; + presence.activity)\n  if (presence.note) {\n    log(&apos;....Note: &apos; + presence.note)\n  }\n})\n\n/*\n* Get (from state) the presence for the given user(s)\n*/\nfunction getPresence() {\n  const userIds = document.getElementById(&apos;userIdFetch&apos;).value\n  const presence = client.presence.get(userIds)\n\n  for (let i=0; i < presence.length; i++ ) {\n    log(&apos;Presence for &apos; +  presence[i].userId)\n    log(&apos;....Status: &apos; + presence[i].status)\n    log(&apos;....Activity: &apos; + presence[i].activity)\n    if (presence[i].note) {\n      log(&apos;....Note: &apos; + presence[i].note)\n    }\n  }\n}\n\n&quot;,&quot;html&quot;:&quot;<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=&apos;text&apos; id=&apos;clientId&apos;/>\n  Email: <input type=&apos;text&apos; id=&apos;email&apos;/>\n  Password: <input type=&apos;password&apos; id=&apos;password&apos;/>\n  <input type=&apos;button&apos; value=&apos;Login&apos; onclick=&apos;login();&apos; />\n  <input type=&apos;button&apos; value=&apos;Subscribe to service&apos; onclick=&apos;subscribeService();&apos; />\n  <input type=&apos;button&apos; value=&apos;Populate dropdowns&apos; onclick=&apos;populateDropdowns();&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Update your presence on Websocket Channel</legend>\n  Status: <select class=&apos;content&apos; id=&apos;statusesDropdown&apos;></select>\n  Activity: <select class=&apos;content&apos; id=&apos;activitiesDropdown&apos;></select>\n  Note: <input type=&apos;text&apos; id=&apos;note&apos;/>\n  <input type=&apos;button&apos; value=&apos;update&apos; onclick=&apos;updatePresence()&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Subscribe (watch) user</legend>\n  UserId(s): <input type=&apos;text&apos; id=&apos;userIdSubscribe&apos;/>\n  <input type=&apos;button&apos; value=&apos;subscribe&apos; onclick=&apos;subscribe()&apos; />\n  <input type=&apos;button&apos; value=&apos;unsubscribe&apos; onclick=&apos;unsubscribe()&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Fetch and Get presence</legend>\n  UserId(s): <input type=&apos;text&apos; id=&apos;userIdFetch&apos;/>\n  <input type=&apos;button&apos; value=&apos;fetch&apos; onclick=&apos;fetchPresence()&apos; />\n  <input type=&apos;button&apos; value=&apos;get&apos; onclick=&apos;getPresence()&apos; />\n  <input type=&apos;button&apos; value=&apos;clear activities&apos; onclick=&apos;clearActivities()&apos; />\n</fieldset>\n\n<fieldset>\n  <legend>Presence activity</legend>\n  <div id=&apos;presence-activity&apos;></div>\n</fieldset>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Presence Demo&quot;,&quot;editors&quot;:&quot;101&quot;,&quot;js_external&quot;:&quot;https://kandy-portal.s3.amazonaws.com/public/javascript/cpaas2/kandy.cpaas2.js&quot;} '><input type="image" src="../../../assets/resources/TryItOn-CodePen.png"></form>