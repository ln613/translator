import { makeAutoObservable } from 'mobx';
import OpenAI from 'openai';

class RealtimeChatStore {
  messages = [];
  isConnected = false;
  isStreaming = false;
  currentMessage = '';
  openai = null;
  stream = null;

  constructor() {
    makeAutoObservable(this);
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  setCurrentMessage(message) {
    this.currentMessage = message;
  }

  addMessage(message) {
    this.messages.push(message);
  }

  setIsConnected(status) {
    this.isConnected = status;
  }

  setIsStreaming(status) {
    this.isStreaming = status;
  }

  async startStreaming() {
    if (this.currentMessage.trim() === '') return;
    
    // Add user message to chat history
    this.addMessage({
      role: 'user',
      content: this.currentMessage
    });
    
    // Clear input field
    this.setCurrentMessage('');
    
    try {
      this.setIsStreaming(true);
      
      // Create messages array for API call
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds in real-time.'
        },
        ...this.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      // Create a placeholder for the assistant's response
      const assistantMessage = {
        role: 'assistant',
        content: ''
      };
      this.addMessage(assistantMessage);
      
      // Start the stream
      this.stream = await this.openai.completions.create({
        model: 'gpt-4o-mini-realtime-preview',
        prompt: messages.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        stream: true,
        max_tokens: 1000
      });
      
      // Process the stream
      for await (const chunk of this.stream) {
        if (chunk.choices[0]?.text) {
          assistantMessage.content += chunk.choices[0].text;
          // Force update to trigger re-render
          this.messages = [...this.messages];
        }
      }
    } catch (error) {
      console.error('Error in streaming chat:', error);
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      });
    } finally {
      this.setIsStreaming(false);
    }
  }

  stopStreaming() {
    if (this.stream) {
      this.stream.controller.abort();
      this.stream = null;
      this.setIsStreaming(false);
    }
  }

  clearChat() {
    this.messages = [];
    this.currentMessage = '';
  }
}

export const realtimeChatStore = new RealtimeChatStore();
