import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Send, Bot, User, Zap, Calendar, MessageSquare, Slack, Phone, Mail, Clock, Repeat, Edit, Star, CheckCircle, ArrowRight, Loader2, ExternalLink, Shield, Play, Settings, BarChart3 } from 'lucide-react';

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
  prefilled?: boolean;
}

interface ConnectedTools {
  [key: string]: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your TryCentral AI assistant. I can help you automate tasks across your favorite tools. Try one of these common workflows or tell me what you'd like to automate:",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Tool connection states
  const [connectedTools, setConnectedTools] = useState<ConnectedTools>({
    'Slack': true, // Slack is already connected
    'Gmail': false,
    'WhatsApp': false,
    'Google Sheets': false,
    'Calendar': false,
    'Notifications': false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const prefilledWorkflows = [
    {
      title: "Daily Slack Standup Reminder",
      description: "Send a Slack message every weekday morning",
      workflow: {
        trigger: "Time-based",
        action: "Send Slack message",
        frequency: "Weekdays at 9:00 AM",
        tools: ["Slack"],
        prefilled: true
      }
    },
    {
      title: "Email to WhatsApp Notifications",
      description: "Get WhatsApp alerts for important emails",
      workflow: {
        trigger: "Email received",
        action: "Send WhatsApp message",
        frequency: "Every time",
        tools: ["Gmail", "WhatsApp"],
        prefilled: true
      }
    },
    {
      title: "Weekly Team Report",
      description: "Automatically generate and send weekly reports",
      workflow: {
        trigger: "Time-based",
        action: "Generate report",
        frequency: "Weekly on Fridays",
        tools: ["Google Sheets", "Slack"],
        prefilled: true
      }
    }
  ];

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
      case 'google sheets': return <MessageSquare className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'slack': return 'bg-purple-500';
      case 'whatsapp': return 'bg-green-500';
      case 'gmail': return 'bg-red-500';
      case 'calendar': return 'bg-blue-500';
      case 'google sheets': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const connectTool = async (toolName: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setConnectedTools(prev => ({ ...prev, [toolName]: true }));
        resolve();
      }, 2000);
    });
  };

  const suggestToolConnection = (toolName: string) => {
    const connectionMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: `I notice you need ${toolName} for this workflow. Would you like me to help you connect it? It's quick and secure! 🔗`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, connectionMessage]);
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
        botResponse = `Perfect! I understand you want to automate: "${input}". Let me set this up for you.`;
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

  const handlePrefilledWorkflow = (workflow: WorkflowSuggestion) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "Great choice! Let me set up this workflow for you. You can customize any of the settings below:",
      timestamp: new Date(),
      workflowSuggestion: workflow
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const WorkflowCard = ({ suggestion }: { suggestion: WorkflowSuggestion }) => {
    // Pre-select values based on the suggestion
    const [selectedTrigger, setSelectedTrigger] = useState(suggestion.trigger);
    const [selectedAction, setSelectedAction] = useState(suggestion.action);
    const [selectedFrequency, setSelectedFrequency] = useState(suggestion.frequency);
    const [customMessage, setCustomMessage] = useState(suggestion.prefilled ? 'Good morning team! Please share your daily standup updates.' : '');
    const [customChannel, setCustomChannel] = useState(suggestion.prefilled ? '#general' : '');
    const [showSetupSteps, setShowSetupSteps] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [stepStatuses, setStepStatuses] = useState({
      connect: 'pending',
      permissions: 'pending',
      test: 'pending'
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingTool, setConnectingTool] = useState('');

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
      'Generate report',
      'Execute webhook'
    ];

    const frequencyOptions = [
      'Once',
      'Daily',
      'Weekly',
      'Monthly',
      'Weekdays only',
      'Weekends only',
      'Every time',
      'Custom schedule'
    ];

    const needsSlackDetails = selectedAction === 'Send Slack message';
    
    // Check which tools are connected/disconnected
    const connectedToolsList = suggestion.tools.filter(tool => connectedTools[tool]);
    const disconnectedToolsList = suggestion.tools.filter(tool => !connectedTools[tool]);
    const allToolsConnected = disconnectedToolsList.length === 0;

    const handleConnectWorkflow = async () => {
      if (!allToolsConnected) {
        // Start connecting the first disconnected tool
        if (disconnectedToolsList.length > 0) {
          await handleConnectTool(disconnectedToolsList[0] || suggestion.tools[0]);
        }
        return;
      }
      
      setShowSetupSteps(true);
      setCurrentStep(1);
      setStepStatuses({
        connect: 'loading',
        permissions: 'pending',
        test: 'pending'
      });

      // Automatically start the setup flow
      setTimeout(async () => {
        // Step 1: Connect tools (simulate connection)
        setStepStatuses(prev => ({ ...prev, connect: 'completed' }));
        setCurrentStep(2);
        
        // Step 2: Configure permissions
        setTimeout(async () => {
          setStepStatuses(prev => ({ ...prev, permissions: 'loading' }));
          
          setTimeout(() => {
            setStepStatuses(prev => ({ ...prev, permissions: 'completed' }));
            setCurrentStep(3);
            
            // Step 3: Test & activate
            setTimeout(() => {
              setStepStatuses(prev => ({ ...prev, test: 'loading' }));
              
              setTimeout(() => {
                setStepStatuses(prev => ({ ...prev, test: 'completed' }));
                
                // Show success message
                setTimeout(() => {
                  const successMessage: Message = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: '🎉 Workflow activated successfully! Your automation is now live and will run according to your schedule.',
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, successMessage]);
                }, 500);
              }, 2000);
            }, 1000);
          }, 1500);
        }, 1000);
      }, 1000);
      
      console.log('Setting up workflow:', {
        trigger: selectedTrigger,
        action: selectedAction,
        frequency: selectedFrequency,
        customMessage,
        customChannel
      });
    };

    const handleConnectTool = async (toolName: string) => {
      setIsConnecting(true);
      setConnectingTool(toolName);
      
      try {
        await connectTool(toolName);
        setIsConnecting(false);
        setConnectingTool('');
        
        // Show success message for the specific tool
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: `🎉 Great! ${toolName} is now connected. ${disconnectedToolsList.filter(t => t !== toolName).length === 0 ? "All tools are connected! You can now set up your workflow." : `You still need to connect ${disconnectedToolsList.filter(t => t !== toolName).join(', ')}.`}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } catch (error) {
        console.error('Error connecting tool:', error);
        setIsConnecting(false);
        setConnectingTool('');
      }
    };

    const handleConfigurePermissions = async () => {
      setStepStatuses(prev => ({ ...prev, permissions: 'loading' }));
      
      // Simulate permissions configuration
      setTimeout(() => {
        setStepStatuses(prev => ({ ...prev, permissions: 'completed' }));
        setCurrentStep(3);
        
        // Auto-proceed to test step
        setTimeout(() => {
          handleTestWorkflow();
        }, 1000);
      }, 1500);
    };

    const handleTestWorkflow = async () => {
      setStepStatuses(prev => ({ ...prev, test: 'loading' }));
      
      // Simulate test execution
      setTimeout(() => {
        setStepStatuses(prev => ({ ...prev, test: 'completed' }));
        
        console.log('Workflow test completed, stepStatuses should be:', { test: 'completed' });
        
        // Show success message
        setTimeout(() => {
          const successMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: '🎉 Workflow activated successfully! Your automation is now live and will run according to your schedule. You can now view your dashboard or edit the workflow settings.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        }, 500);
      }, 2000);
    };

    const getStepIcon = (status: string, stepNumber: number) => {
      if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
      if (status === 'loading') return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          currentStep >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {stepNumber}
        </div>
      );
    };

    const getStepBackground = (status: string, stepNumber: number) => {
      if (status === 'completed') return 'bg-green-50 border-green-200';
      if (status === 'loading') return 'bg-blue-50 border-blue-200';
      if (currentStep >= stepNumber) return 'bg-white border-gray-200';
      return 'bg-gray-50 border-gray-200';
    };

    const handleViewDashboard = () => {
      setShowDashboard(true);
      const dashboardMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "🚀 Opening your workflow dashboard! Here you can monitor all your active automations, view performance metrics, and see recent activity.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, dashboardMessage]);
    };

    const handleEditWorkflow = () => {
      // Reset to editing mode
      setShowSetupSteps(false);
      setCurrentStep(1);
      setStepStatuses({
        connect: 'pending',
        permissions: 'pending',
        test: 'pending'
      });
      
      const editMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "✏️ Perfect! You can now edit your workflow settings below. Make any changes you need and then click 'Set Up Workflow' again to save the updated workflow.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, editMessage]);
    };

    const ToolConnectionCards = () => (
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-medium mb-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          Connect your tools to get started
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disconnectedToolsList.map((tool) => (
            <Card key={tool} className="p-4 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getToolColor(tool)} flex items-center justify-center text-white`}>
                    {getToolIcon(tool)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{tool}</div>
                    <div className="text-sm text-gray-600">Not connected</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleConnectTool(tool)}
                  disabled={isConnecting && connectingTool === tool}
                >
                  {isConnecting && connectingTool === tool ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700">
                  <strong>Secure connection:</strong> You'll be redirected to {tool}'s official login page. We only access what's needed for your workflow.
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Connected tools preview */}
        {connectedToolsList.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-medium text-green-700 mb-3">✅ Already connected:</div>
            <div className="flex flex-wrap gap-2">
              {connectedToolsList.map((tool) => (
                <div key={tool} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className={`w-6 h-6 rounded ${getToolColor(tool)} flex items-center justify-center text-white`}>
                    {getToolIcon(tool)}
                  </div>
                  <span className="text-sm text-green-800">{tool}</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const SetupStepsFlow = () => (
      <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Setting up your workflow...</h3>
        </div>
        
        <div className="space-y-4">
          {/* Step 1: Connect Tools */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStepBackground(stepStatuses.connect, 1)}`}>
            {getStepIcon(stepStatuses.connect, 1)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">Connect your tools</div>
              <div className="text-sm text-gray-600">
                {stepStatuses.connect === 'completed' ? 
                  `✅ Successfully connected to ${suggestion.tools.join(', ')}` :
                  stepStatuses.connect === 'loading' ?
                  `🔗 Connecting to ${suggestion.tools.join(', ')}...` :
                  `We'll help you connect ${suggestion.tools.join(', ')}` 
                }
              </div>
            </div>
            {stepStatuses.connect === 'pending' && (
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleConnectTool(disconnectedToolsList[0] || suggestion.tools[0])}
                disabled={isConnecting}
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
              </Button>
            )}
            {stepStatuses.connect === 'completed' && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Connected
              </Button>
            )}
          </div>

          {/* Step 2: Configure Permissions */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStepBackground(stepStatuses.permissions, 2)}`}>
            {getStepIcon(stepStatuses.permissions, 2)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">Configure permissions</div>
              <div className="text-sm text-gray-600">
                {stepStatuses.permissions === 'completed' ? 
                  '✅ Permissions configured successfully' :
                  stepStatuses.permissions === 'loading' ?
                  '⚙️ Configuring permissions...' :
                  'Grant necessary permissions for the workflow'
                }
              </div>
            </div>
            {stepStatuses.permissions === 'loading' && (
              <Button size="sm" variant="outline" disabled>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Configuring
              </Button>
            )}
            {stepStatuses.permissions === 'completed' && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                <Shield className="w-4 h-4 mr-1" />
                Configured
              </Button>
            )}
          </div>

          {/* Step 3: Test & Activate */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStepBackground(stepStatuses.test, 3)}`}>
            {getStepIcon(stepStatuses.test, 3)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">Test & activate</div>
              <div className="text-sm text-gray-600">
                {stepStatuses.test === 'completed' ? 
                  '🎉 Workflow is now active and running!' :
                  stepStatuses.test === 'loading' ?
                  '🧪 Testing workflow...' :
                  'Run a test and activate your workflow'
                }
              </div>
            </div>
            {stepStatuses.test === 'loading' && (
              <Button size="sm" variant="outline" disabled>
                <Play className="w-4 h-4 animate-spin mr-1" />
                Testing
              </Button>
            )}
            {stepStatuses.test === 'completed' && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </Button>
            )}
          </div>
        </div>

        {/* Connection Instructions */}
        {currentStep === 1 && stepStatuses.connect === 'loading' && !allToolsConnected && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <strong>Connecting...</strong> We're securely connecting to your {suggestion.tools.join(', ')} account(s).
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {stepStatuses.test === 'completed' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <div className="font-semibold">Workflow Successfully Activated!</div>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Your automation will now run {selectedFrequency.toLowerCase()} and {selectedAction.toLowerCase()}.
            </div>
          </div>
        )}
      </div>
    );

    return (
      <Card className="mt-6 p-0 bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Zap className="w-5 h-5" />
            Workflow Configuration
            {suggestion.prefilled && (
              <Badge className="bg-white/20 text-white border-0 ml-2">
                <Star className="w-3 h-3 mr-1" />
                Suggested
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Tool Connection Cards */}
          {!allToolsConnected && <ToolConnectionCards />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                When
              </div>
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-xl z-50">
                  {triggerOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Do
              </div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-xl z-50">
                  {actionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-green-500" />
                How Often
              </div>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-xl z-50">
                  {frequencyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsSlackDetails && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="font-medium text-gray-700 flex items-center gap-2">
                <Slack className="w-4 h-4 text-blue-600" />
                Slack Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Channel</label>
                  <Input
                    placeholder="e.g., #general, @username"
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="bg-white border-blue-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <Textarea
                    placeholder="What message should I send?"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="bg-white border-blue-200 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-gray-100" />
          
          <div className="space-y-3">
            <div className="font-medium text-gray-700">Required Tools</div>
            <div className="flex flex-wrap gap-2">
              {suggestion.tools.map((tool, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`flex items-center gap-1 px-3 py-1 ${
                    connectedTools[tool] 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {getToolIcon(tool)}
                  {tool}
                  {connectedTools[tool] && <CheckCircle className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          {suggestion.missingInfo && suggestion.missingInfo.length > 0 && !suggestion.prefilled && (
            <div className="space-y-3">
              <div className="font-medium text-amber-600">Configuration Notes:</div>
              <div className="space-y-2">
                {suggestion.missingInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main action buttons */}
          <div className="flex gap-3 pt-4">
            {console.log('Current stepStatuses.test:', stepStatuses.test)}
            {stepStatuses.test === 'completed' ? (
              <>
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-11 rounded-xl"
                  onClick={handleViewDashboard}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 h-11 rounded-xl"
                  onClick={handleEditWorkflow}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Workflow
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-11 rounded-xl"
                  onClick={handleConnectWorkflow}
                  disabled={showSetupSteps || !allToolsConnected}
                >
                  {showSetupSteps ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setting Up...
                    </>
                  ) : !allToolsConnected ? (
                    <>
                      Connect Tools First
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Set Up Workflow
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 h-11 rounded-xl px-6">
                  <Edit className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </>
            )}
          </div>

          {/* Debug info - remove this after testing */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            Debug: stepStatuses.test = {stepStatuses.test}, showSetupSteps = {showSetupSteps.toString()}
          </div>

          {showSetupSteps && <SetupStepsFlow />}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TryCentral AI</h1>
              <p className="text-sm text-gray-600">Automation made simple</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              ⭐ 5.0 rating
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              1000+ automations created
            </Badge>
            <Sheet open={showDashboard} onOpenChange={setShowDashboard}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[800px] sm:max-w-[800px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Workflow Dashboard
                  </SheetTitle>
                  <SheetDescription>
                    Monitor your active automations and view performance metrics.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Workflows</p>
                          <p className="text-2xl font-bold text-blue-600">3</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold text-green-600">98%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">This Week</p>
                          <p className="text-2xl font-bold text-purple-600">47</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Play className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Active Workflows */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Workflows</h3>
                    <div className="space-y-3">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Slack className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Daily Slack Standup Reminder</p>
                              <p className="text-sm text-gray-600">Weekdays at 9:00 AM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Email to WhatsApp Notifications</p>
                              <p className="text-sm text-gray-600">When important email received</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Weekly Team Report</p>
                              <p className="text-sm text-gray-600">Fridays at 5:00 PM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Quick Start Suggestions */}
      {messages.length === 1 && (
        <div className="p-4 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prefilledWorkflows.map((workflow, index) => (
                <Card 
                  key={index} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white border-gray-200 rounded-xl"
                  onClick={() => handlePrefilledWorkflow(workflow.workflow)}
                >
                  <h4 className="font-medium text-gray-800 mb-2">{workflow.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  <div className="flex items-center gap-2">
                    {workflow.workflow.tools.map((tool, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-blue-600">
                        {getToolIcon(tool)}
                        {tool}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex items-start gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white border-2 border-blue-200'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className={`space-y-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl max-w-full ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
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
                <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tell me what you'd like to automate... e.g., 'Send me a Slack reminder every Friday at 5pm'"
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 rounded-xl bg-white"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 h-12 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
