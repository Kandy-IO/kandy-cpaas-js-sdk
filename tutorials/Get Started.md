---
layout: page
categories: quickstarts-javascript
title: Get Started
permalink: /quickstarts/javascript/cpaas/Get%20Started
position: 0
categories:
  - getting_started
---

# Get Started

In this quickstart, we will help you dip your toes in before you dive in. This guide will help you get started with the $KANDY$ Javascript SDK.

## Base URL

This is the HTTPS entry point that you will use for Javascript SDK authentication, REST service and websocket notifications. It will need to be included in the configurations for the SDK (see below).

```
  $KANDYFQDN$
```

## Using the SDK

To begin, you will need to include the javascript library in your application. The library can be included as a UMD module by using a `<script>` tag or bundled with your application as a CommonJS module.

#### As a script

The library will expose the `Kandy` object to global scope. The `Kandy.create` function is used to create an instance of the SDK, as well as to configure that instance.

``` html
<!-- HTML -->

<!-- Load the library. -->
<script src='path/to/kandy.js'></script>

<script type='text/javascript'>
  // Instantiate the library.
  const client = Kandy.create(configs)

  // Use the library.
  client.on( ... )
  ...
</script>
```

#### As a bundle

Different module bundlers can be used to bundle the library with your application. In your application, you simply need to import the library to be able to make use of it.

``` javascript
// ES6 import or...
import { create } from './path/to/Kandy'
// CommonJS module.
var create = require('./path/to/Kandy').create

// Instantiate the library.
const client = create(configs)

// Use the library.
client.on( ... )
```

After you've created your instance of the SDK, you can begin playing around with it to learn its functionality and see how it fits in your application. The API reference documentation will help to explain the details of the available features.

## Configurations

When instantiating the library, there are many configurations that will help to customize behavior to what best serve your application's needs. This can be done by providing a configuration object to the library factory as shown below.

```javascript
// Instantiate the SDK.
import { create } from 'Kandy'
const client = create({
  // Required: Server connection configs.
  authentication: {
    server: {
      base: '$KANDYFQDN$'
    },
    clientCorrelator: 'sampleCorrelator'
  },
  logs: {
    // Customize logging options.
  }
  // Other feature configs.
  // ...
})
```

To learn more about configuring the SDK, please see the [Configuration Quickstart](Configurations).

## Further Reading

The best way to learn is usually by example. Our quickstarts will provided you with working examples and tutorials that you can easily follow. You can also use the Codepen button at the end of each quickstart to run these examples live. These examples are also a great resources with which to experiment and start your own code base. [Visit our quickstarts to learn more.](../)

## Browser Support

| Browser           |        Versions         |
| ----------------- | ----------------------- |
| Chrome            | Latest 3 Major Versions |
| Firefox           | Latest 3 Major Versions |
| Safari (Desktop)  |  Latest Major Version   |

