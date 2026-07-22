import * as React from 'react';

type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export const AuthCard = ({ children, className = '' }: AuthCardProps) => (
  <div
    className={`w-full rounded-surface border border-gray-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}
  >
    {children}
  </div>
);
