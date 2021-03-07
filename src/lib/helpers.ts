/** @internal */
export async function promiseToCallback(promise: Promise<any>, callback: (...args: any) => void) {
    const result = await promise;
    return callback(result);
}

/** @internal */
export function callbackToPromise(func: (...args: any[]) => void, args: any[]): Promise<any> {
    return new Promise((resolve, error) => {
        try {
            func(...args, (...results: any) => {
                resolve(results);
            });
        } catch (e) {
            error(e);
        }
    });
}

/** @internal */
export function checkChrome() {
    return !!globalThis.chrome;
}

/** @internal */
export function checkBrowser() {
    return !!globalThis.browser;
}

/** @internal */
export async function getCurrentTab() {
    const runtimeType = globalThis.browser ?? globalThis.chrome;

    const tabs = checkChrome()
        ? ((await callbackToPromise(runtimeType.tabs.query, [{ active: true, currentWindow: true }])) as chrome.tabs.Tab[])
        : await runtimeType.tabs.query({ active: true, currentWindow: true });

    return tabs[0];
}

// export function getSource() {
//     const availableNamespace = checkChrome ? globalThis.chrome : globalThis.browser;

//     if (
//         availableNamespace &&
//         availableNamespace.extension &&
//         availableNamespace.extension.getBackgroundPage &&
//         availableNamespace.extension.getBackgroundPage() === window
//     ) {
//         return Message.Background;
//     } else if (
//         availableNamespace &&
//         availableNamespace.extension &&
//         availableNamespace.extension.getBackgroundPage &&
//         availableNamespace.extension.getBackgroundPage() !== window
//     ) {
//         return Message.Popup;
//     } else if (availableNamespace.runtime && availableNamespace.runtime.openOptionsPage && availableNamespace.runtime.openOptionsPage() === window) {
//     } else if (!availableNamespace || !availableNamespace.runtime || !availableNamespace.runtime.onMessage) {
//         return Message.Web;
//     } else {
//         return Message.Content;
//     }
// }
