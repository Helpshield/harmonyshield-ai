import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Send, 
  Shield, 
  RefreshCw,
  Trash2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SecurityChatAssistant = () => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm Harmony AI, your cybersecurity assistant for the Harmony Shield platform. I can help you with:\n\n• Understanding Harmony Shield features\n• Cybersecurity best practices\n• Fraud detection and prevention\n• Digital safety tips\n• Platform navigation and support\n\nHow can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-chat', {
        body: { message: inputMessage, requestType: 'chat' }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I apologize, but I could not process your request.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm Harmony AI, your cybersecurity assistant for the Harmony Shield platform. How can I assist you today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 p-4",
          message.isUser ? "justify-end" : "justify-start"
        )}
      >
        {!message.isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
        
        <div
          className={cn(
            "max-w-[75%] p-4 rounded-2xl text-sm",
            message.isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
          
          <div className="text-xs opacity-60 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {message.isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium">You</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-none shadow-elegant bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Harmony AI Assistant</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Your cybersecurity companion for Harmony Shield
                  </p>
                </div>
              </CardTitle>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Chat
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[650px] flex flex-col shadow-elegant border-border/50">
          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                      </div>
                      <div className="bg-muted text-foreground p-4 rounded-2xl rounded-bl-sm text-sm">
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask me about Harmony Shield, cybersecurity tips, fraud prevention, or any security concerns..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-[120px] resize-none flex-1"
                disabled={isLoading}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Bot className="h-3 w-3" />
              Powered by AI • Ask me anything about cybersecurity and Harmony Shield
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecurityChatAssistant;