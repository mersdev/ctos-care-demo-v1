import React from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '../../ui/Card';
import { DirectorshipInfo } from '../../../types/ctos';

interface DirectorshipItemProps {
  directorship: DirectorshipInfo;
}

const DirectorshipItem: React.FC<DirectorshipItemProps> = ({ directorship }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <h3 className="font-medium">{directorship.companyName}</h3>
    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
      <p>Position: {directorship.position}</p>
      <p>Appointed: {directorship.appointedDate}</p>
      {directorship.shareholding && (
        <p>Shareholding: {directorship.shareholding}%</p>
      )}
    </div>
  </div>
);

interface DirectorshipsSectionProps {
  directorships: DirectorshipInfo[];
}

export const DirectorshipsSection: React.FC<DirectorshipsSectionProps> = ({ directorships }) => (
  <Card className="mb-6">
    <CardHeader icon={<BuildingOfficeIcon />} title="B: Directorships & Business Interests" />
    {directorships.length > 0 ? (
      <div className="space-y-4">
        {directorships.map((directorship, index) => (
          <DirectorshipItem key={index} directorship={directorship} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">No directorships found</p>
    )}
  </Card>
);
