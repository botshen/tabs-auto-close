type RuleType = {
  id: string;
  title: string;
  time: number;
  match: string;
  matchType: string[];
  createdAt: string;
  updatedAt: string;
  unit: string;
  switchOn: boolean;
}

type TabInfo = {
  lastVisited: number;
  domain: string;
  idleTime?: number;
};

type HistoryRuleType = {
  id: string;
  icon: string;
  url: string;
  title: string;
  closeTime: string; 
}
