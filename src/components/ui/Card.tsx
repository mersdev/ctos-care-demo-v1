import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ icon, title }) => (
  <h2 className="text-xl font-semibold mb-4 flex items-center">
    {icon && <span className="h-6 w-6 mr-2">{icon}</span>}
    {title}
  </h2>
);

interface StatItemProps {
  label: string;
  value: string | number;
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, className = '' }) => (
  <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
