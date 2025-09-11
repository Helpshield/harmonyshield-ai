import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityChat, type ChatMessage } from '@/hooks/useSecurityChat';
import { translateSecurityText, detectLanguage, getSecurityResponseTemplate } from '@/utils/translationUtils';
import { 
  Bot, 
  Send, 
  Upload, 
  Link, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  FileText,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SecurityChatAssistant = () => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [urlToScan, setUrlToScan] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    scanFile,
    scanURL,
    getDailyThreats,
    clearMessages
  } = useSecurityChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !urlToScan.trim()) return;
    
    // Auto-detect language if not set
    const detectedLang = selectedLanguage === 'auto' ? detectLanguage(inputMessage || urlToScan) : selectedLanguage;
    
    // If there's a URL to scan, scan it first
    if (urlToScan.trim()) {
      await handleUrlScan();
    }
    
    // If there's a message, send it
    if (inputMessage.trim()) {
      await sendMessage(inputMessage, detectedLang);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create file hash (simplified - in production use proper hashing)
      const arrayBuffer = await file.arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hash));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await scanFile(fileHash, file.name, selectedLanguage);
      
      toast({
        title: "File Upload",
        description: `File "${file.name}" uploaded for scanning`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlScan = async () => {
    if (!urlToScan.trim()) return;
    
    await scanURL(urlToScan, selectedLanguage);
    setUrlToScan('');
    
    toast({
      title: "URL Scan",
      description: "URL submitted for security scanning",
    });
  };

  const handleGetDailyThreats = async () => {
    await getDailyThreats(selectedLanguage);
    toast({
      title: "Daily Threats",
      description: "Latest security threat information loaded",
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isSystemMessage = message.type !== 'text';
    
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
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}
        
        <div
          className={cn(
            "max-w-[80%] p-3 rounded-lg text-sm space-y-2",
            message.isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <div className="whitespace-pre-wrap">{message.text}</div>
          
          {/* Render scan results */}
          {message.scanResult && (
            <div className="mt-2 p-2 rounded border border-border/50 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                {message.type === 'file_scan' && <FileText className="h-4 w-4" />}
                {message.type === 'url_scan' && <Link className="h-4 w-4" />}
                <span className="text-xs font-medium">Scan Results</span>
              </div>
              
              {message.scanResult.error ? (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">{message.scanResult.error}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Analysis completed</span>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs opacity-60">
            {message.timestamp.toLocaleTimeString()}
            {message.language && message.language !== 'en' && (
              <Badge variant="outline" className="ml-2 text-xs">
                {message.language.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
        
        {message.isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium">You</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <span>AI Security Chat Assistant</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetDailyThreats}
                disabled={isLoading}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Daily Threats
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm">
                        Analyzing your request...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Error Display */}
          {error && (
            <div className="border-t border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Input Area - Directly Attached */}
          <div className="border-t border-border p-4 bg-background">
            <div className="space-y-3">
              {/* Attachment Preview */}
              {urlToScan && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Link className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground flex-1">{urlToScan}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUrlToScan('')}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Main Input Area */}
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Ask about security, paste URLs to scan, or type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[80px] resize-none"
                    disabled={isLoading}
                  />
                  
                  {/* URL Input for Scanning */}
                  <Input
                    placeholder="Paste URL here to scan for threats (e.g., https://example.com)"
                    value={urlToScan}
                    onChange={(e) => setUrlToScan(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !urlToScan.trim()) || isLoading}
                    className="h-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10"
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  
                  {urlToScan.trim() && (
                    <Button
                      variant="outline"
                      onClick={handleUrlScan}
                      disabled={isLoading}
                      className="h-10"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
              
              {/* Help Text */}
              <p className="text-xs text-muted-foreground">
                Type your message, paste URLs to scan, or upload files for security analysis
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecurityChatAssistant;