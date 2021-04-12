import { MessageLocation } from '../enums/message-location';

export type SendMessageParams = [message: Message, options?: MessageSendOptions | MessageTabsSendOptions] | [extensionId: string, message: any, options?: MessageSendOptions | MessageTabsSendOptions];
export interface MessageSendOptions extends chrome.runtime.MessageOptions {}
export interface MessageTabsSendOptions extends chrome.tabs.MessageSendOptions {}
export interface Message<TData = any> extends MessagePath {
    data: TData;
}

export interface MessagePath {
    source?: MessageLocation;
    destination?: MessageLocation;
    filters?: MessagePathFilter;
}
export interface MessagePathFilter {
    [filterName: string]: string | number | boolean;
}

export interface MessageOptions {
    extensionId?: string;
    options?: MessageSendOptions | MessageTabsSendOptions;
}

export type MessageReceivedCallback<TData = any, TResponseData = any> = (data: TData, sender: chrome.runtime.MessageSender | browser.runtime.MessageSender) => TResponseData | Promise<TResponseData> | undefined;
