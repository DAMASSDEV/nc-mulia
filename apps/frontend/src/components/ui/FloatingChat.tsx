import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Send, ChevronLeft, Plus, Headphones, AlertCircle } from 'lucide-react';
import { chatApi } from '../../lib/api';
import type { ChatMessage, ChatConversation } from '../../types';

interface FloatingChatProps {
  user: { id: string; name: string; role: string } | null;
}

const INACTIVITY_MS = 5 * 60 * 1000;

type Category = 'service' | 'complaint';
type ChatView = 'list' | 'greeting' | 'chat';

export function FloatingChat({ user }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>('list');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [conversations, setConversations] = useState<
    Array<{ id: string; customerName: string; unreadCount: number }>
  >([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBack = useCallback(() => {
    setActiveConv(null);
    setMessages([]);
    setView('list');
    lastActivityRef.current = Date.now();
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setView('list');
    setActiveConv(null);
    setMessages([]);
    setConversations([]);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (!isOpen || view !== 'chat' || !activeConv) return;
    inactivityTimerRef.current = setTimeout(() => {
      handleBack();
    }, INACTIVITY_MS);
  }, [isOpen, view, activeConv, handleBack]);

  useEffect(() => {
    if (!isOpen || view !== 'chat' || !activeConv) return;
    const trackActivity = () => {
      lastActivityRef.current = Date.now();
      resetInactivityTimer();
    };
    document.addEventListener('mousemove', trackActivity, { passive: true });
    document.addEventListener('keydown', trackActivity, { passive: true });
    document.addEventListener('click', trackActivity, { passive: true });
    return () => {
      document.removeEventListener('mousemove', trackActivity);
      document.removeEventListener('keydown', trackActivity);
      document.removeEventListener('click', trackActivity);
    };
  }, [isOpen, view, activeConv, resetInactivityTimer]);

  useEffect(() => {
    resetInactivityTimer();
  }, [isOpen, view, activeConv, resetInactivityTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen && view === 'chat' && activeConv) {
        const idleTime = Date.now() - lastActivityRef.current;
        if (idleTime >= INACTIVITY_MS) handleBack();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpen, view, activeConv, handleBack]);

  useEffect(() => {
    if (isOpen && user && view === 'list') {
      loadConversations();
    }
  }, [isOpen, user, view]);

  useEffect(() => {
    if (isOpen && activeConv && view === 'chat') {
      loadMessages(activeConv);
      lastActivityRef.current = Date.now();
      resetInactivityTimer();
    }
  }, [isOpen, activeConv, view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await chatApi.listConversations();
      const mapped =
        convs.data?.map((c: ChatConversation) => ({
          id: c.id,
          customerName: c.customerName || 'Pengguna',
          unreadCount: c.unreadCount || 0,
        })) ?? [];
      setConversations(mapped);
    } catch {}
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await chatApi.getMessages(convId);
      setMessages(msgs.data ?? []);
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv || !user) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      const msg = await chatApi.sendMessage(activeConv, { message: text });
      if (msg.data) setMessages(prev => [...prev, msg.data!]);
      lastActivityRef.current = Date.now();
      resetInactivityTimer();
    } catch {}
    setSending(false);
  };

  // Start new conversation from greeting screen
  const handleStartNew = useCallback(async (category: Category) => {
    if (!user || creating) return;
    setCreating(true);
    try {
      const res = await chatApi.createConversation({
        customerName: user.name,
        category,
      });
      if (res.data && res.data.id) {
        const conv = res.data as ChatConversation;
        setConversations(prev => [
          { id: conv.id, customerName: conv.customerName || 'Pengguna', unreadCount: 0 },
          ...prev,
        ]);
        setActiveConv(conv.id);
        setMessages([]);
        setView('chat');
        lastActivityRef.current = Date.now();
        resetInactivityTimer();
      }
    } catch {}
    setCreating(false);
  }, [user, creating, resetInactivityTimer]);

  // Hide only for admin users
  if (user && (user.role === 'admin' || user.role === 'super_admin')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary-hover active:scale-95 transition-all flex items-center justify-center"
          aria-label="Buka chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat popup */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-80 sm:w-96 h-[32rem] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-primary text-white">
            <div className="flex items-center gap-2">
              {view === 'chat' && (
                <button
                  onClick={handleBack}
                  className="w-7 h-7 -ml-1 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Kembali"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold text-sm">Live Chat</span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Tutup chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* ── LIST VIEW ── */}
            {view === 'list' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-14 h-14 rounded-full bg-brand-primary-soft flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-brand-primary" />
                </div>
                {!user ? (
                  <div className="text-center space-y-3">
                    <p className="text-sm font-semibold text-foreground">Selamat Datang di NC MULIA</p>
                    <p className="text-xs text-foreground-muted">Silakan masuk ke akun Anda untuk memulai Live Chat dengan nutrisionis kami.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground-muted text-center">
                      {conversations.length > 0
                        ? 'Pilih percakapan atau mulai baru'
                        : 'Mulai percakapan baru dengan tim NC MULIA'}
                    </p>

                    <button
                      onClick={() => setView('greeting')}
                      disabled={creating}
                      className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Mulai Percakapan Baru
                    </button>
                  </>
                )}

                {/* Existing conversations */}
                {conversations.length > 0 && (
                  <div className="w-full space-y-2">
                    <p className="text-xs text-foreground-muted font-medium">Percakapan Sebelumnya</p>
                    {conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveConv(conv.id);
                          setView('chat');
                        }}
                        className="w-full flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface transition text-left"
                      >
                        <span className="text-sm text-foreground truncate">{conv.customerName}</span>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── GREETING VIEW ── */}
            {view === 'greeting' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary-soft flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-brand-primary" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground mb-1">Selamat datang!</p>
                  <p className="text-sm text-foreground-muted">Ada yang bisa kami bantu hari ini?</p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => handleStartNew('service')}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-4 bg-surface-secondary rounded-xl border border-border hover:border-brand-primary hover:bg-brand-primary-soft transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Layanan</p>
                      <p className="text-xs text-foreground-muted">Pertanyaan umum &amp; bantuan produk</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleStartNew('complaint')}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-4 bg-surface-secondary rounded-xl border border-border hover:border-brand-primary hover:bg-brand-primary-soft transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-danger" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Keluhan</p>
                      <p className="text-xs text-foreground-muted">Laporkan masalah atau keluhan</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setView('list')}
                  className="text-xs text-foreground-subtle hover:text-foreground transition-colors"
                >
                  Batal
                </button>
              </div>
            )}

            {/* ── CHAT VIEW ── */}
            {view === 'chat' && activeConv && (
              <>
                {/* Tabs (if multiple conversations) */}
                {conversations.length > 1 && (
                  <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
                    {conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveConv(conv.id);
                          setView('chat');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                          activeConv === conv.id
                            ? 'bg-brand-primary text-white'
                            : 'bg-surface-secondary text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {conv.customerName}
                      </button>
                    ))}
                    <button
                      onClick={() => setView('greeting')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition whitespace-nowrap flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Baru
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-xs text-foreground-subtle mt-8">
                      Ketik pesan di bawah untuk memulai percakapan.
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={`flex ${msg.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                          msg.senderRole === 'admin'
                            ? 'bg-surface-secondary text-foreground'
                            : 'bg-brand-primary text-white'
                        }`}
                      >
                        {msg.message}
                        <div
                          className={`text-[10px] mt-1 ${
                            msg.senderRole === 'admin' ? 'text-foreground-muted' : 'text-white/60'
                          } text-right`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        lastActivityRef.current = Date.now();
                        resetInactivityTimer();
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder="Ketik pesan..."
                      className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                    <button
                      onClick={() => {
                        lastActivityRef.current = Date.now();
                        resetInactivityTimer();
                        handleSend();
                      }}
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
