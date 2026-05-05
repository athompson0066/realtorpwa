/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Send, User, Bot, LayoutGrid, Link as LucideLink, Trash2, Plus, Minus, Globe, MessageCircle, Phone, Mail } from 'lucide-react';


const Accordion = ({ title, content }: { title: string, content: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border border-gray-200 rounded-lg mb-2 bg-white shadow-sm">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left font-semibold">
          {title}
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
        {isOpen && <div className="p-4 bg-gray-50 text-gray-700 text-sm border-t">{content}</div>}
      </div>
    );
  };


const LeadMagnet = ({ title, description, buttonText }: { title: string, description: string, buttonText: string }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
      <div className="border border-blue-100 rounded-lg mb-2 bg-blue-50 p-4 shadow-sm">
        <h4 className="font-bold text-blue-900 mb-1">{title}</h4>
        <p className="text-sm text-blue-700 mb-3">{description}</p>
        <div className="flex flex-col gap-2 mb-3">
          <input 
            type="text" 
            placeholder="First Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-md text-sm"
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded-md text-sm"
          />
        </div>
        <button 
          disabled={!name || !email}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {buttonText}
        </button>
      </div>
    );
  };


const toHtmlCard = (listing: any) => {
    const featuredImage = listing['Featured Image'] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    const ratings = listing['Ratings'] || '4.9/5 (Verified)';
    const cta = listing['Call To Action'] || 'Visit Website';

    return `
    <div style="font-family: sans-serif; margin-bottom: 24px; max-width: 420px; background: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
      <div style="height: 200px; background: #f3f4f6;">
        <img src="${featuredImage}" 
             style="width: 100%; height: 100%; object-fit: cover;" 
             onerror="this.src='https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'" 
             alt="Listing" />
      </div>
      <div style="padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h3 style="margin: 0; font-size: 19px; color: #111827;">${listing['Company Name']}</h3>
          <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Toronto Verified</span>
        </div>
        <p style="margin: 4px 0 10px 0; color: #d97706; font-size: 13px; font-weight: 600;">${listing['Promotional Title']}</p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.4;">${listing['Short Description']}</p>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 18px;">
           <span style="color: #fbbf24; font-size: 16px;">★</span>
           <span style="font-weight: bold; font-size: 14px;">${ratings}</span>
        </div>
        <a href="${listing['Website URL']}" target="_blank" style="display: block; width: 100%; text-align: center; background: #000000; color: #ffffff; padding: 12px 0; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">${cta}</a>
      </div>
    </div>
  `;
};

