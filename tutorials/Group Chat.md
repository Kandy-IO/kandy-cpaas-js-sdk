---
layout: page
categories: quickstarts-javascript
title: Group Messaging
permalink: /quickstarts/javascript/cpaas/Group%20Messaging
position: 8
categories:
  - group
---

# Group Chat

Group Chat is similar to [one-to-one Chat](chat), meaning:

- It does not need special configuration. To learn more about configuration, refer to the [Configurations Quickstart](configurations).
- Subscribing for event notifications, sending a message and handling event notifications are accomplished in the same manner.

What is different from one-to-one Chat is the concept of a group of users and the management aspect of such group.

Simply creating an instance of the SDK, authenticating with credentials, subscribing to the service of interest and creating a group instance is sufficient to get started.

## Subscribing for the Group Chat services

Once we have authenticated, we need to subscribe for notifications on the services we care about.

Note that if you want to use another user to authenticate (after you already authenticated & subscribed with a previous user), you need to reload this tutorial page as this particular tutorial example does not provide an unsubscribe button.

Just like in one-to-one Chat, any given group user wanting to be notified of any chat message within that group, needs to subscribe to 'chat' Service on the `websocket` Channel.

Therefore see [Chat tutorial section](chat) on how to subscribe. We'll just reuse the same code in this CodePen example.

#### HTML

Since we're going to be making a working demo, we also need some HTML. The HTML for this demo is quite simple as we'll only demonstrate the
management part of a chat group (i.e. creating a group instance, adding users to an existing group or deleting users from existing group).
Once you have a group of users, you'll need to use that generated group ID as a way to send messages to that group - see [Chat tutorial section](chat) on how to send messages to a group ID.

First we have some fields for the user to input their credentials.
Provide credentials for a users in a group that you want to create (will want to create multiple browser tabs at this point)
and login with all users.
Also ensure all users (that you want to be part of a group) subscribe to the 'chat' notifications.

Once authenticated, any user will be able to create a group and thus this user will become the administrator of the group.
When admin user creates a group, the rest of participants in that group will get an invitation to join the group as soon as the group is created.
This invitation is sent to a participant because that participant subscribed to 'chat' notifications.

Note that a group administrator cannot leave the group, the only way for admin user to leave the group is to delete such group instance.

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

Next, we have field sets that contains all the management actions we will perform on a group.

We have a button and three input fields to first create a group (with initial participants):

```html
<fieldset>
  <legend>Groups</legend>

  Step 1: Enter the name & participants (and optionally the subject) of the group:
  <br /><br />
  <div>Group name:</div>
  <input type="text" id="group-name" />
  <br /><br />
  <div>Group participants, as comma separated userIDs (Optional):</div>
  <input type="text" id="group-participants" />
  <br /><br />
  <div>Subject for this group (Optional):</div>
  <input type="text" id="group-subject" />
  <br /><br />

  Step 2: Create Group!
  <br />
  (Note that once this group is created, group participants will get an invitation to join the group and in this example
  they will all automatically accept the invitation, for simplicity)
  <br />
  <input type="button" value="Create" onclick="createGroup();" />
  <br />
  <hr />
</fieldset>
```

Allow a participant to leave the group if they wish so.
This is allowed for any participant except the administrator of the group.
So for admin user, the child content of this div element is hidden.

```html
<div id="leave_group_container"></div>
```

Allow the admin to delete the group if they wish so.
So for non-admin user, the child content of this div element is hidden.

```html
<div id="delete_group_container"></div>
```

Once group was created, we have a button and one input field to add a subsequent user to the group.
So for non-admin user, the child content of this div element is hidden.

```html
<div id="add_participant_container"></div>
```

We also have a button and one input field to remove an existing user from the group.
For non-admin user, the child content of this div element is hidden.

```html
<div id="remove_participant_container"></div>
```

Also a list of current participants in current group.

