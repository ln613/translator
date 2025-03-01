import React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { appState } from './appState';
import { speak } from './speechUtils';
import { useSpeechRecognition } from './speechRecognition';
import VoiceInputUI from './components/VoiceInputUI';

function ChatPage() {
  // Use the speech recognition hook
  const { isListening, toggleListening } = useSpeechRecognition((speech) => {
    appState.setMessage(speech);
    // Optionally auto-send the message
    // sendMessage();
  });

  const sendMessage = async () => {
    const responseText = await appState.sendMessageToAPI();
    if (responseText) {
      speak(responseText);
    }
  };

  return (
    <div>
      <h1>Chat with ChatGPT</h1>
      <div>
        {appState.chatHistory.map((msg, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            <div style={{ marginRight: '10px', color: msg.sender === 'user' ? 'blue' : 'green' }}>
              {msg.sender === 'user' ? 'You' : 'ChatGPT'}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          value={appState.message}
          onChange={(e) => appState.setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flexGrow: 1, marginRight: '10px', padding: '8px' }}
        />
        <VoiceInputUI isListening={isListening} toggleListening={toggleListening} />
        <button 
          onClick={sendMessage}
          style={{ 
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default observer(ChatPage);
