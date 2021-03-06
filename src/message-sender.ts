import { MessageLocation } from './enums/message-location';
import { Message, MessageOptions, MessagePath, MessagePathFilter, SendMessageParams } from './interfaces/message.interface';
import { callbackToPromise, checkChrome, getCurrentTab } from './lib/helpers';

export function sendMessageToBackground(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Background, ...filters }, messageOptions);
}
export function sendMessageToOptions(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Options, ...filters }, messageOptions);
}
export function sendMessageToPopup(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Popup, ...filters }, messageOptions);
}
export function sendMessageToContentScript(tabId: number, message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, tabId);
}

export async function sendMessageToCurrentWebPage(message: any, source: MessageLocation, messageOptions?: MessageOptions, filters?: MessagePathFilter) {
    return sendMessageTo(message, { source, destination: MessageLocation.Content, ...filters }, messageOptions, (await getCurrentTab()).id);
}

export function sendMessageTo(message: Message, path: MessagePath, messageOptions?: MessageOptions, tabId?: number): Promise<any> {
    let messageToSend = Object.assign(message, path);
    if (messageOptions?.extensionId) {
        return sendMessage(messageOptions.extensionId, messageToSend, messageOptions?.options);
    }

    if (tabId) {
        return sendMessageFromTab(tabId, messageToSend, messageOptions?.options);
    }

    return sendMessage(messageToSend, messageOptions?.options);
}

export function sendMessage(...args: SendMessageParams): Promise<any> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.runtime.sendMessage, args);
    }
    return runtimeType.runtime.sendMessage(args);
}

export function sendMessageFromTab(tabId: number, ...args: SendMessageParams): Promise<any> {
    const runtimeType = globalThis.browser ?? globalThis.chrome;
    if (checkChrome()) {
        return callbackToPromise(runtimeType.tabs.sendMessage, [tabId, ...args]);
    }
    return runtimeType.tabs.sendMessage(tabId, args);
}
