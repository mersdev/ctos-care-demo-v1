import { GoogleGenerativeAI } from "@google/generative-ai";
import { FinancialMetrics } from '../types/financial';

export interface AIFinancialInsights {
  score: number;
  analysis: string;
  recommendations: {
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
  };
  goals: {
    shortTerm: {
      timeframe: string;
      objectives: {
        goal: string;
        steps: string[];
        expectedOutcome: string;
      }[];
    };
    mediumTerm: {
      timeframe: string;
      objectives: {
        goal: string;
        steps: string[];
        expectedOutcome: string;
      }[];
    };
    longTerm: {
      timeframe: string;
      objectives: {
        goal: string;
        steps: string[];
        expectedOutcome: string;
      }[];
    };
  };
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  private async generatePrompt(metrics: FinancialMetrics): Promise<string> {
    return `You are a personal financial advisor. Analyze these metrics and provide a personalized financial health assessment. Consider that this person is a 25-year-old tech entrepreneur in Kuala Lumpur with multiple income streams. Return ONLY a JSON object with no additional text, markdown formatting, or code blocks.

      Financial Metrics:
      - Net Worth: RM${metrics.netWorth}
      - Monthly Income: RM${metrics.incomeStability.monthlyIncome}
      - Fixed Expenses: RM${metrics.budgetAnalysis.fixedExpenses}
      - Variable Expenses: RM${metrics.budgetAnalysis.variableExpenses}
      - Savings Rate: ${metrics.budgetAnalysis.savingsRate}%
      - Emergency Fund Coverage: ${metrics.emergencyFund.coverageMonths} months
      - Debt-to-Income Ratio: ${metrics.debtManagement.debtToIncomeRatio}%
      - Retirement Savings Rate: ${metrics.retirementSavings.savingsRate}%

      Income Sources:
      - Tech Startup Revenue
      - Software Consultancy
      - Senior Software Engineer Salary
      - Real Estate Rental Income
      - Investment Property Income
      - Stock Portfolio Dividends
      - Tech Patent Royalties
      - Tech Course Revenue

      The response must be a valid JSON object with this exact structure:
      {
        "score": <number between 0-100>,
        "analysis": "<comprehensive analysis considering the person's age, location, and career>",
        "recommendations": {
          "netWorth": "<personalized recommendation based on tech industry and entrepreneurship>",
          "incomeStability": "<advice on balancing multiple income streams>",
          "budgeting": "<specific budgeting advice for high-income tech professional>",
          "emergencyFund": "<recommendation considering startup risks>",
          "debtManagement": "<debt strategy advice>",
          "retirementSavings": "<early retirement planning advice>",
          "insuranceCoverage": "<insurance recommendations for tech entrepreneur>",
          "financialLiteracy": "<continuous learning recommendations>",
          "longTermGoals": "<wealth building strategies>",
          "behavioralAspects": "<mindset and behavior recommendations>"
        },
        "goals": {
          "shortTerm": {
            "timeframe": "10 days",
            "objectives": [
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              },
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              }
            ]
          },
          "mediumTerm": {
            "timeframe": "3 months",
            "objectives": [
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              },
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              }
            ]
          },
          "longTerm": {
            "timeframe": "1 year",
            "objectives": [
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              },
              {
                "goal": "<specific actionable goal>",
                "steps": ["<step 1>", "<step 2>", "<step 3>"],
                "expectedOutcome": "<measurable outcome>"
              }
            ]
          }
        }
      }`;
  }

  private cleanJsonResponse(text: string): string {
    // Remove any markdown code block indicators
    text = text.replace(/```(json|JSON)?/g, '').trim();
    // Remove any leading/trailing whitespace
    return text.trim();
  }

  public async generateInsights(metrics: FinancialMetrics): Promise<AIFinancialInsights> {
    try {
      const prompt = await this.generatePrompt(metrics);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text before parsing
      const cleanedText = this.cleanJsonResponse(text);
      
      try {
        return JSON.parse(cleanedText) as AIFinancialInsights;
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Received text:', cleanedText);
        throw new Error('Failed to parse AI response as JSON');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        score: 0,
        analysis: 'Unable to generate AI insights at this time.',
        recommendations: {
          netWorth: 'Analysis unavailable',
          incomeStability: 'Analysis unavailable',
          budgeting: 'Analysis unavailable',
          emergencyFund: 'Analysis unavailable',
          debtManagement: 'Analysis unavailable',
          retirementSavings: 'Analysis unavailable',
          insuranceCoverage: 'Analysis unavailable',
          financialLiteracy: 'Analysis unavailable',
          longTermGoals: 'Analysis unavailable',
          behavioralAspects: 'Analysis unavailable'
        },
        goals: {
          shortTerm: {
            timeframe: '',
            objectives: []
          },
          mediumTerm: {
            timeframe: '',
            objectives: []
          },
          longTerm: {
            timeframe: '',
            objectives: []
          }
        }
      };
    }
  }
}
