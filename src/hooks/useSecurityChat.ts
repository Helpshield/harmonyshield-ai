import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language?: string;
  type?: 'text' | 'file_scan' | 'url_scan' | 'threat_alert';
  scanResult?: any;
}

export interface SecurityChatHook {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: string, language?: string) => Promise<void>;
  scanFile: (fileHash: string, fileName: string, language?: string) => Promise<void>;
  scanURL: (url: string, language?: string) => Promise<void>;
  getDailyThreats: (language?: string) => Promise<void>;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;
}

export const useSecurityChat = (): SecurityChatHook => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m Harmony AI, your security assistant. I can help you scan files and URLs for threats, provide security advice, and keep you updated on the latest cybersecurity threats. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  const connect = useCallback(() => {
    try {
      // For demo purposes, we'll simulate WebSocket connection
      // In production, this would connect to a WebSocket endpoint
      setIsConnected(true);
      setError(null);
      console.log('Security chat connected');
    } catch (error) {
      console.error('Failed to connect to security chat:', error);
      setError('Failed to connect to security chat service');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send chat message
  const sendMessage = useCallback(async (message: string, language: string = 'en') => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
      language,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-chat', {
        body: {
          message,
          language,
          requestType: 'chat'
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I apologize, but I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date(),
        language,
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Scan file for threats
  const scanFile = useCallback(async (fileHash: string, fileName: string, language: string = 'en') => {
    const scanMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Scanning file: ${fileName}`,
      isUser: true,
      timestamp: new Date(),
      type: 'file_scan'
    };

    setMessages(prev => [...prev, scanMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-chat', {
        body: {
          fileHash,
          language,
          requestType: 'file_scan'
        }
      });

      if (error) throw error;

      const resultMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message || 'File scan completed',
        isUser: false,
        timestamp: new Date(),
        type: 'file_scan',
        scanResult: data.scanResult
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Error scanning file:', error);
      setError('Failed to scan file. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Failed to scan file. Please ensure the file is valid and try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'file_scan'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Scan URL for threats
  const scanURL = useCallback(async (url: string, language: string = 'en') => {
    const scanMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Scanning URL: ${url}`,
      isUser: true,
      timestamp: new Date(),
      type: 'url_scan'
    };

    setMessages(prev => [...prev, scanMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-chat', {
        body: {
          url,
          language,
          requestType: 'url_scan'
        }
      });

      if (error) throw error;

      const resultMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message || 'URL scan completed',
        isUser: false,
        timestamp: new Date(),
        type: 'url_scan',
        scanResult: data.scanResult
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Error scanning URL:', error);
      setError('Failed to scan URL. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Failed to scan URL. Please ensure the URL is valid and try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'url_scan'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get daily threat information
  const getDailyThreats = useCallback(async (language: string = 'en') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-chat', {
        body: {
          language,
          requestType: 'daily_threats'
        }
      });

      if (error) throw error;

      const threatsMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `📊 Today's Security Threats:\n\n${data.threats.map((threat: any, index: number) => 
          `${index + 1}. **${threat.type.toUpperCase()}** (${threat.severity})\n${threat.description}\n💡 ${threat.recommendation}\n`
        ).join('\n')}`,
        isUser: false,
        timestamp: new Date(),
        type: 'threat_alert'
      };

      setMessages(prev => [...prev, threatsMessage]);
    } catch (error) {
      console.error('Error getting daily threats:', error);
      setError('Failed to get daily threats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: '1',
      text: 'Hello! I\'m Harmony AI, your security assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }]);
    setError(null);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    scanFile,
    scanURL,
    getDailyThreats,
    clearMessages,
    connect,
    disconnect
  };
};