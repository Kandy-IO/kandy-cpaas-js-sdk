# Change Log

Kandy.js change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 4.3.0 - 2019-04-26

### Added
- Added group chat functionality with support for sending and receiving messages `KAA-1594`
- Added an API to create, retrieve, update and delete groups. These groups are used for the group chat functionality.  See `kandy.groups` namespace. `KAA-1516` `KAA-1517` `KAA-1518` `KAA-1519` `KAA-1520`
- Added the error event to the `subscription`, to prevent subscription change to emmited when there is a subscription failure. `KAA-1351`
- [CPaaS 2.0] Added reject call functionality. `KAA-1511`
- Added an API to retrieve basic browser information. See `getBrowserDetails`. `KAA-1470`

### Fixed
- Fixed an issue where local call logs would not be generated after a call ended. `KAA-1535`
- Fixed a "remove media" call issue where the error event provided an incorrect message if the track ID was invalid. `KAA-1436`
- Fixed a call issue where, when put on hold by a Cisco Phone, the call would end after a short period. `KAA-1562`
- Fixed reject call behaviour to make call state `Ended` on callee side instead of `Cancelled`. `KAA-1584`
- Fixed a call issue where a media mismatch error on answer would leave the call in `Ringing` state instead of ending the call. `KAA-1432`
- Fixed an issue where errors prevented renegotiation from completing. `KAA-1497`
- Fixed call issue where, when on dual hold with a Cisco phone, a remote unhold operation may incorrectly show a video track being added to the call. `KAA-1593`

### Changed
- The `subscription:change` event is no longer emmitted when there is an error. User will have to subscribe to `subscription:error` as well. `KAA-1351`

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

## 3.4.0 - 2019-04-26

### Added
- Added the error event to the `subscription`, to prevent subscription change to emmited when there is a subscription failure `KAA-1351`
- Added a DEBUG log at the start of every public API invocation, which will better help with future investigations `KAA-1353`

### Changed
- The `subscription:change` event is no longer emmitted when there is an error. User will have to subscribe to `subscription:error` as well. `KAA-1351`
- No longer stores call stats in localstorage by default. Use the `recordCallStats` configuration to turn this back on. `KAA-1552`

## 3.3.0 - 2018-03-29

### Changed

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

- [CPaaS 2.0] Added chat functionality with support for sending and receiving messages `KAA-617`
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
- Fixed the `callHistory` and `presence` plugins to work on both Link and CPaaS 1.5 platforms. `KAA-947`
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
- Fixed a connection issue for CPaaS 1.5 when using the SDK's default services. `KAA-807`
- Fixed an issue where call logs were missing in the logs when a fetch is made immediately after making a call. `KAA-653`
- Fixed an issue where the `remoteParticipant` property was not being added to call state. `KAA-747`

### Deprecation

- The previous event parameter, `conversationId`, for the `conversations:change` event should not be used anymore. The parameter `conversationIds` should now be used. `KAA-834`

## 3.0.0-beta (build 10805+)

### Added

- Added support for OAuth Token subscription via the CPaaS 1.5 API. `KAA-780`
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

For in-depth information about what has changed, please see: https://confluence.genband.com/display/KSDK/Kandy.js+3.0.0-beta+Breaking+Changes

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
