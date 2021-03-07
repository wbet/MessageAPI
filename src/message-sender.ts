import { MessageLocation } from './enums/message-location';
import { Message, MessageOptions, MessagePath, MessagePathFilter, SendMessageParams } from './interfaces/message.interface';
import { callbackToPromise, checkChrome, getCurrentTab } from './lib/helpers';

/** Sends message to the background script */
export function sendMessageToBackground<T = any>(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<T>(message, { source, destination: MessageLocation.Background, ...filters }, messageOptions);
}

/** Sends message to the options page */
export function sendMessageToOptions<T = any>(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<T>(message, { source, destination: MessageLocation.Options, ...filters }, messageOptions);
}

/** Sends message to the popup page */
export function sendMessageToPopup<T = any>(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<T>(message, { source, destination: MessageLocation.Popup, ...filters }, messageOptions);
}

/** Sends message to a specific content script */
export function sendMessageToContentScript<T = any>(tabId: number, message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<T>(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, tabId);
}

/** Sends message to a the currently active webpage/content script */
export async function sendMessageToCurrentWebPage<T = any>(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<T>(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, (await getCurrentTab()).id);
}

/** Sends message to a custom location */
export function sendMessageTo<T = any>(message: Message, path: MessagePath, messageOptions?: MessageOptions, tabId?: number) {
    let messageToSend = Object.assign(message, path);
    if (messageOptions?.extensionId) {
        return sendMessage<T>(messageOptions.extensionId, messageToSend, messageOptions?.options);
    }

    if (tabId) {
        return sendMessageFromTab<T>(tabId, messageToSend, messageOptions?.options);
    }

    return sendMessage<T>(messageToSend, messageOptions?.options);
}

function sendMessage<T = any>(...args: SendMessageParams): Promise<T> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.runtime.sendMessage, args);
    }
    return runtimeType.runtime.sendMessage(args);
}

function sendMessageFromTab<T = any>(tabId: number, ...args: SendMessageParams): Promise<T> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.tabs.sendMessage, [tabId, ...args]);
    }
    return runtimeType.tabs.sendMessage(tabId, args);
}
