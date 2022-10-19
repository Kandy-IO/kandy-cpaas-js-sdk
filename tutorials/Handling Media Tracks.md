---
layout: page
categories: quickstarts-javascript
title: Handling Media Tracks
permalink: /quickstarts/javascript/link/Handling%20%26%20Media%20Tracks
---

# Handling Media Tracks

In this quickstart we will cover how to handle media during an ongoing call with Kandy.js. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## User Interface

To interact with our demo application, we will have a UI that allows us to make outgoing calls and respond to incoming calls. For this tutorial, we will add the ability to do the following to the UI:

- Start / Stop Video
- Add / Remove media

```html
<div>
  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Start/Stop Video</legend>
    <fieldset>
      <div class="bottomSpacing">
        <!-- User input for starting a video during an ongoing call. -->
        <input type="button" value="Start Video" onclick="startVideo();" />
      </div>
      <div>
        <!-- User input for stopping a video during an ongoing call. -->
        <input type="button" value="Stop Video" onclick="stopVideo();" />
      </div>
    </fieldset>
  </fieldset>

  <br />
  <fieldset style="background-color: WhiteSmoke">
    <legend>Add Media</legend>
    <div class="bottomSpacing">
      <!-- User input for adding media to a call. Allows a user to select which
            types of media they would like to be added in the operation. -->
      Audio: <input type="checkbox" id="make-with-audio" />
      Video: <input type="checkbox" id="make-with-video" />
      ScreenShare: <input type="checkbox" id="make-with-screen" />
      <input type="button" value="Add Media(s)" onclick="addMedia();" />
    </div>
  </fieldset>

  <fieldset>
    <legend>Remove Media</legend>
    <!-- User input for removing local media from a call. As local media is added,
          they will be listed here with the option to remove them from the call. -->
    <input type="button" value="Remove Media(s)" onclick="removeMedia();" />
    <div id="localTrack-controls"></div>
  </fieldset>

  <!-- Media containers. -->
  <fieldset>
    <legend>Media containers</legend>
    Remote video: <div id="remote-container"></div>
    Local video: <div id="local-container"></div>
  </fieldset>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

## Start / Stop Video

### Start Video

To add video to a call, we'll have the user click the 'Start Video' button. This will trigger the `startVideo` function shown below. This function does two simple steps to start the video:

1. Set the options for the video (e.g., dimensions) we want to send to the remote participant.
2. Use the `call.startVideo` API to start sending the video.

This can only be used in a basic media scenario, where the call does not have video. By default, calls will be made with audio-only.

```javascript
/*
 * Functionality for starting video on ongoing call.
 */
function startVideo () {
  log('Adding video to the ongoing call' + callId)

  client.call.startVideo(callId)
}
```

### Stop Video

Similar to starting a video, if we want to stop the video, the user can click the 'Stop Video' button, and our `stopVideo` function will remove the local video and stop it from being sent to the remote participant using the `call.stopVideo` API. This can also only be used in a basic media scenario, where the call has only one video track.

```javascript
/*
 *  Functionality for Stopping video on ongoing call.
 */
function stopVideo () {
  log('Removing the video from the ongoing call' + callId)

  client.call.stopVideo(callId)
}
```

## Add / Remove Media

### Add Media(s)

To add multiple media to an ongoing call, the `call.addMedia` API can be used. Our `addMedia` function shown below (triggered when the user clicks "Add Media"), adds the specified media track(s) to the Call and sends the media(s) to the remote participant(s) by using the `call.addMedia` API.

```javascript
/*
 *  Add media on ongoing Call functionality.
 */
function addMedia () {
  log('Adding media track(s) to ongoing call' + callId)

  const withAudioBox = document.getElementById('make-with-audio')
  const withVideoBox = document.getElementById('make-with-video')
  const withScreenBox = document.getElementById('make-with-screen')

  const media = {
    audio: withAudioBox.checked,
    video: withVideoBox.checked,
    screen: withScreenBox.checked
  }

  client.call.addMedia(callId, media)

  // Reset the checkboxes afterwards.
  withAudioBox.checked = false
  withVideoBox.checked = false
  withScreenBox.checked = false
}
```

### Remove Media(s)

To remove media from an ongoing, when the user clicks on the 'Remove Media' button, our `removeMedia` function will:

1. Retrieve the information of the ongoing call
2. Create a list of media track IDs that we want to remove.
3. Use the `call.removeMedia` API to remove the tracks from the call and stop being sent to the remote participant(s).

Similarly to the `call.addMedia` API, this API can also be used to remove multiple tracks

```javascript
/*
 *  Remove media(s) from ongoing Call functionality.
 */
