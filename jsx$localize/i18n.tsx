import React from 'react';

export const i18n: React.FC<{
  children: React.ReactNode,
  id?: string,
  description?: string,
  meaning?: string
}> = ({ children }) => {
  return <>{children}</>;
};