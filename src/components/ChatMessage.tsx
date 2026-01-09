import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
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
              : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-800'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="text-sm markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  table: ({ children }) => (
                    <div className="my-3 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
                      <table className="w-full text-left text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>,
                  tr: ({ children }) => <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">{children}</th>
                  ),
                  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
                  code: ({ children, className }) => {
                    const isInline = !className || !className.includes('language-');
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{children}</code>
                    ) : (
                      <code className="block bg-gray-200 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto my-2 text-gray-800 dark:text-gray-200">{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic my-2 text-gray-700 dark:text-gray-300">{children}</blockquote>
                  ),
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-gray-900 dark:text-white">{children}</h3>,
                  hr: () => <hr className="my-3 border-gray-300 dark:border-gray-700" />,
                  a: ({ href, children }) => (
                    <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

