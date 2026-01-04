import { request } from './apiService';

export interface AuditLogItem {
    id: number;
    user_id: number | null;
    user_name?: string; // from join users table
    action: string;
    entity: string;
    entity_id: string | null;
    details: string | null; // JSON string
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export interface AuditLogFilters {
    action?: string;
    entity?: string;
    user_id?: number | string;
    startDate?: string;
    endDate?: string;
}

export const getAuditLogs = async (filters: AuditLogFilters): Promise<AuditLogItem[]> => {
    // Construct query string
    const validFilters: Record<string, string> = {};
    if (filters.action) validFilters.action = filters.action;
    if (filters.entity) validFilters.entity = filters.entity;
    if (filters.user_id) validFilters.user_id = String(filters.user_id);
    if (filters.startDate) validFilters.startDate = filters.startDate;
    if (filters.endDate) validFilters.endDate = filters.endDate;

    const logs = await request<AuditLogItem[]>('/audit-logs', {
        method: 'GET',
        params: validFilters,
    });

    return logs;
};

export interface BlockedIP {
    id: number;
    ip_address: string;
    blocked_at: string;
    reason: string;
    type: 'ip' | 'user';
}

export const getBlockedIPs = async (): Promise<BlockedIP[]> => {
    return request<BlockedIP[]>('/audit-logs/blocked-ips', {
        method: 'GET'
    });
};

export const unblockIP = async (id: number, type: 'ip' | 'user'): Promise<void> => {
    return request<void>(`/audit-logs/blocked-ips/${id}?type=${type}`, {
        method: 'DELETE'
    });
};
