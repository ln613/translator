import React from 'react'
import { observer } from 'mobx-react'
import { appState } from './appState';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatPage from './ChatPage';
import RealtimeChatPage from './RealtimeChatPage';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <div className="nav-links">
        <Link to="/chat">Chat with ChatGPT</Link>
        <Link to="/realtime-chat">Realtime Chat</Link>
      </div>
      <Routes>
        <Route path="/" element={
          <>
            <div>
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
              <button onClick={() => appState.increment()}>
                count is {appState.count}
              </button>
              <p>
                Edit <code>src/App.jsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs">
              Click on the Vite and React logos to learn more
            </p>
          </>
        } />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/realtime-chat" element={<RealtimeChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default observer(App)
