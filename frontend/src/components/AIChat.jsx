import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/api';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI database assistant powered by Google Gemini. I can help you understand your schema, write queries, and analyze data. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'system');
      const res = await chatWithAI(userMessage, history);

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠ ' + (res.data.message || 'Failed to get response')
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠ ' + (err.response?.data?.message || 'Something went wrong. Please try again.')
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-antares-surface border-b border-antares-border flex-shrink-0">
        <svg className="w-4 h-4 text-antares-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <div>
          <h3 className="text-xs font-semibold text-white">AI Database Assistant</h3>
          <p className="text-2xs text-antares-text-dim">Powered by Gemini</p>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="ml-auto text-antares-text-dim hover:text-white transition-colors p-1"
          title="Clear chat"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded px-3 py-2 text-2xs ${
              msg.role === 'user'
                ? 'bg-antares-accent text-white'
                : 'bg-antares-surface border border-antares-border text-antares-text'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-antares-surface border border-antares-border text-antares-text-dim rounded px-3 py-2 text-2xs">
              <div className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-antares-accent animate-pulse" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-antares-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-antares-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="ml-1.5">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-antares-border p-2 flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your database..."
            className="flex-1 bg-antares-bg border border-antares-border text-antares-text-bright rounded px-2.5 py-1.5 text-2xs focus:outline-none focus:border-antares-accent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-2.5 py-1.5 rounded bg-antares-accent hover:brightness-110 text-white disabled:opacity-40 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
