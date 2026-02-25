"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Trash2, Loader2, RefreshCw } from "lucide-react";
import { sendTicketAssignmentEmail } from "@/actions/tickets";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TicketList({ userId, role, statusFilter }: { userId: string, role: string, statusFilter?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  const fetchStaff = useCallback(async () => {
    if (role !== 'admin') return;
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['admin', 'staff', 'superadmin']);
    if (data) setStaffList(data);
  }, [role]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tickets")
      .select(`
        *,
        client:profiles!client_id(email, full_name),
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

    if (role !== 'admin' && userId) {
        query = query.eq('client_id', userId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Fetch Tickets Error:", error);
    }
    
    if (data) setTickets(data);
    setLoading(false);
  }, [statusFilter, role, userId]);

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
        fetchStaff();
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
  }, [userId, statusFilter, fetchTickets, fetchStaff]);

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
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user?.id).single();

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

  // NEW: Update Assignment Handler (Admin Only)
  const updateAssignment = async (ticketId: string, staffId: string | null) => {
      const { data: ticket } = await supabase.from('tickets').select('subject').eq('id', ticketId).single();
      
      await supabase.from("tickets").update({ assigned_to: staffId || null }).eq("id", ticketId);
      
      if (staffId && ticket) {
          const staffMember = staffList.find(s => s.id === staffId);
          if (staffMember?.email) {
              sendTicketAssignmentEmail(staffMember.email, ticketId, ticket.subject).catch(console.error);
          }
      }
      
      fetchTickets();
  };

  // NEW: Update Internal Notes Handler (Admin Only)
  const updateInternalNotes = async (ticketId: string, notes: string) => {
      await supabase.from("tickets").update({ internal_notes: notes }).eq("id", ticketId);
      fetchTickets();
  };

  // NEW: Delete Ticket Handler (Admin Only)
  const handleDeleteTicket = async (e: React.MouseEvent, ticketId: string) => {
      e.stopPropagation();
      if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return;

      setDeletingId(ticketId);
      try {
          const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
          if (error) throw error;
          setTickets(tickets.filter(t => t.id !== ticketId));
          if (expandedTicket === ticketId) {
              setExpandedTicket(null);
              setMessages([]);
          }
      } catch (error) {
          console.error("Error deleting ticket:", error);
          alert("Failed to delete ticket. Please try again.");
      } finally {
          setDeletingId(null);
      }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
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
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{ticket.subject}</h4>
                    {ticket.priority && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                    )}
                    {ticket.replacement_requested && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center gap-1">
                            <RefreshCw size={10} /> Replacement
                        </span>
                    )}
                </div>
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
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <>
                        <span>•</span>
                        <SLACountdown createdAt={ticket.created_at} priority={ticket.priority} />
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
                    <div className="flex items-center gap-2">
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
                        
                        <select
                            title="Assign to Staff"
                            aria-label="Assign to Staff"
                            onClick={(e) => e.stopPropagation()}
                            value={ticket.assigned_to || ''}
                            onChange={(e) => updateAssignment(ticket.id, e.target.value)}
                            className="bg-black/20 border border-white/10 text-xs text-white rounded p-1 outline-none focus:ring-1 focus:ring-[var(--color-primary)] max-w-[120px]"
                        >
                            <option value="">Unassigned</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.full_name || staff.email}</option>
                            ))}
                        </select>

                        <button
                            onClick={(e) => handleDeleteTicket(e, ticket.id)}
                            disabled={deletingId === ticket.id}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                            title="Delete Ticket"
                        >
                            {deletingId === ticket.id ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Expanded Details & Chat */}
          {expandedTicket === ticket.id && (
              <div className="border-t border-white/10 bg-black/20 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                          <h5 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-2">Description</h5>
                          <p className="text-sm text-[var(--color-text-secondary)]">{ticket.description}</p>
                          {ticket.product && (
                            <div className="mt-3 text-xs text-[var(--color-text-muted)] flex items-center gap-2 bg-white/5 p-2 rounded-lg w-fit">
                            <PackageIcon size={12} />
                            <span>Related to: {ticket.product.name} ({ticket.product.serial_number})</span>
                            </div>
                        )}
                      </div>

                      {role === 'admin' && (
                          <div className="space-y-3">
                              <h5 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-2">Internal Notes (Visible to Staff Only)</h5>
                              <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-[var(--color-text-secondary)] h-24 focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none"
                                    placeholder="Add internal notes for staff..."
                                    defaultValue={ticket.internal_notes || ''}
                                    onBlur={(e) => updateInternalNotes(ticket.id, e.target.value)}
                              />
                          </div>
                      )}

                      {role !== 'admin' && ticket.status === 'resolved' && (
                          <div className="space-y-3">
                              <h5 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-2">Feedback & Rating</h5>
                              <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button 
                                        key={star}
                                        className={`transition-colors ${(ticket.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                                        onClick={async () => {
                                            await supabase.from('tickets').update({ rating: star }).eq('id', ticket.id);
                                            fetchTickets();
                                        }}
                                      >
                                          ★
                                      </button>
                                  ))}
                              </div>
                              <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-[var(--color-text-secondary)] h-16 focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none"
                                    placeholder="Your feedback..."
                                    defaultValue={ticket.feedback || ''}
                                    onBlur={async (e) => {
                                        await supabase.from('tickets').update({ feedback: e.target.value }).eq('id', ticket.id);
                                        fetchTickets();
                                    }}
                              />
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

function SLACountdown({ createdAt, priority }: { createdAt: string, priority: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateSLA = () => {
            const start = new Date(createdAt).getTime();
            const now = new Date().getTime();
            
            // SLA Durations in hours
            const slaHours = priority === 'critical' ? 4 : priority === 'high' ? 8 : priority === 'medium' ? 24 : 48;
            const slaLimit = start + (slaHours * 60 * 60 * 1000);
            const diff = slaLimit - now;

            if (diff <= 0) {
                setTimeLeft("Overdue");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${h}h ${m}m left`);
        };

        calculateSLA();
        const interval = setInterval(calculateSLA, 60000);
        return () => clearInterval(interval);
    }, [createdAt, priority]);

    return (
        <span className={`font-medium ${timeLeft === 'Overdue' ? 'text-red-400' : 'text-orange-400'}`}>
            SLA: {timeLeft}
        </span>
    );
}

