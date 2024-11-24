export interface PersonalInfo {
  name: string;
  icNo: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
}

export interface LegalRecord {
  caseNumber: string;
  court: string;
  filingDate: string;
  status: string;
  capacity: "personal" | "non-personal";
  type: "defendant" | "plaintiff";
  description: string;
}

export interface DirectorshipInfo {
  companyName: string;
  incorporationDate: string;
  position: string;
  appointedDate: string;
  resignedDate?: string;
  profitAfterTax?: number;
  profitableStatus?: boolean;
  shareholding?: number;
}

export interface CreditFacility {
  status: string;
  capacity: string;
  lenderType: string;
  facilityType: string;
  outstandingBalance: number;
  limit: number;
  repaymentTerm: string;
  collateralType: string;
  conductOfAccount: string;
  legalStatus: string;
}

export interface CCRISSummary {
  outstandingCredit: number;
  specialAttentionAccounts: number;
  creditApplications: number;
}

export interface CTOSSnapshot {
  idVerification: boolean;
  bankruptcyStatus: boolean;
  activeLegalRecords: number;
  hasLegalRecords: boolean;
  specialAttentionAccounts: number;
  hasDishonouredCheques: boolean;
  outstandingFacilities: number;
  creditApplications12Months: number;
  hasTradeReferees: boolean;
}

export interface CTOSScore {
  score: number;
  factors: {
    paymentHistory: number;
    outstandingDebt: number;
    creditUtilization: number;
    creditHistoryLength: number;
    recentInquiries: number;
  };
  riskCategory: "Low" | "Medium" | "High";
}

export interface CTOSLitigationIndex {
  index: number;
  activeCases: number;
  resolvedCases: number;
  totalClaims: number;
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
}

export interface TradeReferee {
  companyName: string;
  relationship: string;
  creditLimit: number;
  paymentBehavior: string;
  yearsOfRelationship: number;
}

export interface CTOSReport {
  analysis: Array<{
    section: string;
    confidence: number;
    reasoning: string;
  }>;
  bankingHistory: {
    ccrisSummary: CCRISSummary;
    facilities: CreditFacility[];
    earliestFacility: string;
    securedFacilities: number;
    unsecuredFacilities: number;
  };
  confidence: number;
  directorships: DirectorshipInfo[];
  isVerified: boolean;
  legalCases: {
    asDefendant: LegalRecord[];
    asPlaintiff: LegalRecord[];
  };
  litigationIndex: CTOSLitigationIndex;
  personalInfo: PersonalInfo;
  reportDate: string;
  score: CTOSScore;
  snapshot: CTOSSnapshot;
  tradeReferees: TradeReferee[];
}

export type TransactionData = {
  transactions: Array<{
    date: string;
    amount: number;
    description: string;
    type: "credit" | "debit";
    category?: string;
  }>;
};
