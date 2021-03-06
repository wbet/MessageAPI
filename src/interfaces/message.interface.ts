import { MessageLocation } from 'src/enums/message-location';

export type SendMessageParams =
    | [message: Message, options?: MessageSendOptions | MessageTabsSendOptions]
    | [extensionId: string, message: any, options?: MessageSendOptions | MessageTabsSendOptions];
export interface MessageSendOptions extends chrome.runtime.MessageOptions {}
export interface MessageTabsSendOptions extends chrome.tabs.MessageSendOptions {}
export interface MessagePathFilter {
    [filterName: string]: string | number | boolean;
}

export interface Message extends MessagePath {
    data: any;
}

export interface MessagePath {
    source?: MessageLocation;
    destination?: MessageLocation;
    filter?: MessagePathFilter;
}

export interface MessageOptions {
    extensionId?: string;
    options?: MessageSendOptions | MessageTabsSendOptions;
}
