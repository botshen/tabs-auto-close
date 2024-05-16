import { storageConfig } from "~store";
import { AUTO_CLOSE_TAB_RULES } from "./const";
console.log("background started")
let rules: RuleType[];
let currentTab: chrome.tabs.Tab;

function matchDomain(rule: RuleType, domain: string): boolean {
  let matchExpression = rule.match;
  // console.log('domain', domain)
  // console.log('matchExpression', matchExpression)
  // 如果使用正则表达式，则其他规则失效
  if (rule.matchType.includes('regular')) {
    try {
      let regExp = new RegExp(matchExpression);
      // console.log('正则匹配的结果是', regExp.test(domain))
      return regExp.test(domain);
    } catch (e) {
      console.error('Invalid regular expression:', matchExpression);
      return false;
    }
  }

  // 如果不区分大小写，则统一转换为小写
  if (!rule.matchType.includes('case')) {
    // console.log('不区分大小写')
    matchExpression = matchExpression.toLowerCase();
    domain = domain.toLowerCase();
  }
  // console.log('matchExpression', matchExpression)
  // console.log('domain', domain)
  let matchResult = domain.includes(matchExpression);

  // 如果要匹配整个单词
  if (rule.matchType.includes('wholeWord')) {
    // console.log('=======')
    // console.log('rule.match', rule.match)
    // console.log('domain', domain)
    // console.log('rule.match === domain', rule.match === domain)
    matchResult = rule.match === domain;
  }

  return matchResult;
}
function calcMin(unit, time) {
  switch (unit) {
    case 'min':
      return time;
    case 'hour':
      return time * 60;
    case 'day':
      return time * 60 * 24;
  }
}
async function createAlarmForTab(tab: chrome.tabs.Tab) {
  if (!tab.url || !tab.id || tab.pinned) {
    return;
  }
  // const domain = new URL(tab.url).hostname;
  const rule = rules?.find((r) => matchDomain(r, tab.url));

  if (rule) {
    await chrome.alarms.create(String(tab.id), { delayInMinutes: Number(calcMin(rule.unit, rule.time)) });
  }
}
function closeTab(alarm: { name: string; }) {
  const tabId = Number(alarm.name);
  chrome.tabs.query({}, (tabs) => {
    if (tabs.find(i => i.id === tabId)) {
      chrome.tabs.remove(tabId, () => {
        // console.log(`Closed tab id ${tabId} due to inactivity.`);
      });
    }
  });

}
const main = async () => {
  const data = await storageConfig.instance.get(storageConfig.key)
  rules = data as any;
  // console.log('rules', rules)
  // console.log('chrome.alarms.getAll()', await chrome.alarms.getAll())

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      currentTab = tabs[0];
      // console.log('Initial active tab:', currentTab);
    } else {
      // console.log('No active tab found during initialization.');
    }
  });
  await chrome.alarms.clearAll()
}

main()
storageConfig.instance.watch({
  [AUTO_CLOSE_TAB_RULES]: async (c) => {
    rules = c.newValue;

    // 获取当前活跃的tab，以便在检查时跳过
    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTabId = activeTabs.length > 0 ? activeTabs[0].id : null;

    // 检查所有tab，跳过当前活跃的tab
    const allTabs = await chrome.tabs.query({});
    for (const tab of allTabs) {
      if (!tab.url || tab.pinned || tab.id === activeTabId) {
        // 如果tab没有URL（比如一个新tab），被钉住，或者是当前活跃的tab，则跳过
        continue;
      }
      const matchedRule = rules.find((r) => matchDomain(r, (tab.url)));
      if (matchedRule) {
        // 找到匹配的规则，为这个tab创建一个alarm
        const delayInMinutes = calcMin(matchedRule.unit, matchedRule.time);
        await chrome.alarms.create(String(tab.id), { delayInMinutes });
      }
    }
  }
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // console.log('tab---onUpdated tab')
    if (tab.active) {
      currentTab = tab;
    }
  }
});
chrome.alarms.onAlarm.addListener(closeTab);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await chrome.alarms.clear(String(activeInfo.tabId));
  if (currentTab) {
    await createAlarmForTab(currentTab);
  }
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    currentTab = tab;
  });
});

chrome.tabs.onRemoved.addListener(async function (tabId) {
  await chrome.alarms.clear(String(tabId));
});

