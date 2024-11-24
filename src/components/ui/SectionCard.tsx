import React from 'react';
import { Card, CardHeader } from './Card';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader icon={icon} title={title} />
      <div className="border-t border-gray-100 pt-4">
        {children}
      </div>
    </Card>
  );
};
