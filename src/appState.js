import { makeAutoObservable } from 'mobx';

class AppState {
  message = '';
  chatHistory = [];

  constructor() {
    makeAutoObservable(this);
  }

  setMessage(message) {
    this.message = message;
  }

  setChatHistory(chatHistory) {
    this.chatHistory = chatHistory;
  }

  async sendMessageToAPI() {
    if (this.message.trim() === '') return;

    // Add user message to chat history
    const newMessage = { text: this.message, sender: 'user' };
    this.setChatHistory([...this.chatHistory, newMessage]);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a translator between Chinese (Mandarin, simplified) and English. When the user inputs text in Chinese, translate it to English. When the user inputs text in English, translate it to simplified Chinese. Only provide the translation without any additional explanations or comments. Detect the language automatically and translate accordingly.'
            },
            { role: 'user', content: this.message }
          ]
        })
      });

      const data = await response.json();
      
      // Add chatbot response to chat history
      const chatbotMessage = { text: data.choices[0].message.content, sender: 'chatbot' };
      this.setChatHistory([...this.chatHistory, chatbotMessage]);
      
      // Clear the message input
      this.setMessage('');
      
      // Return the response text for speech synthesis
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to API:', error);
      
      // Add error message to chat history
      const errorMessage = { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'chatbot' 
      };
      this.setChatHistory([...this.chatHistory, errorMessage]);
      
      // Clear the message input
      this.setMessage('');
      
      // Return the error message for speech synthesis
      return errorMessage.text;
    }
  }
}

export const appState = new AppState();
