---
layout: page
categories: quickstarts-javascript
title: Configurations
permalink: /quickstarts/javascript/cpaas/Configurations
position: 1
categories:
  - getting_started
---

# Configurations

The first step for any application is to initialize the SDK. When doing this, you can customize certain features by providing a configuration object. The configuration object is separated by feature and is provided to the SDK Factory as seen in the example below.

```javascript
// Initialize an instance of the SDK.
const client = create({
  authentication: {
    // Server connection configs.
  },
  logs: {
    // Log output configs.
  }
  // Other feature configs.
  // ...
})
```

In most cases, the default values will suffice for an application, but specifying your own configurations allows you to customize certain behaviors. The exception is the authentication configurations, which are always required.

## Example Configurations

This quickstart will showcase a few samples of why you may want to use certain configurations. For a full list of the possible configurations, see the Configuration Documentation.

### Authentication

The Authentication configs are used to specify the backend service that the SDK should connect to. It is important to always include these configurations.

```javascript
authentication: {
  server: {
    // Specify the base of the URL for REST requests.
    base: '$KANDYFQDN$'
  },
  // Specify the identifier for this device.
  clientCorrelator: 'sampleCorrelator'
}
```

### Logs

The Logs configs are used to change the SDK's internal logging behaviour. The SDK will generate logs that provide information about what it is doing, such as info and debug messages, warnings, and errors. These configurations allow an application to select which levels they would like to see logs for, and how those logs should be handled.

By default, the SDK will include logs for all levels (the default `logLevel` is 'debug') and will print the logs to the browser's console (via the default `handler` function) at their appropriate level (for example, 'info' logs will use `console.info` and 'debug' logs will use `console.debug`).

These defaults work well for development purposes, but may conflict with browser or other behaviours. For example, since the default Log Handler uses the browser's console, the browser may also filter logs based on its own settings. Many browsers do not show the 'debug' level by default, so it would be an extra step for a user to enable those logs in their browser. A custom Log Handler can be used to avoid this behaviour conflict, by always using the same level for the browser's console. For this reason, it is recommended that all applications actively set the `logLevel` and `handler` configurations for logs, to ensure the SDK's logging behaviour is well suited for your application and its users.

```javascript
logs: {
  // Set the log level to 'debug' to output more detailed logs.
  logLevel: 'debug',
  // Provide a custom Log Handler function.
  handler: function yourLogHandler (logEntry) { ... }
}
```

### Call

The Call configs are used to initialize call/network settings. This can customize how the library interacts with the network or provide the library with resources for low-level network operations.

```javascript
call: {
  defaultPeerConfig: {
    // A key-value dictionary that corresponds to the available RTCPeerConfiguration which is normally
    // passed when creating an RTCPeerConnection.
    // See https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection#parameters RTCPeerConnection's
    // configuration parameters} for more information.
    // Specify the TURN/STUN servers that should be used.
    iceServers: [
      { urls: '$KANDYTURN1$' },
      { urls: '$KANDYSTUN1$' },
      { urls: '$KANDYTURN2$' },
      { urls: '$KANDYSTUN2$' }
    ]
  },
  // Specify that credentials should be fetched from the server.
  serverTurnCredentials: true
}
```

### Connectivity

The Connectivity configs are used to customize the behavior of the websocket and connectivity checks. These settings should only be needed if the default configs are not sufficient, and you want to tweak the behavior for your application's scenario.

```javascript
connectivity: {
  // Specify that a ping should be sent every 30 seconds, and an error should
  //      be reported after 3 missed pong responses.
  method: {
    type: 'pingPong'
  },
  pingInterval: 30000, // milliseconds
  maxMissedPings: 3
}
```

```javascript
connectivity: {
  method: {
    type: 'pingPong'
  },
  // Specify that, when encountering connectivity issues, reconnection attempts should
  //        be automatically made at 10 second intervals, and an error should be
  //        reported after 3 failed reconnect attempts.
  autoReconnect: true,
  reconnectDelay: 10000,
  reconnectLimit: 3
}
```

```javascript
connectivity: {
  /**
   * Specify that connectivity should be checked for every 60 seconds using a pingPong sent by the client.
   * After 10 missed pings an error should be reported, and autoReconnecting should be attempted.
   * Reconnection attempts should be automatically made at 10 second intervals,
   * and an error should be reported after 5 failed reconnect attempts.
   * Every missed reconnect will be tried again after doubling the wait time (reconnectTimeMultiplier),
   * (eg. 10 seconds, then 20 seconds, then 40 seconds, etc), up to a maximum of 500 seconds.
   */
  method: {
    type: 'pingPong',
    responsibleParty: 'client'
  },
  pingInterval: 60000,
  reconnectLimit: 5,
  reconnectDelay: 10000,
  reconnectTimeMultiplier: 2,
  reconnectTimeLimit: 500000,
  autoReconnect: true,
  maxMissedPings: 10,
  checkConnectivity: true
}
```

