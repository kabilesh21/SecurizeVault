import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiCpu, FiMessageSquare, FiTrash2, FiZap } from 'react-icons/fi';
import { TbRobot } from 'react-icons/tb';
import { searchService } from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your SecurizeVault AI Assistant. I can help you explore your uploaded documents, skills, timeline events, and career pathways. What would you like to know about your profile?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "What are my primary skills?",
    "Show my latest timeline milestones",
    "List all my uploaded resumes",
    "Analyze my career path compatibility"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setSending(true);

    try {
      // Query Smart Retrieval
      const res = await searchService.search(query);
      const data = res.data;

      let botText = "";
      if (data.explanation) {
        botText = data.explanation;
        
        // Append source references if matching records are returned
        if (data.results && data.results.length > 0) {
          botText += `\n\n**Source Records:**\n`;
          data.results.forEach((item, index) => {
            const skillsPart = item.matchedSkills && item.matchedSkills.length > 0 ? ` — *Skills:* ${item.matchedSkills.join(', ')}` : "";
            botText += `${index + 1}. **${item.title}** (${item.resultType})${skillsPart}\n`;
          });
        }
      } else if (data.results && data.results.length > 0) {
        botText = `I searched your portfolio and found **${data.results.length} matching record(s)**. Here is a summary of what I retrieved:\n\n`;
        data.results.forEach((item, index) => {
          botText += `${index + 1}. **${item.title}** (${item.resultType})\n`;
          if (item.matchedSkills && item.matchedSkills.length > 0) {
            botText += `   *Skills:* ${item.matchedSkills.join(', ')}\n`;
          }
          botText += `\n`;
        });
      } else {
        botText = "I searched your ingested catalog but couldn't find any direct matches. Try uploading more documents or re-phrasing your search to ask about specific skills, certificates, or projects!";
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Apologies, I encountered an issue querying your smart portfolio records. Please ensure the backend and AI services are running correctly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Chat cleared! How else can I help you analyze your portfolio or timeline?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4 animate-fade-in">
      {/* Header Panel */}
      <div className="glass-panel p-4 flex justify-between items-center bg-white/40 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-650 text-white rounded-xl flex items-center justify-center shadow-md">
            <TbRobot size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">AI Assistant</h3>
            <p className="text-[11px] text-slate-600">Explore, analyze, and query your digital credentials conversively.</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 hover:bg-slate-100 rounded-xl text-red-650 hover:text-red-700 transition-colors"
          title="Clear Conversation"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-panel p-6 overflow-y-auto space-y-4 bg-white/70 border-slate-100">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-sky-500 text-white' : 'bg-indigo-650 text-white'}`}>
              {msg.sender === 'user' ? <FiUser size={14} /> : <TbRobot size={14} />}
            </div>
            <div className={`p-4 rounded-2xl text-[11px] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-sky-500/10 text-slate-800 rounded-tr-none border border-sky-200/50' 
                : 'bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-800'
            }`}>
              <div className="whitespace-pre-line">
                {msg.text}
              </div>
              <span className="block text-[9px] text-slate-400 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3 max-w-lg">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-indigo-650 text-white animate-pulse">
              <TbRobot size={14} />
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-indigo-650 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-1.5 w-1.5 bg-indigo-650 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-1.5 w-1.5 bg-indigo-650 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 py-1">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3.5 py-1.5 rounded-full bg-white border border-slate-100 hover:bg-white/50 text-[11px] text-slate-700 font-medium transition-all"
            >
              <FiZap size={11} className="inline mr-1 text-indigo-650" />
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Tray */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your portfolio or qualifications..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-100 bg-white text-xs outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 placeholder-slate-400 shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || !input.trim()}
          className="px-5 rounded-xl bg-indigo-650 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
