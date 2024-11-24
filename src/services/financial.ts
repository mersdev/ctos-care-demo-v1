import { Transaction, TransactionData } from '../types/financial';
import { FinancialMetrics } from './types';

export class FinancialAnalyzer {
  private transactions: Transaction[];

  constructor(data: TransactionData) {
    this.transactions = data.transactions;
  }

  private sumTransactions(type: 'credit' | 'debit', categories?: string[]): number {
    return this.transactions
      .filter(t => t.type === type && (!categories || categories.includes(t.category)))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  analyze(): FinancialMetrics {
    const monthlyIncome = this.sumTransactions('credit');
    const monthlyExpenses = this.sumTransactions('debit');

    const fixedExpenses = this.sumTransactions('debit', [
      'Housing',
      'Transportation',
      'Insurance',
      'Utilities'
    ]);

    const variableExpenses = this.sumTransactions('debit', [
      'Food',
      'Entertainment',
      'Shopping',
      'Miscellaneous'
    ]);

    const debtPayments = this.sumTransactions('debit', [
      'Loan Payment',
      'Credit Card',
      'Mortgage'
    ]);

    // Calculate assets and liabilities
    const assets = this.sumTransactions('credit', [
      'Savings',
      'Investment',
      'Property',
      'Other Assets'
    ]);

    const liabilities = this.sumTransactions('debit', [
      'Loan Payment',
      'Credit Card',
      'Mortgage',
      'Other Debts'
    ]);

    const netWorth = assets - liabilities;
    const debtToIncomeRatio = monthlyIncome > 0 ? debtPayments / monthlyIncome : 0;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    
    const totalCreditLimit = this.transactions
      .filter(t => t.category === 'Credit Limit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const creditUtilization = totalCreditLimit > 0 ? debtPayments / totalCreditLimit : 0;
    
    const emergencyFund = this.sumTransactions('credit', ['Savings']);
    const emergencyFundRatio = monthlyExpenses > 0 ? emergencyFund / (monthlyExpenses * 6) : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      fixedExpenses,
      variableExpenses,
      debtPayments,
      netWorth,
      debtToIncomeRatio,
      savingsRate,
      creditUtilization,
      emergencyFundRatio
    };
  }
}