```html
<br />
<fieldset>
  <legend>List of outstanding participants on current group</legend>
  <div id="current_participants"></div>

  Click 'Refresh list' button to get the list of outstanding participants
  <input type="button" value="Refresh list" onclick="fetchAllGroups();" />
  <br />
  <hr />
</fieldset>
<br />
```

Finally, we have a div to display general messages (such as any errors that may occur).

```html
<div id="messages"></div>
```

## Creating a Group instance

When creating a Group, you have to specify the name of the group, as am mandatory parameter.
The name of the group is an optional parameter and so is the list of participants.
Once you specify the necessary parameters, you can create a Group, like so:

```javascript
/*
 *  Basic Group Chat functionality.
 */

// We will only track one group in this demo (even though multiple ones will
// be created on server side if you hit Create button with different names).
var group_ID

// From the start, nobody is administrator until someone first creates a group.
var adminUser = false

var adminActionsAdded = false

// Create a new group.
function createGroup () {
  const groupNameTxt = document.getElementById('group-name').value
  const subjectTxt = document.getElementById('group-subject').value
  const participantsTxt = document.getElementById('group-participants').value

  // subject text is optional
  let params = subjectTxt
    ? { subject: subjectTxt, name: groupNameTxt, type: 'closed' }
    : { name: groupNameTxt, type: 'closed' }

  // participants (other then admin user) are also optional
  if (participantsTxt) {
    let listOfParticipants = participantsTxt.split(',')
    let participants = []
    listOfParticipants.forEach(function (item) {
      participants.push({ address: item })
    })
    params['participants'] = participants
  }

  // Pass in the above parameters. This is an asynchronous request
  // (i.e. result will be obtained through a callback listening for the 'group:new' event)
  client.groups.create(params)

  // Who ever hit the Create button becomes administrator user of the group, automatically.
  adminUser = true
}

// Listen for changes in group-related activities (e.g. group has been created).
client.on('group:new', function (params) {
  const groupNameTxt = document.getElementById('group-name').value

  if (params.error) {
    log(
      'Failed to create the group with name: ' +
        groupNameTxt +
        '. Code is: ' +
        params.error.error.code +
        '. Error is: ' +
        params.error.error.message
    )
  } else {
    log('Successfully created the group with name: ' + groupNameTxt + '. Its generated ID is: ' + params.id)
  }

  // Save the group ID to be used later, by the administrator
  group_ID = params.id

  // Add the admin actions but only ONCE no matter how many groups this  user creates.
  if (adminUser && group_ID && !adminActionsAdded) {
    allowAddingAParticipant()

    allowRemovingAParticipant()

    // We got a valid group ID and this user is the administrator, so allow the user to delete group later on..
    allowUserToDeleteGroup()

    adminActionsAdded = true
  }
})

// Listen for an incoming invitation for a particular group ID
client.on('group:invitation_received', function (params) {
  log(
    'Automatically accepting invitation to joining group whose Id is: ' +
      params.invitation.groupId +
      ' whose name is: ' +
      params.invitation.name
  )
  // For the purpose of making this example more simple, we'l just
  // automatically send an accept answer to any of the invitations.
  client.groups.acceptInvitation(params.invitation.groupId)

  // Save group ID for later, in case this non-admin user decides to leave the group.
  group_ID = params.invitation.groupId

  if (!adminUser && group_ID) {
    // It means this is the context in which a non-admin user is running.
    // So display the 'leave button'.
    // The 'Leave group' button should be hidden for the admin user, because
    // admin user cannot just leave a group (without deleting it).
    allowUserToLeaveGroup()
  }
})

function refreshParticipantsList (groupId) {
  // Get the array of outstanding participants for our current group only
  // (by querying locally - i.e. the redux store) & create a div container
  // to hold that content.
  const participants = client.groups.getParticipants(groupId)

  const divContainer = document.createElement('div')
  if (!participants) {
    // it means this is the user who triggered the action to leave the current group.
    // So this user cannot see what are the remaining participants in the group, anymore.
    // However, other participants will see that user having status as: Disconnected
    divContainer.appendChild(
      document.createTextNode(
        '*** This participant has left the current group. Content of current group is no longer available for this user ***'
      )
    )
    divContainer.appendChild(document.createElement('br'))
  } else if (participants.length > 0) {
    // In the list we're now creating, status can be: Invited, Connect, Disconnected.
    participants.forEach(function (participant) {
      divContainer.appendChild(document.createTextNode(participant.address + ' (status: ' + participant.status + ')'))
      divContainer.appendChild(document.createElement('br'))
    })
  }
  // Refresh content by replacing whatever list of participants was displayed before...
  let currentParticipants = document.getElementById('current_participants')
  if (currentParticipants != null && currentParticipants.length > 0 && currentParticipants.childNodes[0] != null) {
    currentParticipants.removeChild(currentParticipants.childNodes[0])
  }
  currentParticipants.appendChild(divContainer)
}

// Listen to changes in the group. This callback is triggered as a result of
// any of these actions:
// 1- a participant was added by admin
// 2- a participant was removed by admin
// 3- a participant chose to leave the group.
client.on('group:change', function (params) {
  if (!params.id) {
    log('WARNING: No groupId for group:change event. Ignoring this notification...')
    return
  }
  log('Received a group:change event for groupId: ' + params.id)
  refreshParticipantsList(params.id)
})

client.on('group:error', function (params) {
  if (!params.error) {
    return
  }
  log('Encountered a group related error: ' + params.error.toString())
})

// Remove a participant from the existing group
function removeParticipant () {
  const participantTxt = document.getElementById('convo-participant-to-remove').value
  if (!group_ID) {
    log('Could not remove existing participant. Create the group first.')
    return
  }
  if (!participantTxt) {
    log('Could not remove existing participant. Specify the participant ID.')
    return
  }
  client.groups.removeParticipant(group_ID, participantTxt)
}

// Fetch the current set of groups (in order to get access to the list of participants associated with our current group_ID).
function fetchAllGroups () {
  if (!group_ID) {
    log('Could not fetch any participants. No current group ID set.')
    return
  }

  // Fetch latest groups & then will
  // get the participant list for the current group id.
  // This is an async request which will trigger a 'group:refresh' event, see below.
  client.groups.fetch()
}

client.on('group:refresh', function (params) {
  // Note: it is expected that 'params' is an empty object.
  if (!group_ID) {
    log('Could not refresh the participants list. No current group ID set.')
    return
  }
  log(
    'Received a group:refresh event. Refreshing the list of outstanding participants associated with current group id:' +
      group_ID
  )

  refreshParticipantsList(group_ID)
})

function allowUserToLeaveGroup () {
  let leaveButton = document.createElement('button')
  leaveButton.innerHTML = 'Leave the group'
  let br1 = document.createElement('br')
  document.getElementById('leave_group_container').appendChild(br1)
  document.getElementById('leave_group_container').appendChild(leaveButton)
  let br2 = document.createElement('br')
  document.getElementById('leave_group_container').appendChild(br2)
  leaveButton.addEventListener('click', function () {
    client.groups.leave(group_ID)
  })
}

function allowUserToDeleteGroup () {
  let leaveButton = document.createElement('button')
  leaveButton.innerHTML = 'Delete the group'
  let br1 = document.createElement('br')
  document.getElementById('delete_group_container').appendChild(br1)
  document.getElementById('delete_group_container').appendChild(leaveButton)
  let br2 = document.createElement('br')
  document.getElementById('delete_group_container').appendChild(br2)
  leaveButton.addEventListener('click', function () {
    client.groups.delete(group_ID)
  })
}

function allowAddingAParticipant () {
  let br2 = document.createElement('br')
  let fieldSet = document.createElement('fieldset')
  let legend = document.createElement('legend')
  legend.innerHTML = 'Add a user to group'
  fieldSet.appendChild(legend)
  fieldSet.appendChild(br2)

  let instruction = document.createTextNode(
    'Enter the ID of any additional participant user into the group (e.g. johndoe@somedomain.com): '
  )
  fieldSet.appendChild(instruction)

  let inputField = document.createElement('INPUT')
  inputField.setAttribute('type', 'text')
  inputField.setAttribute('id', 'convo-participant-to-add')
  fieldSet.appendChild(inputField)

  let br3 = document.createElement('br')
  fieldSet.appendChild(br3)

  let addButton = document.createElement('button')
  addButton.innerHTML = 'Add'
  fieldSet.appendChild(addButton)
  addButton.addEventListener('click', function () {
    // Add a participant to the existing group
    const participantTxt = document.getElementById('convo-participant-to-add').value
    log('Adding participant: ' + participantTxt)
    if (!group_ID) {
      log('Could not add an additional participant. Create the group first.')
      return
    }
    if (!participantTxt) {
      log('Could not add an additional participant. Specify the participant ID.')
      return
    }
    client.groups.addParticipant(group_ID, participantTxt)
  })

  let br1 = document.createElement('br')
  document.getElementById('add_participant_container').appendChild(br1)

  document.getElementById('add_participant_container').appendChild(fieldSet)
}

function allowRemovingAParticipant () {
  let br2 = document.createElement('br')
  let fieldSet = document.createElement('fieldset')
  let legend = document.createElement('legend')
  legend.innerHTML = 'Remove a user from group'
  fieldSet.appendChild(legend)
  fieldSet.appendChild(br2)

  let instruction = document.createTextNode(
    'Enter the ID of a participant user you want to remove from group (e.g. johndoe@somedomain.com): '
  )
  fieldSet.appendChild(instruction)

  let inputField = document.createElement('INPUT')
  inputField.setAttribute('type', 'text')
  inputField.setAttribute('id', 'convo-participant-to-remove')
  fieldSet.appendChild(inputField)

  let br3 = document.createElement('br')
  fieldSet.appendChild(br3)

  let addButton = document.createElement('button')
  addButton.innerHTML = 'Remove'
  fieldSet.appendChild(addButton)
  addButton.addEventListener('click', function () {
    // Add a participant to the existing group
    const participantTxt = document.getElementById('convo-participant-to-remove').value
    log('Removing participant: ' + participantTxt)
    if (!group_ID) {
      log('Could not remove an existing participant. Create the group first.')
      return
    }
    if (!participantTxt) {
      log('Could not remove an existing participant. Specify the participant ID.')
      return
    }
    client.groups.removeParticipant(group_ID, participantTxt)
  })

  let br1 = document.createElement('br')
  document.getElementById('remove_participant_container').appendChild(br1)

  document.getElementById('remove_participant_container').appendChild(fieldSet)
}
```

