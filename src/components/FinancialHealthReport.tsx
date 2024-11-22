import React, { useEffect, useState } from 'react';
import { FinancialMetrics, TransactionData, AIInsights, SankeyData, Transaction } from '../types/financial';
import { FinancialAnalysisService } from '../services/financialAnalysis';
import { GeminiAIService } from '../services/geminiAI';
import { ResponsiveSankey } from '@nivo/sankey';
import { CurrencyDollarIcon, ChartBarIcon, CreditCardIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface Props {
  transactionData: TransactionData;
  geminiApiKey: string;
}

export const FinancialHealthReport: React.FC<Props> = ({ transactionData, geminiApiKey }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sankeyData, setSankeyData] = useState<SankeyData>({ nodes: [], links: [] });

  useEffect(() => {
    generateReport();
  }, [transactionData, geminiApiKey]);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Generate financial metrics
      const analysisService = new FinancialAnalysisService(transactionData);
      const financialMetrics = analysisService.generateMetrics();
      setMetrics(financialMetrics);

      // Generate AI insights
      const aiService = new GeminiAIService(geminiApiKey);
      const insights = await aiService.generateInsights(financialMetrics);
      setAiInsights(insights);

      // Prepare Sankey data
      prepareSankeyData();
    } catch (err) {
      setError('Failed to generate financial health report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareSankeyData = () => {
    // Group transactions by category and type
    const categoryTotals = transactionData.transactions.reduce((acc: { [key: string]: number }, transaction: Transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.type === 'credit' ? transaction.amount : -transaction.amount;
      return acc;
    }, {});

    // Separate income and expenses
    const income: { [key: string]: number } = {};
    const expenses: { [key: string]: number } = {};
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > 0) {
        income[category] = amount;
      } else {
        expenses[category] = -amount;
      }
    });

    // Create nodes and links
    const nodes = [
      { id: 'Total Income', nodeColor: '#4ade80' }, // Green
      { id: 'Available Funds', nodeColor: '#60a5fa' }, // Blue
      ...Object.keys(expenses).map(category => ({
        id: category,
        nodeColor: '#f87171' // Red
      }))
    ];

    const links = [
      // Link from income categories to Available Funds
      ...Object.entries(income).map(([_, amount]) => ({
        source: 'Total Income',
        target: 'Available Funds',
        value: amount
      })),
      // Links from Available Funds to expense categories
      ...Object.entries(expenses).map(([category, amount]) => ({
        source: 'Available Funds',
        target: category,
        value: amount
      }))
    ];

    setSankeyData({ nodes, links });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white px-2 py-4 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="h-10 w-64 bg-gray-100 rounded-lg animate-pulse mx-auto mb-4"></div>
            <div className="h-6 w-96 bg-gray-100 rounded-lg animate-pulse mx-auto"></div>
          </div>

          {/* Health Score Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
                <div className="h-20 w-full max-w-2xl bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse ml-4"></div>
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-32 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sankey Chart Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
            <div className="h-[500px] bg-gray-100 rounded-lg animate-pulse"></div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-3"></div>
                  <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Generating Report
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics || !aiInsights) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Report Data
          </h2>
          <p className="text-gray-600">
            No financial report data is currently available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-2 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Financial Health Report
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
            A comprehensive analysis of your financial well-being
          </p>
        </div>

        {/* Health Score */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Score */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6 mb-4 md:mb-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 text-center md:text-left">
                Financial Health Score
              </h2>
              <div className="flex items-baseline justify-center md:justify-start">
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-blue-600">
                  {aiInsights.score}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl text-gray-500 ml-2">/100</div>
              </div>
            </div>
            
            {/* Analysis */}
            <div className="w-full md:w-2/3 md:pl-6">
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">
                Analysis
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                {aiInsights.analysis}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {/* Net Worth */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Net Worth</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  RM{metrics.netWorth.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Monthly Income</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  RM{metrics.incomeStability.monthlyIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-indigo-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Savings Rate</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {metrics.budgetAnalysis.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Debt-to-Income */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-500" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Debt-to-Income</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {metrics.debtManagement.debtToIncomeRatio.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sankey Chart */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Money Flow Analysis
          </h2>
          <div className="h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
            <ResponsiveSankey
              data={sankeyData}
              margin={{ 
                top: 10,
                right: window.innerWidth < 640 ? 10 : 20,
                bottom: 10,
                left: window.innerWidth < 640 ? 10 : 20
              }}
              align="justify"
              colors={{ scheme: "category10" }}
              nodeOpacity={1}
              nodeHoverOthersOpacity={0.35}
              nodeThickness={window.innerWidth < 640 ? 12 : 18}
              nodeSpacing={window.innerWidth < 640 ? 12 : 24}
              nodeBorderWidth={0}
              nodeBorderRadius={3}
              linkOpacity={0.5}
              linkHoverOthersOpacity={0.1}
              linkContract={window.innerWidth < 640 ? 1 : 3}
              enableLinkGradient={true}
              labelPosition="outside"
              labelOrientation="horizontal"
              labelPadding={window.innerWidth < 640 ? 8 : 16}
              labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
              animate={true}
              motionConfig="gentle"
              theme={{
                background: "transparent",
                text: {
                  fontSize: window.innerWidth < 640 ? 10 : 12,
                  fill: '#374151'
                }
              }}
            />
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
            AI-Generated Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Short Term Goals */}
            <div className="border border-gray-100 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                Short Term Goals (10 Days)
              </h3>
              {aiInsights.goals.shortTerm.objectives.map((objective, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-1 sm:mb-2">
                    {objective.goal}
                  </h4>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1 mb-1 sm:mb-2">
                    {objective.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">Expected: {objective.expectedOutcome}</p>
                </div>
              ))}
            </div>

            {/* Medium Term Goals */}
            <div className="border border-gray-100 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                Medium Term Goals (3 Months)
              </h3>
              {aiInsights.goals.mediumTerm.objectives.map((objective, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-1 sm:mb-2">
                    {objective.goal}
                  </h4>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1 mb-1 sm:mb-2">
                    {objective.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">Expected: {objective.expectedOutcome}</p>
                </div>
              ))}
            </div>

            {/* Long Term Goals */}
            <div className="border border-gray-100 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                Long Term Goals (1 Year)
              </h3>
              {aiInsights.goals.longTerm.objectives.map((objective, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-1 sm:mb-2">
                    {objective.goal}
                  </h4>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1 mb-1 sm:mb-2">
                    {objective.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">Expected: {objective.expectedOutcome}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
            AI-Powered Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(aiInsights.recommendations).map(([key, value]) => (
              <div key={key} className="border border-gray-100 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
