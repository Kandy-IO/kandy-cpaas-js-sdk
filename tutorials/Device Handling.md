---
layout: page
categories: quickstarts-javascript
title: Handling Devices
permalink: /quickstarts/javascript/cpaas/Handling%20Devices
---

# Device Handling

In this quickstart we will cover how to handle devices with Kandy.js. Handling devices is not a required functionality in the sdk. This tutorial helps give an understanding on how devices work with calls or non-related call operations and retrieving information about the available devices. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## Get devices

To get the list of available devices and information, you simply call the `client.media.getDevices()` API function. When called, it will return an Object with a list for each device type i.e microphone, cameras, speakers. Device lists can be different based on the browser used. For instance, a device in the list can also be added by the browser again as a default device. Included in the device information is the `deviceId` and the `label` of the device, which are both strings. If this list is empty, there can be the possibility of no device present or you don't have permission to access the user's devices and due to this, the label property for the device can be an empty string.

```javascript 
function getDevices () {
  // Get the media devices currently available for use.
  const devices = client.media.getDevices()

  // They are organized in arrays by their device type.
  const { microphone, camera, speaker } = devices

  // Each device has details to identify it, notably a label and unique ID.
  const { label, deviceId } = microphone[0]

  // For some browsers, the details won't be provided unless the end-user has
  //    granted permission to access the devices. That is why we need to
  //    initialize the devices in some cases.
}
```

## Initializing Devices

The `client.media.initializeDevices` API is not required during call setup and will trigger the browser to ask the end-user for permission to access their camera and/or microphone. This gives the browser/application access to the device early, so that the end-user doesn't need to be prompted when they make a call. The API function takes parameters and the application will still need to specify the deviceId when making/answering a call. These permissions could be denied by the end-user and if denied, the list would not have that device using the `client.media.getDevices()` API to get the list of devices.

Note: The API will will trigger an event to let the application know the device list has been updated.

```javascript
/*
 * Call the API to initialize media devices. The browser may prompt the end-user
 *    with a pop-up to grant device permission, if not already allowed.
 * This operation will either trigger a `devices:change` or `devices:error` event,
 *    based on whether the SDK was granted permission or not.
 */
function initializeDevices () {
  // Can request permission for audio and/or video input devices.
  const initAudio = document.getElementById('init-audio').checked
  const initVideo = document.getElementById('init-video').checked

  client.media.initializeDevices({ audio: initAudio, video: initVideo })
}
```

## Selecting Your Device on Call Setup

To learn how to start or answer a call, refer to the [Voice and Video Calls tutorial](Voice%20and%20Video%20Calls). The microphone and/or camera can be chosen when starting a call. The IDs for each device in the media object can be passed as parameters to the `client.call.make` or `client.call.answer` call APIs, see below. Those IDs determine which microphone or camera will be used when starting the call. In the case of the speakers, this will be chosen when the audio track is rendered with the `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

During a call setup, the `client.call.make` API has a different parameter for media options. Included in the media options is the `call.MediaConstraints` object, which defines the format for configuring the media options, see the `Call` API documentation.

Note: The constraints can use either the ideal or exact property. If the exact value cannot be used, the constraint will be considered an error. But in the case of the ideal property, the closest acceptable value will be used instead.

See below for how the media options should be formatted and how to make/answer call with a device.

```javascript
let callId
// Make a call with the selected devices.
function makeCall () {
  // Gather call options from UI.
  const callee = document.getElementById('callee').value
  const withAudio = document.getElementById('make-with-audio').checked
  const withVideo = document.getElementById('make-with-video').checked
  const microphone = getSelectedDeviceId('microphone')
  const camera = getSelectedDeviceId('camera')

  // Determine the media options to provide to the API.
  const audioOptions = withAudio ? { deviceId: microphone } : undefined
  const videoOptions = withVideo ? { deviceId: camera } : undefined

  // Make the call using our options.
  callId = client.call.make(callee, {
    audio: withAudio,
    audioOptions,
    video: withVideo,
    videoOptions
  })
}

