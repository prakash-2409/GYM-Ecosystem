'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { Plus, Search, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

type FilterTab = 'all' | 'active' | 'expiring' | 'expired';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, page],
    queryFn: () =>
      apiClient
        .get('/members', { params: { search: search || undefined, page, limit: 20 } })
        .then((r) => r.data),
  });

  const members = data?.members || [];
  const total = data?.total || 0;

  // Client-side filter for status tabs
  const filteredMembers = members.filter((m: Record<string, unknown>) => {
    if (filter === 'all') return true;
    const sub = (m.subscriptions as Array<Record<string, unknown>>)?.[0];
    if (!sub) return filter === 'expired';
    const endDate = new Date(sub.endDate as string);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (filter === 'expired') return daysLeft <= 0;
    if (filter === 'expiring') return daysLeft > 0 && daysLeft <= 7;
    if (filter === 'active') return daysLeft > 7;
    return true;
  });

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'expiring', label: 'Expiring' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 stagger-1">
        <div>
          <h1 className="text-page-title text-text-primary">Members</h1>
          {total > 0 && (
            <p className="text-caption text-text-secondary mt-1">{total} total members</p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            <Download size={16} strokeWidth={1.5} />
            Export CSV
          </button>
          <Link href="/members/new" className="btn btn-primary">
            <Plus size={16} strokeWidth={1.5} />
            Add Member
          </Link>
        </div>
      </div>

      {/* Search — instant filter */}
      <div className="relative mb-4 stagger-2">
        <Search size={18} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          id="members-search"
          type="text"
          placeholder="Search by name, phone, or member code..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-10"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 stagger-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="stagger-4">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredMembers.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No members found"
              description={search ? `No results for "${search}"` : 'Add your first member to get started'}
              action={
                !search ? (
                  <Link href="/members/new" className="btn btn-primary">
                    <Plus size={16} strokeWidth={1.5} />
                    Add Member
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-surface">
                  <tr>
                    <th className="table-header text-left">
                      <input type="checkbox" className="rounded border-border-default" aria-label="Select all" />
                    </th>
                    <th className="table-header text-left">ID</th>
                    <th className="table-header text-left">Name</th>
                    <th className="table-header text-left">Phone</th>
                    <th className="table-header text-left">Plan</th>
                    <th className="table-header text-left">Expires</th>
                    <th className="table-header text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m: Record<string, unknown>) => {
                    const sub = (m.subscriptions as Array<Record<string, unknown>>)?.[0];
                    const endDate = sub ? new Date(sub.endDate as string) : null;
                    const daysLeft = endDate
                      ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : -1;
                    const status: 'active' | 'expiring' | 'expired' =
                      daysLeft <= 0 ? 'expired' : daysLeft <= 7 ? 'expiring' : 'active';
                    const statusLabel = daysLeft <= 0 ? 'Expired' : daysLeft <= 7 ? `${daysLeft}d left` : 'Active';

                    // Format expiry as DD Mon YYYY
                    const expiryFormatted = endDate
                      ? endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';

                    return (
                      <tr key={m.id as string} className="table-row group">
                        <td className="px-4">
                          <input type="checkbox" className="rounded border-border-default" aria-label={`Select ${(m.user as Record<string, string>)?.name}`} />
                        </td>
                        <td className="px-4 text-table-row font-mono text-text-secondary">{m.memberCode as string}</td>
                        <td className="px-4">
                          <Link href={`/members/${m.id}`} className="text-table-row font-medium text-text-primary hover:text-primary transition-colors duration-fast">
                            <div className="flex items-center gap-3">
                              <div className="avatar text-badge">
                                {((m.user as Record<string, string>)?.name)?.[0]?.toUpperCase() || '?'}
                              </div>
                              {(m.user as Record<string, string>)?.name}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 text-table-row text-text-secondary">{(m.user as Record<string, string>)?.phone}</td>
                        <td className="px-4 text-table-row text-text-secondary">
                          {sub ? (sub.plan as Record<string, string>)?.name : '—'}
                        </td>
                        <td className="px-4 text-table-row text-text-secondary">{expiryFormatted}</td>
                        <td className="px-4">
                          <Badge variant={status}>{statusLabel}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-divider">
                <p className="text-caption text-text-secondary">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary text-caption"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= total}
                    className="btn btn-secondary text-caption"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
