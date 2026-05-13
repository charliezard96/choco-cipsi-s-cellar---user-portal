import React, { createContext, useContext, useState } from 'react';

interface CompareContextValue {
  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextValue>({
  compareList: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export const useCompare = () => useContext(CompareContext);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareList(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    );
  };

  const clearCompare = () => setCompareList([]);
  const isInCompare = (id: string) => compareList.includes(id);

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
