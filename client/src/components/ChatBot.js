import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import axiosInstance from '../axiosInstance';

const ChatBot = ({ analysisData, file }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cvDetails, setCvDetails] = useState(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Fetch CV details when analysis data changes
  useEffect(() => {
    const fetchCvDetails = async () => {

      try {
        const formData = new FormData();
        formData.append('resume', file);

        const {data} = await axiosInstance.post('/cv-details', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      
        setCvDetails(data.cvDetails);


        if (messages.length === 0) {
          setMessages([{
            text: `Hi! 👋 I'm your CV assistant. I've analyzed your CV with ${data.sectionsCount} sections. Ask me anything about it!`,
            type: 'assistant',
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Error fetching CV details:', error);
      }
    };

    if (analysisData) {
      fetchCvDetails();
    }
  }, [analysisData]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      text: userMessage,
      type: 'user',
      timestamp: new Date().toISOString()
    }]);
    setIsLoading(true);
    setError(null);

    try {
      const response=await axiosInstance.post('/chat',{
        message:userMessage,
        analysisData:analysisData,
        cvDetails:cvDetails
      })
      // console.log(res)
     
      // const response = await fetch('http://localhost:5000/api/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     message: userMessage,
      //     analysisData: analysisData,
      //     cvDetails: cvDetails
      //   }),
      // });

      // const data = await response.json();

      if (!response.data.statusText==='OK') {
        throw new Error(response.data.details || response.data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, {
        text: response.data.message,
        type: 'assistant',
        timestamp: response.data.timestamp,
        action: response?.data?.action 
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        text: `Error: Please try again.`,
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`}>
      <button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>CV Assistant</h3>
            <div className="chat-subheader">
              {analysisData ? `${analysisData.sections} sections analyzed` : 'Analyzing CV...'}
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}-message`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your CV..."
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ChatBot;