# Change Log

Kandy.js change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 4.35.0 - beta

### Added

- Added a new (optional) object property `defaultPeerConfig` to `config.call` which would allow for a complete configuration on an RTCPeerConnection. `defaultPeerConfig` supports the same set of properties defined in RTCConfiguration. See [RTCConfiguration properties](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection). `KJS-370`

### Fixed

- Fixed behaviour where a call would still connect when no ICE candidates were found. Calls that experience this will now fail instead. `KJS-329`
- Fixed a backwards compatibility issue with the `client.media.renderTracks` API, `KJS-457`.
- Fixed how cpaas presence request errors are being passed inside the presence plugin to use `BasicError`. `KJS-448`
- Fixed a Call issue where unexpected tracks would appear after call operations if video was added to the call at some point. `KJS-382`, `KJS-267`

## 4.34.0 - 2021-11-26

### Added

- Added a new object property `mediaOffered` to `CallObject` (for an incoming call) to reflect what caller has offered in terms of media. `KJS-334`
- Added the ability to use the `call.replaceTrack` API on a call as long as it is on-going. `KJS-347`
  - Previously the operation required the call to be in the 'Connected' state only.

### Fixed

- If a client unsubscribes from services and gets a 404 Not Found network response, it is treated as a successful unsubscribe operation
  and removes subscription information from state. `KJS-266`
- Fixed an issue where the media direction wasn't being set correctly when adding video to a transceiver that we are reusing, this resulted in
  the call losing remote video when local video is added. `KJS-396`
- Fixed the issue where the websocket cleanup was not triggered when a lost connection was detected. `KJS-424`
- Fixed an issue where if no css selector is passed when calling `client.media.renderTracks` API, it would result in an exception. Now it is
  handled as an error and logged accordingly. `KJS-419`
- Fixed an issue where calls would occasionally get stuck in `Initiating` state if no user info was provided. `KJS-421`
- Fixed an issue where if the client updated the notifications config and set idCacheLength to 0 (disable duplicate checking) it wouldn't be
  used by the SDK and it would continue to check for duplicate notifications. `KJS-427`
- Fixed presence state to indicate when the client has a pending operation in progress for subscribing/unsubscribing to user presence.
  `KJS-295`

## 4.33.0 - 2021-10-29

### Added

- Added improved handling for local network errors occurring during add media and remove media operations for calls. `KJS-184`
- Added two properties: `isLocal` & media `id` on the `media:sourceMuted` & `media:sourceUnmuted` events. These events are sent to application level. `KJS-78`
- Added call state diagrams for both outgoing & incoming call and updated state transitions based on the supported `ringingFeedbackMode`. `KJS-104`
- A new `connectivity.resetConnection` API to allow for a reset of websocket connection. This can be invoked by the application when it detects unstable network conditions. `KJS-373`
- Added new `fetch` API. `kandy.fetch` allows the client to send any Kandy REST request through the SDK. `KJS-374`

## 4.32.0 - 2021-09-24

### Added

- Added an extra property `iceCollectionDelay` as part of `extraInfo` parameter that is passed to `iceCollectionCheck` function. This will further improve the application's side in making a decision whether it has collected good enough ICE candidates. `KJS-253`

### Fixed

- Update notifications plugin state when a websocket connection is removed to indicate the websocket channel is no longer enabled. `KJS-209`
- Fixed a Call issue where receiving a compressed SDP would cause the operation to fail `KJS-328`

## 4.31.0 - 2021-08-30

### Added

- Added support for additional parameters that are passed into the `config.call.iceCollectionCheck` function, in order for application to better decide when it collected good enough ICE candidates for the media call. `KJS-202`
- Added Call functionality to restart media after a connection failure. `KJS-86`, `KJS-68`
  - A new `call.mediaRestart` API has been added to trigger the restart operation. Please see its description for more information.
  - A new `call:mediaRestart` event has been added to signify the result of the operation.
- Added exception handling to the SDP handler pipeline. If any handler throws an exception, it's now logged and execution continues with the next handler in the pipeline. `KJS-46`
- Added previous media connection state to `call:mediaConnectionChange` event data. `KJS-96`
- Added improved Call handling for local network errors occurring during hold and unhold midcall operations. `KJS-127`

### Fixed

- Fixed a Call issue for slow-start operations where the call would not enter 'On Hold' state in certain scenarios. `KJS-259`
- Fixed an issue with the `updateConfig()` API where it would merge arrays instead of replace them. `KJS-205`
- Updated internal timing provided to the `call.iceCollectionCheck` configuration function to be more accurate. `KJS-123`
  - The `elapsedTime` parameter will be the actual time rather than based on the `call.iceCollectionDelay` value.

## 4.30.1 - 2021-08-11

### Fixed

- Fixed a Call issue where a call would not enter 'On Hold' state when the remote endpoint holds the call in certain scenarios. `KAA-2654`

## 4.30.0 - 2021-07-30

### Added

- Added new Call tutorial for Device Handling. `KJS-152`

### Changed

- Changed the domain names used in configuration for all turn/stun servers to the newly public ones (for Kandy tutorials). `KJS-89`

## Fixed

- Improved YAML SDP log output by not repeating the final SDP if there has been no changes from the `logHandlers`.

## 4.29.0 - 2021-06-25

### SDP Semantics Defaults

With this release we're announcing the default SDP semantics are changing to the standard compliant `unified-plan` semantics. Only users on Chrome version `92` and earlier are impacted by this change. This is happening now that Google Chrome M91 is published and all interoperability work is finished. In subsequent releases `plan-b` support will be removed entirely. For more information see the release notes for SDK version `4.18.0`.

### Added

