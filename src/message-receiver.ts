import { MessageLocation } from 'src/enums/message-location';

import { Message, MessagePath, MessagePathFilter, MessageReceivedCallback } from './interfaces/message.interface';

/** Listens for messages from the background script */
export function onMessageFromBackground(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback) {
    const messagePath: MessagePath = { source: MessageLocation.Background, destination: currentLocation, filters };
    onMessage(messagePath, callback);
}

/** Listens for messages from the options page */
export function onMessageFromOptions(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback) {
    const messagePath: MessagePath = { source: MessageLocation.Options, destination: currentLocation, filters };
    onMessage(messagePath, callback);
}

/** Listens for messages from the popup page */
export function onMessageFromPopup(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback) {
    const messagePath: MessagePath = { source: MessageLocation.Popup, destination: currentLocation, filters };
    onMessage(messagePath, callback);
}

/** Listens for messages from the content script */
export function onMessageFromContentScript(currentLocation: MessageLocation, filters: MessagePathFilter, callback: MessageReceivedCallback) {
    const messagePath: MessagePath = { source: MessageLocation.Content, destination: currentLocation, filters };
    onMessage(messagePath, callback);
}

/** Listens for messages from anywhere */
export function onMessageAnywhere(filters: MessagePathFilter, callback: MessageReceivedCallback) {
    const messagePath: MessagePath = { filters };
    onMessage(messagePath, callback);
}

/** Listens for messages from custom sources and locations */
export function onMessage(messagePath: MessagePath, callback: MessageReceivedCallback): void {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    runtimeType.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
        if (checkPath(messagePath, message) && checkFilters(messagePath, message)) {
            callback(message.data, sender, sendResponse);
        }
    });
}

/**
 * Checks if we configured any filters and if yes checks if the filters are the same.
 */
function checkFilters(messagePath: MessagePath, message: Message) {
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