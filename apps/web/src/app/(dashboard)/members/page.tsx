'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, page],
    queryFn: () =>
      apiClient
        .get('/members', { params: { search: search || undefined, page, limit: 20 } })
        .then((r) => r.data),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <Link
          href="/members/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
        >
          <Plus size={18} />
          Add Member
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or member code..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : data?.members?.length === 0 ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<Users size={28} />}
            title={search ? "No members found" : "No members yet"}
            description={
              search
                ? `No members match "${search}". Try a different search term.`
                : "Get started by adding your first member to the gym."
            }
            action={
              <Link
                href="/members/new"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
              >
                <Plus size={16} />
                Add Member
              </Link>
            }
          />
        </div>
      ) : (
        <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.members?.map((m: Record<string, unknown>) => {
                  const sub = (m.subscriptions as Array<Record<string, unknown>>)?.[0];
                  const isExpired = sub ? new Date(sub.endDate as string) < new Date() : true;
                  return (
                    <tr key={m.id as string} className="hover:bg-[#F5F5F5] transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{m.memberCode as string}</td>
                      <td className="px-6 py-4">
                        <Link href={`/members/${m.id}`} className="text-sm font-medium text-primary hover:underline">
                          {(m.user as Record<string, string>)?.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{(m.user as Record<string, string>)?.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {sub ? (sub.plan as Record<string, string>)?.name : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {sub ? new Date(sub.endDate as string).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.total > 20 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= data.total}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
