---
layout: page
categories: quickstarts-javascript
title: Logging
permalink: /quickstarts/javascript/link/Logging
---

# SDK Logs

The SDK has a logging system for providing information about its internal behaviours. The SDK will generate human-readable logs, at different levels for different types of information, that explain how it is handling an application's requests. These logs are important for understanding what the SDK is doing and for debugging potential issues.

This tutorial will explain how the SDK's logging system works, how an application can configure the system, and provide code samples about custom logging functionality that may benefit your application.

## Logging System

When the SDK generates a log, it creates a JSON object we call a "Log Entry". This object contains the log message itself, as well as meta-info about when and who logged it. This meta-info helps to provide context about the log message to more easily understand the source/reason of the log. For example, all logs generated for a specific call will be tagged as a call log and include that call's unique ID.

Each Log Entry also includes the "log level" that it was generated at. The different log levels refer to different types of information that will be included in the log messages. For example, the INFO level provides general information about the SDK's internal operations and the DEBUG level provides specific details about those operations. The possible log levels in a Log Entry match the log levels that the SDK can be configured to use (see `api.logger.levels` in the API documentation).

After the SDK generates a Log Entry, it will pass the log to the "Log Handler" for processing. This Log Handler is the function that decides how the log is handled, and is fully customizable by an application. The SDK's default Log Handler acts as a thin wrapper around the browser's console API (ie. `window.console`). It parses the meta-info in the Log Entry and prepends it to the already human-readable log message, then uses the console to log it at the appropriate level. The code for the SDK's default Log Handler is shown below.

```javascript 
/**
 * Default function for the SDK to use for logging.
 *    Uses entry information to form a prefix, then logs to console.
 *    For more information, see the `api.logger.LogHandler` API documentation.
 * @method defaultLogHandler
 * @param  {LogEntry} entry
 */
function defaultLogHandler (entry) {
  // Compile the meta info of the log for a prefix.
  const { timestamp, level, target, method } = entry

  // Find a short name to reference which Logger this log is from.
  //    This is mostly to cut down the ID if it's too long for a human to read.
  const shortId = target.id && target.id.length > 8 ? target.id.substring(0, 6) : target.id
  const shortName = shortId ? target.type + '/' + shortId : target.type

  // Format the parsed meta-information.
  const logInfo = timestamp + ' - ' + shortName + ' - ' + level

  // The first message parameter is always a string.
  const [log, ...extra] = entry.messages

  // Log the message to the console at the appropriate method level.
  console[method](logInfo + ' - ' + log, ...extra)
}
```

It is important to be aware of this default log behaviour. Since it uses the browser's console APIs, the browser can also filter which logs a user sees. This can be beneficial for a developer, but may be a hindrance for an end-user that is not as familiar with a browser's console and dev-tools. For this reason, we recommend providing a custom Log Handler to the SDK that is better suited for your application and its users.

### Setting a custom Log Handler

An application can customize the Log Handler behaviour by providing their own Log Handler function to the SDK as configuration. This allows an application to choose logging behaviour that is better suited for its users/scenario.

As shown below, the `config.logs.handler` is the configuration for providing a custom Log Handler to the SDK. The SDK will then replace the default Log Handler used internally with the provided Log Handler.

```javascript 
// Your custom Log Handler function.
function customLogHandler (logEntry) { ... }

// Configuration object for the SDK.
const configs = {
  logs: {
    handler: customLogHandler,
    logLevel: 'DEBUG'
  },
  // Configuration for other features.
  authentication: {  ... },
  ...
}

// Initialize the SDK with the configs.
const client = Kandy.create(configs)
```

### Writing a custom Log Handler

A custom Log Handler function can include any functionality that the application desires. The SDK has no restrictions on the Log Handler (other than it is in fact a function). Writing a custom Log Handler is mostly about knowing how to handle a Log Entry object. Below is a list of the important properties on a Log Entry object.

- `timestamp`: When the log was created, based on the UNIX epoch.
- `method`: The log method that the SDK used to create the log. This will match up with the browser's console methods (eg. `info`, `debug`, `warn`).
- `level`: The level that the log was created at. The SDK's configured log level (ie. `config.logs.logLevel`) will affect which levels of logs a Log Handler will receive. The SDK will only provide the Log Handler with Log Entries that are at or above the set log level ('debug' being considered the lowest level and 'silent' the highest level).
- `messages`: An array of the information the log was created with. The first item in the array will be the human-readable 'log message'. Subsequent items can be optional additional information.
- `target`: Object with information about the source of the log. Includes sub-properties `type` (the category of object that the log is about) and `id` (the unique ID that represents that specific type instance). For example, a call log will have 'Call' as its type and the call's ID as its `id`.

