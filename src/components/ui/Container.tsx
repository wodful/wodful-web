import * as React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export const Container = ({
  children,
  className = '',
  as: Tag = 'div',
}: ContainerProps) => (
  <Tag className={`mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </Tag>
);
