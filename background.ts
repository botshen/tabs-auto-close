import { AUTO_CLOSE_TAB_RULES } from "./const";
import { storageConfig } from "~store";

type TabInfo = {
  lastVisited: number;
  domain: string;
  idleTime?: number;
};

const tabTimes: Record<number, TabInfo> = {};
let currentTabId: number | null = null;
let rules: any[];
const updateCurrentTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    const now = Date.now(); // 获取当前时间
    tabs.forEach((tab) => {
      // 对每个tab进行处理
      if (tab.id) {
        const domain = new URL(tab.url || '').hostname; // 安全地读取URL，考虑到可能tab.url为空的情况
        tabTimes[tab.id] = { lastVisited: now, domain }; // 更新或设置tabTimes中的信息
      }
    });
    if (tabs.find(tab => tab.active)) {
      // 如果存在活动标签，则更新currentTabId
      currentTabId = tabs.find(tab => tab.active)?.id;
    }
  });
}
const main = async () => {
  const data = await storageConfig.instance.get(storageConfig.key) // "value"
  rules = data as any;
  updateCurrentTabs()
}

main()

chrome.tabs.onActivated.addListener((activeInfo) => {
  currentTabId = activeInfo.tabId;
  const now = Date.now();
  tabTimes[currentTabId] = { ...tabTimes[currentTabId], lastVisited: now };

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
  console.log('开始检查');
  const now = Date.now();
  const tabsToClose = [];

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const tabId = tab.id;
      const url = tab.url;
      const domain = new URL(url).hostname;
      console.log('domain',domain)
      if (!rules) return;
      const rule = rules.find(rule => domain.includes(rule.match));

      if (rule) {
        console.log('rule',rule)
        const tabInfo = tabTimes[tabId];
        console.log('tabInfo',tabInfo)
        const diffTime = now - tabInfo?.lastVisited
        console.log('diffTime',diffTime)
        if (tabId !== currentTabId && diffTime > parseInt(rule.time, 10)) {
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

setInterval(checkForIdleTabs, 5000);



storageConfig.instance.watch({
  [AUTO_CLOSE_TAB_RULES]: (c) => {
    rules = c.newValue;
    console.log(c.newValue)
  }
});

export { };
