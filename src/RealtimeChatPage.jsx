import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { realtimeChatStore } from './realtimeChatStore';
import SimplePeer from 'simple-peer';

const RealtimeChatPage = () => {
  const messagesEndRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [realtimeChatStore.messages]);

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Try to get local media stream with optional video and audio
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (deviceError) {
        console.warn('Could not access media devices:', deviceError);
        // Continue without media stream
      }

      if (stream) {
        localStreamRef.current = stream;
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
      
      console.log('SimplePeer:', SimplePeer);
      if (typeof SimplePeer === 'undefined') {
        console.error('SimplePeer is undefined!');
      } else {
        console.log('SimplePeer is defined.');
      }
      console.log('typeof SimplePeer:', typeof SimplePeer);
      console.log('SimplePeer:', SimplePeer);
      if (typeof SimplePeer !== 'function') {
        console.error('SimplePeer is not a constructor!');
        return;
      } else {
        console.log('SimplePeer is a constructor.');
      }
      console.log('SimplePeer before new SimplePeer:', SimplePeer);
      // Create peer connection
      peerRef.current = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream || undefined
      });
      
      // Handle peer events
      peerRef.current.on('signal', data => {
        // In a real app, you would send this signal data to the other peer
        console.log('Signal data to send to peer:', data);
      });
      
      peerRef.current.on('connect', () => {
        console.log('Peer connection established');
        realtimeChatStore.setIsConnected(true);
      });
      
      peerRef.current.on('stream', remoteStream => {
        remoteStreamRef.current = remoteStream;
        
        // Display remote video
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      peerRef.current.on('error', err => {
        console.error('Peer connection error:', err);
        realtimeChatStore.setIsConnected(false);
      });
      
      peerRef.current.on('close', () => {
        console.log('Peer connection closed');
        realtimeChatStore.setIsConnected(false);
      });
      
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
    }
  };

  // Clean up WebRTC on component unmount
  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      // Stop streaming if active
      if (realtimeChatStore.isStreaming) {
        realtimeChatStore.stopStreaming();
      }
      
      // Close peer connection
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      
      // Stop local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    realtimeChatStore.startStreaming();
  };

  return (
    <div className="realtime-chat-container">
      <h1>Realtime Chat with GPT-4o Mini</h1>
      
      <div className="video-container">
        <div className="local-video-wrapper">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          <div className="video-label">You</div>
        </div>
        
        <div className="remote-video-wrapper">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="video-label">Remote</div>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {realtimeChatStore.messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={realtimeChatStore.currentMessage}
            onChange={(e) => realtimeChatStore.setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={realtimeChatStore.isStreaming}
          />
          <button 
            type="submit" 
            disabled={realtimeChatStore.isStreaming || !realtimeChatStore.currentMessage.trim()}
          >
            Send
          </button>
          {realtimeChatStore.isStreaming && (
            <button 
              type="button" 
              onClick={() => realtimeChatStore.stopStreaming()}
              className="stop-button"
            >
              Stop
            </button>
          )}
        </form>
      </div>
      
      <style>{`
        .realtime-chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .video-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .local-video-wrapper,
        .remote-video-wrapper {
          position: relative;
          width: 48%;
        }
        
        .local-video,
        .remote-video {
          width: 100%;
          height: 300px;
          background-color: #222;
          border-radius: 8px;
          object-fit: cover;
        }
        
        .video-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 8px;
          word-break: break-word;
        }
        
        .user-message {
          align-self: flex-end;
          background-color: #0084ff;
          color: white;
        }
        
        .assistant-message {
          align-self: flex-start;
          background-color: #f1f0f0;
          color: #333;
        }
        
        .message-form {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ccc;
          background-color: #f9f9f9;
        }
        
        .message-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
        }
        
        .message-form button {
          padding: 10px 15px;
          background-color: #0084ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .message-form button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .stop-button {
          background-color: #ff3b30 !important;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default observer(RealtimeChatPage);
