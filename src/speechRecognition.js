import { useState, useRef, useCallback } from 'react';

/**
 * Utility functions and hooks for speech recognition
 */

/**
 * Creates and configures a speech recognition instance
 * @param {Function} onResult - Callback function to handle recognition results
 * @param {Function} onEnd - Callback function called when recognition ends
 * @returns {Object} - The speech recognition instance and control functions
 */
const createSpeechRecognition = (onResult, onEnd) => {
  // Check if speech recognition is supported
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.error('Speech recognition is not supported in this browser');
    return null;
  }

  // Create speech recognition instance
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Configure recognition
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'zh-CN;en-US'; // Auto-detect language

  // Set up event handlers
  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const speech = event.results[last][0].transcript;
    onResult(speech);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onEnd();
  };

  // Return the recognition instance and control functions
  return {
    start: () => {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };
};

/**
 * Custom hook for speech recognition
 * @param {Function} onSpeechResult - Callback function to handle speech recognition results
 * @returns {Object} - Speech recognition state and control functions
 */
export const useSpeechRecognition = (onSpeechResult) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = createSpeechRecognition(
      // onResult callback
      (speech) => {
        if (onSpeechResult) {
          onSpeechResult(speech);
        }
      },
      // onEnd callback
      () => {
        setIsListening(false);
      }
    );

    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [onSpeechResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening
  };
};
