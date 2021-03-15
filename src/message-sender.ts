import { MessageLocation } from './enums/message-location';
import { Message, MessageOptions, MessagePathFilter, SendMessageParams } from './interfaces/message.interface';
import { callbackToPromise, checkBrowser, getCurrentTab } from './lib/helpers';

/** Sends message to the background script */
export function sendMessageToBackground<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Background, ...filters }, messageOptions);
}

/** Sends message to the options page */
export function sendMessageToOptions<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Options, ...filters }, messageOptions);
}

/** Sends message to the popup page */
export function sendMessageToPopup<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Popup, ...filters }, messageOptions);
}

/** Sends message to a specific content script */
export function sendMessageToContentScript<TData = any, TResponseData = any>(tabId: number, data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Content, ...filters }, messageOptions, tabId);
}

/** Sends message to a the currently active webpage/content script */
export function sendMessageToCurrentWebPage<TData = any, TResponseData = any>(data: TData, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return getCurrentTab().then((x) => sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Content, ...filters }, messageOptions, x.id));
}

/** Sends message to a custom location */
export function sendMessageTo<TData = any, TResponseData = any>(message: Message<TData>, messageOptions?: MessageOptions, tabId?: number) {
    if (messageOptions?.extensionId) {
        return sendMessage<TResponseData>(messageOptions.extensionId, message, messageOptions?.options);
    }

    if (tabId) {
        return sendMessageFromTab<TResponseData>(tabId, message, messageOptions?.options);
    }

    return sendMessage<TResponseData>(message, messageOptions?.options);
}

function sendMessage<TResponseData = any>(...args: SendMessageParams): Promise<TResponseData> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkBrowser()) {
        return runtimeType.runtime.sendMessage(args);
    }
    return callbackToPromise(runtimeType.runtime.sendMessage, args);
}

function sendMessageFromTab<TResponseData = any>(tabId: number, ...args: SendMessageParams): Promise<TResponseData> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkBrowser()) {
        return runtimeType.tabs.sendMessage(tabId, args);
    }
    return callbackToPromise(runtimeType.tabs.sendMessage, [tabId, ...args]);
}