// Answer an incoming call using the selected devices.
function answerCall () {
  // Retrieve call state.
  const call = client.call.getById(callId)

  // Gather call options from UI.
  const withAudio = document.getElementById('answer-with-audio').checked
  const withVideo = document.getElementById('answer-with-video').checked
  const microphone = getSelectedDeviceId('microphone')
  const camera = getSelectedDeviceId('camera')

  // Determine the media options to provide to the API.
  const audioOptions = withAudio ? { deviceId: microphone } : undefined
  const videoOptions = withVideo ? { deviceId: camera } : undefined

  // Answer the call using our options.
  client.call.answer(callId, {
    audio: withAudio,
    audioOptions,
    video: withVideo,
    videoOptions
  })
}
```

## Changing Devices during a Call

To learn how to perform midcall operations, refer to the [Handling Media tutorial](Handling%20Media%20Tracks).

When adding a device (e.g. microphone and/or a camera) during an ongoing call, the `deviceId` for each device will need to be passed into the media object with the `client.call.addMedia` API. However, removing the device will require specifying the `trackId` and the `deviceId` in the media Object to the `client.call.replaceTrack` API as parameters. To learn how to add/remove media, refer to [Handling Media Tracks](Handling%20Media%20Tracks). Changing the output device (i.e speakers) requires unrendering the the tracks using the `client.media.removeTracks` and re-rendering the track with `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

Note: The `client.call.replaceTrack` API is the recommended way to change a device during a call but if that can't be done, the application should remove using `client.call.removeTracks` and then re-add a track in order to change its device.

```javascript
/**
 * Changes the device, of the specified type, being used on the call with
 *    the selected device of that type.
 */
function replaceDevice (type) {
  const call = client.call.getById(callId)
  const newDevice = getSelectedDeviceId(type)

  /*
   * Important: The method to change input devices vs. output devices is different.
   * For input devices (microphone, camera), you need to replace the track being
   *    used with a new track that is getting media from the new device.
   * For output devices (speakers), you simply need to re-render the existing
   *    track and specify the new device to use.
   */
  if (type === 'microphone' || type === 'camera') {
    // Determine whether its an audio or video track we are replacing based
    //    on the device type specified.
    const mediaType = type === 'microphone' ? 'audio' : 'video'

    // Determine the media options to be provided to the API.
    const mediaOptions =
      mediaType === 'audio'
        ? { audio: true, audioOptions: { deviceId: newDevice } }
        : { video: true, videoOptions: { deviceId: newDevice } }

    // Find the ID of the track we are replacing. For input devices, we act
    //    on our local tracks.
    const trackId = call.localTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === mediaType
    })

    // Replace the existing track with a new track using our selected device.
    client.call.replaceTrack(callId, trackId, mediaOptions)
  } else if (type === 'speaker') {
    // Find the ID of the track we want to change the speaker for. For output
    //    devices, we act on the remote tracks.
    const trackId = call.remoteTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === 'audio'
    })

    // Unrender the remote audio track, then re-render it with the desired
    //    speaker device.
    client.media.removeTracks([trackId], '#remote-container')
    client.media.renderTracks([trackId], '#remote-container', {
      speakerId: newDevice
    })
  }
}
```

## Events

### devices:change

The `devices:change` event informs us when the media devices have changed and multiple things can also trigger this event. For instance, when initializing devices or connecting/disconnecting devices to the end-user's machine.

This would also be emitted during an ongoing call, if media devices changed. The `devices:error` event will be triggered when an error is encountered when using media devices. For instance, initializing devices or connecting/disconnecting devices to the end-user's machine could trigger these if an error occurs. Also when the browser cannot find a media device that fulfills the `call.MediaConstraint` provided.

