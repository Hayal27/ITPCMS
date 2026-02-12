import React, { useState, useEffect } from 'react';
import {
    getContactMessages,
    markMessageAsRead,
    deleteContactMessage,
    replyContactMessage,
    ContactMessage
} from '../../services/apiService';
import {
    FiMail as Mail,
    FiTrash2 as Trash2,
    FiEye as Eye,
    FiRefreshCcw as RefreshCcw,
    FiCheckCircle as CheckCircle2,
    FiClock as Clock,
    FiAlertCircle as AlertCircle,
    FiSend as Send,
    FiX as X,
    FiUser as User,
    FiPhone as Phone,
    FiCalendar as Calendar,
    FiChevronRight as ChevronRight,
    FiSearch as Search
} from 'react-icons/fi';

const ContactMessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Reply State
    const [replySubject, setReplySubject] = useState('');
    const [replyBody, setReplyBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await getContactMessages();
            setMessages(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const handleViewMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        setReplySubject(`RE: ${message.message.substring(0, 30)}...`);
        setSendSuccess(false);
        setShowModal(true);

        if (message.status === 'new') {
            try {
                await markMessageAsRead(message.id);
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
            } catch (err) {
                console.error('Failed to mark message as read', err);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this message?')) {
            try {
                await deleteContactMessage(id);
                setMessages(prev => prev.filter(m => m.id !== id));
            } catch (err: any) {
                alert(err.message || 'Failed to delete message');
            }
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMessage || !replyBody || !replySubject) return;

        setIsSending(true);
        try {
            await replyContactMessage(selectedMessage.id, replySubject, replyBody);
            setSendSuccess(true);
            setReplyBody('');
            // Update local state status
            setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m));
            setTimeout(() => {
                setShowModal(false);
                setSendSuccess(false);
            }, 2000);
        } catch (err: any) {
            alert(err.message || 'Failed to send reply');
        } finally {
            setIsSending(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
                        New
                    </span>
                );
            case 'read':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Read
                    </span>
                );
            case 'replied':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Replied
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {status}
                    </span>
                );
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-6 h-6 text-blue-500" />
                        Contact Messages
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and respond to inquiries from your website visitors.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={loadMessages}
                        disabled={loading}
                        className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Messages Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-8" colSpan={5}>
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">{getStatusBadge(msg.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{msg.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{msg.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs">{msg.message}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewMessage(msg)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-red-100 dark:border-red-800/50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                <Mail className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No messages found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Modal for Viewing & Replying */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-in">

                        {/* Left Side: Original Message Content */}
                        <div className="w-full md:w-5/12 bg-gray-50/50 dark:bg-slate-800/30 border-r border-gray-100 dark:border-gray-800 p-6 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                    Original Inquiry
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            {selectedMessage.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{selectedMessage.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedMessage.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="w-3.5 h-3.5" />
                                            {selectedMessage.phone || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(selectedMessage.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 min-h-[150px]">
                                    <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                                        "{selectedMessage.message}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Reply Form */}
                        <div className="w-full md:w-7/12 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-green-500" />
                                    Compose Response
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {sendSuccess ? (
                                <div className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in py-10">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reply Sent!</h4>
                                    <p className="text-gray-500 dark:text-gray-400">Your response has been delivered to {selectedMessage.email}.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendReply} className="flex-grow flex flex-col gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={replySubject}
                                                onChange={(e) => setReplySubject(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 text-gray-900 dark:text-white"
                                                placeholder="Response subject..."
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">Message Content</label>
                                            <textarea
                                                required
                                                rows={10}
                                                value={replyBody}
                                                onChange={(e) => setReplyBody(e.target.value)}
                                                className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 text-gray-900 dark:text-white resize-none"
                                                placeholder="Write your response here..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSending ? (
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {isSending ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessagesPage;
