import React from 'react';
import { Card, CardHeader } from '../../ui/Card';
import { TradeReferee } from '../../../types/ctos';

interface TradeRefereeItemProps {
  referee: TradeReferee;
}

const TradeRefereeItem: React.FC<TradeRefereeItemProps> = ({ referee }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <h3 className="font-medium">{referee.companyName}</h3>
    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
      <p>Relationship: {referee.relationship}</p>
      <p>Years: {referee.yearsOfRelationship}</p>
      <p>Credit Limit: RM {referee.creditLimit.toLocaleString()}</p>
      <p>Payment Behavior: {referee.paymentBehavior}</p>
    </div>
  </div>
);

interface TradeRefereesSectionProps {
  referees: TradeReferee[];
}

export const TradeRefereesSection: React.FC<TradeRefereesSectionProps> = ({ referees }) => (
  <Card className="mb-6">
    <CardHeader title="E: Trade Referee Listing" />
    {referees.length > 0 ? (
      <div className="space-y-4">
        {referees.map((referee, index) => (
          <TradeRefereeItem key={index} referee={referee} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">No trade referees found</p>
    )}
  </Card>
);
