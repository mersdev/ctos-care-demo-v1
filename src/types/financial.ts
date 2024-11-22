export interface AccountHolder {
  age: number;
  occupation: string;
  location: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface TransactionData {
  account_holder: AccountHolder;
  transactions: Transaction[];
}

export interface FinancialMetrics {
  netWorth: number;
  incomeStability: {
    monthlyIncome: number;
  };
  budgetAnalysis: {
    fixedExpenses: number;
    variableExpenses: number;
    savingsRate: number;
  };
  emergencyFund: {
    coverageMonths: number;
  };
  debtManagement: {
    debtToIncomeRatio: number;
  };
  retirementSavings: {
    savingsRate: number;
  };
}

export interface GoalObjective {
  goal: string;
  steps: string[];
  expectedOutcome: string;
}

export interface TimeframedGoals {
  timeframe: string;
  objectives: GoalObjective[];
}

export interface AIRecommendations {
  netWorth: string;
  incomeStability: string;
  budgeting: string;
  emergencyFund: string;
  debtManagement: string;
  retirementSavings: string;
  insuranceCoverage: string;
  financialLiteracy: string;
  longTermGoals: string;
  behavioralAspects: string;
}

export interface AIGoals {
  shortTerm: TimeframedGoals;
  mediumTerm: TimeframedGoals;
  longTerm: TimeframedGoals;
}

export interface AIInsights {
  score: number;
  analysis: string;
  recommendations: AIRecommendations;
  goals: AIGoals;
}

export interface SankeyNode {
  id: string;
  nodeColor: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface FinancialHealthReportProps {
  transactionData: TransactionData;
  geminiApiKey: string;
}
