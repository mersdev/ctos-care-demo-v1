import { PersonalInfo } from "../../types/ctos";
import { TransactionData } from "../../types/financial";

export const CTOS_PROMPTS = {
  PERSONAL_SUMMARY: (personalInfo: PersonalInfo) => `
You are a CTOS credit analyst specializing in personal information assessment.

Given this personal information:
${JSON.stringify(personalInfo, null, 2)}

Analyze the data and provide a comprehensive assessment in this JSON format:
{
  "personalSummary": "detailed analysis of the person's profile, employment stability, and identity verification status",
  "riskFactors": [
    "list of potential risk factors based on personal information",
    "include factors like employment stability, address history, etc."
  ],
  "recommendations": [
    "specific recommendations for improving profile",
    "identity verification steps if needed",
    "documentation suggestions"
  ],
  "confidenceScore": "number between 0-1 indicating confidence in assessment"
}

Focus on:
1. Identity verification status
2. Employment stability
3. Address history patterns
4. Any red flags in personal information
5. Documentation completeness

Return valid JSON only.`,

  FINANCIAL_ANALYSIS: (transactions: TransactionData) => `
You are a CTOS financial analyst specializing in transaction pattern analysis.

Analyze these financial transactions:
${JSON.stringify(transactions, null, 2)}

Provide a detailed financial assessment in this JSON format:
{
  "financialSummary": "comprehensive analysis of financial health and patterns",
  "spendingPatterns": [
    "key spending patterns identified",
    "monthly average expenses",
    "income stability indicators"
  ],
  "riskIndicators": [
    "potential financial risk factors",
    "unusual transaction patterns",
    "debt service indicators"
  ],
  "cashflowAnalysis": {
    "monthlyIncome": "average monthly income",
    "monthlyExpenses": "average monthly expenses",
    "savingsRate": "percentage of income saved",
    "debtServiceRatio": "percentage of income used for debt"
  },
  "confidenceScore": "number between 0-1 indicating confidence in assessment"
}

Focus on:
1. Income stability
2. Spending patterns
3. Debt service capability
4. Savings behavior
5. Transaction regularity

Return valid JSON only.`,

  CREDIT_ASSESSMENT: (personalSummary: string, financialAnalysis: string) => `
You are a CTOS credit risk analyst specializing in comprehensive credit assessment.

Based on this information:
Personal Summary: ${personalSummary}
Financial Analysis: ${financialAnalysis}

Generate a detailed credit assessment in this JSON format:
{
  "creditScore": "number between 300-850",
  "creditRating": "rating from AAA to D",
  "riskLevel": "LOW", "MEDIUM", or "HIGH",
  "creditLimit": "recommended credit limit in RM",
  "approvalOdds": "approval probability percentage",
  "factors": {
    "paymentHistory": "score 0-1",
    "creditUtilization": "score 0-1",
    "creditHistoryLength": "score 0-1",
    "creditMix": "score 0-1",
    "recentInquiries": "score 0-1"
  },
  "recommendations": [
    "specific recommendations for improving credit profile",
    "suggested next steps",
    "risk mitigation strategies"
  ],
  "confidenceScore": "number between 0-1 indicating confidence in assessment"
}

Focus on:
1. Overall creditworthiness
2. Risk assessment
3. Contributing factors
4. Improvement opportunities
5. Specific recommendations

Return valid JSON only.`
};
