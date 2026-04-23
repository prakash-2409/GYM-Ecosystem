'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, CalendarCheck, CreditCard, TrendingUp, UserPlus,
  ArrowUpRight, ArrowDownRight, Clock, Dumbbell
} from 'lucide-react';
import {
  MOCK_DASHBOARD_STATS, MOCK_MEMBERS, MOCK_TODAY_CHECKINS,
  MOCK_REVENUE_CHART, MOCK_PLAN_DISTRIBUTION, MOCK_FEES,
} from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const stats = MOCK_DASHBOARD_STATS;
  const [activeTab, setActiveTab] = useState<'checkins' | 'fees'>('checkins');

  const pendingFees = MOCK_FEES.filter(f => f.status === 'due' || f.status === 'overdue');
  const totalPending = pendingFees.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="stagger-1">
        <h1 className="text-page-title text-text-primary">Dashboard</h1>
        <p className="text-body text-text-secondary mt-2">
          Real-time overview  •  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-between-cards stagger-2">
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-card-label">Active Members</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="stat-card-value">{stats.activeMembers}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="stat-card-trend up"><ArrowUpRight size={14} /> 8%</span>
            <span className="text-caption text-text-muted">of {stats.totalMembers} total</span>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-card-label">Monthly Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard size={18} className="text-emerald-500" />
            </div>
          </div>
          <p className="stat-card-value font-mono">{formatCurrency(stats.monthlyRevenue)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="stat-card-trend up"><ArrowUpRight size={14} /> 12%</span>
            <span className="text-caption text-text-muted">vs last month</span>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-card-label">Today Check-ins</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CalendarCheck size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="stat-card-value">{stats.todayCheckIns}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-caption text-text-muted">Avg {stats.avgCheckInsPerDay}/day</span>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-card-label">New This Month</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <UserPlus size={18} className="text-violet-500" />
            </div>
          </div>
          <p className="stat-card-value">{stats.newThisMonth}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="stat-card-trend up"><ArrowUpRight size={14} /> 3</span>
            <span className="text-caption text-text-muted">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-between-cards stagger-3">
        {/* Revenue chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-section-heading text-text-primary">Revenue Trend</h2>
              <p className="text-caption text-text-muted mt-1">Last 6 months collection</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <TrendingUp size={14} className="text-emerald-600" />
              <span className="text-badge text-emerald-700">+12% growth</span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE_CHART} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="card">
          <h2 className="text-section-heading text-text-primary mb-1">Plan Distribution</h2>
          <p className="text-caption text-text-muted mb-4">{stats.totalMembers} total subscriptions</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PLAN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="members"
                  stroke="none"
                >
                  {MOCK_PLAN_DISTRIBUTION.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                  <Tooltip
                    formatter={(value: number, _: string, props: any) => [value, props?.payload?.name]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBEB', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {MOCK_PLAN_DISTRIBUTION.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between text-table-row">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-text-secondary">{plan.name}</span>
                </div>
                <span className="text-text-primary font-medium font-mono">{plan.members}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section — tabs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-between-cards stagger-4">
        {/* Recent activity */}
        <div className="xl:col-span-2 card p-0 overflow-hidden">
          <div className="px-card-pad py-4 border-b border-divider flex items-center gap-4">
            <button
              onClick={() => setActiveTab('checkins')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'checkins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Today{"'"}s Check-ins
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'fees'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Pending Fees
            </button>
          </div>

          {activeTab === 'checkins' ? (
            <div className="divide-y divide-divider">
              {MOCK_TODAY_CHECKINS.map((ci) => (
                <div key={ci.id} className="px-card-pad py-4 flex items-center justify-between hover:bg-page/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="avatar text-badge">{ci.memberName[0]}</div>
                    <div>
                      <p className="text-body text-text-primary font-medium">{ci.memberName}</p>
                      <p className="text-caption text-text-muted font-mono">{ci.memberCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${ci.source === 'kiosk' ? 'badge-coach' : 'badge-receptionist'}`}>
                      {ci.source === 'kiosk' ? '🔲 Kiosk' : '📱 Mobile'}
                    </span>
                    <p className="text-caption text-text-muted mt-1 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {timeAgo(ci.checkedInAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {pendingFees.map((fee) => (
                <div key={fee.id} className="px-card-pad py-4 flex items-center justify-between hover:bg-page/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="avatar text-badge bg-red-500">{fee.memberName[0]}</div>
                    <div>
                      <p className="text-body text-text-primary font-medium">{fee.memberName}</p>
                      <p className="text-caption text-text-muted">{fee.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body text-danger font-medium font-mono">{formatCurrency(fee.amount)}</p>
                    <span className={`badge ${fee.status === 'overdue' ? 'badge-overdue' : 'badge-fee-due'}`}>
                      {fee.status === 'overdue' ? 'Overdue' : 'Due'}
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-card-pad py-3 bg-stat-card flex items-center justify-between">
                <span className="text-caption text-text-secondary font-medium">Total Pending</span>
                <span className="text-body text-danger font-medium font-mono">{formatCurrency(totalPending)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions + at-risk members */}
        <div className="space-y-between-cards">
          {/* Quick actions */}
          <div className="card">
            <h2 className="text-section-heading text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/members/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stat-card transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <UserPlus size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-body text-text-primary font-medium">Add New Member</p>
                  <p className="text-caption text-text-muted">Register a new gym member</p>
                </div>
              </Link>
              <Link href="/fees" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stat-card transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <CreditCard size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-body text-text-primary font-medium">Collect Fees</p>
                  <p className="text-caption text-text-muted">{pendingFees.length} payments pending</p>
                </div>
              </Link>
              <Link href="/notifications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stat-card transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <Dumbbell size={18} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-body text-text-primary font-medium">Send Notification</p>
                  <p className="text-caption text-text-muted">WhatsApp, SMS, or Push</p>
                </div>
              </Link>
            </div>
          </div>

          {/* At-risk members */}
          <div className="card">
            <h2 className="text-section-heading text-text-primary mb-1">At-Risk Members</h2>
            <p className="text-caption text-text-muted mb-4">Inactive or expiring soon</p>
            <div className="space-y-3">
              {MOCK_MEMBERS.filter(m => m.status === 'expired' || m.status === 'expiring').slice(0, 4).map((m) => (
                <Link key={m.id} href={`/members/${m.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stat-card transition-colors">
                  <div className={`avatar text-badge ${m.status === 'expired' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-table-row text-text-primary font-medium truncate">{m.name}</p>
                    <p className="text-caption text-text-muted">{m.plan}</p>
                  </div>
                  <span className={`badge ${m.status === 'expired' ? 'badge-expired' : 'badge-expiring'}`}>
                    {m.status === 'expired' ? 'Expired' : 'Expiring'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