Once a group has been created sending a message to a group of users is done in the same way as any regular chat message: just provide the ID of that group when creating the conversation.

Also, messaging events (such as 'messages:change' and 'conversations:change') are delivered in the same way as in [Chat tutorial section](chat).
The function handling the 'messages:change' just needs to filter by message type: 'chat-group' in order to detect a group message.

### Instructions For Demo

- Open as many browser instances of Google Chrome®, or [another supported browser](get-started), as the number of users in a group you want to have, by clicking **Try it** that many times.
- Enter your Client ID for your account or project in those browser instances.
- Enter the email address of each of user you want to use in the group. Each user should be associated with your account.
- Enter the password for each of those users.
- Click **Login** to get your time-limited access token in all those browser instances.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive notifications from the server for all users.
- Decide which user will be the one creating the group instance. This user will become the administrator of the Group.
- In the browser instance for the admin user, enter the group name and subject and any User IDs of initial participants in that group. Enter those User IDs by comma separating them, in this format: [userId_1]@[domain],[userId_2]@[domain]. Then click **Create** to create the new group instance.
- Once a group is created, ensure the rest of participant users got the group invitation event and they all automatically accepted that invitation.
  This can be verified by looking at the Messages area generated at the bottom of those browser instances.
  Also write down the generated Group ID (displayed in the Messages area) and use it in creating a Conversation instance in CodePen's demo associated with the [Chat tutorial section](chat).
