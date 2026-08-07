import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { chatApi } from '../../lib/api';
import type { User as AdminUser, ChatMessage, ChatConversation } from '../../types';

interface AdminChatProps {
  user: AdminUser;
  onLogout: () => void;
}

export default function AdminChatPage({ user, onLogout }: AdminChatProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filtered, setFiltered] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? conversations.filter(c => c.customerName.toLowerCase().includes(q) || c.user?.name?.toLowerCase().includes(q)) : conversations);
  }, [search, conversations]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const res = await chatApi.listAllConversations();
      const convs = res.data?.conversations ?? [];
      setConversations(convs);
      setFiltered(convs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat percakapan.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const msgs = await chatApi.getMessages(id);
      setMessages(msgs.data ?? []);
      await chatApi.markRead(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pesan.');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    setError('');
    try {
      const msg = await chatApi.sendMessage(activeConv.id, { message: newMessage.trim() });
      if (msg.data) setMessages(prev => [...prev, msg.data!]);
      setNewMessage('');
      loadConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim pesan.');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await chatApi.close(id);
      loadConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menutup percakapan.');
    }
  };

  return (
    <AdminLayout user={user} title="Live Chat" onLogout={onLogout}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Input placeholder="Cari percakapan..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Button size="sm" variant="secondary" onClick={loadConversations}>Refresh</Button>
        </div>

        {error && <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-xl text-sm text-danger">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 220px)' }}>
          {/* List */}
          <div className="border rounded-xl overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h3 className="font-semibold text-sm text-foreground">Percakapan ({filtered.length})</h3>
            </div>
            {isLoading && conversations.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted text-sm">Memuat...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted text-sm">Tidak ada percakapan.</div>
            ) : (
              filtered.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-4 border-b last:border-none transition ${activeConv?.id === conv.id ? 'bg-brand-primary-soft' : 'hover:bg-surface-secondary'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-foreground-muted" />
                    <span className="text-sm font-medium text-foreground truncate">{conv.customerName}</span>
                    {conv.unreadByAdmin && conv.unreadByAdmin > 0 ? (
                      <Badge variant="warning" className="ml-auto text-[10px]">{conv.unreadByAdmin}</Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground-subtle capitalize">{conv.category}</span>
                    <span className="text-xs text-foreground-subtle capitalize">— {conv.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {activeConv ? (
              <Card className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                  <div>
                    <div className="font-semibold text-sm">{activeConv.customerName}</div>
                    <div className="text-xs text-foreground-muted capitalize">{activeConv.category} — {activeConv.status}</div>
                  </div>
                  {activeConv.status !== 'closed' && (
                    <Button size="sm" variant="secondary" onClick={() => handleClose(activeConv.id)}>Tutup</Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {messages.map(msg => {
                    const isAdminMsg = msg.senderRole === 'admin';
                    return (
                      <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${isAdminMsg ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-foreground'}`}>
                          <div className={`text-[10px] font-medium mb-0.5 ${isAdminMsg ? 'text-white/80' : 'text-foreground-subtle'}`}>
                            {isAdminMsg ? 'Admin' : (msg.senderName || activeConv.customerName)}
                          </div>
                          <div className="leading-relaxed">{msg.message}</div>
                          <div className={`text-[10px] mt-1 ${isAdminMsg ? 'text-white/70' : 'text-foreground-subtle'}`}>
                            {new Date(msg.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {activeConv.status !== 'closed' && (
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Ketik respons..."
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-full">
                <div className="text-center text-foreground-muted">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Pilih percakapan untuk melihat pesan.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
