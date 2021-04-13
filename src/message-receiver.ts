import { MessageLocation } from './enums/message-location';
import { Message, MessagePath, MessagePathFilter, MessageReceivedCallback } from './interfaces/message.interface';
import { checkBrowser } from './lib/helpers';

/** Listens for messages from the background script */
export function onMessageFromBackground<TData = any, TResponseData = any>(
    currentLocation: MessageLocation,
    filters: MessagePathFilter,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,

    preferredRuntime?: typeof chrome | typeof browser
) {
    const messagePath: MessagePath = { source: MessageLocation.Background, destination: currentLocation, filters };
    onMessage(messagePath, callbackActions, preferredRuntime);
}

/** Listens for messages from the options page */
export function onMessageFromOptions<TData = any, TResponseData = any>(
    currentLocation: MessageLocation,
    filters: MessagePathFilter,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,

    preferredRuntime?: typeof chrome | typeof browser
) {
    const messagePath: MessagePath = { source: MessageLocation.Options, destination: currentLocation, filters };
    onMessage(messagePath, callbackActions, preferredRuntime);
}

/** Listens for messages from the popup page */
export function onMessageFromPopup<TData = any, TResponseData = any>(
    currentLocation: MessageLocation,
    filters: MessagePathFilter,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,

    preferredRuntime?: typeof chrome | typeof browser
) {
    const messagePath: MessagePath = { source: MessageLocation.Popup, destination: currentLocation, filters };
    onMessage(messagePath, callbackActions, preferredRuntime);
}

/** Listens for messages from the content script */
export function onMessageFromContentScript<TData = any, TResponseData = any>(
    currentLocation: MessageLocation,
    filters: MessagePathFilter,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,

    preferredRuntime?: typeof chrome | typeof browser
) {
    const messagePath: MessagePath = { source: MessageLocation.Content, destination: currentLocation, filters };
    onMessage(messagePath, callbackActions, preferredRuntime);
}

/** Listens for messages from anywhere */
export function onMessageAnywhere<TData = any, TResponseData = any>(
    filters: MessagePathFilter,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,
    preferredRuntime?: typeof chrome | typeof browser
) {
    const messagePath: MessagePath = { filters };
    onMessage(messagePath, callbackActions, preferredRuntime);
}

/** Listens for messages from custom sources and locations */
export function onMessage<TData = any, TResponseData = any>(
    messagePath: MessagePath,
    callbackActions: { [actionType: string]: MessageReceivedCallback<TData, TResponseData> } | MessageReceivedCallback<TData, TResponseData>,
    preferredRuntime?: typeof chrome | typeof browser
): void {
    const runtimeType = preferredRuntime ?? globalThis.browser ?? globalThis.chrome;
    runtimeType.runtime.onMessage.addListener((message: Message<TData>, sender, sendResponse) => {
        if (checkPath(messagePath, message) && checkPathFilters(messagePath, message)) {
            let response;
            if (callbackActions instanceof Function) {
                response = callbackActions(message.data, sender);
            }
            if (!(callbackActions instanceof Function) && message.actionType && callbackActions[message.actionType]) {
                response = callbackActions[message.actionType](message.data, sender);
            }

            // if we use browser we want to return a promise, on chrome we still use sendResponse
            if (response instanceof Promise) {
                return response;
            }

            if (response) {
                if (checkBrowser()) {
                    return new Promise<TResponseData>((resolve) => {
                        resolve(response);
                    });
                }
                sendResponse(response);
                return true;
            }
        }
        if (runtimeType === browser && checkBrowser()) {
            return new Promise<void>((resolve) => {
                resolve(undefined);
            });
        }

        sendResponse(undefined);
        return true;
    });
}

/**
 * Checks if we configured any filters and if yes checks if the filters are the same.
 */
function checkPathFilters(messagePath: MessagePath, message: Message) {
    if (messagePath.filters) {
        const filters = Object.keys(messagePath.filters);
        const receivedFilters = message.filters ? Object.keys(message.filters) : [];
        return filters.every((x) => receivedFilters.includes(x) && messagePath?.filters && message?.filters && messagePath?.filters[x] === message?.filters[x]);
    }
    return true;
}

/**
 * Checks source and/or destination, if no path details are filled in then listens to everything
 */
function checkPath(messagePath: MessagePath, message: Message) {
    if (messagePath.source && messagePath.destination) {
        return messagePath?.source === message?.source && messagePath?.destination === message?.destination;
    }
    if (messagePath.source) {
        return messagePath?.source === message?.source;
    }
    if (messagePath.destination) {
        return messagePath?.destination === message?.destination;
    }
    return true;
}