- After a Conversation instance has been created in that tutorial, the sending of any messages (from one user to the rest of participants in that group) will then be accomplished just like the one-to-one example. In that tutorial you may need to open browser instances for admin user and rest of user participants (in that group) so that you can test sending/receiving of messages from any of those participants.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Basic Chat Demo\n */\n\nconst client = Kandy.create({\n  subscription: {\n    expires: 3600\n  },\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return { accessToken: data.access_token, idToken: data.id_token, expiresIn: data.expires_in }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({ clientId, username: userEmail, password })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\nfunction subscribe () {\n  const services = [&apos;chat&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/*\n *  Basic Group Chat functionality.\n */\n\n// We will only track one group in this demo (even though multiple ones will\n// be created on server side if you hit Create button with different names).\nvar group_ID\n\n// From the start, nobody is administrator until someone first creates a group.\nvar adminUser = false\n\nvar adminActionsAdded = false\n\n// Create a new group.\nfunction createGroup () {\n  const groupNameTxt = document.getElementById(&apos;group-name&apos;).value\n  const subjectTxt = document.getElementById(&apos;group-subject&apos;).value\n  const participantsTxt = document.getElementById(&apos;group-participants&apos;).value\n\n  // subject text is optional\n  let params = subjectTxt\n    ? { subject: subjectTxt, name: groupNameTxt, type: &apos;closed&apos; }\n    : { name: groupNameTxt, type: &apos;closed&apos; }\n\n  // participants (other then admin user) are also optional\n  if (participantsTxt) {\n    let listOfParticipants = participantsTxt.split(&apos;,&apos;)\n    let participants = []\n    listOfParticipants.forEach(function (item) {\n      participants.push({ address: item })\n    })\n    params[&apos;participants&apos;] = participants\n  }\n\n  // Pass in the above parameters. This is an asynchronous request\n  // (i.e. result will be obtained through a callback listening for the &apos;group:new&apos; event)\n  client.groups.create(params)\n\n  // Who ever hit the Create button becomes administrator user of the group, automatically.\n  adminUser = true\n}\n\n// Listen for changes in group-related activities (e.g. group has been created).\nclient.on(&apos;group:new&apos;, function (params) {\n  const groupNameTxt = document.getElementById(&apos;group-name&apos;).value\n\n  if (params.error) {\n    log(\n      &apos;Failed to create the group with name: &apos; +\n        groupNameTxt +\n        &apos;. Code is: &apos; +\n        params.error.error.code +\n        &apos;. Error is: &apos; +\n        params.error.error.message\n    )\n  } else {\n    log(&apos;Successfully created the group with name: &apos; + groupNameTxt + &apos;. Its generated ID is: &apos; + params.id)\n  }\n\n  // Save the group ID to be used later, by the administrator\n  group_ID = params.id\n\n  // Add the admin actions but only ONCE no matter how many groups this  user creates.\n  if (adminUser && group_ID && !adminActionsAdded) {\n    allowAddingAParticipant()\n\n    allowRemovingAParticipant()\n\n    // We got a valid group ID and this user is the administrator, so allow the user to delete group later on..\n    allowUserToDeleteGroup()\n\n    adminActionsAdded = true\n  }\n})\n\n// Listen for an incoming invitation for a particular group ID\nclient.on(&apos;group:invitation_received&apos;, function (params) {\n  log(\n    &apos;Automatically accepting invitation to joining group whose Id is: &apos; +\n      params.invitation.groupId +\n      &apos; whose name is: &apos; +\n      params.invitation.name\n  )\n  // For the purpose of making this example more simple, we&apos;l just\n  // automatically send an accept answer to any of the invitations.\n  client.groups.acceptInvitation(params.invitation.groupId)\n\n  // Save group ID for later, in case this non-admin user decides to leave the group.\n  group_ID = params.invitation.groupId\n\n  if (!adminUser && group_ID) {\n    // It means this is the context in which a non-admin user is running.\n    // So display the &apos;leave button&apos;.\n    // The &apos;Leave group&apos; button should be hidden for the admin user, because\n    // admin user cannot just leave a group (without deleting it).\n    allowUserToLeaveGroup()\n  }\n})\n\nfunction refreshParticipantsList (groupId) {\n  // Get the array of outstanding participants for our current group only\n  // (by querying locally - i.e. the redux store) & create a div container\n  // to hold that content.\n  const participants = client.groups.getParticipants(groupId)\n\n  const divContainer = document.createElement(&apos;div&apos;)\n  if (!participants) {\n    // it means this is the user who triggered the action to leave the current group.\n    // So this user cannot see what are the remaining participants in the group, anymore.\n    // However, other participants will see that user having status as: Disconnected\n    divContainer.appendChild(\n      document.createTextNode(\n        &apos;*** This participant has left the current group. Content of current group is no longer available for this user ***&apos;\n      )\n    )\n    divContainer.appendChild(document.createElement(&apos;br&apos;))\n  } else if (participants.length > 0) {\n    // In the list we&apos;re now creating, status can be: Invited, Connect, Disconnected.\n    participants.forEach(function (participant) {\n      divContainer.appendChild(document.createTextNode(participant.address + &apos; (status: &apos; + participant.status + &apos;)&apos;))\n      divContainer.appendChild(document.createElement(&apos;br&apos;))\n    })\n  }\n  // Refresh content by replacing whatever list of participants was displayed before...\n  let currentParticipants = document.getElementById(&apos;current_participants&apos;)\n  if (currentParticipants != null && currentParticipants.length > 0 && currentParticipants.childNodes[0] != null) {\n    currentParticipants.removeChild(currentParticipants.childNodes[0])\n  }\n  currentParticipants.appendChild(divContainer)\n}\n\n// Listen to changes in the group. This callback is triggered as a result of\n// any of these actions:\n// 1- a participant was added by admin\n// 2- a participant was removed by admin\n// 3- a participant chose to leave the group.\nclient.on(&apos;group:change&apos;, function (params) {\n  if (!params.id) {\n    log(&apos;WARNING: No groupId for group:change event. Ignoring this notification...&apos;)\n    return\n  }\n  log(&apos;Received a group:change event for groupId: &apos; + params.id)\n  refreshParticipantsList(params.id)\n})\n\nclient.on(&apos;group:error&apos;, function (params) {\n  if (!params.error) {\n    return\n  }\n  log(&apos;Encountered a group related error: &apos; + params.error.toString())\n})\n\n// Remove a participant from the existing group\nfunction removeParticipant () {\n  const participantTxt = document.getElementById(&apos;convo-participant-to-remove&apos;).value\n  if (!group_ID) {\n    log(&apos;Could not remove existing participant. Create the group first.&apos;)\n    return\n  }\n  if (!participantTxt) {\n    log(&apos;Could not remove existing participant. Specify the participant ID.&apos;)\n    return\n  }\n  client.groups.removeParticipant(group_ID, participantTxt)\n}\n\n// Fetch the current set of groups (in order to get access to the list of participants associated with our current group_ID).\nfunction fetchAllGroups () {\n  if (!group_ID) {\n    log(&apos;Could not fetch any participants. No current group ID set.&apos;)\n    return\n  }\n\n  // Fetch latest groups & then will\n  // get the participant list for the current group id.\n  // This is an async request which will trigger a &apos;group:refresh&apos; event, see below.\n  client.groups.fetch()\n}\n\nclient.on(&apos;group:refresh&apos;, function (params) {\n  // Note: it is expected that &apos;params&apos; is an empty object.\n  if (!group_ID) {\n    log(&apos;Could not refresh the participants list. No current group ID set.&apos;)\n    return\n  }\n  log(\n    &apos;Received a group:refresh event. Refreshing the list of outstanding participants associated with current group id:&apos; +\n      group_ID\n  )\n\n  refreshParticipantsList(group_ID)\n})\n\nfunction allowUserToLeaveGroup () {\n  let leaveButton = document.createElement(&apos;button&apos;)\n  leaveButton.innerHTML = &apos;Leave the group&apos;\n  let br1 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;leave_group_container&apos;).appendChild(br1)\n  document.getElementById(&apos;leave_group_container&apos;).appendChild(leaveButton)\n  let br2 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;leave_group_container&apos;).appendChild(br2)\n  leaveButton.addEventListener(&apos;click&apos;, function () {\n    client.groups.leave(group_ID)\n  })\n}\n\nfunction allowUserToDeleteGroup () {\n  let leaveButton = document.createElement(&apos;button&apos;)\n  leaveButton.innerHTML = &apos;Delete the group&apos;\n  let br1 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;delete_group_container&apos;).appendChild(br1)\n  document.getElementById(&apos;delete_group_container&apos;).appendChild(leaveButton)\n  let br2 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;delete_group_container&apos;).appendChild(br2)\n  leaveButton.addEventListener(&apos;click&apos;, function () {\n    client.groups.delete(group_ID)\n  })\n}\n\nfunction allowAddingAParticipant () {\n  let br2 = document.createElement(&apos;br&apos;)\n  let fieldSet = document.createElement(&apos;fieldset&apos;)\n  let legend = document.createElement(&apos;legend&apos;)\n  legend.innerHTML = &apos;Add a user to group&apos;\n  fieldSet.appendChild(legend)\n  fieldSet.appendChild(br2)\n\n  let instruction = document.createTextNode(\n    &apos;Enter the ID of any additional participant user into the group (e.g. johndoe@somedomain.com): &apos;\n  )\n  fieldSet.appendChild(instruction)\n\n  let inputField = document.createElement(&apos;INPUT&apos;)\n  inputField.setAttribute(&apos;type&apos;, &apos;text&apos;)\n  inputField.setAttribute(&apos;id&apos;, &apos;convo-participant-to-add&apos;)\n  fieldSet.appendChild(inputField)\n\n  let br3 = document.createElement(&apos;br&apos;)\n  fieldSet.appendChild(br3)\n\n  let addButton = document.createElement(&apos;button&apos;)\n  addButton.innerHTML = &apos;Add&apos;\n  fieldSet.appendChild(addButton)\n  addButton.addEventListener(&apos;click&apos;, function () {\n    // Add a participant to the existing group\n    const participantTxt = document.getElementById(&apos;convo-participant-to-add&apos;).value\n    log(&apos;Adding participant: &apos; + participantTxt)\n    if (!group_ID) {\n      log(&apos;Could not add an additional participant. Create the group first.&apos;)\n      return\n    }\n    if (!participantTxt) {\n      log(&apos;Could not add an additional participant. Specify the participant ID.&apos;)\n      return\n    }\n    client.groups.addParticipant(group_ID, participantTxt)\n  })\n\n  let br1 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;add_participant_container&apos;).appendChild(br1)\n\n  document.getElementById(&apos;add_participant_container&apos;).appendChild(fieldSet)\n}\n\nfunction allowRemovingAParticipant () {\n  let br2 = document.createElement(&apos;br&apos;)\n  let fieldSet = document.createElement(&apos;fieldset&apos;)\n  let legend = document.createElement(&apos;legend&apos;)\n  legend.innerHTML = &apos;Remove a user from group&apos;\n  fieldSet.appendChild(legend)\n  fieldSet.appendChild(br2)\n\n  let instruction = document.createTextNode(\n    &apos;Enter the ID of a participant user you want to remove from group (e.g. johndoe@somedomain.com): &apos;\n  )\n  fieldSet.appendChild(instruction)\n\n  let inputField = document.createElement(&apos;INPUT&apos;)\n  inputField.setAttribute(&apos;type&apos;, &apos;text&apos;)\n  inputField.setAttribute(&apos;id&apos;, &apos;convo-participant-to-remove&apos;)\n  fieldSet.appendChild(inputField)\n\n  let br3 = document.createElement(&apos;br&apos;)\n  fieldSet.appendChild(br3)\n\n  let addButton = document.createElement(&apos;button&apos;)\n  addButton.innerHTML = &apos;Remove&apos;\n  fieldSet.appendChild(addButton)\n  addButton.addEventListener(&apos;click&apos;, function () {\n    // Add a participant to the existing group\n    const participantTxt = document.getElementById(&apos;convo-participant-to-remove&apos;).value\n    log(&apos;Removing participant: &apos; + participantTxt)\n    if (!group_ID) {\n      log(&apos;Could not remove an existing participant. Create the group first.&apos;)\n      return\n    }\n    if (!participantTxt) {\n      log(&apos;Could not remove an existing participant. Specify the participant ID.&apos;)\n      return\n    }\n    client.groups.removeParticipant(group_ID, participantTxt)\n  })\n\n  let br1 = document.createElement(&apos;br&apos;)\n  document.getElementById(&apos;remove_participant_container&apos;).appendChild(br1)\n\n  document.getElementById(&apos;remove_participant_container&apos;).appendChild(fieldSet)\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@667/dist/kandy.js\&quot;></script>\n\n<fieldset>\n  <legend>Authenticate using your account information</legend>\n  Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n  <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n  <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n</fieldset>\n<fieldset>\n  <legend>Subscribe to Chat Service on Websocket Channel</legend>\n  <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; disabled value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n</fieldset>\n\n<fieldset>\n  <legend>Groups</legend>\n\n  Step 1: Enter the name & participants (and optionally the subject) of the group:\n  <br /><br />\n  <div>Group name:</div>\n  <input type=\&quot;text\&quot; id=\&quot;group-name\&quot; />\n  <br /><br />\n  <div>Group participants, as comma separated userIDs (Optional):</div>\n  <input type=\&quot;text\&quot; id=\&quot;group-participants\&quot; />\n  <br /><br />\n  <div>Subject for this group (Optional):</div>\n  <input type=\&quot;text\&quot; id=\&quot;group-subject\&quot; />\n  <br /><br />\n\n  Step 2: Create Group!\n  <br />\n  (Note that once this group is created, group participants will get an invitation to join the group and in this example\n  they will all automatically accept the invitation, for simplicity)\n  <br />\n  <input type=\&quot;button\&quot; value=\&quot;Create\&quot; onclick=\&quot;createGroup();\&quot; />\n  <br />\n  <hr />\n</fieldset>\n\n<div id=\&quot;leave_group_container\&quot;></div>\n\n<div id=\&quot;delete_group_container\&quot;></div>\n\n<div id=\&quot;add_participant_container\&quot;></div>\n\n<div id=\&quot;remove_participant_container\&quot;></div>\n\n<br />\n<fieldset>\n  <legend>List of outstanding participants on current group</legend>\n  <div id=\&quot;current_participants\&quot;></div>\n\n  Click &apos;Refresh list&apos; button to get the list of outstanding participants\n  <input type=\&quot;button\&quot; value=\&quot;Refresh list\&quot; onclick=\&quot;fetchAllGroups();\&quot; />\n  <br />\n  <hr />\n</fieldset>\n<br />\n\n<div id=\&quot;messages\&quot;></div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Basic Chat Demo&quot;,&quot;editors&quot;:&quot;101&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

