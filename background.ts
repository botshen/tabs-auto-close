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
async function createAlarmForTab(tab: chrome.tabs.Tab) {
  // console.log('createAlarmForTab', tab)
  if (!tab.url || !tab.id) {
    return;
  }
  // const domain = new URL(tab.url).hostname;
  const rule = rules.find((r) => matchDomain(r, tab.url));

  if (rule) {
    console.log('rule', rule.time)
    // console.log('匹配成功',)
    // console.log('rule', rule)
    // console.log('tab.url', tab.url)
    await chrome.alarms.create(String(tab.id), { delayInMinutes: Number(rule.time) / 60000 });
    // console.log('chrome.alarms.getAll()', await chrome.alarms.getAll())
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
  [AUTO_CLOSE_TAB_RULES]: (c) => {
    rules = c.newValue;
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
  // chrome.tabs.query({}, (tabs) => {
  //   console.log('tabs', tabs.map(i => i.url + i.id))
  // });
});

chrome.tabs.onRemoved.addListener(async function (tabId) {
  await chrome.alarms.clear(String(tabId));
});

