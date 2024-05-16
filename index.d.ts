type RuleType = {
  id: string;
  title: string;
  time: string;
  match: string;
  matchType: string[];
  createdAt: string;
  updatedAt: string;
  unit?: string;
}

type TabInfo = {
  lastVisited: number;
  domain: string;
  idleTime?: number;
};

