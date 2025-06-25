
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Zap, Calendar, MessageSquare, Slack, Phone, Mail, Clock, Repeat, Edit } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  workflowSuggestion?: WorkflowSuggestion;
}

interface WorkflowSuggestion {
  trigger: string;
  action: string;
  frequency: string;
  tools: string[];
  missingInfo?: string[];
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your TryCentral AI assistant. Tell me what task you'd like to automate and I'll help you set it up. For example: 'Send me a Slack message every morning at 9am' or 'When I get an important email, notify me on WhatsApp'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeUserIntent = (message: string): WorkflowSuggestion | null => {
    const lowerMessage = message.toLowerCase();
    
    // Pattern matching for common automation requests
    if (lowerMessage.includes('slack') && (lowerMessage.includes('every') || lowerMessage.includes('daily') || lowerMessage.includes('morning'))) {
      return {
        trigger: 'Time-based',
        action: 'Send Slack message',
        frequency: 'Daily at 9:00 AM',
        tools: ['Slack'],
        missingInfo: ['Which Slack channel?', 'What message content?']
      };
    }
    
    if (lowerMessage.includes('email') && lowerMessage.includes('whatsapp')) {
      return {
        trigger: 'Email received',
        action: 'Send WhatsApp notification',
        frequency: 'Every time',
        tools: ['Gmail', 'WhatsApp'],
        missingInfo: ['Define "important email" criteria']
      };
    }
    
    if (lowerMessage.includes('remind') || lowerMessage.includes('reminder')) {
      return {
        trigger: 'Time-based',
        action: 'Send reminder',
        frequency: 'Custom',
        tools: ['Calendar', 'Notifications'],
        missingInfo: ['When should I remind you?', 'What reminder message?']
      };
    }

    if (lowerMessage.includes('when') || lowerMessage.includes('if')) {
      return {
        trigger: 'Event-based',
        action: 'Execute action',
        frequency: 'When condition is met',
        tools: ['To be determined'],
        missingInfo: ['What specific condition?', 'What action to take?']
      };
    }

    return null;
  };

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'whatsapp': return <Phone className="w-4 h-4" />;
      case 'gmail': return <Mail className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const workflowSuggestion = analyzeUserIntent(input);
      
      let botResponse = '';
      if (workflowSuggestion) {
        botResponse = `I understand! You want to automate: "${input}". Let me set this up for you.`;
      } else {
        botResponse = `I'd love to help you automate that! Can you be more specific about when you want this to happen and what action should be taken? For example: "Every Monday at 10am" or "When I receive an email from my boss"`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        workflowSuggestion
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const WorkflowCard = ({ suggestion }: { suggestion: WorkflowSuggestion }) => {
    const [selectedTrigger, setSelectedTrigger] = useState(suggestion.trigger);
    const [selectedAction, setSelectedAction] = useState(suggestion.action);
    const [selectedFrequency, setSelectedFrequency] = useState(suggestion.frequency);
    const [customMessage, setCustomMessage] = useState('');
    const [customChannel, setCustomChannel] = useState('');

    const triggerOptions = [
      'Time-based',
      'Email received',
      'Calendar event',
      'Form submission',
      'File uploaded',
      'Event-based',
      'Manual trigger'
    ];

    const actionOptions = [
      'Send Slack message',
      'Send WhatsApp message',
      'Send email',
      'Create calendar event',
      'Send notification',
      'Update spreadsheet',
      'Execute webhook'
    ];

    const frequencyOptions = [
      'Once',
      'Daily',
      'Weekly',
      'Monthly',
      'Every time',
      'Weekdays only',
      'Custom schedule'
    ];

    const needsSlackDetails = selectedAction === 'Send Slack message';

    return (
      <Card className="mt-4 p-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-brand-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-brand-primary font-semibold">
            <Zap className="w-5 h-5" />
            Workflow Configuration
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                When
              </div>
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                <SelectTrigger className="bg-white border-brand-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {triggerOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Do
              </div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="bg-white border-brand-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {actionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                How Often
              </div>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="bg-white border-brand-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {frequencyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsSlackDetails && (
            <div className="space-y-4 p-4 bg-white rounded-lg border border-brand-primary/10">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Slack className="w-4 h-4 text-brand-primary" />
                Slack Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Channel</label>
                  <Input
                    placeholder="e.g., #general, @username"
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <Textarea
                    placeholder="What message should I send?"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="bg-white border-gray-300 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />
          
          <div className="space-y-3">
            <div className="font-medium text-gray-700">Required Tools</div>
            <div className="flex flex-wrap gap-2">
              {suggestion.tools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                  {getToolIcon(tool)}
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {suggestion.missingInfo && suggestion.missingInfo.length > 0 && (
            <div className="space-y-3">
              <div className="font-medium text-orange-600">Configuration Notes:</div>
              <div className="space-y-2">
                {suggestion.missingInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white">
              Connect & Set Up Workflow
            </Button>
            <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10">
              <Edit className="w-4 h-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">TryCentral AI</h1>
            <p className="text-sm text-gray-600">Automation made simple</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex items-start gap-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-white border-2 border-brand-primary/20'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-brand-primary" />
                )}
              </div>
              <div className={`space-y-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 rounded-2xl max-w-full ${
                  message.type === 'user'
                    ? 'bg-brand-primary text-white rounded-br-md'
                    : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <div className="text-xs text-gray-500 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {message.workflowSuggestion && (
                  <WorkflowCard suggestion={message.workflowSuggestion} />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tell me what you'd like to automate... e.g., 'Send me a Slack reminder every Friday at 5pm'"
            className="flex-1 border-gray-300 focus:border-brand-primary focus:ring-brand-primary"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
