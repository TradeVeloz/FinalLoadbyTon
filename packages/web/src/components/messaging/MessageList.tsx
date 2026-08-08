import React, { useEffect, useRef } from 'react';
import { Paperclip, ExternalLink } from 'lucide-react';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 p-1">
      {messages.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">No messages yet.</p>
          <p className="mt-1 text-xs text-gray-400">Start the conversation with the other party.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const own = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', own ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] px-3.5 py-2.5 shadow-sm animate-fade-in-up',
                  own
                    ? 'bg-brand-orange text-white rounded-l-xl rounded-tr-xl'
                    : 'bg-white border border-gray-200 rounded-r-xl rounded-tl-xl'
                )}
              >
                <p className={cn('text-xs font-semibold mb-0.5', own ? 'text-white/90' : 'text-gray-500')}>
                  {msg.senderName}
                </p>
                <p className={cn('text-sm whitespace-pre-wrap break-words', own ? 'text-white' : 'text-gray-800')}>
                  {msg.content}
                </p>
                {msg.attachmentUrl && (
                  <a
                    href={msg.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'mt-1.5 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium',
                      own
                        ? 'border-white/25 bg-white/15 text-white hover:bg-white/25'
                        : 'border-gray-200 bg-gray-50 text-navy-800 hover:bg-gray-100'
                    )}
                  >
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="max-w-[160px] truncate">{msg.attachmentName ?? msg.attachmentUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                <p className={cn('mt-1 text-[10px]', own ? 'text-white/70' : 'text-gray-400')}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};
