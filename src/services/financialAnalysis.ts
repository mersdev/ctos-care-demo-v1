import { Transaction, FinancialMetrics, TransactionData } from '../types/financial';

export class FinancialAnalysisService {
  private transactions: Transaction[];
  private monthlyIncome: number;
  private monthlyExpenses: number;

  constructor(data: TransactionData) {
    this.transactions = data.transactions;
    this.monthlyIncome = this.calculateTotalIncome();
    this.monthlyExpenses = this.calculateTotalExpenses();
  }

  private calculateTotalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateTotalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateFixedExpenses(): number {
    const fixedCategories = ['Housing', 'Transportation', 'Insurance', 'Utilities'];
    return this.transactions
      .filter(t => t.type === 'debit' && fixedCategories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateVariableExpenses(): number {
    const variableCategories = ['Food', 'Entertainment', 'Shopping', 'Miscellaneous'];
    return this.transactions
      .filter(t => t.type === 'debit' && variableCategories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateDebtPayments(): number {
    const debtCategories = ['Loan Payment', 'Credit Card', 'Mortgage'];
    return this.transactions
      .filter(t => t.type === 'debit' && debtCategories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateNetWorth(): number {
    // Calculate total assets
    const assets = [
      'Savings',
      'Investment',
      'Business Income',
      'Rental Income',
      'Education Income',
      'Intellectual Property'
    ];
    
    const totalAssets = this.transactions
      .filter(t => t.type === 'credit' && assets.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total liabilities
    const liabilities = ['Loan Payment', 'Credit Card', 'Mortgage'];
    const totalLiabilities = this.transactions
      .filter(t => t.type === 'debit' && liabilities.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    return totalAssets - totalLiabilities;
  }

  public generateMetrics(): FinancialMetrics {
    // Calculate savings rate
    const monthlySavings = this.monthlyIncome - this.monthlyExpenses;
    const savingsRate = (monthlySavings / this.monthlyIncome) * 100;

    // Calculate fixed expenses
    const fixedExpenses = this.calculateFixedExpenses();
    const variableExpenses = this.calculateVariableExpenses();

    // Calculate debt-to-income ratio
    const debtPayments = this.calculateDebtPayments();
    const debtToIncomeRatio = (debtPayments / this.monthlyIncome) * 100;

    // Calculate emergency fund coverage (in months)
    const emergencyFundCoverage = monthlySavings > 0 
      ? Math.floor((monthlySavings * 6) / this.monthlyExpenses) 
      : 0;

    // Calculate retirement savings rate (15% of income recommended)
    const retirementSavingsRate = 15; // Fixed at 15% as a recommended target

    return {
      netWorth: this.calculateNetWorth(),
      incomeStability: {
        monthlyIncome: this.monthlyIncome
      },
      budgetAnalysis: {
        fixedExpenses,
        variableExpenses,
        savingsRate: Math.max(0, Math.min(100, savingsRate)) // Clamp between 0 and 100
      },
      emergencyFund: {
        coverageMonths: emergencyFundCoverage
      },
      debtManagement: {
        debtToIncomeRatio: Math.max(0, Math.min(100, debtToIncomeRatio)) // Clamp between 0 and 100
      },
      retirementSavings: {
        savingsRate: retirementSavingsRate
      }
    };
  }
}