function removeMedia () {
  log('Removing media track(s) to ongoing call' + callId)
  let checkBoxes = document.getElementsByName('removeMedia')
  // Get the list of IDs with checked checkboxes.
  const trackIds = getAllCheckedTracks()

  client.call.removeMedia(callId, trackIds)
}
```

## Events

The media events for handling tracks on a call fall into three categories:

1. Track Rendering: The `call:tracksAdded` and `call:tracksRemoved` events let the application know when tracks are available to be rendered or need to be unrendered.
2. Media Issues: The `media:sourceMuted` and `media:sourceUnmuted` events let the application know when a track is having a media interruption, such as a network issue.
3. Track Loss: The `media:trackEnded` event lets the application know when a track has unexpectedly ended and needs to be handled.

### Track Rendering

The `call:tracksAdded` and `call:tracksRemoved` events will be emitted once per call operation, either initiated locally or remotely, and will include the list of tracks that have been added or removed due to that operation. A track being added to a call means that its media is available to be rendered. A track being removed from a call means that it is no longer available to be rendered.

For our demo application, we will handle these events be rendering or unrendering the tracks as appropriate. For local tracks that are added to the call, we will also show a UI element that lets the user remove them from the call if desired. Below are the event listeners we will implement to handle the events and hand off the tracks to the functions to perform these actions.

```javascript
/**
 * When new tracks are added to the call, we want to render them.
 * For local tracks, we also want to add a UI element so we can remove them.
 */
client.on('call:tracksAdded', function (params) {
  const { trackIds } = params

  trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)

    // Render the track's media.
    renderTrack(track)

    // Add UI controls to remove local tracks from the call.
    if (track.isLocal) {
      addTrackControls(track)
    }
  })
})

/**
 * When tracks are removed from the call, we want to unrender them.
 * For local tracks, we also want to remove the UI element we previously added.
 */
client.on('call:tracksRemoved', function (params) {
  const { trackIds } = params

  // Iterate over each trackId to determine how to unrender it.
  trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)

    // Unrender the track from the page.
    removeTrack(track)

    // Remove the UI controls for the local track.
    if (track.isLocal) {
      removeTrackControls(track)
    }
  })
})
```

To render and unrender the tracks, we simply use the `media.renderTracks` or `media.removeTracks` APIs. We will render all tracks in either the local or remote HTML containers. It should be noted that we are not rendering local audio tracks since we do not want the user to hear themselves speaking.

```javascript
/*
 * Function that renders a track.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function renderTrack (track) {
  if (track.isLocal) {
    // Only render local video into the local container. The user does not need
    //    to hear themselves speak.
    if (track.kind === 'video') {
      client.media.renderTracks([track.trackId], '#local-container')
    }
  } else {
    // Render all remote media into the remote container.
    client.media.renderTracks([track.trackId], '#remote-container')
  }
}

/*
 * Function that unrenders a track.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function removeTrack (track) {
  // Check whether the ended track was a local track or not.
  if (track.isLocal) {
    if (track.kind === 'video') {
      // Remove the video track from the local container.
      //    Local audio tracks were not rendered by the renderTrack function.
      client.media.removeTracks([track.trackId], '#local-container')
    }
  } else {
    // Remove the track from the remote container.
    client.media.removeTracks([track.trackId], '#remote-container')
  }
}
```

For local tracks added to the call, we want the user to be able to remove them from the call. We will show a list of all local tracks, allowing the user to check the tracks they want to be removed before calling the `call.removeMedia` API. Below are the functions we will use to add the UI elements to the page, to remove the UI elements from the page afterwards, and to get the list of all selected tracks.

```javascript
/*
 * Function to add UI elements for removing a local track from the Call.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function addTrackControls (track) {
  if (!track.isLocal) {
    // We only want to add controls for local tracks.
    return
  }

  const controlsId = 'controls-' + track.trackId
  if (document.getElementById(controlsId)) {
    // Controls already exist for this track.
    return
  }

  const controls = document.createElement('div')
  controls.id = controlsId

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = track.trackId
  checkbox.name = 'local-track'

  const label = document.createElement('label')
  label.innerHTML = track.kind + 'track (' + track.trackId + ')'

  controls.appendChild(checkbox)
  controls.appendChild(label)

  const trackList = document.getElementById('localTrack-controls')
  trackList.appendChild(controls)
}

/*
 * Function to remove UI elements used for removing a local track from the Call.
 * @param {Track} track The Track object retrieved from the SDK.
 */
