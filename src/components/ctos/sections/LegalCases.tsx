import React from 'react';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '../../ui/Card';
import { LegalRecord } from '../../../types/ctos';

interface LegalCaseItemProps {
  record: LegalRecord;
}

const LegalCaseItem: React.FC<LegalCaseItemProps> = ({ record }) => (
  <div className="border-b border-gray-200 last:border-b-0 py-4">
    <div className="flex justify-between mb-2">
      <span className="font-medium">{record.caseNumber}</span>
      <span className={`px-2 py-1 rounded text-sm ${
        record.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
        {record.status}
      </span>
    </div>
    <p className="text-gray-600 text-sm mb-2">{record.description}</p>
    <div className="flex justify-between text-sm text-gray-500">
      <span>Filed: {record.filingDate}</span>
      <span>Amount: RM {record.amount.toLocaleString()}</span>
    </div>
  </div>
);

interface LegalCasesSectionProps {
  asDefendant?: LegalRecord[] | null;
  asPlaintiff?: LegalRecord[] | null;
}

export const LegalCasesSection: React.FC<LegalCasesSectionProps> = ({
  asDefendant,
  asPlaintiff
}) => {
  const hasLegalCases = (asDefendant?.length || 0) > 0 || (asPlaintiff?.length || 0) > 0;

  if (!hasLegalCases) {
    return (
      <Card className="mb-6">
        <CardHeader icon={<ScaleIcon />} title="D: Legal Cases" />
        <div className="p-4 text-gray-500 text-center">
          No legal cases found
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader icon={<ScaleIcon />} title="D: Legal Cases" />
      <div className="divide-y divide-gray-200">
        {(asDefendant || []).map((record, index) => (
          <div key={index} className="p-4">
            <LegalCaseItem record={record} />
          </div>
        ))}
        {(asPlaintiff || []).map((record, index) => (
          <div key={index} className="p-4">
            <LegalCaseItem record={record} />
          </div>
        ))}
      </div>
    </Card>
  );
};
