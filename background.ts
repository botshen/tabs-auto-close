import { AUTO_CLOSE_TAB_RULES } from "./const";
import { storageConfig } from "~store";

const tabTimes: Record<number, TabInfo> = {};
let currentTabId: number | null = null;
let rules: RuleType[];
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
function matchDomain(rule: RuleType, domain: string): boolean {
  let matchExpression = rule.match;
  console.log('domain', domain)
  console.log('matchExpression', matchExpression)
  // 如果使用正则表达式，则其他规则失效
  if (rule.matchType.includes('regular')) {
    try {
      let regExp = new RegExp(matchExpression);
      console.log('正则匹配的结果是', regExp.test(domain))
      return regExp.test(domain);
    } catch (e) {
      console.error('Invalid regular expression:', matchExpression);
      return false;
    }
  }

  // 如果不区分大小写，则统一转换为小写
  if (!rule.matchType.includes('case')) {
    console.log('不区分大小写')
    matchExpression = matchExpression.toLowerCase();
    domain = domain.toLowerCase();
  }
  console.log('matchExpression', matchExpression)
  console.log('domain', domain)
  let matchResult = domain.includes(matchExpression);

  // 如果要匹配整个单词
  if (rule.matchType.includes('wholeWord')) {
    console.log('=======')
    console.log('rule.match', rule.match)
    console.log('domain', domain)
    console.log('rule.match === domain', rule.match === domain)
    matchResult = rule.match === domain;
  }

  return matchResult;
}
function checkForIdleTabs() {
  if (!rules || rules.length === 0) return;
  console.log('===========开始检查==========');
  const now = Date.now();
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const tabId = tab.id;
      const url = tab.url;
      const rule = rules.find(rule => matchDomain(rule, url));
      if (!rule) {
        console.log('rule,匹配失败')
        return;
      }
      console.log('rule,匹配成功', rule, tabId)
      const tabInfo = tabTimes[tabId];
      console.log('tabInfo', tabInfo)
      const diffTime = now - tabInfo?.lastVisited
      console.log('diffTime', diffTime)
      console.log('rule.time', rule.time)
      const configTimeout = Number(rule.time)
      console.log('configTimeout', configTimeout)
      if (tabId !== currentTabId && diffTime > configTimeout) {
        chrome.tabs.remove(tabId, () => {
          console.log(`Closed tab id ${tabId} due to inactivity.`);
          delete tabTimes[tabId];
        });
      }
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
