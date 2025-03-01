/**
 * Utility functions for speech synthesis
 */

/**
 * Detects if the text is primarily Chinese
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if the text is primarily Chinese
 */
export const isChinese = (text) => {
  // Check if more than 1/3 of characters are in Chinese Unicode range
  let chineseCount = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Chinese character ranges (simplified and traditional)
    if ((charCode >= 0x4E00 && charCode <= 0x9FFF) || 
        (charCode >= 0x3400 && charCode <= 0x4DBF) ||
        (charCode >= 0x20000 && charCode <= 0x2A6DF) ||
        (charCode >= 0x2A700 && charCode <= 0x2B73F) ||
        (charCode >= 0x2B740 && charCode <= 0x2B81F) ||
        (charCode >= 0x2B820 && charCode <= 0x2CEAF)) {
      chineseCount++;
    }
  }
  return chineseCount > text.length / 3; // If more than 1/3 of chars are Chinese
};

/**
 * Speaks the provided text using the Web Speech API
 * Automatically detects if the text is Chinese or English and sets the appropriate language
 * @param {string} text - The text to speak
 */
export const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on content detection
    if (isChinese(text)) {
      utterance.lang = 'zh-CN'; // Mandarin Chinese (Simplified)
      console.log('Speaking in Chinese');
    } else {
      utterance.lang = 'en-US'; // English
      console.log('Speaking in English');
    }
    
    window.speechSynthesis.speak(utterance);
  }
};
