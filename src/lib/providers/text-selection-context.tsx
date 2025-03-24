"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import { TextSelectionInfo } from "../document-form-types";

interface TextSelectionContextType {
  currentTextSelection: TextSelectionInfo | null;
  setTextSelection: (selection: TextSelectionInfo | null) => void;
  clearTextSelection: () => void;
}

const TextSelectionContext = createContext<TextSelectionContextType | undefined>(undefined);

export function TextSelectionProvider({ children }: { children: React.ReactNode }) {
  const [currentTextSelection, setCurrentTextSelection] = useState<TextSelectionInfo | null>(null);

  const setTextSelection = useCallback((selection: TextSelectionInfo | null) => {
    setCurrentTextSelection(selection);
  }, []);

  const clearTextSelection = useCallback(() => {
    setCurrentTextSelection(null);
  }, []);

  return (
    <TextSelectionContext.Provider
      value={{
        currentTextSelection,
        setTextSelection,
        clearTextSelection
      }}
    >
      {children}
    </TextSelectionContext.Provider>
  );
}

export function useTextSelectionContext() {
  const context = useContext(TextSelectionContext);
  if (context === undefined) {
    throw new Error('useTextSelectionContext must be used within a TextSelectionProvider');
  }
  return context;
} 