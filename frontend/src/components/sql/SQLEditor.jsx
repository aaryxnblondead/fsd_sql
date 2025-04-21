import { useState, useEffect } from 'react';
import MonacoEditorWrapper from './MonacoEditorWrapper';

function SQLEditor({ initialCode, onCodeChange, onExecute }) {
  const [code, setCode] = useState(initialCode || '-- Write your SQL query here');
  const [editor, setEditor] = useState(null);
  
  // Update local state when initialCode prop changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);
  
  // Editor options
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    wordWrap: 'on'
  };
  
  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    setEditor(editor);
    editor.focus();
  };
  
  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value);
    if (onCodeChange) {
      onCodeChange(value);
    }
  };
  
  // Handle keyboard shortcut for execution
  const handleEditorKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };
  
  // Execute button click
  const handleExecute = () => {
    if (onExecute) {
      onExecute(code);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div 
        className="code-editor-container"
        onKeyDown={handleEditorKeyDown}
      >
        <MonacoEditorWrapper
          width="100%"
          height="250px"
          language="sql"
          theme="vs-dark"
          value={code}
          options={editorOptions}
          onChange={handleCodeChange}
          editorDidMount={handleEditorDidMount}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Press Ctrl+Enter to run query
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExecute}
        >
          Execute Query
        </button>
      </div>
    </div>
  );
}

export default SQLEditor; 