function removeTrackControls (track) {
  if (!track.isLocal) {
    return
  }

  const controlsId = 'controls-' + track.trackId
  const controls = document.getElementById(controlsId)
  if (controls) {
    const trackList = document.getElementById('localTrack-controls')
    trackList.removeChild(controls)
  } else {
    // Track controls don't exist for this track.
  }
}

/*
 * Function to get the IDs of all checked checkboxes for local tracks.
 * @return {Array<string>} List of track IDs.
 */
function getAllCheckedTracks () {
  const checkedBoxes = document.querySelectorAll('input[name=local-track]:checked')
  const trackIds = Array.from(checkedBoxes).map(box => box.id)

  return trackIds
}
```

This is all of the code our demo application needs to handle media tracks being added and removed from a call.

### Media Issues

The `media:sourceMuted` and `media:sourceUnmuted` events are emitted when a track has stopped receiving media from its source. These events are emitted for individual tracks and are not tied to a call operation being performed. The predominant scenario where this will happen is for remote tracks during network issues, when they are not receiving a consistent flow of media and may flicker between being "source muted" and "source unmuted". It is also possible for these events to be emitted for a local track, but only by a local action, such as the browser preventing a track from receiving media based on an end-user action.

How these events should be handled is very subjective, but there are two main questions to help an application developer decide:

1. When should the events be handled? It is not known how long a track may be source muted for, or if it is a single occurrence or repeated, so these events may be seen to "flicker" back and forth. The main thoughts for an answer to this question are:
  - Handle them immediately: The end-user should see immediate feedback when a media issue occurs.
  - Handle them delayed (debounce): To prevent "flickering", a short delay before handling them can ensure the opposite event isn't immediately emitted as well.
  - Don't handle them: Media issues will be obvious to an end-user with choppy remote audio or video, and extra handling may not be necessary.

2. How seriously should they be handled? Whether it is seen as a minor or major issue will affect how an application wants to handle these events. A few options for an answer to this question are:
  - Provide UI feedback: The end-user should be shown some feedback (eg. buffering UI element) so they are aware of the issue, but the media can remain unchanged.
  - Unrender media: The track can be unrendered from the UI while "source muted" to clearly indicate a temporary outage.
  - Remove media: If a track is continuously having issues, a more drastic step could be to remove media from the call to reduce bandwidth needed. An audio&video call could be reduced to audio-only for both sides of the call, for example.

For our demo application, we will handle these events with a slight delay by showing a message to the end-user that a track has been "source muted".

```javascript
// Allow a debounce timeout to be stored per track.
const sourceMutedTimeouts = {}

/**
 * When a track which is available for rendering becomes source muted, we want
 *    to debounce the event to prevent "flickering" for short interruptions, but
 *    inform the end-user of longer interruptions.
 */
client.on('media:sourceMuted', function (params) {
  if (sourceMutedTimeouts[params.trackId]) {
    // We already have an event that this track has become source muted recently.
    //    That means the track's state is flickering between source muted/unmuted.
    //    Ignore this event.
  } else {
    // Setup a delay of 1 second before handling the event.
    sourceMutedTimeouts[params.trackId] = setTimeout(() => {
      const track = client.media.getTrackById(params.trackId)
      const call = client.call.getById(callId)
      const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks
      // If the track is still source muted after the delay, log a message to
      //    inform the end-user.
      // We also check that the call is supposed to be available for rendering at
      //    this point in time. If the track is not part of the Call, then it is
      //    not expected to become source unmuted unless it becomes available again.
      if (track.sourceMuted && availableTracks.includes(params.trackId)) {
        const endpoint = params.isLocal ? 'Local' : 'Remote'
        log(endpoint + ' ' + track.kind + ' has been source muted for 1 second.')
      } else {
        // If the track is not source muted after the delay, then it was only a
        //    short media interruption.
      }

      // Remove the debounce timeout.
      sourceMutedTimeouts[params.trackId] = undefined
    }, 1000)
  }
})

