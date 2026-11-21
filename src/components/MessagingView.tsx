import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Paperclip,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '../i18n/translations';
import { Conversation, ServiceRequest, UserRole } from '../types/salu';
import { RequestStateTag, SafeAvatar } from './ui/Primitives';
import { WhatsAppCircleSprite } from './ui/SaluIcons';

interface MessagingViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  requests: ServiceRequest[];
  activeRole: UserRole;
  userName: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  onOpenRequestDetail: (requestId: string) => void;
}

export function MessagingView({
  conversations,
  activeConversationId,
  requests,
  activeRole,
  userName,
  onSelectConversation,
  onSendMessage,
  onOpenRequestDetail,
}: MessagingViewProps) {
  const { lang, t } = useLang();
  const [draftText, setDraftText] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const linkedRequest = activeConv
    ? requests.find((r) => r.id === activeConv.requestId)
    : undefined;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || (!draftText.trim() && !attachment)) return;
    onSendMessage(
      activeConv.id,
      draftText.trim() || (lang === 'pt' ? 'Ficheiro do projeto anexado' : 'Attached project file'),
      attachment
    );
    setDraftText('');
    setAttachment(undefined);
  };

  const isProvider = activeRole === 'provider';

  return (
    <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] shadow-xs">
      {/* Left Conversation List */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] dark:border-[#1E325C] flex flex-col">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E325C]">
          <h1 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Conversas', 'Conversations')} ({conversations.length})
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {t(
              'Negocie o âmbito e registe os termos dentro da SALU.',
              'Negotiate scope and preserve terms inside SALU.'
            )}
          </p>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C] overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const selected = activeConv?.id === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                  selected
                    ? isProvider
                      ? 'bg-[#F97316]/10 dark:bg-[#F97316]/15'
                      : 'bg-[#1D6FE5]/10 dark:bg-[#1D6FE5]/20'
                    : 'hover:bg-[#F8FAFC] dark:hover:bg-[#132347]/60'
                }`}
              >
                <SafeAvatar
                  src={conv.otherPartyAvatar}
                  alt={conv.otherPartyName}
                  sizeClass="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                      {conv.otherPartyName}
                    </p>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                      {conv.lastMessageAt}
                    </span>
                  </div>
                  <p className="text-xs text-[#1D6FE5] dark:text-[#60A5FA] truncate">
                    {conv.requestTitle}
                  </p>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate mt-0.5">
                    {lastMsg?.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat & Request Context */}
      {activeConv ? (
        <div className="lg:col-span-8 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E325C] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <SafeAvatar
                src={activeConv.otherPartyAvatar}
                alt={activeConv.otherPartyName}
                sizeClass="w-10 h-10"
              />
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white truncate">
                  {activeConv.otherPartyName}
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate">
                  {activeConv.otherPartyRoleLabel} · {activeConv.otherPartyLocation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeConv.whatsappAvailable && (
                <a
                  href="https://wa.me/244923410882"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15803D] dark:text-[#86EFAC] bg-[#F0FDF4] dark:bg-[#16A34A]/15 border border-[#BBF7D0] dark:border-[#16A34A]/35 rounded-lg hover:bg-[#DCFCE7] dark:hover:bg-[#16A34A]/25 transition-colors"
                >
                  <WhatsAppCircleSprite className="w-4 h-4" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {linkedRequest && (
                <button
                  type="button"
                  onClick={() => onOpenRequestDetail(linkedRequest.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg ${
                    isProvider
                      ? 'bg-[#F97316] hover:bg-[#EA580C]'
                      : 'bg-[#1D6FE5] hover:bg-[#1558B8]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('Ver Pedido & Acordo', 'View Request & Agreement')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Pinned Request Context Strip */}
          {linkedRequest && (
            <div className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#060E20] border-b border-[#E2E8F0] dark:border-[#1E325C] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <RequestStateTag state={linkedRequest.state} />
                <span className="font-medium text-[#334155] dark:text-[#CBD5E1] truncate">
                  {linkedRequest.title}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[#475569] dark:text-[#94A3B8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1D6FE5] dark:text-[#60A5FA]" />
                <span>
                  {t(
                    'Mantenha o preço final e o âmbito confirmados na SALU',
                    'Keep final price & scope confirmed inside SALU'
                  )}
                </span>
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[400px]">
            {activeConv.messages.map((msg) => {
              const isMine = msg.senderRole === activeRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1">
                    {isMine ? userName : msg.senderName} · {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                      isMine
                        ? isProvider
                          ? 'bg-[#F97316] text-white'
                          : 'bg-[#1D6FE5] text-white'
                        : 'bg-[#F1F5F9] dark:bg-[#132347] text-[#0F172A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.attachmentName && (
                      <div
                        className={`mt-2 pt-2 border-t text-xs flex items-center gap-1.5 ${
                          isMine
                            ? 'border-white/20 text-white/90'
                            : 'border-[#CBD5E1] dark:border-[#1E325C] text-[#475569] dark:text-[#CBD5E1]'
                        }`}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{msg.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-2"
          >
            {attachment && (
              <div className="flex items-center justify-between px-3 py-1.5 text-xs bg-[#F1F5F9] dark:bg-[#132347] rounded-md">
                <span>{t('Anexado:', 'Attached:')} {attachment}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(undefined)}
                  className="text-[#64748B] hover:text-red-600"
                >
                  {t('Remover', 'Remove')}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAttachment(
                    lang === 'pt' ? 'Foto_Referencia_Ambito.jpg' : 'Scope_Reference_Photo.jpg'
                  )
                }
                className="p-2.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
                title={t('Anexar ficheiro ou foto', 'Attach sample file or photo')}
                aria-label={t('Anexar ficheiro', 'Attach file')}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={t(
                  'Escreva uma mensagem ou proponha termos...',
                  'Write a message or propose terms...'
                )}
                className="flex-1 px-3.5 py-2.5 text-sm bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#0F172A] dark:text-white focus:outline-none focus:border-[#1D6FE5]"
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-lg ${
                  isProvider
                    ? 'bg-[#F97316] hover:bg-[#EA580C]'
                    : 'bg-[#1D6FE5] hover:bg-[#1558B8]'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Enviar', 'Send')}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="lg:col-span-8 flex items-center justify-center p-10 text-sm text-[#64748B]">
          {t('Selecione uma conversa para ver as mensagens.', 'Select a conversation to view messages.')}
        </div>
      )}
    </div>
  );
}
