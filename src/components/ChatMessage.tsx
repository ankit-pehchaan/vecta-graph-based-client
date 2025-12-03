import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ content, isUser, timestamp, isStreaming }: ChatMessageProps) {
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="text-sm markdown-content">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children, className }) => {
                    const isInline = !className || !className.includes('language-');
                    return isInline ? (
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code>
                    ) : (
                      <code className="block bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2 text-gray-700">{children}</blockquote>
                  ),
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-gray-900">{children}</h3>,
                  hr: () => <hr className="my-3 border-gray-300" />,
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          {isStreaming && !isUser && (
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full ml-1 animate-pulse" />
          )}
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