/**
 * When a track which is available for rendering becomes source unmuted after a
 *    longer interruption, we want to inform the end-user that the interruption
 *    has ended.
 */
client.on('media:sourceUnmuted', function (params) {
  const call = client.call.getById(callId)
  const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks

  if (sourceMutedTimeouts[params.trackId]) {
    // If there is a timeout for this track, that means the source muted state
    //    of the track has flickered within 1 second.
    // Ignore this event, since the timeout will check if the track was source
    //    unmuted during the delay.
  } else if (!availableTracks.includes(params.trackId)) {
    // If the track is not available as part of the Call at this point in time,
    //    then this event does not need to be handled.
    // This occurs for some browsers that simulate a new track becoming source
    //    unmuted immediately as they are first created.
  } else {
    // If there is no timeout, then the track had been source muted for too long.
    //    Log a message saying it has been source unmuted.
    const track = client.media.getTrackById(params.trackId)
    const endpoint = params.isLocal ? 'Local' : 'Remote'
    log(endpoint + ' ' + track.kind + ' has been source unmuted.')
  }
})
```

### Track Loss

When a track is removed from the call by an SDK operation, the `call:tracksRemoved` event will be emitted for that track. When a track ends unexpectedly, but is still part of the call, the `media:trackEnded` event will instead be emitted to let the application know about the problem. The predominant scenario where this will happen is for a local track whose device has been disconnected. For example, if a bluetooth headset or USB camera is disconnected from the machine, any local tracks retrieved from those devices will end. Some browsers also allow an end-user to end screensharing directly through the browser UI, which will also cause that local screenshare track to end.

When a track ends in this way, an application needs to decide how the track should be handled. The two most common methods are:

1. Remove the track: The track has ended and should be removed from the Call so that the remote side of the call knows that it is no longer available for rendering.
  - The `call.removeMedia` API can be used to remove a track from the call.
2. Replace the track: The track has ended but it can be replaced with a new track of the same type to prevent any call interruptions.
  - The `call.replaceTrack` API can be used to replace a track with a new one.

A scenario where you may want to remove the track is when it is a video (or screenshare) track. Replacing a video track with media from a different camera may not be desired by the end-user, depending what other cameras they have connected to their machine (and where they are pointing). Automatically removing the track would "re-synchronize" the call, so that both users know the video was removed.

A scenario where you may want to replace the track is when it is an audio track. Removing an ended audio track could result in the user not having audio, interrupting the call until the user can fix it. Automatically replacing an audio track with a new track could prevent the audio interruption.

For our demo application, we will follow the above scenarios: replace audio and remove video.

```javascript
/**
 * When a local track ends unexpectedly, minimize the interruption to the call it
 *    causes by either removing or replacing it.
 */
