import { MessageLocation } from 'src/enums/message-location';

export type SendMessageParams =
    | [message: Message, options?: MessageSendOptions | MessageTabsSendOptions]
    | [extensionId: string, message: any, options?: MessageSendOptions | MessageTabsSendOptions];
export interface MessageSendOptions extends chrome.runtime.MessageOptions {}
export interface MessageTabsSendOptions extends chrome.tabs.MessageSendOptions {}
export interface MessagePathFilter {
    [filterName: string]: string | number | boolean;
}

export interface Message<T = any> extends MessagePath {
    data: T;
}

export interface MessagePath {
    source?: MessageLocation;
    destination?: MessageLocation;
    filters?: MessagePathFilter;
}

export interface MessageOptions {
    extensionId?: string;
    options?: MessageSendOptions | MessageTabsSendOptions;
}

export type MessageReceivedCallback<T = any, U = any> = (
    data: T,
    sender?: chrome.runtime.MessageSender | browser.runtime.MessageSender,
    sendResponse?: (response?: U) => void
) => void;
