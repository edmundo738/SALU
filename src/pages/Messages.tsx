import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import type { FileRecord } from '../../shared/types';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { useI18n, formatDateTime } from '../i18n';
import { friendlyError } from '../lib/errors';
import { Avatar, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '../components/ui/Base';
import { ConversationRow } from '../components/Cards';
import { FileUpload } from '../components/FileUpload';
import { useToast } from '../app/ToastProvider';
import { FileImage } from '../components/FileImage';

export function MessagesPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const toast = useToast();
  const conversations = useApiData(() => api.conversations(), []);
  const [tick, setTick] = useState(0);
  const thread = useApiData(() => (id ? api.messages(id) : Promise.resolve(null)), [id, tick]);
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<FileRecord | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.data?.messages.length, id]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!id || (!body.trim() && !attachment)) return;
    setSending(true);
    setError(null);
    try {
      await api.sendMessage(id, { body: body.trim(), fileIds: attachment ? [attachment.id] : [] });
      setBody('');
      setAttachment(null);
      setTick((value) => value + 1);
      conversations.reload();
      toast.success(t('messages.sent'));
    } catch (err) {
      const message = friendlyError(err, lang, t);
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {!id && <PageHeader eyebrow={t('nav.messages')} title={t('messages.title')} subtitle={t('messages.subtitle')} />}

      <div className={`grid gap-4 ${id ? 'md:grid-cols-[300px_1fr]' : 'md:grid-cols-[320px_1fr]'}`}>
        <div className={id ? 'hidden md:block' : ''}>
          <Card className="p-2">
            {conversations.loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-16" />
                ))}
              </div>
            ) : conversations.error ? (
              <div className="p-2">
                <ErrorState
                  message={friendlyError(new Error(conversations.error), lang, t)}
                  onRetry={conversations.reload}
                  retryLabel={t('common.retry')}
                />
              </div>
            ) : !conversations.data?.conversations.length ? (
              <EmptyState icon={MessageSquare} title={t('messages.empty')} body={t('messages.emptyBody')} />
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                {conversations.data.conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={conversation.id === id ? 'bg-[#EFF6FF] dark:bg-[#132347] rounded-xl' : ''}
                  >
                    <ConversationRow conversation={conversation} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className={id ? '' : 'hidden md:block'}>
          {!id ? (
            <Card className="h-full min-h-[28rem] flex items-center justify-center">
              <EmptyState icon={MessageSquare} title={t('messages.select')} body={t('messages.subtitle')} />
            </Card>
          ) : thread.loading && !thread.data ? (
            <Card className="p-5 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-16" />
              ))}
            </Card>
          ) : thread.error || !thread.data ? (
            <ErrorState
              message={friendlyError(new Error(thread.error || 'not found'), lang, t)}
              onRetry={thread.reload}
              retryLabel={t('common.retry')}
            />
          ) : (
            <Card className="flex flex-col h-[calc(100vh-12rem)] min-h-[28rem]">
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] p-3 dark:border-[#1E325C]">
                <Link
                  to="/mensagens"
                  className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#132347]"
                  aria-label={t('common.back')}
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Avatar
                  file={thread.data.conversation.otherPartyAvatar}
                  name={thread.data.conversation.otherPartyName}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-[#0F172A] dark:text-white">
                    {thread.data.conversation.otherPartyName}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                    {thread.data.conversation.requestTitle}
                  </p>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F8FAFC] dark:bg-[#081C41]/40"
                aria-live="polite"
              >
                {thread.data.messages.length === 0 ? (
                  <EmptyState icon={MessageSquare} title={t('messages.noMessages')} body={t('messages.start')} />
                ) : (
                  thread.data.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${message.mine ? 'bg-[#1D6FE5] text-white rounded-br-md' : 'bg-white text-[#0F172A] border border-[#E2E8F0] dark:bg-[#0C1833] dark:text-[#F8FAFC] dark:border-[#1E325C] rounded-bl-md'}`}
                      >
                        {message.body && <p className="whitespace-pre-line break-words">{message.body}</p>}
                        {message.attachment && (
                          <a
                            href={api.fileUrl(message.attachment)}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 block rounded-lg overflow-hidden ${message.body ? '' : 'mt-0'}`}
                          >
                            {message.attachment.mime.startsWith('image/') ? (
                              <FileImage file={message.attachment} className="max-h-56 w-auto rounded-lg" />
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs underline">
                                <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                                {message.attachment.name}
                              </span>
                            )}
                          </a>
                        )}
                        <p className={`mt-1 text-[10px] ${message.mine ? 'text-white/65' : 'text-[#94A3B8]'}`}>
                          {formatDateTime(message.createdAt, lang)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="border-t border-[#E2E8F0] p-3 dark:border-[#1E325C]">
                {error && (
                  <p className="mb-2 text-xs text-red-700 dark:text-red-300" role="alert">
                    {error}
                  </p>
                )}
                {attachment && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#F1F5F9] p-2 text-xs dark:bg-[#132347]">
                    <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate flex-1">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="min-h-11 min-w-11 inline-flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-[#1E325C]"
                      aria-label={t('common.remove')}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor="message-body" className="sr-only">
                      {t('messages.placeholder')}
                    </label>
                    <textarea
                      id="message-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void send(e as unknown as React.FormEvent);
                        }
                      }}
                      placeholder={t('messages.placeholder')}
                      rows={2}
                      maxLength={4000}
                      className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm focus:border-[#1D6FE5] focus:outline-none focus:ring-2 focus:ring-[#1D6FE5]/25 dark:border-[#1E325C] dark:bg-[#0C1833]"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <FileUpload
                      purpose="message"
                      label={t('messages.attach')}
                      compact
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onUploaded={setAttachment}
                    />
                    <Button type="submit" loading={sending} aria-label={t('messages.send')}>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('common.send')}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
