import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type {
  GreetingMessage,
  AgentResponseMessage,
  ProfileUpdateMessage,
  IntelligenceSummaryMessage,
  SuggestedNextStepsMessage,
  ErrorMessage,
} from '../services/api';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatCanvasProps {
  greeting?: GreetingMessage | null;
  agentResponse?: AgentResponseMessage | null;
  profileUpdate?: ProfileUpdateMessage | null;
  intelligenceSummary?: IntelligenceSummaryMessage | null;
  suggestedNextSteps?: SuggestedNextStepsMessage | null;
  error?: ErrorMessage | null;
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function ChatCanvas({
  greeting,
  agentResponse,
  profileUpdate,
  intelligenceSummary,
  suggestedNextSteps,
  error,
  onSendMessage,
  isConnected,
  isConnecting,
  sidebarOpen = false,
  onToggleSidebar,
}: ChatCanvasProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const greetingAddedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  // Handle greeting
  useEffect(() => {
    if (greeting && !greetingAddedRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: `greeting-${Date.now()}`,
          content: greeting.message,
          isUser: false,
          timestamp: greeting.timestamp || new Date().toISOString(),
        },
      ]);
      greetingAddedRef.current = true;
    }
  }, [greeting]);

  // Handle agent response chunks - SINGLE useEffect to prevent duplication
  useEffect(() => {
    if (!agentResponse) return;

    if (agentResponse.is_complete) {
      // Final chunk - complete the streaming message
      if (streamingMessageIdRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMessageIdRef.current
              ? { ...m, content: currentStreamingMessage, isStreaming: false }
              : m
          )
        );
        streamingMessageIdRef.current = null;
        setCurrentStreamingMessage('');
        setIsAgentThinking(false);
      }
    } else if (agentResponse.content) {
      // Streaming chunk with content - first token arrived
      setIsAgentThinking(false);
      
      if (!streamingMessageIdRef.current) {
        // Start new streaming message
        const id = `agent-${Date.now()}`;
        streamingMessageIdRef.current = id;
        setMessages((prev) => [
          ...prev,
          {
            id,
            content: '',
            isUser: false,
            timestamp: agentResponse.timestamp || new Date().toISOString(),
            isStreaming: true,
          },
        ]);
      }
      
      // Accumulate the chunk and update message in one operation
      setCurrentStreamingMessage((prev) => {
        const newContent = prev + agentResponse.content;
        // Update the message immediately with new content
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.id === streamingMessageIdRef.current
              ? { ...m, content: newContent, isStreaming: true }
              : m
          )
        );
        return newContent;
      });
    }
  }, [agentResponse]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: `Error: ${error.message}`,
          isUser: false,
          timestamp: error.timestamp || new Date().toISOString(),
        },
      ]);
    }
  }, [error]);

  const handleSend = (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAgentThinking(true); // Show loading when user sends message
    onSendMessage(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Agent Chat</h2>
            {isConnected ? (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Active
              </span>
            ) : isConnecting ? (
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Connecting...
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                Disconnected
              </span>
            )}
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isConnecting && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Start a conversation with your financial adviser...
          </div>
        )}
        {isConnecting && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Connecting to your financial adviser...
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isStreaming={message.isStreaming}
          />
        ))}
        {isAgentThinking && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500">Agent is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </div>
  );
}