- Added a new property to the `CallObject` called `mediaConnectionState`, which tracks the underlying media connection state of a call. `KJS-141`, `KJS-223`
  - A new call event [`call:mediaConnectionChange`](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#calleventcallmediaconnectionchange) is also emitted every time the media connection state is changed.
- Added a new property to the call config called `callAuditTimer`, which sets the time interval to follow when auditing a call. If not specified in the call config object, the default of 25000 milliseconds will be used. `KJS-106`
- Added the ability to customize the `X-CPaaS-Agent` header's value by appending any custom string to its value. `KJS-159`

### Fixed

- Reworked Call audits so that the audits are performed with more consistency with respect to the interval. `KJS-105`
- Fixed a Call issue where the SDK incorrectly handled remote operations from SIP devices in specific scenarios. `KAA-2593`
  - The SDK will now have better interop with remote endpoints that do not have `a=mid` lines in their initial offer.
- Switched from using String.prototype.replaceAll to String.prototype.replace and using regex to do the correct string replacement. Some browsers don't yet
  support replaceAll. `KJS-82`
- Fixed a Call issue where a remote hold operation would not be processed correctly in some scenarios. `KAA-2639`

## 4.28.0 - 2021-05-28

### Added

- Added a Call configuration check to ensure the SDK is not configured to use SDP Semantic 'Plan-B' with a Chrome version that no longer supports it.
  - Please be aware that SDP Semantic 'Plan-B' is being deprecated. It is only supported on Chrome and only prior to version M93.

### Fixed

- Fixed a Call issue on Chrome where remote video tracks would not be ended when the remote participant removed them from the Call in certain scenarios. `KAA-2628`
  - This issue still exists on non-Chromium based browsers for the time being.
- Fixed a Call documentation issue to clarify the information retrieved from the `call.getStats` API. `KAA-2281`

## 4.27.0 - 2021-04-30

### Added

- Improved the logging of [SDP handler functions](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#callsdphandlerfunction). `KJS-99`
  - In [`DEBUG` mode](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#loggerlevels) and lower, each SDP handler function applied to the SDP and the changes that may have resulted.
  - The final SDP is logged with all of the changes that have been applied.
  - The entire report is logged to the console in [YAML format](https://yaml.org/).

### Fixed

- Changed how [`destroy`](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#apidestroy) is used to prevent errors when destroying inside an event. `KJS-123`
- Fix issue where the app isn't notified and subscription isn't removed when the websocket connection is lost and `autoReconnect` is set to false in configuration. `KJS-60`
- Fixed an issue where minimizing the SDK caused an error. `KJS-141`
- Added handling websocket error and close scenarios instead of waiting for the heartbeat to fail to either retry connection or just notify the app and clean up subscription. `KJS-61`
- Added missing 'Call API:' logs to call and groups plugin api interface. `KJS-124`

## 4.26.0 - 2021-03-26

### Fixed

- Updated the Handling Media Tracks tutorial for more clarity. `KJS-109`

## 4.25.0 - 2021-02-26

### Added

- Added Call configuration for "ringing feedback" mode. `KAA-2553`
  - Allows for setting 'auto' or 'manual' modes, to determine whether ringing feedback will be sent automatically when a call is received or when the application chooses to send it.
  - See the `config.call.ringingFeedbackMode` configuration and the new `call.sendRingingFeedback` API for more information.
- Added a new _Handling Media Tracks_ tutorial. `KJS-28`
  - Explains how to manage the medias during an ongoing call.

## 4.24.2 - 2021-02-22

This is a hotfix release, reverting some changes introduced in 4.24.0 and 4.24.1 causing regressions.

As we've become aware, some of the changes we've done in an attempt to correct the issue `KAA-2599` have caused some regressions. We've attempted to correct those issues with 4.24.1 but there are still issues being discovered. In this release we are reverting to the behavior before this change was introduced.

### Technical background on the issue

In some configurations of Kandy, the SDK doesn't receive any SSRC attributes in SDP payloads. This causes a change in behavior in the Chrome browser where `MediaStreamTrack` and `MediaStream` ids take on a value that is no longer unique. This breaks a fundamental assumption that the SDK has about media tracks and streams. In 4.24.0 we attempted what seemed to be an innocuous workaround and our results were positive. However, shortly after we started receiving reports of issues in regular call scenarios (where SSRC is present). 4.24.1 was an attempt at fixing those issues, but after it's release we started noticing new cases that were not accounted for.

Because of the core nature of the assumption of id uniqueness in the SDK we've decided to revert all the changes related to trying to cover for this case and will be addressing this more thoroughly in a future release.

### Changed

- Reverted all changes done for `KAA-2599` and `KAA-2605`.

## 4.24.1 - 2021-02-10 [YANKED]

⚠️ **Post-release note**: This version of the SDK continues to cause regressions with call audio after hold/un-hold call operations and has been yanked.

### Fixed

- Fixed a Call issue where there was no audio after an un-hold operation. `KAA-2605`

## 4.24.0 - 2021-01-29 [YANKED]

⚠️ **Post-release note**: This version of the SDK revealed a major regression issue with call audio after hold/un-hold call operations and has been yanked.

### Added

- Added explicit warning around the connectivity plugin when using `server` for the `responsibleParty` and a `pingInterval`. `KJS-58`
  - `pingInterval` is ignored when the server is responsible for pings. This has been made more explicit now.

### Changed

- Updated Logging tutorial to download logs in NDJSON format. `KJS-25`
- Updated error messages when an action is performed on an invalid call state.

### Fixed

- Fixed issue where Kandy.js would ignore a new track if it had the same id as another track on another peer. `KAA-2599`

## 4.23.0 - 2020-12-21

### Added

- Added a request authorization event: `request:error` `KAA-1076`
  - This event is specific for authorization issues when communicating with the server and notifies an application that the user's credentials should be updated/fixed. This event is emitted _in addition_ to any regular error event for an operation that may be emitted.

### Fixed

- Fixed a Call issue where a crash would occur when a remote SDP offer does not have a media-level direction attribute. `KAA-2585`
- Fixed an issue where log handlers set in the config were not being applied to WebRTC related logs. `KAA-2528`
- Fixed the content of `presence:change` event for the case when user fetches presence for a given user. `KAA-2527`

## 4.22.0 - 2020-11-27

### Added

- Added SDK metadata to `call:statsReceived` event's payload. `KAA-2557`
- Added a new Call Statistics tutorial. `KAA-2559`
  - Explains how to retrieve statistics for calls and what the statistics can be used for.

### Fixed

- Fixed issue where call is not successfully put on hold if only one side is sharing video. `KAA-2555`
- Minor documentation fixes.
- Update the Call `MediaConstraint` format description to include the "direct value" approach. `KAA-2565`
- Fixed issue where the user subscription was being removed if internet connectivity was lost for too long. `KAA-2538`

### Changed

- Changed the way we import Kandy.js dependency into CPaaS tutorials so that it is more visible to user. `KAA-2552`
- Updated CPaaS Anonymous Calls tutorial to allow for manual token entry and setting. `KAA-2550`
- Changed `call.getStats` Call API to return a Promise, so that caller can get the report of the call as part of invoking this API. `KAA-2558`

## 4.21.0 - 2020-10-30

### Fixed

- Fixed an issue with the 'Group Chat' tutorial where some information would be displayed as 'undefined'. `KAA-2531`

### Changed

- Action logs are now disabled by default. The client can provide either a boolean or an object with action log configuration details. If `logActions` is set to `true`, the default settings for action logs will be used. See [Config documentation](https://kandy-io.github.io/kandy-cpaas-js-sdk/docs/#config). `KAA-2504`

## 4.20.0 - 2020-10-02

### Added

- Added a new media API `media.initializeDevices`to get the list of available media devices with permission from the users-end device. `KAA-2445`
- Improved debugging logs for network operations. `KAA-2503`
  - Added new debug level logs for REST request and response information.
  - Added new debug level logs for messages sent and received on the websocket.
  - Added new section to the Logging tutorial to better describe the log levels.
- Added the ability to name the redux store instance for debugging with redux devtools extension.

### Fixed

- Fixed two related issues where null pointer errors were being thrown whenever messages or conversations were deleted. The notification handler now checks for events of type `SessionUpdated`. `KAA-2496` `KAA-1860`
- Fixed a Media issue for `Unified-Plan` calls where a remote track would incorrectly be marked as muted when created. `KAA-2519`
- Fixed documentation for `renderTracks` function to correctly use `track.trackId` instead of the incorrect `track.id`. `KAA-2502`

### Changed

- Updated tutorial codepens to be more robust around authentication and subscription operations. `KAA-2491`
- Removed `Creating LogManager` debug log since it was only in place to work around a bug in Chrome that has been fixed. `KAA-2494`

## 4.19.0 - 2020-08-28

### Added

- Added a new Logging tutorial. `KAA-2464`
  - Explains how the SDK's logging system works and how an application can customize its behaviour.

### Fixed

- Fixed an issue where an empty directory search wasn't passing the servers error message in the `message` field. Now we pass whatever the server error response message was. `KAA-2030`

## 4.18.0 - 2020-07-31

### Important changes

#### media:sourceMuted & media:sourceUnmuted (`KAA-2407`)

The SDK has been updated to use `unified-plan` as the default value for
'sdpSemantics'. `plan-b` only works in Chrome, and is being removed from Chrome
very soon. You will need to handle `media:sourceMuted` and `media:sourceUnmuted` events to
know when to render/unrender remote media.

To see how to use these events, visit our tutorials.
[Kandy tutorials](https://kandy-io.github.io/kandy-cpaas-js-sdk/tutorials/?config=us#/Get%20Started)

### Added

- Added new Call API `call.setSdpHandlers` for setting SDP Handlers after the SDK has been initialized. `KAA-2322`
- Added an SDK requirement in the 'Voice and Video Calls' tutorial for making a call to a PSTN destination. `KAA-2384`
- Added step-by-step details (in Authentication tutorial) on how to obtain key credential information from portal site, in order to generate the authentication tokens. `KAA-2392`
- Added a validation check to handle lack of subscription for 'presence' service.

### Fixed

- Fixed an issue preventing the playing of video tracks during a call on iOS Safari. `KAA-2382`
- Fixed an issue preventing the proper termination of an audio+video outgoing call when camera was already in use. `KAA-2426`
- Fixed an issue where the screenshare options for the `call.make` Call API were not shown in the documentation.
- Fixed issue where uncaught errors in `setLocalDescription` were crashing the saga. These events are now being properly handled. `KAA-2460`
- Fixed `media:sourceMuted` and `media:sourceUnmuted` events by adding `trackId` data instead of passing it in a single element array. `KAA-2455`

### Changed

- Removed the Call default values for BandwidthControls when adding media to a call. `KAA-2402`
  - This affects the `make`, `answer`, `addMedia`, and `startVideo` Call APIs.
  - If the `options.bandwidth` parameter is not provided, the SDK will now default to the browser's behaviour instead of setting its own bandwidth limits for audio and video (of 5000 each).
- Updated the `webrtc-adapter` package (6.4.4 -> 7.6.3). `KAA-2381`
- Updated the tutorials with the right configuration for the Turn servers. `kAA-2441`
- Added a small note to the documentation to inform that screensharing is not supported on iOS Safari. `KAA-2429`

## 4.17.0 - 2020-06-26

### Added

- Added new parameter validation to all configs used with the `create` function. Incorrect parameters will log a `VALIDATION` message. `KAA-2223`
- Added new session level bandwidth limit parameter to the call API. The parameter is `call` and should be passed in the same options object as `audio` and `video` bandwidth controls. `KAA-2108`
- Added documentation about `CodecSelectors` for `sdpHandlers.createCodecRemover`.
- Added callId parameter passed to SDP pipeline handlers `call.SdpHandlerFunction`. `KAA-2242`

### Fixed

- Fixed a Call issue where the callee would not receive a `call:newTrack` event for the remote tracks when answering the call. `KAA-2380`
- Fixed the `conversation.getAll` Messaging API, so that it contains 'lastMessage' property for every conversation object returned to user. `KAA-2400`
- Fixed a Call issue where SDP Handlers were not given the opportunity to act on a local SDP before it was sent to the remote endpoint. `KAA-2136`
- Fixed an issue where replacing a track and then ending it wasn't emitting the proper `call:trackEnded` event. `KAA-2370` `KAA-2387`
- Normalized error data returned from all REST requests to internal components. Doesn't impact public API. `KAA-2348`
- Fixed an issue with `sdpHandlers.createCodecRemover` where it wasn't handling multiple codecs selectors with the same name. `KAA-2416`

### Changed

- Changed `call.getAvailableCodecs` Call API to return a Promise, so that caller can get the list of codecs as part of invoking this API, without the need to setup a separate event listener. This does not impact the existing use of API. `KAA-2423`
- Changed the default configuration value for 'sdpSemantics' to be 'unified-plan', instead of 'plan-b'. `KAA-2401`
  - 'plan-b' is an option supported only by Chrome and it has been deprecated. Further details are [here](https://webrtc.org/getting-started/unified-plan-transition-guide).
  - This should not be a breaking change since Kandy Link supports the interoperability between 'plan-b' and 'unified-plan', transparently.

## 4.16.0 - 2020-05-29

### Added

- Added new call config option 'mediaBrokerOnly'. When set to true the SDK will not try to recreate a calls PeerConnection. This is intended for backends configured to disallow peer to peer connections. `KAA-2259`
- Added new Call API `call.getAvailableCodecs` which can be used to return a list of available codecs supported by the browser. `KAA-2275`
- Added new Call option for configuring DSCP markings on the media traffic. `KAA-2256`
  - DSCP controls can be configured with the `call.make`, `call.answer`, `call.addMedia`, and `call.startVideo` Call APIs.
- Added `removeBundling` flag to the call config for users that want to turn it off. `KAA-2338`

### Fixed

- Removed the need for remote party properties (callNotificationParams) to be present in notifications. `KAA-2271`
- Fixed Firefox calling Chrome issue related to media bundling. `KAA-2282`
- Fixed the triggering of call:trackEnded event (on caller's side) when a media track is removed as well as duplication of such event (on callee's side) when plan-b is used. `KAA-2343`
- Fixed the check for valid authentication tokens in tutorials. `KAA-2298`
- Fixed an issue with removing media for a 'Connected' Call (after an earlier attempt was made while the Call was 'On Hold') `KAA-2353`
- Fixed documentation for Conversation in messaging plugin. `KAA-2102`

### Changed

- Improved the `call.startVideo` API to allow for configuring additional options such as bandwidth.
- Changed the Tutorial's access URL so that it does not expose configuration parameters for a specific domain/server. `KAA-2320`
- The default for `removeBundling` has been changed to be `false`, thereby enabling media bundling. `KAA-2338`
- Updated the Voice and Video Calls tutorials with the proper way of handling media. `KAA-1929`

## 4.15.0 - 2020-04-30

### Added

- Added the handling of mute/unmute events which are being generated when a media source is muted/unmuted by triggers that are outside of SDK's control. `KAA-1641`

### Fixed

- Fixed the broken links in the documentation. `KAA-2270`
- Fixed tutorial's error logging (when subscribing for services) by generating better error messages in SDK. `KAA-2272`

### Changed

- Improved logs for Calls. `KAA-2219`
- Improved behaviour when loading SDK into browser that doesn't support WebRTC. `KAA-2238` `KAA-2258`

## 4.14.0 - 2020-03-27

### Added

- Added a new tutorial topic describing 'Call States' and few minor updates on API documentation. `KAA-2169`
- Added checking for media willSend and willReceive when a Hold operation is received in case the remote side answered an audio only call with audio and video. `KAA-2209`

### Fixed

- Fixed an issue where an existing local video track could not be replaced by a screen sharing track. `KAA-2144`
- Fixed an issue where the `conversation.subscribe` listener not being triggered. `KAA-2200`

## 4.13.0 - 2020-02-28

### Added

- Added a custom header (containing SDK name and version) which will be included in any REST request sent to server. This is based on configuration and its default value is set to false (i.e. don't send this custom header) `KAA-2103`
- Added a destroy function to allow users to wipe the SDK state and render the SDK unusable. `KAA-2181`
  - This is useful when a user is finished with the SDK and wants their data to not be available to the next SDK consumer. After destroy is called, the SDK must be recreated for an application to continue working.

### Fixed

- Fixed the ICE servers documentation for the CPaaS SDK. `KAA-2194`
- Fixed a Call issue where a slow-start, remote hold operation, when entering a "dual hold" state, was not being processed correctly. `KAA-2183`
- Fixed problems with Firefox Hold/Unhold under `plan-b` sdpSemantics by making it impossible to start the SDK in `plan-b` under any browser that is not Chrome. `KAA-2174`

## 4.12.0 - 2020-01-31

### Added

- Added SDP Handler functionality to allow modifying a local SDP after it has been set locally but before sending it to the remote endpoint. `KAA-2136`
  - A `step` property has been added to the `SdpHandlerInfo` parameter given to a `SdpHandlerFunction`. This indicates whether the next step is to `set` the SDP locally or `send` the SDP to the remote endpoint.

### Fixed

- Fixed a Call issue where Call configurations for the ICE collection process were not used for incoming calls. `KAA-2184`
  - See `KAA-1469` in v4.10.0 for affected configurations.
- Fixed an SDP Handler issue where `SdpHandlerInfo.type` was undefined the first time an SDP Handler is called on receiving a call.
- Fixed a midcall issue where removal of a remote media track did not trigger an event notification to application level. `KAA-2150`

## 4.11.1 - 2020-01-02

### Fixed

- Fixed documentation issue, introduced in 4.11.0, where portions of the documentation were missing. `KAA-2151`

## 4.11.0 - 2019-12-20

### Added

- Added SMS History support. `KAA-2017`
- Added new Logger functionality to allow applications to customize the format of information that the SDK logs.
  - See `config.logs.handler`, `config.logs.logActions.handler`, `logger.LogHandler`, and `logger.LogEntry`.
  - An application can now provide a `LogHandler` function to the SDK via configuration. The SDK will use this function for logging information. By default, the SDK will continue to log information to the console.
- Added new helper functions for simple call scenarios. `startVideo` is used to add video to a call that doesn't have a video track yet. `stopVideo` is used to remove video from a call that only has one video track started. The idea is these are simpler to use than the more configurable `addMedia`/`removeMedia`. `KAA-1971`

### Fixed

- Fixed SMS-related requests to use destination address coming from smsinbound subscription instead of global configuration object. `KAA-2060`
- Fixed a Call issue where some slow-start midcall operations (eg. transfer, unhold) would fail. `KAA-2110`
  - This fix re-introduces a previous issue fixed in v4.9.0: `KAA-1890`.
- Fixed an issue where call was failing when the user(caller) has no user@domain format. `KAA-2131`

## 4.10.0 - 2019-11-29

### Added

- Added new user event, `users:change`, to notify when we fetch information about a user. `KAA-1882`
- Added new Call configurations to provide flexibility for the ICE collection process. `KAA-1469`
  - See `config.call` for new configs: `iceCollectionDelay`, `maxIceTimeout`, and `iceCollectionCheck`.
  - These configs should only be needed when the ICE collection process does not complete normally. This should not happen in most scenarios, but can be determined if there is a delay (of 3 seconds or the value set for `maxIceTimeout`) during call establishment.
  - These configurations allow an application to customize the ICE collection process according to their network / scenario, in order to workaround issues.
- Added two new events to notify of Presence subscribe and unsubscribe operations, and Presence fetch now triggers a `presence:change` event for a successful fetch. `KAA-1878`
  - Presence subscribe triggers the new `presence:subscribe` event, and Presence unsubscribe will trigger the new `presence:unsubscribe` event.

### Changed

- Changed the event emitted when a user is fetched to `users:change`. `KAA-1882`

### Fixed

- Fixed public documentation hyperlinks for custom type definitions. `KAA-2011`
- Fixed public documentation for messaging. `KAA-1881`

## 4.9.0 - 2019-11-01

### Added

- Added Call functionality where local media tracks are deleted if they are not being used for the call. `KAA-1890`
- Added a `call:operation` event which is fired by call operations to keep track of operation progress. `KAA-1949`
- Added call related API docs to help with migration from 3.x API. `KAA-2062`
- Added the emission of an event when call state changes from Initiating to Initiated. `KAA-2080`

### Changed

- Improved Call screenshare functionality. `KAA-2000`
  - Added explicit screenshare options for APIs, separate from video options. See the `call.make`, `call.answer`, and `call.addMedia` APIs.
  - A browser extension is no longer required for screensharing on Google Chrome.
  - A Call can now be started and/or answered with screenshare.

### Fixed

- Fixed an issue where the "to" information of the call wasn't being set to where the call was actually sent. `KAA-2014`
- Fixed an issue where the websocket connection is not closed when unsubscribing from all services. `KAA-2025`
- Fixed the inconsistent order of media events for both incoming & outgoing calls. `KAA-1757`
- Fixed an issue where the SIP number normalization was unnecessarily removing an '@' symbol. `KAA-1793`
- Fixed the issue where an active call did not hang up when the call audit failed. `KAA-2003`
- Used the proper channel connectivity method for maintaining websocket channel lifetime. `KAA-2007`
- Fixed CodePen tutorial for Directory search so that a message is logged when no contact is found. `KAA-1636`
- Fixed documentation to reflect the correct default value for checkConnectivity parameter. `KAA-1876`
- Fixed public doc links for call and media.
- Fixed the special case of deleting conversations with no messages so that it now works correctly. `KAA-1984`

## 4.8.0 - 2019-09-27

### Fixed

- Fixed an issue in Chrome plan-b where hold operation will not fire a `call:trackEnded` event and will fire it during the unhold operation. `KAA-1942`
- Fixed the ordering and nesting of types & namespaces in public documentation. `KAA-1880`
- Fixed an issue where local call logs were reporting a duration of 0 for all incoming calls. `KAA-1794`

### Changed

- Changed the public API documentation groupings to namespaces. `KAA-1918`

## 4.7.0 - 2019-08-30

### Fixed

- Fixed the logging issue for the Authentication tutorial regarding subscribing/unsubscribing for/from services. `KAA_1916`
- Fixed an issue where the `kandy.call.history.clear()` is not clearing history data and returning an empty array. `KAA-1873`
- Fixed implementation of public API 'getAll' (for 'users' plugin) to return an array of all users instead of an object of all users, so that it aligns with current API documentation. `KAA-1923`
- Fixed a Users issue where the 'fetchSelfInfo' API would not return any information for the current user. `KAA-1924`
- Fixed an issue causing some BasicError objects to have a misleading message rather than a message about the operation that failed. `KAA-1947`
- Fixed an issue where call audits weren't being sent.`KAA-1944`

## 4.6.0 - 2019-08-01

### Added

- Added "replaceTrack" functionality for calls. See the `kandy.call.replaceTrack` API. `KAA-1727`
- Added bandwidth control functionality for calls. See `kandy.call.makeCall`, `kandy.call.answerCall`, `kandy.call.removeMedia` & `kandy.call.addMedia`. `KAA-1740`
- User now automatically disconnects gracefully when internet connection is lost for too long. `KAA-1591`
- Added the ability to delete messages and conversations of types `chat-oneToOne`, `chat-group` and `sms`. See `Conversation#delete` and `Conversation#deleteMessages`. `KAA-1777` `KAA-1826`
- Added information about token expiry time when user logs in, using CodePen example application.
- Added partial support for Group management to the Kandy example application. This includes: group creation, fetching groups and render basic group info.
- Added ability to delete messages & conversations in the CPaaS example application. `KAA-1842`
- Added a tutorial page for Group management. It includes group creation (and deletion) by admin user, invites to a group of participants, ability to accept or reject invites by non-admin users as well as adding (and removing) participants by admin user. `KAA-1767`

### Fixed

- Fixed a Messaging issue where messages could not be received on a Conversation that was created with a mixed-case recipient ID. `KAA-1889`
- Fixed a Messaging issue where SMS messages were either duplicated or missing in CodePen example application. `KAA-1752`
- Fixed presence fetching for a given user. `KAA-1874`
- Fixed browser support table in Tutorial page and specify more explicitly that SDK supports Safari Desktop.
- Fixed many API documentation issues across all SDK's plugins.
- Fixed version numbering associated with public documentation. `KAA-1823`

### Changed

- Refactored the Groups and Invitation state content in SDK Redux store. `KAA-1845`

## 4.5.0 - 2019-06-28

### Fixed

- Fixed an issue where the `fetchMessages` function was not available on `Conversations` returned by `kandy.conversation.getAll()`. `KAA-1795`

### Added

- a new event `group:refresh` has been added. `KAA-1797`
- `group:refresh` event is now emitted when a new list of groups is fetched instead of `group:change`. `KAA-1797`

### Changed

- `group:change` event is now emitted after the user has left a group and when a participant has joined the group. `KAA-1797`
- `group:change` event payload no longer contains `participant`. `KAA-1797`
- `group:new` event is now emitted when a new `group` is created instead of `group:change`. `KAA-1797`
- `group:delete` event is now emitted when a `group` is deleted instead of `group:change`. `KAA-1797`
- `group:delete` event now contains a payload with the deleted group. `KAA-1797`
- The valid conversation types have been changed to `chat-oneToOne`, `chat-group` and `sms`. Previous types `im` and `group` can still be used and will be converted to the newer types. `KAA-1744`.
- Removed the first parameter (contactId) from kandy.contacts.update() API, thus deprecating it. The user should now use the update(contact) API and ensure that contactId is now being supplied as part of the contact object which is passed to this API. `KAA-1783` `KAA-1600`

## 4.4.0 - 2019-05-24

### Added

- Added Ignore Call functionality. `KAA-1512`

### Fixed

- Fixed call states not having `startTime` and/or `endTime` properties in certain scenarios when the call does not establish. `KAA-1620`
- Fixed the `contacts.remove` API from reporting a success during failure scenarios.
- The `contacts:error` event should now be emitted instead of `contacts:change`.

## 4.3.1 - 2019-04-26

### Fixed

- Made a hotfix release just to update the version because something went wrong with NPM and it requires a new version.

## 4.3.0 - 2019-04-26

### Added

- Added group chat functionality with support for sending and receiving messages `KAA-1594`
- Added an API to create, retrieve, update and delete groups. These groups are used for the group chat functionality. See `kandy.groups` namespace. `KAA-1516` `KAA-1517` `KAA-1518` `KAA-1519` `KAA-1520`
- Added a DEBUG log at the start of every public API invocation, which will better help with future investigations `KAA-1353`
- Added reject call functionality. `KAA-1511`
- Added an API to retrieve basic browser information. See `getBrowserDetails`. `KAA-1470`

### Fixed

- Fixed a "remove media" call issue where the error event provided an incorrect message if the track ID was invalid. `KAA-1436`
- Fixed reject call behaviour to make call state `Ended` on callee side instead of `Cancelled`. `KAA-1584`
- Fixed a call issue where a media mismatch error on answer would leave the call in `Ringing` state instead of ending the call. `KAA-1432`
- Fixed an issue where errors prevented renegotiation from completing. `KAA-1497`

## 4.2.1 - 2019-04-16

### Added

- Added a new call configuration property "removeH264Codecs" to disable removing "H264" Codecs from the SDP by default `KAA-1585`

### Changed

- Changed the default SDP handling to remove "H264" Codecs. `KAA-1585`

## 4.2.0 - 2019-03-29

### Fixed

- Fixed an issue where disconnecting from the network would leave isConnected in the wrong state `KAA-1547`

## 4.1.0 - 2019-03-01

### Added

- Added new Presence event, `presence:selfChange`, to notify when self-presence information has changed. `KAA-1153`
- Added Presence APIs for retrieving presence information. See `kandy.presence.getAll` and `kandy.presence.getSelf`. KAA-1152.
- Added Presence constants to the API. See `kandy.presence.statuses` and `kandy.presence.activities`. `KAA-1151`

### Fixed

- Fixed an issue where the states property was not being defined on the call namespace (kandy.call.states). `KAA-1349`
- Fixed a crash when using the Presence `fetch` API and receiving no data. `KAA-1169`.

### Changed

- Changed the default sdpSemantics to "unified-plan". `KAA-1427`

## 4.0.0 - 2019-02-01

### Compatibility Warning

Version 4.0.0 has many breaking changes for call APIs. Please see the API reference documentation to see the new Call API.

### Added

- Added support to make calls on Safari 12.

### Changed

- Refactored all of the WebRTC-related code.
- Changed the callOptions parameter for the makeAnonymous API function of the CallMe SDK. It must now include a `from` property (callOptions.from), indicating the URI of the caller, as it no longer receives a default value of `anonymousUser@kandy.callMe`. `KAA-1350`

## 3.2.0 - 2019-03-01

### Added

- Added new Presence event, `presence:selfChange`, to notify when self-presence information has changed. `KAA-1153`
- Added Presence APIs for retrieving presence information. See `kandy.presence.getAll` and `kandy.presence.getSelf`. KAA-1152.
- Added Presence constants to the API. See `kandy.presence.statuses` and `kandy.presence.activities`. `KAA-1151`

### Fixed

- Fixed an issue where refreshing an empty address book generated an error. `KAA-1380`
- Fixed an issue where the states property was not being defined on the call namespace (kandy.call.states). `KAA-1349`
- Fixed a crash when using the Presence `fetch` API and receiving no data. `KAA-1169`.

## 3.1.0 - 2019-02-01

### Fixed

- Fixed an issue where track removal does not get cleaned up properly. `KAA-1305`
- Fixed an issue that sometimes cause an error when the user adds "sip:" before the destination address when making a call. `KAA-1360`
- Fixed an issue with Firefox media rendering by escaping special characters from selector in Track component. `KAA-1231`
- Fixed an issue with hold state failing to be set properly on call with certain SIP servers `KAA-938`
- Fixed an issue where audio would not stay muted when going from both hold to local hold. `KAA-1202`
- Fixed an issue where user objects were being added to the state without a userId property, causing them to be keyed by undefined. `KAA-1330`
- Fixed an issue affecting messaging whereby outgoing instant messages remained stuck in an "isPending" state. `KAA-1321`
- Fixed an issue where starting the preview video was failing. `KAA-1344`
- Fixed an issue where the content type header was not being set properly during subscription. `KAA-1331`
- Fixed an issue where Kandy Link users were not having calls added to call history. `KAA-1336`
- Fixed an issue where the presence userID was not being set in some cases in the presence notification message. `KAA-1382`
- Fixed an issue where an internally-used library was polluting the window object. `KAA-1371`
- Fixed an issue where slow-start calls that are rejected were not added to call history. `KAA-1203`

## 3.0.0 - 2018-10-29

### Important Changes

#### HTMLMediaElement.srcObject (`KAA-965`)

In this release we changed the way media streams are attached to media elements to adapt to [upcoming changes](https://www.chromestatus.com/features/5618491470118912) in Chrome. This change is currently announced for Chrome M69. Applications using older versions of the SDK will need to be updated to include these changes prior to Chrome releasing this.

#### createKandy Renamed to kandy.create()

The function to instantiate the SDK has been renamed from `createKandy()` to `Kandy.create()`. Please update your applications accordingly.

### Added

- [CPaaS] Added chat functionality with support for sending and receiving messages `KAA-617`
- Added user's locale to data returned in fetchSelfInfo(). `KAA-787`
- Added new Authorization name (authname) to the Kandy connect method. `KAA-606`
- Implemented originalRemoteParticipant field to call and callHistory for keeping track of the initial call "to" `feat/KAA-959`
- Implemented the ability to set and get the custom parameters set on a call. See `kandy.call.setCustomParameters` and `kandy.call.getCustomParameters`. `KAA-918`
- Implemented the ability to send the custom parameters set on a call. See `kandy.call.sendCustomParameters`. `KAA-919`
- Added ability to answer slow start call with video `KAA-858`
- Added functions getCache, setCache to callHistory plugin `KAA-546`
- Added events for tracking cache changes
- Added connectivity.method object to the connectivity configuration allowing server or client to be configured for connCheck responsibility. `KAA-614`
- Added the ability to silence the remote audio for calls and audio bridges. `KAA-1003`
- Added new API method under the _user_ namespace: `kandy.user.getAll`. `KAA-747`
- Added new API methods under the _contacts_ namespace: `kandy.contacts.fetch`, `kandy.contacts.get` and `kandy.contacts.getAll`. `KAA-747`
- Added the ability to set the video as "inactive" instead of "sendonly" when holding a call. `KAA-1067`
- Added ability to turn off log grouping by configuration log: { disableGroup: true }
- Add remote hold state when music on hold is playing with slow start. `KAA-1137`

### Changed

- Moved User Directory Search to the `kandy.user` namespace (previously on `contacts`). `KAA-747`
- Renamed API function kandy.user.fetchDetails to kandy.user.fetchSelfInfo(). `KAA-747`

### Fixed

- Fixed Safari11 and IE11 browser support `KAA-1109`
- Removed an extra colon from the eventType CALL_HISTORY_CACHE_CHANGE `KAA-546`
- Fixed the `callHistory` and `presence` plugins to work on both Link and UC platforms. `KAA-947`
- Updated API documentation for 'customParameters' parameter. `KAA-913`
- Fixed debug message falsely claiming calls may fail in Anonymous Call scenarios. `KAA-934`
- Updated logs to output slightly less noise as part of a logged item.
- Fixed and issue where Trickle ICE process is being initiated on video/stop start when Tickle ICE is disabled.
- Fixed an issue where services subscription timeout would be compounded when services took a long time to subscribe.
- Fixed a merge issue where changes for `KAA-858` were overwritten. `KAA-1065`

## 3.0.0-beta (build 12095+)

### Added

- Added a new property to call logs: `remoteParticipant`. `KAA-853`
  - This includes the `displayName` and `displayNumber` for the remote participant of the call.

### Fixed

- Fixed an issue where calls on hold would cause an unhandled error when added to an audio bridge. `KAA-678`
- Fixed an issue where call logs would have incorrect information for the remote call participant. `KAA-853`
  - Logs will now consistently display the "caller" information as the originator of the call and "callee" information as the destination of the call.
- Fixed issue with video stream for Electron interoperability with Cisco Phones. `KAA-821`
- Fixed 2 issues in Kandy's logManager:
  - The console logger's level is now being set
  - The console's logger is configured such as to not persist data in localStorage

## 3.0.0-beta (build 11497+)

### Added

- Added a getter function, `getMessage`, on conversations for retrieving specific messages. `KAA-850`
- Added the list of conversations that were affected in the `conversations:change` event. `KAA-834`

### Fixed

- Fixed an issue where messages fetched for a conversation may show up as duplicate messages. `KAA-849`
- Fixed an error when trying to fetch a conversation's messages after it received a message. `KAA-848`
- Fixed a connection issue for UC when using the SDK's default services. `KAA-807`
- Fixed an issue where call logs were missing in the logs when a fetch is made immediately after making a call. `KAA-653`
- Fixed an issue where the `remoteParticipant` property was not being added to call state. `KAA-747`

### Deprecation

- The previous event parameter, `conversationId`, for the `conversations:change` event should not be used anymore. The parameter `conversationIds` should now be used. `KAA-834`

## 3.0.0-beta (build 10805+)

### Added

- Added support for OAuth Token subscription via the UC API. `KAA-780`
- Added a more consistent structure to SDK debug logs. `KAA-685`
- Added documentation for the Config plugin's API. `KAA-728`
- Added kandy.getConfig() functionality for getting the current configuration `KAA-728`

## 3.0.0-beta (build 10484+)

### Added

- Added support for Custom SIP headers for Anonymous and regular Calls. `KAA-831`
- Added new property to call state, `remoteParticipant`, retrieved and updated from FCS. `KAA-746`
- Added transition info in the state change event for remote transfer scenarios. `KAA-746`.
  - In a `REMOTE_HOLD` to `IN_CALL` change `transition.code === 9907` signifies a remote participant change.

### Deprecation

- The previous call state properties (eg. `calleeName`) about call participants are now discouraged. Please use `remoteParticipant` for the other call participant's information.

## 3.0.0-beta (build 9354+)

### Fixed

- DTLS changes for CUCM bugs and for consultative transfer. `KAA-804`, `KAA-806`, `KAA-808`
- Tentative fix for process hold issue when on stable state.
- Fixed an issue with Early Media not doing Call Audits. `KAA-781`

## 3.0.0-beta (build 8790+)

### Added

- Added a new parameter to `auth:change` events, to notify of a forced disconnection. `KAA-799`

### Fixed

- Fixed an issue where the end of user subscriptions would not be handled properly. `KAA-799`
- Fixed an issue where the websocket would ping after disconnect, causing a websocket error.

## 3.0.0-beta (build 8760+)

### Added

- Added a retry mechanism for failed session resubscription attempts. `KAA-799`
- Added a new event, `auth:resub`, to notify the application about resub attempts. `KAA-799`

## 3.0.0-beta (build 5574+)

### Compatibility Warning

Version 3.0 is a hard break in backwards compatibility for Kandy.js. This latest beta version is also a hard break from the previous beta version. Numerous breaking changes have been made in this version, with the goal of avoiding API-related breaking changes in the future. The changes are aimed at providing a more consistent and intuitive experience across the entirety of the new API.

The summary of the breaking changes are (1) most API functions have been namespaced, (2) many API function names have been slightly changed, (3) many event names have been slightly changed, (4) event argument parameters have changed, and (5) renaming of SDK build files.

For in-depth information about what has changed, please see: <https://confluence.genband.com/display/KSDK/Kandy.js+3.0.0-beta+Breaking+Changes>

### Fixed

- Fixed the "uncaught at rootSaga" issue, which prevented actions from being processed afterwards.

### Added

- Support for partial subscriptions. `KAA-403`
- The ability to normalize call destination addresses. See the `kandy.call.make` API options. `KAA-560`
- Better functionality for retrieving media devices. See `kandy.call.getDevices` API and the `devices:change` event. `KAA-563`.

## 3.0.0-beta (build 4927+)

### Compatibility Warning

Version 3.0 is a hard break in backwards compatibility for Kandy.js. The new API is modern, reactive, ES6 friendly and more consistent.

Additionally, the new SDK replaces both FCS and Kandy.js 2.13 in a unified converged API. This allows you to write applications on Kandy that can have the benefit of running on all of the Kandy platforms.

We are continually in the process of improving the SDK and our documentation in order to help developers face the difficulty of developing a real-time communication app.

Our reactive approach to this new version of the SDK puts more responsibility on the SDK and less on the app for many tasks:

- Authentication and connection management is tracked by the SDK to a higher degree and helps developers solidify this aspect of their apps.
- Conversation and call state is tracked by the SDK alleviating this burden from the application. The application can focus on rendering these in a reactive manner.
- Converged unified APIs that allow for graceful elevation of features when they become available on the platform.
- Customizability via a plugin system that drives all interactions within the SDK.

### Added

- Completely new unified API that replaces both FCS and Kandy.js 2.x. See the reference documentation.
- New documentation portal with all new documentation and quick starts for 3.0.