```javascript
/*
 * Listen for changes to the device lists. This will happen after devices have
 *    been initialized or if a device is added/removed from the end-user's machine.
 * When emitted, we want to updated our HTML device selectors using the
 *    updated lists.
 */
client.on('devices:change', () => {
  const devices = client.media.getDevices()
  log('Media devices have changed.')
  console.log('Full devices list: ', devices)

  const types = ['microphone', 'camera', 'speaker']
  types.forEach(type => {
    // Update our HTML select elements with the updated devices.
    updateSelector(type, devices[type])
  })
})

/*
 * Listen for device errors. This will happen either if permission is denied
 *   by the end-user when initializing devices, or if the SDK cannot get access
 *   to a device using the specified options when adding media to a call.
 */
client.on('devices:error', function (params) {
  log('An error occurred:' + params.error.message)
})
```

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Device Handling Demo\n */\n\nconst { create } = Kandy\n\nconst client = create({\n  call: {\n    // Specify the TURN/STUN servers that should be used.\n    iceServers: [\n      { urls: &apos;$KANDYTURN1$&apos; },\n      { urls: &apos;$KANDYSTUN1$&apos; },\n      { urls: &apos;$KANDYTURN2$&apos; },\n      { urls: &apos;$KANDYSTUN2$&apos; }\n    ],\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n\n  // Required: Server connection configs.\n  authentication: {\n    server: {\n      base: &apos;$KANDYFQDN$&apos;\n    },\n    clientCorrelator: &apos;sampleCorrelator&apos;\n  }\n})\n\n/*\n * User subscription code.\n */\n\nconst cpaasAuthUrl = &apos;https://$KANDYFQDN$/cpaas/auth/v1/token&apos;\n\n/**\n * Creates a form body from an dictionary\n */\nfunction createFormBody (paramsObject) {\n  const keyValuePairs = Object.entries(paramsObject).map(\n    ([key, value]) => encodeURIComponent(key) + &apos;=&apos; + encodeURIComponent(value)\n  )\n  return keyValuePairs.join(&apos;&&apos;)\n}\n\n/**\n * Gets the tokens necessary for authentication to $KANDY$\n */\nasync function getTokens ({ clientId, username, password }) {\n  const formBody = createFormBody({\n    client_id: clientId,\n    username,\n    password,\n    grant_type: &apos;password&apos;,\n    scope: &apos;openid&apos;\n  })\n\n  // POST a request to create a new authentication access token.\n  const fetchResult = await fetch(cpaasAuthUrl, {\n    method: &apos;POST&apos;,\n    headers: {\n      &apos;Content-Type&apos;: &apos;application/x-www-form-urlencoded&apos;\n    },\n    body: formBody\n  })\n\n  // Parse the result of the fetch as a JSON format.\n  const data = await fetchResult.json()\n\n  return {\n    accessToken: data.access_token,\n    idToken: data.id_token,\n    expiresIn: data.expires_in\n  }\n}\n\nasync function login () {\n  const clientId = document.getElementById(&apos;clientId&apos;).value\n  const userEmail = document.getElementById(&apos;userEmail&apos;).value\n  const password = document.getElementById(&apos;password&apos;).value\n\n  try {\n    const { accessToken, idToken, expiresIn } = await getTokens({\n      clientId,\n      username: userEmail,\n      password\n    })\n\n    if (!accessToken || !idToken) {\n      log(&apos;Error: Failed to get valid authentication tokens. Please check the credentials provided.&apos;)\n      return\n    }\n    client.setTokens({ accessToken, idToken })\n    document.getElementById(&apos;loginBtn&apos;).disabled = true\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = false\n    log(&apos;Successfully logged in as &apos; + userEmail + &apos;. Your access token will expire in &apos; + expiresIn / 60 + &apos; minutes&apos;)\n  } catch (error) {\n    log(&apos;Error: Failed to get authentication tokens. Error: &apos; + error)\n  }\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  // Wrap message in textNode to guarantee that it is a string\n  // https://stackoverflow.com/questions/476821/is-a-dom-text-node-guaranteed-to-not-be-interpreted-as-html\n  const textNode = document.createTextNode(message)\n  const divContainer = document.createElement(&apos;div&apos;)\n  divContainer.appendChild(textNode)\n  document.getElementById(&apos;messages&apos;).appendChild(divContainer)\n}\n\n/**\n * Subscribes to the call service on the websocket channel for notifications.\n * Do this after logging in.\n */\nfunction subscribe () {\n  const services = [&apos;call&apos;]\n  const subscriptionType = &apos;websocket&apos;\n  client.services.subscribe(services, subscriptionType)\n}\n\n// Listen for subscription changes.\nclient.on(&apos;subscription:change&apos;, function () {\n  if (\n    client.services.getSubscriptions().isPending === false &&\n    client.services.getSubscriptions().subscribed.length > 0\n  ) {\n    document.getElementById(&apos;subscribeBtn&apos;).disabled = true\n    log(&apos;Successfully subscribed&apos;)\n  }\n})\n\nclient.on(&apos;subscription:error&apos;, function (params) {\n  log(&apos;Unable to subscribe. Error: &apos; + params.error.message)\n})\n\n/*\n * Helper functions for managing changes to the HTML.\n */\n\n// Function to update the HTML <select> elements of device lists.\nfunction updateSelector (deviceType, devices) {\n  const selector = document.getElementById(deviceType + &apos;-selector&apos;)\n\n  // Clear the previous options, then re-add the default \&quot;no selection\&quot; option.\n  selector.innerHTML = &apos;&apos;\n  const defaultOption = document.createElement(&apos;option&apos;)\n  defaultOption.value = undefined\n  defaultOption.textContent = &apos;No device selected.&apos;\n  selector.appendChild(defaultOption)\n\n  // Add each device of this type to the select element.\n  devices.forEach(device => {\n    const option = document.createElement(&apos;option&apos;)\n    option.value = device.deviceId\n\n    // Important: Device labels are not always available.\n    // This is generally because the SDK does not have permission to access\n    //    identifiable information about the devices. This is where we need\n    //    to prompt the end-user for permission by initializing the devices.\n    option.textContent = device.label ? device.label : &apos;Label not available - Media permission required!&apos;\n\n    selector.appendChild(option)\n  })\n}\n\n// Function to get the ID of the specified type&apos;s selected device.\nfunction getSelectedDeviceId (type) {\n  const device = document.getElementById(type + &apos;-selector&apos;).value\n\n  // If the selected device is the default option, return undefined.\n  // The system default device will be used if no deviceId is specified when\n  //    adding media to a call.\n  if (device === &apos;undefined&apos;) {\n    return undefined\n  }\n\n  return device\n}\n\n/*\n * Call related code.\n */\n\n/*\n * Call the API to initialize media devices. The browser may prompt the end-user\n *    with a pop-up to grant device permission, if not already allowed.\n * This operation will either trigger a `devices:change` or `devices:error` event,\n *    based on whether the SDK was granted permission or not.\n */\nfunction initializeDevices () {\n  // Can request permission for audio and/or video input devices.\n  const initAudio = document.getElementById(&apos;init-audio&apos;).checked\n  const initVideo = document.getElementById(&apos;init-video&apos;).checked\n\n  client.media.initializeDevices({ audio: initAudio, video: initVideo })\n}\n\nlet callId\n// Make a call with the selected devices.\nfunction makeCall () {\n  // Gather call options from UI.\n  const callee = document.getElementById(&apos;callee&apos;).value\n  const withAudio = document.getElementById(&apos;make-with-audio&apos;).checked\n  const withVideo = document.getElementById(&apos;make-with-video&apos;).checked\n  const microphone = getSelectedDeviceId(&apos;microphone&apos;)\n  const camera = getSelectedDeviceId(&apos;camera&apos;)\n\n  // Determine the media options to provide to the API.\n  const audioOptions = withAudio ? { deviceId: microphone } : undefined\n  const videoOptions = withVideo ? { deviceId: camera } : undefined\n\n  // Make the call using our options.\n  callId = client.call.make(callee, {\n    audio: withAudio,\n    audioOptions,\n    video: withVideo,\n    videoOptions\n  })\n}\n\n// Answer an incoming call using the selected devices.\nfunction answerCall () {\n  // Retrieve call state.\n  const call = client.call.getById(callId)\n\n  // Gather call options from UI.\n  const withAudio = document.getElementById(&apos;answer-with-audio&apos;).checked\n  const withVideo = document.getElementById(&apos;answer-with-video&apos;).checked\n  const microphone = getSelectedDeviceId(&apos;microphone&apos;)\n  const camera = getSelectedDeviceId(&apos;camera&apos;)\n\n  // Determine the media options to provide to the API.\n  const audioOptions = withAudio ? { deviceId: microphone } : undefined\n  const videoOptions = withVideo ? { deviceId: camera } : undefined\n\n  // Answer the call using our options.\n  client.call.answer(callId, {\n    audio: withAudio,\n    audioOptions,\n    video: withVideo,\n    videoOptions\n  })\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.from)\n\n  client.call.end(callId)\n}\n\n/**\n * Changes the device, of the specified type, being used on the call with\n *    the selected device of that type.\n */\nfunction replaceDevice (type) {\n  const call = client.call.getById(callId)\n  const newDevice = getSelectedDeviceId(type)\n\n  /*\n   * Important: The method to change input devices vs. output devices is different.\n   * For input devices (microphone, camera), you need to replace the track being\n   *    used with a new track that is getting media from the new device.\n   * For output devices (speakers), you simply need to re-render the existing\n   *    track and specify the new device to use.\n   */\n  if (type === &apos;microphone&apos; || type === &apos;camera&apos;) {\n    // Determine whether its an audio or video track we are replacing based\n    //    on the device type specified.\n    const mediaType = type === &apos;microphone&apos; ? &apos;audio&apos; : &apos;video&apos;\n\n    // Determine the media options to be provided to the API.\n    const mediaOptions =\n      mediaType === &apos;audio&apos;\n        ? { audio: true, audioOptions: { deviceId: newDevice } }\n        : { video: true, videoOptions: { deviceId: newDevice } }\n\n    // Find the ID of the track we are replacing. For input devices, we act\n    //    on our local tracks.\n    const trackId = call.localTracks.find(id => {\n      const track = client.media.getTrackById(id)\n      return track.kind === mediaType\n    })\n\n    // Replace the existing track with a new track using our selected device.\n    client.call.replaceTrack(callId, trackId, mediaOptions)\n  } else if (type === &apos;speaker&apos;) {\n    // Find the ID of the track we want to change the speaker for. For output\n    //    devices, we act on the remote tracks.\n    const trackId = call.remoteTracks.find(id => {\n      const track = client.media.getTrackById(id)\n      return track.kind === &apos;audio&apos;\n    })\n\n    // Unrender the remote audio track, then re-render it with the desired\n    //    speaker device.\n    client.media.removeTracks([trackId], &apos;#remote-container&apos;)\n    client.media.renderTracks([trackId], &apos;#remote-container&apos;, {\n      speakerId: newDevice\n    })\n  }\n}\n\n/*\n * Listen for changes to the device lists. This will happen after devices have\n *    been initialized or if a device is added/removed from the end-user&apos;s machine.\n * When emitted, we want to updated our HTML device selectors using the\n *    updated lists.\n */\nclient.on(&apos;devices:change&apos;, () => {\n  const devices = client.media.getDevices()\n  log(&apos;Media devices have changed.&apos;)\n  console.log(&apos;Full devices list: &apos;, devices)\n\n  const types = [&apos;microphone&apos;, &apos;camera&apos;, &apos;speaker&apos;]\n  types.forEach(type => {\n    // Update our HTML select elements with the updated devices.\n    updateSelector(type, devices[type])\n  })\n})\n\n/*\n * Listen for device errors. This will happen either if permission is denied\n *   by the end-user when initializing devices, or if the SDK cannot get access\n *   to a device using the specified options when adding media to a call.\n */\nclient.on(&apos;devices:error&apos;, function (params) {\n  log(&apos;An error occurred:&apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n\n  // If the call ended, stop tracking the callId.\n  if (params.state === client.call.states.ENDED) {\n    callId = null\n  }\n})\n\n// Set listener for incoming calls.\nclient.on(&apos;call:receive&apos;, function (params) {\n  // Keep track of the callId.\n  callId = params.callId\n\n  // Retrieve call information.\n  call = client.call.getById(params.callId)\n  log(&apos;Received incoming call from &apos; + call.from)\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:newTrack&apos;, function (params) {\n  // Check whether the new track was a local track or not.\n  if (params.local) {\n    // Don&apos;t render the local audio track so the end-user doesn&apos;t hear themselves.\n    const localTrack = client.media.getTrackById(params.trackId)\n    if (localTrack.kind === &apos;video&apos;) {\n      client.media.renderTracks([params.trackId], &apos;#local-container&apos;)\n    }\n  } else {\n    // Render the remote media into the remote container.\n    const remoteTrack = client.media.getTrackById(params.trackId)\n    if (remoteTrack.kind === &apos;audio&apos;) {\n      // Specify the speaker we want to use if it is an audio track.\n      const speakerId = getSelectedDeviceId(&apos;speaker&apos;)\n      client.media.renderTracks([params.trackId], &apos;#remote-container&apos;, {\n        speakerId\n      })\n    } else {\n      client.media.renderTracks([params.trackId], &apos;#remote-container&apos;)\n    }\n  }\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (params.local) {\n    // Remove the track from the local container.\n    client.media.removeTracks([params.trackId], &apos;#local-container&apos;)\n  } else {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@799/dist/kandy.js\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Media Devices</legend>\n    <div>\n      <input type=\&quot;button\&quot; onclick=\&quot;initializeDevices()\&quot; value=\&quot;Initialize Devices\&quot;></input>\n      with audio: <input type=\&quot;checkbox\&quot; checked id=\&quot;init-audio\&quot;/>\n      with audio: <input type=\&quot;checkbox\&quot; id=\&quot;init-video\&quot;/>\n    <div>\n      Microphones:\n      <select id=\&quot;microphone-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n     <div>\n      Cameras:\n      <select id=\&quot;camera-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n     <div>\n      Speakers:\n      <select id=\&quot;speaker-selector\&quot;>\n        <option>No device selected.</option>\n      </select>\n    </div>\n  </fieldset>\n</div>\n\n<div>\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Authenticate using your account information</legend>\n    Client ID: <input type=\&quot;text\&quot; id=\&quot;clientId\&quot; />\n    User Email: <input type=\&quot;text\&quot; id=\&quot;userEmail\&quot; />\n    Password: <input type=\&quot;password\&quot; id=\&quot;password\&quot; />\n    <input type=\&quot;button\&quot; id=\&quot;loginBtn\&quot; value=\&quot;Login\&quot; onclick=\&quot;login();\&quot; />\n  </fieldset>\n\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Subscribe To Call Service Websocket Channel</legend>\n    <input type=\&quot;button\&quot; id=\&quot;subscribeBtn\&quot; value=\&quot;Subscribe\&quot; onclick=\&quot;subscribe();\&quot; />\n  </fieldset>\n\n  <fieldset style=\&quot;background-color: WhiteSmoke\&quot;>\n    <legend>Call </legend>\n\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for making a call. -->\n      <input type=\&quot;button\&quot; value=\&quot; Make Call \&quot; onclick=\&quot;makeCall();\&quot; />\n      with audio: <input type=\&quot;checkbox\&quot; checked id=\&quot;make-with-audio\&quot; />\n      with video: <input type=\&quot;checkbox\&quot; id=\&quot;make-with-video\&quot; />\n      to: <input type=\&quot;text\&quot; id=\&quot;callee\&quot; />\n      using input devices selected above.\n    </div>\n\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for responding to an incoming call. -->\n      <input type=\&quot;button\&quot; value=\&quot;Answer Call\&quot; onclick=\&quot;answerCall();\&quot; />\n      with audio: <input type=\&quot;checkbox\&quot; checked id=\&quot;answer-with-audio\&quot; />\n      with video: <input type=\&quot;checkbox\&quot; id=\&quot;answer-with-video\&quot; />\n      using input devices selected above.\n    </div>\n\n    <div>\n      <input type=\&quot;button\&quot; value=\&quot;Change Microphone with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;microphone&apos;);\&quot;/>\n      <input type=\&quot;button\&quot; value=\&quot;Change Camera with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;camera&apos;);\&quot;/>\n      <input type=\&quot;button\&quot; value=\&quot;Change Speaker with selected device.\&quot; onclick=\&quot;replaceDevice(&apos;speaker&apos;);\&quot;/>\n    </div>\n\n    <div style=\&quot;margin-bottom: 15px\&quot;>\n      <!-- User input for ending an ongoing call. -->\n      <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n    </div>\n\n    <fieldset>\n      <!-- Message output container. -->\n      <legend>Messages</legend>\n      <div id=\&quot;messages\&quot;></div>\n    </fieldset>\n  </fieldset>\n\n  <br/>\n  Remote Tracks:\n  <div id=\&quot;remote-audio-container\&quot;></div>\n  <div id=\&quot;remote-container\&quot;></div>\n  Local Tracks:\n  <div id=\&quot;local-audio-container\&quot;></div>\n  <div id=\&quot;local-container\&quot;></div>\n</div>\n\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Device Handling Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

