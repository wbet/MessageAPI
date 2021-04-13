# Message API

Message API is a strongly typed wrapper that provides a modern API based on `promises`, compatible with both Chromium and Firefox Message API, while keeping their native performance.

It can be used with both the `chrome` and the `browser` namespace. If both are found the `browser` namespace takes priority to provide the best performance.

Regardless of the available namespace, all of the functions will return a `promise` if possible.
For example `runtime.sendMessage` on Chrome uses a `callback` while on Firefox returns a `promise`, this library will return a `promise` for both of them.

It also provides easy to use functions specifically created to remove the clutter of manually crafted filters for the messages used to get to that specific one that triggers the desired functions.
Lastly, it takes care of edge cases and errors like [The message port closed before a response was received.](https://github.com/mozilla/webextension-polyfill/issues/130).

# How to use

## Interfaces

All the available interfaces will be presented bellow in an explicit way.
For Typescript users all the generics have 'any' the default so no explicit declaration is actually needed.

```typescript
interface Message<T> {
    data: T;
    source?: 'Content' | 'Background' | 'Popup' | 'Options';
    destination?: 'Content' | 'Background' | 'Popup' | 'Options';
    filters?: MessagePathFilter; //contains key value pairs with custom properties to filter on while receiving the message
}

interface MessagePath {
    source?: 'Content' | 'Background' | 'Popup' | 'Options';
    destination?: 'Content' | 'Background' | 'Popup' | 'Options';
    filters?: MessagePathFilter; //contains key value pairs with custom properties to filter on while receiving the message
}

interface MessagePathFilter {
    [filterName: string]: string | number | boolean;
}

interface MessageOptions {
    extensionId?: string; // required while sending a message to an extension (if not filled in it will send to your extension)
    options?:
        | {
              /** Whether the TLS channel ID will be passed into onMessageExternal for processes that are listening for the connection event. */
              includeTlsChannelId?: boolean;
          }
        | {
              /** Optional. Send a message to a specific frame identified by frameId instead of all frames in the tab. */
              frameId?: number;
          };
}
export type MessageReceivedCallback<TData = any, TResponseData = any> = (data: TData, sender: chrome.runtime.MessageSender | browser.runtime.MessageSender) => TResponseData | Promise<TResponseData> | undefined;
```

## Enums

All the available enums will be presented bellow:

```typescript
export enum MessageLocation {
    Content = 'Content',
    Background = 'Background',
    Popup = 'Popup',
    Options = 'Options'
}
// used as a normal object with properties

MessageLocation.Popup;
```

## Send message

These functions wraps both runtime.sendMessage and tabs.sendMessage APIs.
They are used to send a message to content and background scripts or to different extensions or to different parts of your extension such as popup and options pages:

### Typescript

```typescript
function sendMessageToBackground<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter): Promise<TResponseData>;

function sendMessageToOptions<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter): Promise<TResponseData>;

function sendMessageToPopup<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter): Promise<TResponseData>;

function sendMessageToContentScript<TData = any, TResponseData = any>(tabId: number, data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter): Promise<TResponseData>;

function sendMessageToCurrentWebPage<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter): Promise<TResponseData>;

function sendMessageTo<TData = any, TResponseData = any>(message: Message<TData>, messageOptions?: MessageOptions, tabId?: number): Promise<TResponseData>;
```

### Javascript

```javascript
function sendMessageToBackground(data, source, messageOptions, filters)

function sendMessageToOptions(data, source, messageOptions, filters)

function sendMessageToPopup(data, source, messageOptions, filters)

function sendMessageToContentScript(tabId, data, source, messageOptions, filters)

function sendMessageToCurrentWebPage(data, source, messageOptions, filters)

function sendMessageTo(message, messageOptions, tabId)
```

### Example

```typescript
//simple use case
sendMessageToBackground('message', MessageLocation.Popup);
// or
sendMessageToBackground('message', 'Popup');

// more complex use case
sendMessageToBackground('message', MessageLocation.Popup, {}, { name: 'messageForSpecificCase', numberFilter: 30, isFiltered: true });

// with response handle
sendMessageToBackground('message', 'Popup').then((response) => {
    // processing response
});

// with response handle of known type
sendMessageToBackground<{ name: string; age: number }>('message', 'Popup').then((response) => {
    // processing response of type {name:string, age:number}
});

// custom use case - where we can set no source or destination and just use specific custom filters
sendMessageTo({ data: 'message' }, {}, { filter: 'filter data' });

// custom use case - where we can set a source or destination if we want
sendMessageTo({ data: 'message' }, {}, { filter: 'filter data' });

//others
sendMessageTo({ data: 'message' }, { extensionId: 'id' }, { filter: 'filter data' });
sendMessageTo({ data: 'message' }, { extensionId: 'id', options: { frameId: 'frameId' } }, { filter: 'filter data' });
sendMessageTo({ data: 'message' }, { extensionId: 'id', options: { includeTlsChannelId: 'true' } }, { filter: 'filter data' });
```

## Receive message

These functions wraps both runtime.sendMessage and tabs.sendMessage APIs.
They are used to send a message to content and background scripts or to different extensions or to different parts of your extension such as popup and options pages:

### Typescript

```typescript
function onMessageFromBackground<TData = any, TResponseData = any>(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback<TData, TResponseData>): void;

function onMessageFromOptions<TData = any, TResponseData = any>(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback<TData, TResponseData>): void;

function onMessageFromPopup<TData = any, TResponseData = any>(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback<TData, TResponseData>): void;

function onMessageFromContentScript<TData = any, TResponseData = any>(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback<TData, TResponseData>): void;

function onMessageAnywhere<TData = any, TResponseData = any>(filters: MessagePathFilter, callback: MessageReceivedCallback<TData, TResponseData>): void;

function onMessage<TData = any, TResponseData = any>(messagePath: MessagePath, callback: MessageReceivedCallback<TData, TResponseData>): void;
```

### Javascript

```javascript
function onMessageFromBackground(currentLocation, filters, callback)

function onMessageFromOptions(currentLocation, filters, callback)

function onMessageFromPopup(currentLocation, filters, callback)

function onMessageFromContentScript(currentLocation, filters, callback)

function onMessageAnywhere(filters, callback)

function onMessage(messagePath, callback)
```

### Example

```typescript
// default use case where no type is defined - assumptions currentLocation is the popup page and no filters
onMessageFromBackground(MessageLocation.Popup, {}, (data, sender, sendResponse) => {
    // sender has the sender info
    // data has the any type
    // sendResponse can be called to return a response to the sender
    // e.g
    const modifiedData = data.age + 1;
    sendResponse(modifiedData);
});

// use case with type definitions
onMessageFromBackground<{ name: string; age: number }, number>(MessageLocation.Popup, {}, (data, sender, sendResponse) => {
    // sender has the sender info
    // data has the {name:string, age:number} type
    // sendResponse can be called to return a response to the sender with the number type
    // e.g
    const modifiedData = data.age + 1;
    sendResponse(modifiedData);
});

// use case with type definitions and filters
onMessageFromBackground<{ name: string; age: number }, number>(MessageLocation.Popup, { name: 'AgentX' }, (data, sender, sendResponse) => {
    // only messages sent to the popup from the background script coming from 'AgentX' will pass through
});

//simple use case - only process the data
onMessageFromBackground(MessageLocation.Popup, {}, (data: TData) => {
    // process data
});

//custom use case - similar with the ones above
onMessage({ source: MessageLocation.Background, destination: MessageLocation.Popup, filters: { name: 'AgentX' } }, (data, sender, sendResponse) => {
    // sender has the sender info
    // data has the {name:string, age:number} type
    // sendResponse can be called to return a response to the sender with the number type
    // e.g
    const modifiedData = data.age + 1;
    sendResponse(modifiedData);
});

//custom use case - similar with the ones above but with no source or destination
onMessage({ filters: { name: 'AgentX' } }, (data, sender, sendResponse) => {
    // sender has the sender info
    // data has the {name:string, age:number} type
    // sendResponse can be called to return a response to the sender with the number type
    // e.g
    const modifiedData = data.age + 1;
    sendResponse(modifiedData);
});
```

# Importing the library

This library is available both as an unminified ES6 module and as a minfied libraries created by webpack.

-   Using the unminified ES6 module each individual functions can be imported own their own. This is very useful if you use modern TS/JS, especially with a bundling system that can remove unused functions.

```typescript
import { onMessage } from '@wbet/message-api/message-receiver';
```

-   The minified libraries are compatible with ES6, AMD, CommonJS and the script tag.

```typescript
// import using CommonJS(in nodeJS)
const messageApi = require('@wbet/message-api');

// import using AMD
require(['messageApi'], (messageApi) => {
    // ...
});

// import using ES6 modules
import * as messageApi from '@wbet/message-api';
```

```html
// import using the script tag - importing minified UML - I will use relative paths to exemplify
<script src="./dist/umd/index.min.js"></script>
<script>
    // The 'messageApi' library is added as a property to the window object
    window.messageApi.sendMessage(...)
    // ...
</script>

// import using the script tag - importing minified script from the Web folder - I will use relative paths to exemplify
<script src="./dist/web/index.min.js"></script>
<script>
     // The 'messageApi' library is saved in a global variable
    messageApi.sendMessage(...)
</script>

// if you want to load the script from a CDN you can use
<script src="https://unpkg.com/@wbet/message-api/dist/umd/index.min.js"></script>

// or
<script src="https://unpkg.com/@wbet/message-api/dist/web/index.min.js"></script>
```

# Final note

This library will be improved over time with APIs like connect and sendNativeMessage.

If you found any bug please open an issue and it will be addressed as soon as humanly possible.

# Changelog

## 1.0.10

-   Added actions and action types. Actions are a map of functions to trigger as callback if the type is matched. Actions are optional.
-   Small fixes

## 1.0.5

-   Fixed error [The message port closed before a response was received.](https://github.com/mozilla/webextension-polyfill/issues/130)
-   Adjusted promise to callback function
-   Added preferred namespace as optional parameter.
