import { storageConfig, storageHistoryConfig } from "~store";
import { AUTO_CLOSE_TAB_RULES, AUTO_CLOSE_TAB_RULES_HISTORY } from "./const";
import { nanoid } from "nanoid";
console.log("background started")
let rules: RuleType[];
let currentTab: chrome.tabs.Tab;


function matchDomain(rule: RuleType, domain: string): boolean {
  if (!rule.switchOn) {
    return false;
  }
  let matchExpression = rule.match;
  // 如果使用正则表达式，则其他规则失效
  if (rule.matchType.includes('regular')) {
    try {
      let regExp = new RegExp(matchExpression);
      return regExp.test(domain);
    } catch (e) {
      console.error('Invalid regular expression:', matchExpression);
      return false;
    }
  }

  // 如果不区分大小写，则统一转换为小写
  if (!rule.matchType.includes('case')) {
    matchExpression = matchExpression.toLowerCase();
    domain = domain.toLowerCase();
  }
  let matchResult = domain.includes(matchExpression);

  // 如果要匹配整个单词
  if (rule.matchType.includes('wholeWord')) {
    matchResult = rule.match === domain;
  }

  return matchResult;
}
function calcMin(unit, time) {
  switch (unit) {
    case 'min':
      return Number(time);
    case 'hour':
      return time * 60;
    case 'day':
      return time * 60 * 24;
  }
}
// const domain = new URL(tab.url).hostname;

async function createAlarmForTab(tab: chrome.tabs.Tab, forOneTab: boolean = false) {
  try {
    if (forOneTab) {
      if (!tab.pendingUrl || !tab.id || tab.pinned) {
        throw new Error("Tab has invalid properties or is pinned.");
      }
    } else {
      if (!tab.url || !tab.id || tab.pinned) {
        throw new Error("Tab has invalid properties or is pinned.");
      }
    }
    const domain = forOneTab ? tab.pendingUrl : tab.url;
    const rule = rules?.find((r) => matchDomain(r, domain));
    if (rule) {
      await chrome.alarms.create(String(tab.id), { delayInMinutes: Number(calcMin(rule.unit, rule.time)) });
      console.log("Alarm created for tab ID:", tab.id);
    }
  } catch (error) {
    console.error("Failed to create an alarm for tab ID:", tab?.id, error);
  }
}


async function closeTab(alarm: { name: string }) {
  try {
    const tabId = Number(alarm.name);
    const tabs = await chrome.tabs.query({});
    const tab = tabs.find((i) => i.id === tabId);
    if (!tab) throw new Error("Tab not found.");
    
    await chrome.tabs.remove(tabId);
    console.log("Tab removed successfully:", tabId);

    const data = (await storageHistoryConfig.instance.get(storageHistoryConfig.key)) || [];
    const newData: HistoryRuleType = {
      id: nanoid(18),
      title: tab.title,
      url: tab.url,
      icon: tab.favIconUrl,
      closeTime: new Date().toISOString(),
    };
    await storageHistoryConfig.instance.set(storageHistoryConfig.key, [newData, ...data]);
  } catch (error) {
    console.error("Failed to close tab on alarm:", error);
  }
}
const main = async () => {
  const data = await storageConfig.instance.get(storageConfig.key)
  rules = data as any;
  await storageHistoryConfig.instance.set(storageHistoryConfig.key, [])
  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTabs.length > 0) {
    currentTab = activeTabs[0];
  }
  await checkAll()
  setTimeout(async () => {
    // 获取当前打开的tab，把alarm删除掉,处理重新打开的情况
    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTabs.length > 0) {
      activeTabs[0].id && await chrome.alarms.clear(activeTabs[0].id.toString())
    }
  }, 1000)
}

main()
async function checkAll() {
  await chrome.alarms.clearAll()
  if (!rules || rules.length === 0) return;
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
      console.log('可恶，创建了--2（checkAll）')

      await chrome.alarms.create(String(tab.id), { delayInMinutes });
    }
  }
  const data = await storageHistoryConfig.instance.get(storageHistoryConfig.key) || []
  chrome.action.setBadgeText({ text: data.length === 0 ? "" : data.length.toString() });

}
storageConfig.instance.watch({
  [AUTO_CLOSE_TAB_RULES]: async (c) => {
    rules = c.newValue;
    await checkAll()
  }
});
storageHistoryConfig.instance.watch({
  [AUTO_CLOSE_TAB_RULES_HISTORY]: async (c) => {
    chrome.action.setBadgeText({ text: c.newValue.length === 0 ? "" : c.newValue.length.toString() });
  }
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.active) {
      currentTab = tab;
    }
  }
});
chrome.alarms.onAlarm.addListener(closeTab);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('chrome.tabs.onActivated', activeInfo)
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.pinned) return;
  console.log('chrome.tabs.onActivated activatedInfo:', activeInfo);
  await chrome.alarms.clear(String(activeInfo.tabId));
  if (currentTab) {
    console.log('纳尼？？', currentTab)
    await createAlarmForTab(currentTab);
  }
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    currentTab = tab;
  });
});

chrome.tabs.onRemoved.addListener(async function (tabId) {
  await chrome.alarms.clear(String(tabId));
});
chrome.tabs.onCreated.addListener(async (tab) => {
  console.log('chrome.tabs.onCreated', tab)
  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('activeTabs', activeTabs)
  const currentId = activeTabs.length > 0 ? activeTabs[0].id : null;
  console.log('tab.id', tab.id)
  console.log('currentId', currentId)
  if (tab.id !== currentId) {
    console.log('tab', tab)
    await createAlarmForTab(tab, true);
  }
})

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('details', details)
  if (details.reason === "install") {
    console.log("扩展已安装。");
    // 执行一些安装时需要进行的初始化操作
    // 比如设置默认的本地存储值
    await storageConfig.instance.set(storageConfig.key, [{
      id: nanoid(18),
      title: "All Pages",
      time: 1,
      match: ".",
      unit: "day",
      matchType: ["regular"],
      switchOn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }])
  } else if (details.reason === "update") {
    console.log("扩展已更新。");
    console.log('details.previousVersion', details.previousVersion)
    // 如果之前规则的time是字符串，都改成数值类型
    const rules = await storageConfig.instance.get(storageConfig.key)
    if (Array.isArray(rules)) {
      rules.forEach(rule => {
        if (typeof rule.time === 'string') {
          rule.time = Number(rule.time);
        }
      });
      await storageConfig.instance.set(storageConfig.key, rules)
    }
  }
});

// chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
//   if (details.frameId === 0) { // 0表示顶级框架，即标签页本身
//     chrome.tabs.query({}, function (tabs) {
//       var existingTab = tabs.find(tab => tab.url === details.url);
//       if (existingTab) {
//         // 如果存在匹配的标签页，切换到该标签页
//         chrome.tabs.update(existingTab.id, { active: true });

//         // 关闭当前标签页（如果不是初始的空白页）
//         if (details.tabId !== existingTab.id) {
//           chrome.tabs.remove(details.tabId);
//         }
//       }
//     });
//   }
// }, { url: [{ urlMatches: 'https?://*/*' }] });
