import { useState, useEffect, useCallback } from 'react';

export interface SelectionState {
  text: string;
  rect: DOMRect | null;
}

export const useTextSelection = () => {
  const [selection, setSelection] = useState<SelectionState>({
    text: '',
    rect: null,
  });

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const text = sel.toString().trim();
      
      if (text.length > 0) {
        setSelection({
          text,
          rect: range.getBoundingClientRect(),
        });
        return;
      }
    }
    setSelection({ text: '', rect: null });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return selection;
};