## Sample Log Handler Behaviours

The SDK's default Log Handler behaviour is targeted towards developers, and so we expect that applications will need to customize it for their end-users. Below are two examples of custom behaviour that may be desired in your application.

### Browser Console Filtering

The SDK's default Log Handler works well for development, but users may run into an issue with it if their browser is also filtering log levels. Browsers may hide console logs at the 'debug' level (sometimes called 'Verbose' level by browsers) by default, which could catch users unaware. This can become an issue if a user, tester, etc. is collecting logs to showcase an issue they have encountered.

A custom Log Handler can work around this browser behaviour by changing the method that is used when logging to the console. The Log Handler can change the method to something that ensures all logs are shown in the console at an equal level. For example, below is the default Log Handler again, but with a slight change to only use the `console.log` method.

```javascript 
/**
 * Custom Log Handler that changes how the log is given to the browser.
 * @method alwaysEqualLogHandler
 * @param  {LogEntry} entry
 */
function alwaysEqualLogHandler (entry) {
  // Compile the meta info of the log for a prefix.
  const { timestamp, level, target } = entry

  // Parse the meta-info the same as the default Log Handler.
  const shortId = target.id && target.id.length > 8 ? target.id.substring(0, 6) : target.id
  const shortName = shortId ? target.type + '/' + shortId : target.type
  const logInfo = timestamp + ' - ' + shortName + ' - ' + level
  const [log, ...extra] = entry.messages

  // Log the message to the console, but always use the "log" method.
  //    This ensures that all logs are treated equally by the browser, and none
  //    will be filtered out by default.
  console.log(logInfo + ' - ' + log, ...extra)
}
```

### Save to File

Again, the SDK's default behaviour of logging to the browser's console works well for development, but is only useful if the user is actually watching the browser's console. If an end-user needs to collect logs to report an issue they have encountered, it is cumbersome for them to save the logs from the browser console.

An application can implement a "save logs to file" feature with the help of a custom Log Handler. The application can use a Log Handler to save the Log Entry objects, then create a file with them at a later point. For example, below is the default Log Handler again, but with a slight change to save all of the logs it has received.

```javascript
// The maximum number of logs to save.
const maxLogs = 1000
// The saved logs.
let logs = []

/**
 * Custom Log Handler that also saves the Log Entries
 * @method saveLogsLogHandler
 * @param  {LogEntry} entry
 */
function saveLogsLogHandler (entry) {
  // Compile the meta info of the log for a prefix.
  const { timestamp, level, target, method } = entry

  // Parse and log the same as the default Log Handler.
  const shortId = target.id && target.id.length > 8 ? target.id.substring(0, 6) : target.id
  const shortName = shortId ? target.type + '/' + shortId : target.type
  const logInfo = timestamp + ' - ' + shortName + ' - ' + level
  const [log, ...extra] = entry.messages
  console[method](logInfo + ' - ' + log, ...extra)

  // In addition, save the LogEntry to be used later.
  //    Only keep the latest `maxLogs` amount of logs.
  logs = logs.splice(1 - maxLogs).concat(entry)
}
```

With the logs saved, the application can decide on a method for providing them directly to a user that best suits them. A simple method would be to create a `Blob` for the logs, and allow the user to download it as a file. See below for a sample implementation of this method. In this case we will also demonstrate formatting the logs in NDJSON format, which appends a new line after each log entry.

```html 
<input type="submit" value="Download Logs" onclick="downloadLogs()" />
```

```javascript
/**
 * Function for providing the SDK logs to a user via a downloaded file.
 * @method downloadLogs
 */
function downloadLogs () {
  // Convert the saved logs into a NDJSON blob.
  const blob = new Blob([logs.map(JSON.stringify).join('\n')])

  // Create a button that will save the Blob as a file when clicked.
  const button = document.createElement('a')
  button.href = URL.createObjectURL(blob)
  // Give the file a name.
  button.download = Date.now().toString() + '_sdk' + kandy.getVersion() + '_logs.ndjson'

  // Auto-click the button.
  button.click()
}
```

When saving Log Entries, we recommend saving them in NDJSON format and retaining all of the data from each entry, rather than parsing them beforehand. It is possible to parse the Log Entries from the file afterwards, but impossible to reconstruct any data that is lost when they were parsed. This ensures that whoever is inspecting the log file has all of the data as it was provided by the SDK.

**N.B.:** If you require support about an issue with the SDK itself, we will ask you to provide a log file with the raw NDJSON Log Entries and the SDK configured at the 'DEBUG' `logLevel`.

