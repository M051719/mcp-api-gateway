/**
 * AI Assistant with Knowledge Base + Dappier Integration
 * Searches KB first, then enhances with real-time Dappier data
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Sparkles, BookOpen } from 'lucide-react';
import { dappierService } from '../services/dappierService';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRealTimeData?: boolean;
  hasKBData?: boolean;
  kbArticles?: Array<{ id: string; title: string; }>;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI assistant with access to our Knowledge Base AND real-time market data. I can help with foreclosure prevention, property analysis, credit repair, DSCR loans, and more. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState<'basic' | 'premium' | 'elite'>('basic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user tier on mount
  useEffect(() => {
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();{ response: string; kbArticles: Array<{ id: string; title: string; }>; hasRealTime: boolean; hasKB: boolean }> => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let kbArticles: Array<{ id: string; title: string; }> = [];
    let hasRealTime = false;
    let hasKB = false;

    // STEP 1: Search Knowledge Base first
    const kbResults = await knowledgeBaseService.searchArticles(userMessage, userTier);
    
    if (kbResults.hasResults && kbResults.articles.length > 0) {
      hasKB = true;
      const topArticle = kbResults.articles[0];
      kbArticles = kbResults.articles.slice(0, 3).map(a => ({ id: a.id, title: a.title }));

      // Extract excerpt from top article
      response = `📚 **From our Knowledge Base:**\n\n${topArticle.excerpt}\n\n`;
      
      if (kbResults.articles.length > 1) {
        response += `**Related Articles:**\n`;
        kbResults.articles.slice(0, 3).forEach((article, idx) => {
          response += `${idx + 1}. ${article.title}\n`;
        });
        response += `\nVisit the Knowledge Base page to read full articles!\n\n`;
      }
    }

    // STEP 2: Check if real-time data is needed
    const needsRealTimeData = lowerMessage.includes('market') || 
                              lowerMessage.includes('rate') || 
                              lowerMessage.includes('current') ||
                              lowerMessage.includes('price') ||
                              lowerMessage.includes('trend');

    if (needsRealTimeData && dappierService.isConfigured()) {
      const realTimeData = await dappierService.enhanceWithRealTimeData(userMessage);
      if (realTimeData) {
        hasRealTime = true;
        response += realTimeData;
      }
    }

    // STEP 3: Add contextual guidance if no KB results
    if (!hasKB) {
      if (lowerMessage.includes('roi') || lowerMessage.includes('return on investment')) {
        response = "💡 **ROI (Return on Investment):**\n\n" +
          "ROI shows how much profit you make compared to your investment.\n\n" +
          "**Formula:** (Profit - Cost) ÷ Cost × 100%\n\n" +
          "Our calculators show:\n" +
          "• Cash-on-Cash Return\n" +
          "• Total ROI\n" +
          "• Cap Rate\n" +
          "• DSCR\n\n" +
          "Visit our Knowledge Base for detailed ROI guides!";
      } else if (lowerMessage.includes('1%') || lowerMessage.includes('one percent')) {
        response = "📊 **The 1% Rule:**\n\n" +
          "Monthly rent should be ≥1% of purchase price\n\n" +
          "Example: $200K property needs $2,000/mo rent\n\n" +
          "Use our Rental Analyzer to check any property!\n\n" +
          "Check Knowledge Base for complete 1% Rule guide.";
      } else if (lowerMessage.includes('dscr')) {
        response = "🏦 **DSCR (Debt Service Coverage Ratio):**\n\n" +
          "Formula: NOI ÷ Annual Debt Payment\n\n" +
          "Lender Requirements:\n" +
          "• 1.25x = Excellent\n" +
          "• 1.0-1.24x = Acceptable\n" +
          "• <1.0x = Rejected\n\n" +
          "See Knowledge Base for DSCR loan details!";
      } else if (lowerMessage.includes('calculator')) {
        response = "🧮 **Our Calculators:**\n\n" +
          "• Rental Analyzer (Basic & Full)\n" +
          "• Fix & Flip Analyzer\n" +
          "• ROI Calculator\n" +
          "• DSCR Calculator\n" +
          "• 1% Rule Checker\n\n" +
          "All calculators integrate with Knowledge Base articles!";
      } else {
        response = "I can help you with:\n\n" +
          "🏠 **Foreclosure Prevention** - Stop foreclosure\n" +
          "💳 **Credit Repair** - Improve credit scores\n" +
          "📊 **Property Analysis** - ROI, DSCR, 1% Rule\n" +
          "💰 **Financing** - DSCR loans, private money\n" +
          "📬 **Direct Mail** - Send campaigns\n" +
          "📚 **Knowledge Base** - 100+ educational articles\n\n" +
          "What would you like to learn about?";
      }
    }

    // STEP 4: Log conversation for analytics
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await knowledgeBaseService.logAIConversation(
          user.id,
          userMessage,
          response,
          kbArticles.map(a => a.id)
        );
      }
    } catch (error) {
      consolaiResponse = await generateAIResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        hasRealTimeData: aiResponse.hasRealTime,
        hasKBData: aiResponse.hasKB,
        kbArticles: aiResponse.kbArticles
    } else if (lowerMessage.includes('direct mail') || lowerMessage.includes('postcard')) {
      baseResponse = "Our direct mail system lets you send professional postcards:\n\n" +
        "📬 **Premium Users**: 100 postcards/month\n" +
        "📬 **Elite Users**: Unlimited postcards\n" +
        "✅ Built-in legal compliance\n" +
        "✅ Lob API integration\n" +
        "✅ Campaign tracking\n\n" +
        "Visit the Direct Mail page to create your first campaign!";
    } else {
      baseResponse = "I can help you with:\n\n" +
        "🏠 **Foreclosure Prevention** - Stop foreclosure processes\n" +
        "💳 **Credit Repair** - Improve your credit score\n" +
        "📊 **Property Analysis** - Research properties\n" +
        "💰 **Cash Offers** - Get quick property valuations\n" +
        "📬 **Direct Mail** - Send targeted campaigns\n" +
        "📚 **Education** - Learn about real estate investing\n\n" +
        "What would you like help with?";
    }

    // Combine base response with real-time data
    return realTimeEnhancement ? baseResponse + realTimeEnhancement : baseResponse;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        hasRealTimeData: dappierService.isConfigured() && response.includes('📊 **Real-Time Data')
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: '🆘 What is DSCR?', query: 'What is DSCR and how does it work?' },
    { label: '📈 1% Rule', query: 'Explain the 1% rule for rentals score?' },
    { label: '📊 Market Data', query: 'What are current market trends?' },
    { label: '💰 Cash Offer', query: 'How do I get a cash offer?' }
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {dappierService.isConfigured() && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    KB
                  </span>
                  {dappierService.isConfigured() && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      Live
                    </span>
                  )}
                </div>  Live Data
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <di(message.hasRealTimeData || message.hasKBData) && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-2">
                        {message.hasKBData && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Knowledge Base
                          </span>
                        )}
                        {message.hasRealTimeData && (
                          <span>✓ Real-time data</span>
                        )}
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.hasRealTimeData && (
                      <div className="mt-2 text-xs opacity-75">
                        ✓ Enhanced with real-time data
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.query);
                        handleSend();
                      }}
                      className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition-colors text-left"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
