// Polyfills for Node.js globals in the browser environment
import process from 'process';

window.process = process;
window.global = window;
