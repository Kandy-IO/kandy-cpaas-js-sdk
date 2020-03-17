---
layout: page
categories: quickstarts-javascript
title: Call States
permalink: /quickstarts/javascript/cpaas/Call%20States
position: 4
---

# Call States

Any given Call instance has its information persisted in the SDK instance it was created. To retrieve this information, you can use the `call.getById` or `call.getAll` functions to get information of a particular call or calls.

Call information persists beyond the call's lifetime.

To see the supported Call states, see `api.call.states` in API documentation.

When an operation is performed on a call, it can transition to another state.
The operation can either be explicitly initiated by the user or implicitly triggered by the SDK (for example as a result of internal error or a server response).
The scenarios mentioned below are just few examples and therefore they do not cover all possibilities.

- If current state is '**Initiating**' then it can transition to '**Initiated**' or '**Ended**'.

  Going into '**Initiated**' state is the result of a user making a call, where all conditions have been locally met (e.g. device(s) locally available, server accepted the request). The Call is now waiting to be received on the remote side, and will be updated again when a response is received.

  Going into '**Ended**' state is the result of user hanging up at that very moment or an error being reported.

- If current state is '**Initiated**' then it can transition to '**Ringing**', '**Early media**', '**Ended**' or '**Cancelled**'.

  Going into '**Ringing**' state is an indication that server successfully delivered the call request to remote endpoint. It's important to realize that the SDK will not play media automatically, it is up to you to decide how to alert the user of an call status.

  Going into '**Early media**' is the result of caller receiving media track, without the call having been answered. When this state occurs, the call will also receive media new tracks. These tracks can be rendered using the `api.media.renderTracks` API.

  Going into '**Ended**' state is the result of caller hanging up or an error being reported.

  Going into '**Cancelled**' state is an indication that request was cancelled by the server side for various reasons (e.g. caller hung up or callee answered the call from another device). This state only applies to the callee's side.

- If current state is '**Early media**', the call's state can change to any of these states: '**Connected**' or '**Ended**'.

  Going into '**Connected**' state could be the result of callee answering the call. Once in this state, other mid-call operations like hold, addMedia, transfer and others become possible.

  Going into '**Ended**' state is the result of caller hanging up or an error being reported.

- If current state is '**Ringing**' then it can transition to '**Ended**', '**Cancelled**' or '**Connected**'.

  Going into '**Ended**' state is the result of caller hanging up or callee rejecting the incoming call or an error being reported.

  Going into '**Cancelled**' state: see above description.

  Going into '**Connected**' state is the result of callee answering the call. Once in this state, other mid-call operations like hold, addMedia, transfer and others become possible.

* If current state is '**Connected**', the call's state can transitin to: '**On Hold**' or '**Ended**'.

  Going into '**On Hold**' state is the result of either caller or callee putting call on hold. When a Call is set on hold, it means its media directions was set as inactive. When a call is on hold, certain other mid-call operations are not possible such as adding media.

  Going into '**Ended**' state is the result of caller or callee hanging up the call or an error being reported.

* If current state is '**On Hold**', then it can transition to '**Connected**' or '**Ended**'.

  Going into '**Connected**' state is the result of re-establishing the sending and receiving of media tracks by the party who put the call on hold, originally. If both parties put the call on hold, then both have to unhold the call in order to get back into this state.

  Going into '**Ended**' state is the result of caller or callee hanging up the call or an error being reported.

