import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, StatItem } from '../../ui/Card';
import { CCRISSummary } from '../../../types/ctos';

interface BankingHistorySectionProps {
  ccrisSummary?: CCRISSummary | null;
}

export const BankingHistorySection: React.FC<BankingHistorySectionProps> = ({ ccrisSummary }) => {
  const defaultSummary: CCRISSummary = {
    outstandingCredit: 0,
    specialAttentionAccounts: 0,
    creditApplications: 0
  };

  const summary = ccrisSummary || defaultSummary;

  const stats = [
    {
      label: 'Outstanding Credit',
      value: `RM ${summary.outstandingCredit.toLocaleString()}`
    },
    {
      label: 'Special Attention',
      value: summary.specialAttentionAccounts
    },
    {
      label: 'Credit Applications',
      value: summary.creditApplications
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader icon={<BanknotesIcon />} title="C: Banking Payment History" />
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">CCRIS Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </Card>
  );
};
