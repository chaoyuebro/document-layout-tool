import React from 'react';
import { EditorProvider } from '@/contexts/EditorContext';
import EditorLayout from './EditorLayout';

const EditorPage: React.FC = () => {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
};

export default EditorPage;
