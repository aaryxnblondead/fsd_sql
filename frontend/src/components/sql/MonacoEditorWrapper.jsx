import React from 'react';
import MonacoEditor from 'react-monaco-editor';

/**
 * A wrapper component that ensures all lifecycle methods are defined
 * to prevent errors with react-monaco-editor in React 19
 */
const MonacoEditorWrapper = React.forwardRef((props, ref) => {
  // Create a safe version of the props with all lifecycle methods defined
  const safeProps = {
    ...props,
    
    // Always ensure these methods are functions
    editorWillMount: props.editorWillMount || (() => ({})),
    editorDidMount: props.editorDidMount || (() => {}),
    editorWillUnmount: props.editorWillUnmount || (() => {}),
    onChange: props.onChange || (() => {}),
    
    // Apply reasonable defaults for required props
    width: props.width || '100%',
    height: props.height || '300px',
    language: props.language || 'javascript',
    theme: props.theme || 'vs-dark',
    value: props.value || '',
    options: {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      ...(props.options || {})
    }
  };
  
  return <MonacoEditor {...safeProps} ref={ref} />;
});

// Set display name for debugging
MonacoEditorWrapper.displayName = 'MonacoEditorWrapper';

export default MonacoEditorWrapper; 