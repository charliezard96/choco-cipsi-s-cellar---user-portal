import React, { createContext, useContext, useState } from 'react';

interface SearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextValue>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export const useSearch = () => useContext(SearchContext);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchContext.Provider value={{ isOpen, openSearch: () => setIsOpen(true), closeSearch: () => setIsOpen(false) }}>
      {children}
    </SearchContext.Provider>
  );
};