client.on('media:trackEnded', function (params) {
  const { trackId, callId } = params
  const track = client.media.getTrackById(trackId)

  if (track.isLocal) {
    if (track.kind === 'video') {
      // For a local video track that ended unexpectedly, clean up the call by
      //    unrendering it then removing it from the call.
      client.media.removeTrack([trackId], '#local-container')
      client.call.removeMedia(callId, [trackId])
    } else if (track.kind === 'audio') {
      // For a local audio track that ended unexpectedly, replace it with a new
      //    audio track.
      client.call.replaceTrack(callId, trackId, { audio: true })
    }
  }
})
```

## Live Demo

Want to try this example for yourself? Click the button below to get started.

### Instructions for Demo

- Open two browser instances of Google Chrome®, or [another supported browser](Get%20Started), by clicking **Try it** two times.
  - One instance will start the call (User A) and the other instance will answer it (User B).
- Enter your Client ID for your account or project in both instances.
  - Enter the email address of User A in the first instance (account or project users).
  - Enter the email address of User B in the second instance (account or project users).
- Enter the passwords for each user.
- Click **Login** to get your time-limited access token in both instances.
  - Note: If the token expires, you’ll need to login again.
- Click **Subscribe** to receive call notifications from the server for both users.
- Enter the User ID of User B in the _to_ field of User A's instance.
- Click **Make Call** to start the call from User A to User B.
- Click **Answer Call** to answer the call once User B has received the incoming call request.
  - You should see the text "Received incoming call" under Messages on User B's instance.
- After a short time, User A and User B should be in an established call and collection of call statistics should have started on both sides.
- Click **End Call** in either instance to end the call. Call statistics should have ended on both sides.
- Click **Download Call Stats** in either instance to download the statistics. Check your **Downloads** folder which should contain your downloaded file.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Call Statistics Demo\n */\n\nconst { create } = Kandy\n\nconst client = create({\n  call: {\n    defaultPeerConfig: {\n      iceServers: [\n        { urls: &apos;$KANDYTURN1$&apos; },\n        { urls: &apos;$KANDYSTUN1$&apos; },\n        { urls: &apos;$KANDYTURN2$&apos; },\n        { urls: &apos;$KANDYSTUN2$&apos; }\n      ]\n    },\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return {\n    accessToken: data.access_token,\n    idToken: data.id_token,\n    expiresIn: data.expires_in\n  }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({\n      clientId,\n      username: userEmail,\n      password\n    })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\nlet callId\n\n// Get user input and make a call to the callee.\nfunction makeCall () {\n  const callee = document.getElementById(&apos;callee&apos;).value\n\n  // Make the call with audio-only.\n  callId = client.call.make(callee, { audio: true })\n}\n\n// Answer an incoming call.\nfunction answerCall () {\n  // Answer the call with audio-only.\n  client.call.answer(callId, { audio: true })\n}\n\n// End an ongoing call.\nfunction endCall () {\n  const call = client.call.getById(callId)\n\n  log(&apos;Ending call with &apos; + call.from)\n  client.call.end(callId)\n}\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === &apos;ENDED&apos;) {\n    callId = null\n  }\n})\n\n// Set listener for successful call starts.\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n})\n\n/*\n * Functionality for starting video on ongoing call.\n */\nfunction startVideo () {\n  log(&apos;Adding video to the ongoing call&apos; + callId)\n\n  client.call.startVideo(callId)\n}\n\n/*\n *  Functionality for Stopping video on ongoing call.\n */\nfunction stopVideo () {\n  log(&apos;Removing the video from the ongoing call&apos; + callId)\n\n  client.call.stopVideo(callId)\n}\n\n/*\n *  Add media on ongoing Call functionality.\n */\nfunction addMedia () {\n  log(&apos;Adding media track(s) to ongoing call&apos; + callId)\n\n  const withAudioBox = document.getElementById(&apos;make-with-audio&apos;)\n  const withVideoBox = document.getElementById(&apos;make-with-video&apos;)\n  const withScreenBox = document.getElementById(&apos;make-with-screen&apos;)\n\n  const media = {\n    audio: withAudioBox.checked,\n    video: withVideoBox.checked,\n    screen: withScreenBox.checked\n  }\n\n  client.call.addMedia(callId, media)\n\n  // Reset the checkboxes afterwards.\n  withAudioBox.checked = false\n  withVideoBox.checked = false\n  withScreenBox.checked = false\n}\n\n/*\n *  Remove media(s) from ongoing Call functionality.\n */\nfunction removeMedia () {\n  log(&apos;Removing media track(s) to ongoing call&apos; + callId)\n  let checkBoxes = document.getElementsByName(&apos;removeMedia&apos;)\n  // Get the list of IDs with checked checkboxes.\n  const trackIds = getAllCheckedTracks()\n\n  client.call.removeMedia(callId, trackIds)\n}\n\n/**\n * When new tracks are added to the call, we want to render them.\n * For local tracks, we also want to add a UI element so we can remove them.\n */\nclient.on(&apos;call:tracksAdded&apos;, function (params) {\n  const { trackIds } = params\n\n  trackIds.forEach(trackId => {\n    const track = client.media.getTrackById(trackId)\n\n    // Render the track&apos;s media.\n    renderTrack(track)\n\n    // Add UI controls to remove local tracks from the call.\n    if (track.isLocal) {\n      addTrackControls(track)\n    }\n  })\n})\n\n/**\n * When tracks are removed from the call, we want to unrender them.\n * For local tracks, we also want to remove the UI element we previously added.\n */\nclient.on(&apos;call:tracksRemoved&apos;, function (params) {\n  const { trackIds } = params\n\n  // Iterate over each trackId to determine how to unrender it.\n  trackIds.forEach(trackId => {\n    const track = client.media.getTrackById(trackId)\n\n    // Unrender the track from the page.\n    removeTrack(track)\n\n    // Remove the UI controls for the local track.\n    if (track.isLocal) {\n      removeTrackControls(track)\n    }\n  })\n})\n\n/*\n * Function that renders a track.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction renderTrack (track) {\n  if (track.isLocal) {\n    // Only render local video into the local container. The user does not need\n    //    to hear themselves speak.\n    if (track.kind === &apos;video&apos;) {\n      client.media.renderTracks([track.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render all remote media into the remote container.\n    client.media.renderTracks([track.trackId], &apos;#remote-container&apos;)\n  }\n}\n\n/*\n * Function that unrenders a track.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction removeTrack (track) {\n  // Check whether the ended track was a local track or not.\n  if (track.isLocal) {\n    if (track.kind === &apos;video&apos;) {\n      // Remove the video track from the local container.\n      //    Local audio tracks were not rendered by the renderTrack function.\n      client.media.removeTracks([track.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([track.trackId], &apos;#remote-container&apos;)\n  }\n}\n\n/*\n * Function to add UI elements for removing a local track from the Call.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction addTrackControls (track) {\n  if (!track.isLocal) {\n    // We only want to add controls for local tracks.\n    return\n  }\n\n  const controlsId = &apos;controls-&apos; + track.trackId\n  if (document.getElementById(controlsId)) {\n    // Controls already exist for this track.\n    return\n  }\n\n  const controls = document.createElement(&apos;div&apos;)\n  controls.id = controlsId\n\n  const checkbox = document.createElement(&apos;input&apos;)\n  checkbox.type = &apos;checkbox&apos;\n  checkbox.id = track.trackId\n  checkbox.name = &apos;local-track&apos;\n\n  const label = document.createElement(&apos;label&apos;)\n  label.innerHTML = track.kind + &apos;track (&apos; + track.trackId + &apos;)&apos;\n\n  controls.appendChild(checkbox)\n  controls.appendChild(label)\n\n  const trackList = document.getElementById(&apos;localTrack-controls&apos;)\n  trackList.appendChild(controls)\n}\n\n/*\n * Function to remove UI elements used for removing a local track from the Call.\n * @param {Track} track The Track object retrieved from the SDK.\n */\nfunction removeTrackControls (track) {\n  if (!track.isLocal) {\n    return\n  }\n\n  const controlsId = &apos;controls-&apos; + track.trackId\n  const controls = document.getElementById(controlsId)\n  if (controls) {\n    const trackList = document.getElementById(&apos;localTrack-controls&apos;)\n    trackList.removeChild(controls)\n  } else {\n    // Track controls don&apos;t exist for this track.\n  }\n}\n\n/*\n * Function to get the IDs of all checked checkboxes for local tracks.\n * @return {Array<string>} List of track IDs.\n */\nfunction getAllCheckedTracks () {\n  const checkedBoxes = document.querySelectorAll(&apos;input[name=local-track]:checked&apos;)\n  const trackIds = Array.from(checkedBoxes).map(box => box.id)\n\n  return trackIds\n}\n\n// Allow a debounce timeout to be stored per track.\nconst sourceMutedTimeouts = {}\n\n/**\n * When a track which is available for rendering becomes source muted, we want\n *    to debounce the event to prevent \&quot;flickering\&quot; for short interruptions, but\n *    inform the end-user of longer interruptions.\n */\nclient.on(&apos;media:sourceMuted&apos;, function (params) {\n  if (sourceMutedTimeouts[params.trackId]) {\n    // We already have an event that this track has become source muted recently.\n    //    That means the track&apos;s state is flickering between source muted/unmuted.\n    //    Ignore this event.\n  } else {\n    // Setup a delay of 1 second before handling the event.\n    sourceMutedTimeouts[params.trackId] = setTimeout(() => {\n      const track = client.media.getTrackById(params.trackId)\n      const call = client.call.getById(callId)\n      const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks\n      // If the track is still source muted after the delay, log a message to\n      //    inform the end-user.\n      // We also check that the call is supposed to be available for rendering at\n      //    this point in time. If the track is not part of the Call, then it is\n      //    not expected to become source unmuted unless it becomes available again.\n      if (track.sourceMuted && availableTracks.includes(params.trackId)) {\n        const endpoint = params.isLocal ? &apos;Local&apos; : &apos;Remote&apos;\n        log(endpoint + &apos; &apos; + track.kind + &apos; has been source muted for 1 second.&apos;)\n      } else {\n        // If the track is not source muted after the delay, then it was only a\n        //    short media interruption.\n      }\n\n      // Remove the debounce timeout.\n      sourceMutedTimeouts[params.trackId] = undefined\n    }, 1000)\n  }\n})\n\n/**\n * When a track which is available for rendering becomes source unmuted after a\n *    longer interruption, we want to inform the end-user that the interruption\n *    has ended.\n */\nclient.on(&apos;media:sourceUnmuted&apos;, function (params) {\n  const call = client.call.getById(callId)\n  const availableTracks = params.isLocal ? call.localTracks : call.remoteTracks\n\n  if (sourceMutedTimeouts[params.trackId]) {\n    // If there is a timeout for this track, that means the source muted state\n    //    of the track has flickered within 1 second.\n    // Ignore this event, since the timeout will check if the track was source\n    //    unmuted during the delay.\n  } else if (!availableTracks.includes(params.trackId)) {\n    // If the track is not available as part of the Call at this point in time,\n    //    then this event does not need to be handled.\n    // This occurs for some browsers that simulate a new track becoming source\n    //    unmuted immediately as they are first created.\n  } else {\n    // If there is no timeout, then the track had been source muted for too long.\n    //    Log a message saying it has been source unmuted.\n    const track = client.media.getTrackById(params.trackId)\n    const endpoint = params.isLocal ? &apos;Local&apos; : &apos;Remote&apos;\n    log(endpoint + &apos; &apos; + track.kind + &apos; has been source unmuted.&apos;)\n  }\n})\n\n/**\n * When a local track ends unexpectedly, minimize the interruption to the call it\n *    causes by either removing or replacing it.\n */\nclient.on(&apos;media:trackEnded&apos;, function (params) {\n  const { trackId, callId } = params\n  const track = client.media.getTrackById(trackId)\n\n  if (track.isLocal) {\n    if (track.kind === &apos;video&apos;) {\n      // For a local video track that ended unexpectedly, clean up the call by\n      //    unrendering it then removing it from the call.\n      client.media.removeTrack([trackId], &apos;#local-container&apos;)\n      client.call.removeMedia(callId, [trackId])\n    } else if (track.kind === &apos;audio&apos;) {\n      // For a local audio track that ended unexpectedly, replace it with a new\n      //    audio track.\n      client.call.replaceTrack(callId, trackId, { audio: true })\n    }\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@5.3.0-beta.947/dist/kandy.js\&quot;></script>\n\n<div>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; /> User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; /> Password:\n    <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n  </fieldset>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n  <fieldset>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Call with audio</legend>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- User input for making a call. -->\n      <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeCall();\&quot; />\n      to <input type=\&quot;text\&quot; id=\&quot;callee\&quot; />\n    </div>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- User input for responding to an incoming call. -->\n      <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n    </div>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </div>\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n  </fieldset>\n</div>\n\n<div>\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Start/Stop Video</legend>\n    <fieldset>\n      <div class=\&quot;bottomSpacing\&quot;>\n        <!-- User input for starting a video during an ongoing call. -->\n        <input type=\&quot;button\&quot; value=\&quot;Start Video\&quot; onclick=\&quot;startVideo();\&quot; />\n      </div>\n      <div>\n        <!-- User input for stopping a video during an ongoing call. -->\n        <input type=\&quot;button\&quot; value=\&quot;Stop Video\&quot; onclick=\&quot;stopVideo();\&quot; />\n      </div>\n    </fieldset>\n  </fieldset>\n\n  <br />\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Add Media</legend>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- User input for adding media to a call. Allows a user to select which\n            types of media they would like to be added in the operation. -->\n      Audio: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-audio\&quot; />\n      Video: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; />\n      ScreenShare: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-screen\&quot; />\n      <input type=\&quot;button\&quot; value=\&quot;Add Media(s)\&quot; onclick=\&quot;addMedia();\&quot; />\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>Remove Media</legend>\n    <!-- User input for removing local media from a call. As local media is added,\n          they will be listed here with the option to remove them from the call. -->\n    <input type=\&quot;button\&quot; value=\&quot;Remove Media(s)\&quot; onclick=\&quot;removeMedia();\&quot; />\n    <div id=\&quot;localTrack-controls\&quot;></div>\n  </fieldset>\n\n  <!-- Media containers. -->\n  <fieldset>\n    <legend>Media containers</legend>\n    Remote video: <div id=\&quot;remote-container\&quot;></div>\n    Local video: <div id=\&quot;local-container\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n.bottomSpacing {\n  margin-bottom: 15px;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Call Statistics Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

