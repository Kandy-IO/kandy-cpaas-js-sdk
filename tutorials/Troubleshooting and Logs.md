---
layout: page
categories: quickstarts-javascript
title: Troubleshooting and Logs
permalink: /quickstarts/javascript/cpaas2/Troubleshooting%20and%20Logs
position: 9
---

# Capturing Logs and Troubleshooting Problems

This quickstart covers the basics of how to gather log information from the SDK and troubleshooting problems. Code snippets will be shown that demonstrates using the logger. These snippets will come together to form a working demo application that you can modify and tinker with at the end.

## Configuring the Logger

When you create an instance of the SDK, you can supply configurations for the logger as part of the configuration object. The Configuration Documentation includes the full list of log configurations available for the logger.

```javascript 
// Log settings can be configured on SDK initialization.
var client = Kandy.create({
  logs: {
    logLevel: 'debug',
    enableFcsLogs: true
  }
  // Other configs.
  // ...
})
```

## Using the Logger

The logger outputs the logged information to the developer console in your browser. You can view it by opening your browser's Developer Tools and navigating to the Console tab.

### Saving Console Logs

If you experience an issue with how the SDK is behaving, or require support, it can be beneficial to save the log output to a file. This currently will need to be done manually.

If you're using Chrome Browser:

- Open your developer tools
- Navigate to the Console tab
- Right-click anywhere within the console and select "Save As"

If you're using Firefox Browser:

- Open your developer tools
- Navigate to the Console tab
- Right-click and "Select All"
- Copy paste all the text to a file and save

### Reporting a Bug

You can report an issue with the SDK by going to our [contact us page](/contact-us) or, if you are logged in, you can create a support ticket [here](/portal/support/submit-ticket).

## User Interface

We will create a simple UI for demonstrating the effect that log levels have on logging.

```html
<div>
  <fieldset>
    <legend>Select a Log level</legend>
    <input type="radio" name="log-level" value="silent">silent
    <input type="radio" name="log-level" value="error" >error
    <input type="radio" name="log-level" value="warn">warn
    <input type="radio" name="log-level" value="info">info
    <input type="radio" name="log-level" value="debug">debug
  </fieldset>
  <input type="button" value="Initialize SDK" onclick="initialize();" />
</div>
```

## Controls

Now lets add some controls for setting the log level.

```javascript
function initialize() {
  var logLevel = document.querySelector('input[name="log-level"]:checked').value
  console.log('log level:', logLevel)
  var client = Kandy.create({
    logs: {
      logLevel: logLevel,
      enableFcsLogs: true
    },
    authentication: {
      server: {
        base: '$KANDYFQDN$'
      },
      clientCorrelator: 'sampleCorrelator'
    }
  })
}
```

That covers the basics of what is needed to capture logs and troubleshoot issues. Check out the Codepen link below for an interactive example with various log levels.

## Live Demo

The following demo shows how various log levels affect the logging output. Note: for this example 'info' and 'debug' will show logs and 'silent', 'error' won't show any logs, because an error won't occur.

Want to play around with this example for yourself? Feel free to edit this code on Codepen.



<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * $KANDY$ Logger Demo\n */\n\nfunction initialize() {\n  var logLevel = document.querySelector(&apos;input[name=\&quot;log-level\&quot;]:checked&apos;).value\n  console.log(&apos;log level:&apos;, logLevel)\n  var client = Kandy.create({\n    logs: {\n      logLevel: logLevel,\n      enableFcsLogs: true\n    },\n    authentication: {\n      server: {\n        base: &apos;$KANDYFQDN$&apos;\n      },\n      clientCorrelator: &apos;sampleCorrelator&apos;\n    }\n  })\n}\n\n&quot;,&quot;html&quot;:&quot;<div>\n  <fieldset>\n    <legend>Select a Log level</legend>\n    <input type=\&quot;radio\&quot; name=\&quot;log-level\&quot; value=\&quot;silent\&quot;>silent\n    <input type=\&quot;radio\&quot; name=\&quot;log-level\&quot; value=\&quot;error\&quot; >error\n    <input type=\&quot;radio\&quot; name=\&quot;log-level\&quot; value=\&quot;warn\&quot;>warn\n    <input type=\&quot;radio\&quot; name=\&quot;log-level\&quot; value=\&quot;info\&quot;>info\n    <input type=\&quot;radio\&quot; name=\&quot;log-level\&quot; value=\&quot;debug\&quot;>debug\n  </fieldset>\n  <input type=\&quot;button\&quot; value=\&quot;Initialize SDK\&quot; onclick=\&quot;initialize();\&quot; />\n</div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;$KANDY$ Logger Demo&quot;,&quot;editors&quot;:101,&quot;js_external&quot;:&quot;https://cdn.jsdelivr.net/gh/Kandy-IO/kandy-cpaas-js-sdk@58675/dist/kandy.js&quot;} '><input type="image" src="./TryItOn-CodePen.png"></form>