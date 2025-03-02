import { useState, useRef, useCallback } from 'react';

/**
 * Utility functions and hooks for speech recognition
 */

/**
 * Creates and configures a speech recognition instance for a specific language
 * @param {string} lang - The language code (e.g., 'en-US', 'zh-CN')
 * @param {Function} onResult - Callback function to handle recognition results
 * @param {Function} onEnd - Callback function called when recognition ends
 * @returns {Object} - The speech recognition instance and control functions
 */
const createLanguageRecognition = (lang, onResult, onEnd) => {
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
  recognition.interimResults = true;
  recognition.lang = lang;

  // Set up event handlers
  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const result = event.results[last];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;
    
    onResult(transcript, confidence, lang);
  };

  recognition.onend = () => {
    onEnd(lang);
  };

  recognition.onerror = (event) => {
    console.error(`Speech recognition error (${lang}):`, event.error);
    onEnd(lang);
  };

  // Return the recognition instance and control functions
  return {
    start: () => {
      try {
        recognition.start();
      } catch (error) {
        console.error(`Error starting speech recognition (${lang}):`, error);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error(`Error stopping speech recognition (${lang}):`, error);
      }
    }
  };
};

/**
 * Creates and configures dual speech recognition instances for English and Mandarin
 * @param {Function} onResult - Callback function to handle recognition results
 * @param {Function} onEnd - Callback function called when recognition ends
 * @returns {Object} - The speech recognition instances and control functions
 */
const createSpeechRecognition = (onResult, onEnd) => {
  // Check if speech recognition is supported
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.error('Speech recognition is not supported in this browser');
    return null;
  }

  let bestResult = { transcript: '', confidence: 0, lang: '' };
  let recognitionsEnded = 0;
  
  // Function to handle results from both recognizers
  const handleResult = (transcript, confidence, lang) => {
    console.log(`Result from ${lang}:`, transcript, `(confidence: ${confidence})`);
    
    // Update best result if this one has higher confidence
    if (confidence > bestResult.confidence) {
      bestResult = { transcript, confidence, lang };
    }
  };
  
  // Function to handle when both recognizers have ended
  const handleEnd = (lang) => {
    recognitionsEnded++;
    console.log(`Recognition ended for ${lang}, ${recognitionsEnded} of 2 completed`);
    
    // When both recognizers have ended, return the best result
    if (recognitionsEnded === 2) {
      console.log('Final detected language:', bestResult.lang);
      onResult(bestResult.transcript);
      onEnd();
      
      // Reset for next recognition
      bestResult = { transcript: '', confidence: 0, lang: '' };
      recognitionsEnded = 0;
    }
  };

  // Create recognizers for English and Mandarin
  const englishRecognition = createLanguageRecognition('en-US', handleResult, handleEnd);
  const mandarinRecognition = createLanguageRecognition('zh-CN', handleResult, handleEnd);

  // Return the recognition instances and control functions
  return {
    start: () => {
      try {
        englishRecognition.start();
        // Small delay to avoid conflicts
        setTimeout(() => {
          mandarinRecognition.start();
        }, 200);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    },
    stop: () => {
      try {
        englishRecognition.stop();
        mandarinRecognition.stop();
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
