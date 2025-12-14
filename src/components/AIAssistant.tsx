/**
 * AI Assistant with Dappier MCP Integration
 * Floating chat button with real-time data
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Sparkles } from 'lucide-react';
import { dappierService } from '../services/dappierService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRealTimeData?: boolean;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI assistant with access to real-time market data. I can help with foreclosure prevention, property analysis, credit repair, and more. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Try to get real-time data enhancement first
    let realTimeEnhancement = '';
    if (dappierService.isConfigured()) {
      realTimeEnhancement = await dappierService.enhanceWithRealTimeData(userMessage) || '';
    }

    // Base responses for common queries
    let baseResponse = '';

    if (lowerMessage.includes('foreclosure') || lowerMessage.includes('prevent')) {
      baseResponse = "I can help you understand foreclosure prevention options:\n\n" +
        "1. **Loan Modification**: Negotiate new terms with your lender\n" +
        "2. **Forbearance**: Temporarily pause payments\n" +
        "3. **Repayment Plan**: Catch up on missed payments over time\n" +
        "4. **Short Sale**: Sell for less than owed with lender approval\n" +
        "5. **Deed in Lieu**: Transfer property to avoid foreclosure\n\n" +
        "Would you like me to connect you with our in-house loan processing team?";
    } else if (lowerMessage.includes('credit') || lowerMessage.includes('score')) {
      baseResponse = "I can guide you on credit repair:\n\n" +
        "✅ **Dispute Errors**: Challenge inaccurate items on your report\n" +
        "✅ **Payment Plans**: Set up on-time payment strategies\n" +
        "✅ **Credit Utilization**: Keep balances below 30%\n" +
        "✅ **Credit Builder**: Open secured cards or credit-builder loans\n" +
        "✅ **Debt Consolidation**: Combine high-interest debts\n\n" +
        "Our credit repair dashboard has automated tools to help you improve your score.";
    } else if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('rate')) {
      baseResponse = "For current market information, I'm fetching the latest data...";
    } else if (lowerMessage.includes('property') || lowerMessage.includes('house')) {
      baseResponse = "I can help with property analysis:\n\n" +
        "📊 **Property Lookup**: Get detailed property information\n" +
        "💰 **Cash Offer**: Receive a 24-hour cash offer\n" +
        "📈 **Market Analysis**: Compare with similar properties\n" +
        "🏠 **Deal Analysis**: Calculate ROI and cash flow\n\n" +
        "What property address would you like me to analyze?";
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
    { label: '🆘 Stop Foreclosure', query: 'How can I prevent foreclosure?' },
    { label: '💳 Fix Credit', query: 'How do I improve my credit score?' },
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
                  <span className="font-bold">AI Assistant</span>
                </div>
                {dappierService.isConfigured() && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Live Data
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
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
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
