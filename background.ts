import { storageConfig } from "~store";

// background.ts
type TabInfo = {
  lastVisited: number;
  domain: string;
  idleTime?: number; // 为每个tab设置独立的闲置时间
};



const tabTimes: Record<number, TabInfo> = {};
let currentTabId: number | null = null;
let matchPattern: string; // Default to all URLs

// 设置默认的空闲时间，单位是毫秒
let defaultIdleTime = 5000;
// chrome.storage.local.get(['closeTabsList'], function (result) {
//   if (result.closeTabsList) {
//     // todo
//   }
// });


const main = async () => {
  const data = await storageConfig.instance.get(storageConfig.key) // "value"
  console.log('data', data)
}

main()

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('activeInfo', activeInfo)

  currentTabId = activeInfo.tabId;
  const now = Date.now();

  // 更新新激活选项卡的最后访问时间
  tabTimes[currentTabId] = { ...tabTimes[currentTabId], lastVisited: now };

  //更新其他标签页的最后访问时间，以防止立即关闭
  for (const tabIdStr in tabTimes) {
    const tabId = Number(tabIdStr);
    if (tabId !== currentTabId) {
      tabTimes[tabId] = { ...tabTimes[tabId], lastVisited: now };
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabTimes[tabId];
});

function checkForIdleTabs() {
  console.log('开始检查' + "=================" + Date.now());
  console.log('tabTimes', tabTimes);
  console.log(Object.keys(tabTimes).length, '有多少tab')
  const now = Date.now();
  const tabsToClose = [];

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const tabId = tab.id;
      const url = tab.url;
      // 假设可以从URL中获取域名
      const domain = new URL(url).hostname;
      console.log('domain', domain)

      // 需要关闭的域名列表
      const domainsToClose = [matchPattern];

      if (domainsToClose.includes(domain)) {
        const tabInfo = tabTimes[tabId];
        const diffTime = now - tabInfo.lastVisited
        console.log('冷静时间：', diffTime)
        if (tabId !== currentTabId && diffTime > defaultIdleTime) {
          tabsToClose.push(tabId);
        }
      }
    });

    tabsToClose.forEach((tabId) => {
      chrome.tabs.remove(tabId, () => {
        console.log(`Closed tab id ${tabId} due to inactivity.`);
        delete tabTimes[tabId];
      });
    });
  });
}


// setInterval(checkForIdleTabs, 5000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.idleTime !== undefined) {
    defaultIdleTime = request.idleTime;
    chrome.storage.local.set({ idleTime: defaultIdleTime });
  }
  if (request.matchPattern) {
    matchPattern = request.matchPattern;
    chrome.storage.local.set({ matchPattern });
  }
});

// Initialize tabTimes with idleTime on browser startup
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    const url = tab.url;
    // 假设可以从URL中获取域名
    const domain = new URL(url).hostname;
    console.log('domain', domain)
    tabTimes[tab.id] = { lastVisited: Date.now(), domain };
  });
});

export { };

