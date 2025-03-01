import React from 'react';

/**
 * Component for the voice input button and indicator
 * @param {Object} props - Component props
 * @param {boolean} props.isListening - Whether the speech recognition is currently active
 * @param {Function} props.toggleListening - Function to toggle the listening state
 * @returns {JSX.Element} - Voice input UI components
 */
const VoiceInputUI = ({ isListening, toggleListening }) => {
  return (
    <>
      <button 
        onClick={toggleListening} 
        style={{ 
          backgroundColor: isListening ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          marginRight: '10px',
          cursor: 'pointer'
        }}
      >
        {isListening ? 'Stop Voice' : 'Start Voice'}
      </button>
      {isListening && (
        <div style={{ color: '#ff4444', marginBottom: '10px', fontStyle: 'italic' }}>
          Listening... Speak now
        </div>
      )}
    </>
  );
};

export default VoiceInputUI;
