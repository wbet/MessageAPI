import { MessageLocation } from './enums/message-location';
import { Message, MessageOptions, MessagePathFilter, SendMessageParams } from './interfaces/message.interface';
import { checkBrowser, getCurrentTab, tailCallbackToPromise } from './lib/helpers';

/** Sends message to the background script */
export function sendMessageToBackground<TData = any, TResponseData = any>(
    data: TData,
    source: MessageLocation,
    messageOptions?: MessageOptions,
    filters?: MessagePathFilter,
    preferredRuntime?: typeof chrome | typeof browser
) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Background, ...filters }, messageOptions, undefined, preferredRuntime);
}

/** Sends message to the options page */
export function sendMessageToOptions<TData = any, TResponseData = any>(
    data: TData,
    source: MessageLocation,
    messageOptions?: MessageOptions,
    filters?: MessagePathFilter,
    preferredRuntime?: typeof chrome | typeof browser
) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Options, ...filters }, messageOptions, undefined, preferredRuntime);
}

/** Sends message to the popup page */
export function sendMessageToPopup<TData = any, TResponseData = any>(
    data: TData,
    source: MessageLocation,
    messageOptions?: MessageOptions,
    filters?: MessagePathFilter,
    preferredRuntime?: typeof chrome | typeof browser
) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Popup, ...filters }, messageOptions, undefined, preferredRuntime);
}

/** Sends message to a specific content script */
export function sendMessageToContentScript<TData = any, TResponseData = any>(
    tabId: number,
    data: TData,
    source: MessageLocation,
    messageOptions?: MessageOptions,
    filters?: MessagePathFilter,
    preferredRuntime?: typeof chrome | typeof browser
) {
    return sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Content, ...filters }, messageOptions, tabId, preferredRuntime);
}

/** Sends message to a the currently active webpage/content script */
export function sendMessageToCurrentWebPage<TData = any, TResponseData = any>(
    data: TData,
    source: MessageLocation,
    messageOptions?: MessageOptions,
    filters?: MessagePathFilter,
    preferredRuntime?: typeof chrome | typeof browser
) {
    return getCurrentTab().then((x) => sendMessageTo<TData, TResponseData>({ data, source, destination: MessageLocation.Content, ...filters }, messageOptions, x.id, preferredRuntime));
}

/** Sends message to a custom location */
export function sendMessageTo<TData = any, TResponseData = any>(message: Message<TData>, messageOptions?: MessageOptions, tabId?: number, preferredRuntime?: typeof chrome | typeof browser) {
    const runtimeType = preferredRuntime ?? globalThis.browser ?? globalThis.chrome;

    if (messageOptions?.extensionId) {
        return sendMessage<TResponseData>(runtimeType, messageOptions.extensionId, message, messageOptions?.options);
    }

    if (tabId) {
        return sendMessageFromTab<TResponseData>(runtimeType, tabId, message, messageOptions?.options);
    }

    return sendMessage<TResponseData>(runtimeType, message, messageOptions?.options);
}

function sendMessage<TResponseData = any>(runtimeType: typeof chrome | typeof browser, ...args: SendMessageParams): Promise<TResponseData> | Promise<undefined> {
    if (checkBrowser()) {
        // @ts-ignore
        return (runtimeType as typeof browser).runtime.sendMessage(...args);
    }
    return tailCallbackToPromise(runtimeType.runtime.sendMessage, args);
}

function sendMessageFromTab<TResponseData = any>(runtimeType: typeof chrome | typeof browser, tabId: number, ...args: SendMessageParams): Promise<TResponseData> | Promise<undefined> {
    if (checkBrowser()) {
        // @ts-ignore
        return (runtimeType as typeof browser).tabs.sendMessage(tabId, ...args);
    }
    return tailCallbackToPromise(runtimeType.tabs.sendMessage, [tabId, ...args]);
}
