"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TicketList({ userId, role, statusFilter }: { userId: string, role: string, statusFilter?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tickets")
      .select(`
        *,
        client:profiles(email, full_name),
        product:products(name, serial_number)
      `)
      .order("created_at", { ascending: false });

    if (statusFilter) {
        if (statusFilter === 'pending') {
            query = query.in('status', ['open', 'in_progress']);
        } else {
            query = query.eq('status', statusFilter);
        }
    }

    const { data } = await query;

    if (data) setTickets(data);
    setLoading(false);
  }, [statusFilter]);

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_messages")
      .select(`
        *,
        sender:profiles(full_name, role)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    
    if (data) setMessages(data);
  };

  useEffect(() => {
    setTimeout(() => {
        fetchTickets();
    }, 0);
    
    // Subscribe to Ticket Changes
    const ticketChannel = supabase
      .channel('tickets-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
    };
  }, [userId, statusFilter, fetchTickets]);

  // Expand Ticket Handler
  const toggleExpand = async (ticketId: string) => {
      if (expandedTicket === ticketId) {
          setExpandedTicket(null);
          setMessages([]);
      } else {
          setExpandedTicket(ticketId);
          await fetchMessages(ticketId);
      }
  };

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !expandedTicket) return;

      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get sender profile id
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user?.id).single();

      if (profile) {
          const { error } = await supabase.from('ticket_messages').insert({
              ticket_id: expandedTicket,
              sender_id: profile.id,
              message: newMessage
          });

          if (!error) {
              setNewMessage("");
              fetchMessages(expandedTicket);
          }
      }
      setSending(false);
  };

  // Update Status Handler (Admin Only)
  const updateStatus = async (ticketId: string, newStatus: string) => {
      await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId);
      fetchTickets();
  };

  if (loading) return <div className="text-[var(--color-text-muted)] text-sm">Loading tickets...</div>;

  if (tickets.length === 0) {
    return (
      <div className="text-[var(--color-text-muted)] text-sm bg-white/5 p-4 rounded-xl border border-white/10">
        No tickets found.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'in_progress': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'closed': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div 
          key={ticket.id} 
          className={`bg-white/5 border border-white/10 rounded-xl transition-all overflow-hidden ${expandedTicket === ticket.id ? 'ring-1 ring-[var(--color-primary)]' : 'hover:bg-white/10'}`}
        >
          {/* Header (Clickable) */}
          <div 
            onClick={() => toggleExpand(ticket.id)}
            className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getStatusColor(ticket.status)}`}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-white font-medium">{ticket.subject}</h4>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span className="font-mono">#{ticket.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  {role === 'admin' && (
                    <>
                      <span>•</span>
                      <span className="text-[var(--color-primary)]">{ticket.client?.full_name || ticket.client?.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
                </div>
                {/* Status Dropdown for Admin */}
                {role === 'admin' && (
                    <select 
                        title="Update Ticket Status"
                        aria-label="Update Ticket Status"
                        onClick={(e) => e.stopPropagation()}
                        value={ticket.status} 
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="bg-black/20 border border-white/10 text-xs text-white rounded p-1 outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                )}
            </div>
          </div>

          {/* Expanded Details & Chat */}
          {expandedTicket === ticket.id && (
              <div className="border-t border-white/10 bg-black/20 p-4">
                  <div className="mb-6">
                      <h5 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-2">Description</h5>
                      <p className="text-sm text-[var(--color-text-secondary)]">{ticket.description}</p>
                      {ticket.product && (
                        <div className="mt-3 text-xs text-[var(--color-text-muted)] flex items-center gap-2 bg-white/5 p-2 rounded-lg w-fit">
                        <PackageIcon size={12} />
                        <span>Related to: {ticket.product.name} ({ticket.product.serial_number})</span>
                        </div>
                    )}
                  </div>

                  {/* Chat Section */}
                  <div className="mb-4">
                    <h5 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-4">Conversation</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {messages.length === 0 ? (
                            <p className="text-xs text-[var(--color-text-muted)] italic">No messages yet.</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender.role === 'admin' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.sender.role === 'admin' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-br-none' : 'bg-white/10 text-white border border-white/10 rounded-bl-none'}`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                        {msg.sender.role === 'admin' ? 'Support' : msg.sender.full_name} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                  </div>

                  {/* Reply Box */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                       <input 
                            type="text" 
                            placeholder="Type a reply..." 
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                       />
                       <button 
                            type="submit" 
                            disabled={sending} 
                            className="px-4 py-2 bg-[var(--color-primary)] text-black text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            Send
                       </button>
                  </form>
              </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PackageIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
