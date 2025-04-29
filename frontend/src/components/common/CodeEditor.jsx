import React from 'react';
import PropTypes from 'prop-types';

const CodeEditor = ({
  value,
  onChange,
  language = 'sql',
  height = '300px',
  className = '',
}) => {
  return (
    <div className={`code-editor-container ${className}`} style={{ height }}>
      <textarea
        className="w-full h-full p-4 font-mono text-white bg-hr-dark-secondary border border-hr-dark-accent rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your SQL query here..."
      />
    </div>
  );
};

CodeEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  language: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default CodeEditor; 