const toHtmlGreeting = () => `
    <div style="font-family: sans-serif; max-width: 450px; background: #ffffff; border-radius: 16px; border: 1px solid #efefef; box-shadow: 0 10px 15px rgba(0,0,0,0.1); overflow: hidden; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 40px; height: 40px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 12px;">S</div>
            <h2 style="margin: 0; font-size: 18px;">Sade Assistant</h2>
        </div>
        <p style="color: #4b5563; line-height: 1.5; font-size: 15px; margin-bottom: 15px;">
            Hello! I’m Sade. I can find the best verified Toronto professionals for you. <br><br>
            <b>What neighborhood or service (Plumbing, Remodeling, etc.) are you looking for?</b>
        </p>
        <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Toronto Citypages • Real-Time Search</div>
    </div>
  `;

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, type: 'card' | 'text' }[]>([
    { role: 'assistant', content: toHtmlGreeting(), type: 'card' }
  ]);
  const [input, setInput] = useState('');
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      chatEndRef.current.parentElement.scrollTop = chatEndRef.current.parentElement.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/11Moe3zp1qnYvJFTkY46VHrDO4cOGnEqL7LzcUrCY59A/export?format=csv')
      .then(res => res.text())
      .then(csv => {
        // Simple CSV parsing for this example
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i]?.trim();
            return obj;
          }, {} as any);
        });
        setSheetData(data);
      });
  }, []);

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: toHtmlGreeting(), type: 'card' }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input, type: 'text' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://flowise.aiolosmedia.com/api/v1/prediction/c0423c15-71cd-471a-857f-793d286dfc69', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      const data = await response.json();
      
      const fullResponse = data.text || 'No results found.';
      
      // Match all relevant listings by category or keywords
      const matchedListings = sheetData.filter(listing => 
        fullResponse.toLowerCase().includes(listing['Company Name']?.toLowerCase()) ||
        fullResponse.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 3);
      
      if (matchedListings.length > 0) {
        const assistantMessage = { 
            role: 'assistant' as const, 
            content: matchedListings.map(listing => toHtmlCard(listing)).join(''),
            type: 'card' as const
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Typing effect for text-based assistant response
        setMessages(prev => [...prev, { role: 'assistant', content: '', type: 'text' }]);
        for (let i = 0; i <= fullResponse.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20));
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = fullResponse.substring(0, i);
            return newMessages;
          });
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.', type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="relative w-full max-w-md bg-white p-6 rounded-2xl shadow-sm text-center mb-6">
        <button 
          onClick={handleClearChat}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
          <img 
            src="https://orlandosydney.com/wp-content/uploads/2023/05/Female-Professional-Headshot.-LinkedIn-Business-Profile.-By-Orlandosydney.com-202300752.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">Business Navigator</h1>
        <p className="text-gray-500">Discover top-rated services.</p>
        <div className="flex justify-center gap-4 mt-3 text-gray-400">
          <Globe className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <Mail className="w-5 h-5" />
        </div>
      </header>

      <div className="w-full max-w-md flex-grow flex flex-col gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <span className="font-semibold">Company Name</span>
          <LayoutGrid className="text-gray-400" />
        </div>

        <div className="flex-grow bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4 overflow-y-auto h-[400px] scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
              {m.type === 'card' ? (
                <div dangerouslySetInnerHTML={{ __html: m.content }} />
              ) : (
                <div className="text-gray-800 text-sm leading-relaxed space-y-4">
                  <Markdown>{m.content}</Markdown>
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="text-gray-400 italic">Chatting...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-grow p-3 rounded-xl border border-gray-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about businesses..."
          />
          <button className="bg-black text-white p-3 rounded-xl" onClick={handleSendMessage}>
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">
          <Accordion title="Get Your Free Home Valuation" content="Find out what your property is worth in the current market with a complimentary, no-obligation home valuation report." />
          <Accordion title="View Our Latest Listings" content="Browse our exclusive selection of properties across Toronto. Click here to see homes that match your criteria." />
          <Accordion title="Schedule an Expert Consultation" content="Ready to buy or sell? Let's discuss your real estate goals. Book a private consultation with our team today." />
        </div>
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Exclusive Resources</h3>
          <LeadMagnet title="Toronto First-Time Buyer's Toolkit" description="Everything you need to know about navigating the Toronto real estate market as a first-time buyer." buttonText="Download Toolkit" />
          <LeadMagnet title="Move-In Ready Checklist" description="A comprehensive checklist to ensure a stress-free transition into your new dream home." buttonText="Get Checklist" />
        </div>
        <footer className="mt-8 pt-8 pb-8 px-4 rounded-b-2xl bg-gradient-to-r from-blue-50 to-indigo-100 border-t border-blue-200 flex justify-center gap-8 text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-all transform hover:scale-110"><Globe className="w-7 h-7" /></a>
          <a href="#" className="hover:text-green-600 transition-all transform hover:scale-110"><MessageCircle className="w-7 h-7" /></a>
          <a href="#" className="hover:text-sky-600 transition-all transform hover:scale-110"><Phone className="w-7 h-7" /></a>
          <a href="#" className="hover:text-red-600 transition-all transform hover:scale-110"><Mail className="w-7 h-7" /></a>
        </footer>
      </div>
    </div>
  );
}
