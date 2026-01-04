import React, { useEffect, useState } from 'react';
import './SubscribersAdmin.css';

interface Subscriber {
    id: number;
    email: string;
    status: 'active' | 'unsubscribed';
    subscribed_at: string;
    unsubscribed_at: string | null;
}

const SubscribersAdmin: React.FC = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5005/api/subscribers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setSubscribers(data.data);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubscribers = subscribers.filter(sub => {
        const matchesFilter = filter === 'all' || sub.status === filter;
        const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const activeCount = subscribers.filter(s => s.status === 'active').length;
    const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

    const exportToCSV = () => {
        const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At'];
        const csvData = filteredSubscribers.map(sub => [
            sub.email,
            sub.status,
            new Date(sub.subscribed_at).toLocaleString(),
            sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="subscribers-admin">
                <div className="loading-spinner">Loading subscribers...</div>
            </div>
        );
    }

    return (
        <div className="subscribers-admin">
            <div className="subscribers-header">
                <h1>Newsletter Subscribers</h1>
                <button onClick={exportToCSV} className="export-btn">
                    📥 Export to CSV
                </button>
            </div>

            <div className="subscribers-stats">
                <div className="stat-card">
                    <div className="stat-number">{subscribers.length}</div>
                    <div className="stat-label">Total Subscribers</div>
                </div>
                <div className="stat-card active">
                    <div className="stat-number">{activeCount}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card unsubscribed">
                    <div className="stat-number">{unsubscribedCount}</div>
                    <div className="stat-label">Unsubscribed</div>
                </div>
            </div>

            <div className="subscribers-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={filter === 'active' ? 'active' : ''}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={filter === 'unsubscribed' ? 'active' : ''}
                        onClick={() => setFilter('unsubscribed')}
                    >
                        Unsubscribed
                    </button>
                </div>
            </div>

            <div className="subscribers-table-container">
                <table className="subscribers-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Subscribed At</th>
                            <th>Unsubscribed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscribers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="no-data">
                                    No subscribers found
                                </td>
                            </tr>
                        ) : (
                            filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber.id}>
                                    <td>{subscriber.id}</td>
                                    <td className="email-cell">{subscriber.email}</td>
                                    <td>
                                        <span className={`status-badge ${subscriber.status}`}>
                                            {subscriber.status}
                                        </span>
                                    </td>
                                    <td>{new Date(subscriber.subscribed_at).toLocaleString()}</td>
                                    <td>
                                        {subscriber.unsubscribed_at
                                            ? new Date(subscriber.unsubscribed_at).toLocaleString()
                                            : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="subscribers-footer">
                <p>Showing {filteredSubscribers.length} of {subscribers.length} subscribers</p>
            </div>
        </div>
    );
};

export default SubscribersAdmin;
