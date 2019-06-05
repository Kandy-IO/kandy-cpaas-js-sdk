---
layout: page
categories: quickstarts-javascript
title: Configurations
permalink: /quickstarts/javascript/uc/Configurations
---

# Kandy Configurations

The first step for any application is to initialize Kandy.js. When doing this, you can customize certain features by providing a configurations object. Kandy's configuration object is separated by feature, and is provided to the Kandy Factory as seen in the example below.

```  javascript
// Initialize an instance of Kandy.js.
import { create } from kandy
const kandy = create({
    authentication: {
        // Server connection configs.
    },
    logs: {
        // Log output configs.
    },
    // Other feature configs.
    ...
});
```

In most cases, the default values will suffice for an application, but specifying your own configurations allows you to customize certain behaviours. The exception is the authentication configurations, which are always required. This quickstart will showcase a few samples of why you may want to use certain configurations. For a full list of the possible configurations, see the [Configuration Documentation](../../references/uc#configurations).

## Example Configurations

### Logs

The Logs configs are used to change the severity of logging output from Kandy.js. This allows for more logged messages, such as debug information, warnings, and errors, which can help to explain what Kandy is doing.

``` javascript
logs: {
    // Set the log level to 'debug' to output more detailed logs. Default is 'warn'.
    logLevel: 'debug'
}
```

### Call

The Call configs are used to initialize call/network settings and to set the starting behaviour of a call. They are split into call behaviour configs (under a `callDefaults` object), and call initialization configs. These configs will be used as the default for a call if they are not provided when the call is made.

``` javascript
call: {
    callDefaults: {
        // Set the default behaviour for a call to an audio call where video
        //      is enabled, so can be used later on.
        isVideoEnabled: true,
        sendInitialVideo: false,
        // Set the default HTML elements that should be used to display call media.
        remoteVideoContainer: document.getElementById('remote-media'),
        localVideoContainer: document.getElementById('local-media')
    },
    // Specify the browser extension to use (for Chrome) when doing screensharing.
    chromeExtensionId: 'abc123...'
}
```

### Authentication

The Authentication configs are used to specify the backend service that Kandy.js should connect to. It is important to always include these configurations.

``` javascript
authentication: {
    subscription: {
        // Specify the connection information for REST requests.
    },
    websocket: {
        // Specify the connection information for websockets.
    }
}
```

### Connectivity

The Connectivity configs are used to customize the behaviour of the websocket and connectivity checks. These settings should only be needed if the default configs are not sufficient, and you want to tweak the behaviour for your application's scenario.

``` javascript
connectivity: {
    // Specify that a ping should be sent every 30 seconds, and an error should
    //      be reported after 3 missed pong responses.
    method: 'pingPong',
    pingInterval: 30000, // milliseconds
    maxMissedPings: 3
}
```



