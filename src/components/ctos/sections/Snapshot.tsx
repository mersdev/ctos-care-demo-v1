import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, StatItem } from '../../ui/Card';
import { CTOSSnapshot } from '../../../types/ctos';

interface SnapshotSectionProps {
  snapshot: CTOSSnapshot;
}

export const SnapshotSection: React.FC<SnapshotSectionProps> = ({ snapshot }) => {
  const stats = [
    { label: 'Bankruptcy Status', value: snapshot.bankruptcyStatus ? 'Yes' : 'No' },
    { label: 'Active Legal Records', value: snapshot.activeLegalRecords },
    { label: 'Special Attention Accounts', value: snapshot.specialAttentionAccounts },
  ];

  return (
    <Card className="mb-6">
      <CardHeader icon={<DocumentIcon />} title="A: Snapshot" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </Card>
  );
};
