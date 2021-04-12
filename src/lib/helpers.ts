/** @internal */
export function tailCallbackToPromise(func: (...args: any[]) => void, args: any[]): Promise<any> {
    return new Promise((resolve, error) => {
        try {
            func(...args, (...results: any) => {
                if (results.length === 1) {
                    resolve(results[0]);
                }
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
    const query = { active: true, currentWindow: true };
    const tabs = checkChrome() ? ((await tailCallbackToPromise(runtimeType.tabs.query, [query])) as chrome.tabs.Tab[]) : await runtimeType.tabs.query(query);
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
