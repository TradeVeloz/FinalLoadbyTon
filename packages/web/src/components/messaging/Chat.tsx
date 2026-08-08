import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface ChatProps {
  jobId: string;
}

export const Chat: React.FC<ChatProps> = ({ jobId }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { connected, joinJob, leaveJob, on } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchApi<Message[]>(`/messages/job/${jobId}`)
      .then((data) => {
        if (active) setMessages(data);
      })
      .catch((err: unknown) => {
        if (active) {
          addToast({
            type: 'error',
            title: 'Failed to load messages',
            description: err instanceof Error ? err.message : 'Please try again.',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId, addToast]);

  useEffect(() => {
    joinJob(jobId);
    const unsubscribe = on('message:new', (data) => {
      const incoming = data as Message;
      if (!incoming || incoming.jobId !== jobId) return;
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
    });

    return () => {
      unsubscribe();
      leaveJob(jobId);
    };
  }, [jobId, joinJob, leaveJob, on]);

  const handleSend = useCallback(
    (content: string) => {
      if (!user) return;
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        jobId,
        senderId: user.id,
        senderName: user.profile?.companyName ?? 'You',
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);

      fetchApi<Message>(`/messages/job/${jobId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
        .then((created) => {
          setMessages((prev) => {
            const index = prev.findIndex((msg) => msg.id === tempId);
            if (index === -1) return prev;
            const next = [...prev];
            next[index] = created;
            return next;
          });
        })
        .catch((err: unknown) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          addToast({
            type: 'error',
            title: 'Failed to send message',
            description: err instanceof Error ? err.message : 'Please try again.',
          });
        });
    },
    [user, jobId, addToast]
  );

  return (
    <Card className="shadow-premium">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Job Thread</CardTitle>
        <span
          className={cn(
            'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider',
            connected ? 'text-emerald-600' : 'text-gray-400'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', connected ? 'animate-pulse bg-emerald-500' : 'bg-gray-400')} />
          {connected ? 'Live' : 'Offline'}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Loading messages…</div>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id ?? ''} />
        )}
        <MessageInput onSend={handleSend} />
      </CardContent>
    </Card>
  );
};
