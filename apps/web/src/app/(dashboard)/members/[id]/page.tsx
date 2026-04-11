'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, Calendar, Dumbbell,
  CreditCard, Bell, TrendingDown, User2, Activity
} from 'lucide-react';
import { MOCK_MEMBERS, MOCK_FEES, MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Tab = 'overview' | 'attendance' | 'progress' | 'fees' | 'notifications';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export default function MemberProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const member = useMemo(() => {
    return MOCK_MEMBERS.find((m) => m.id === params.id) || MOCK_MEMBERS[0];
  }, [params.id]);

  const memberFees = useMemo(() => {
    return MOCK_FEES.filter((f) => f.memberId === member.id);
  }, [member.id]);

  const memberNotifications = useMemo(() => {
    return MOCK_NOTIFICATIONS.filter((n) => n.sentTo === member.name || n.sentTo === 'All Members');
  }, [member.name]);

  const weightData = member.weight.map((w, i) => ({ month: MONTHS[i], weight: w, bodyFat: member.bodyFat[i] }));

  const daysRemaining = Math.max(0, Math.ceil((new Date(member.planEnd).getTime() - Date.now()) / 86400000));

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: User2 },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'progress', label: 'Progress', icon: Activity },
    { key: 'fees', label: 'Fee History', icon: CreditCard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/members" className="inline-flex items-center gap-2 text-body text-text-secondary hover:text-text-primary transition-colors stagger-1">
        <ArrowLeft size={16} />
        Back to Members
      </Link>

      {/* Profile Header */}
      <div className="card stagger-2">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`avatar-xl text-2xl ${
            member.status === 'expired' ? 'bg-red-500' :
            member.status === 'expiring' ? 'bg-amber-500' : ''
          }`}>
            {member.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-page-title text-text-primary">{member.name}</h1>
              <span className={`badge ${
                member.status === 'active' ? 'badge-active' :
                member.status === 'expiring' ? 'badge-expiring' : 'badge-expired'
              }`}>
                {member.status === 'active' ? 'Active' :
                 member.status === 'expiring' ? 'Expiring' : 'Expired'}
              </span>
            </div>
            <p className="text-body text-text-secondary font-mono">ID: {member.memberCode}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-caption text-text-secondary">
              <span className="flex items-center gap-1"><Phone size={13} /> {member.phone}</span>
              <span className="flex items-center gap-1"><Mail size={13} /> {member.email}</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> Joined {formatDate(member.joinedAt)}</span>
              <span className="flex items-center gap-1"><Dumbbell size={13} /> {member.plan}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">Edit Profile</button>
            <button className="btn btn-primary">Renew Plan</button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-between-cards stagger-3">
        <div className="stat-card">
          <p className="stat-card-label">Total Visits</p>
          <p className="stat-card-value mt-2 font-mono">{member.totalVisits}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">This Month</p>
          <p className="stat-card-value mt-2 font-mono">{member.thisMonthVisits}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Days Left</p>
          <p className={`stat-card-value mt-2 font-mono ${
            daysRemaining > 30 ? 'text-success' :
            daysRemaining > 7 ? 'text-warning' : 'text-danger'
          }`}>
            {daysRemaining}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Fees Due</p>
          <p className={`stat-card-value mt-2 font-mono ${member.feesDue > 0 ? 'text-danger' : 'text-success'}`}>
            {member.feesDue > 0 ? formatCurrency(member.feesDue) : '₹0'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-divider stagger-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-between-cards">
            <div className="card">
              <h3 className="text-card-heading text-text-primary mb-4">Personal Information</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: member.name },
                  { label: 'Gender', value: member.gender },
                  { label: 'Age', value: `${member.age} years` },
                  { label: 'Phone', value: member.phone },
                  { label: 'Email', value: member.email },
                  { label: 'Member Since', value: formatDate(member.joinedAt) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-divider last:border-0">
                    <span className="text-caption text-text-muted">{item.label}</span>
                    <span className="text-body text-text-primary font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-card-heading text-text-primary mb-4">Subscription Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Current Plan', value: member.plan },
                  { label: 'Amount', value: formatCurrency(member.planAmount) },
                  { label: 'Start Date', value: formatDate(member.planStart) },
                  { label: 'End Date', value: formatDate(member.planEnd) },
                  { label: 'Days Remaining', value: `${daysRemaining} days` },
                  { label: 'Status', value: member.status.charAt(0).toUpperCase() + member.status.slice(1) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-divider last:border-0">
                    <span className="text-caption text-text-muted">{item.label}</span>
                    <span className="text-body text-text-primary font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ATTENDANCE ═══ */}
        {activeTab === 'attendance' && (
          <div className="card">
            <h3 className="text-card-heading text-text-primary mb-4">
              April 2026 Attendance — {member.thisMonthVisits} visits
            </h3>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-caption text-text-muted font-medium py-1">{d}</div>
              ))}
              {/* April 2026 starts on Wednesday (index 3) */}
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const attended = member.attendanceDays.includes(day);
                const isToday = day === 9;
                const isFuture = day > 9;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      isFuture
                        ? 'text-text-muted/30'
                        : attended
                        ? 'bg-success text-white shadow-sm'
                        : isToday
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-stat-card text-text-secondary'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 text-caption text-text-muted">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" /> Present
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-stat-card border border-border-default" /> Absent
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/10 border border-primary/30" /> Today
              </span>
            </div>
          </div>
        )}

        {/* ═══ PROGRESS ═══ */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-between-cards">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-card-heading text-text-primary">Weight Trend</h3>
                <div className="flex items-center gap-1 text-caption text-success px-2 py-0.5 rounded-full bg-success-bg">
                  <TrendingDown size={12} />
                  <span>-{member.weight[0] - member.weight[member.weight.length - 1]} kg</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBEB' }} />
                    <Line type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-card-heading text-text-primary">Body Fat %</h3>
                <div className="flex items-center gap-1 text-caption text-success px-2 py-0.5 rounded-full bg-success-bg">
                  <TrendingDown size={12} />
                  <span>-{member.bodyFat[0] - member.bodyFat[member.bodyFat.length - 1]}%</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBEB' }} />
                    <Line type="monotone" dataKey="bodyFat" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card md:col-span-2">
              <h3 className="text-card-heading text-text-primary mb-4">Current Measurements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card text-center">
                  <p className="stat-card-label">Weight</p>
                  <p className="stat-card-value mt-2 font-mono">{member.weight[member.weight.length - 1]} <span className="text-caption">kg</span></p>
                </div>
                <div className="stat-card text-center">
                  <p className="stat-card-label">Body Fat</p>
                  <p className="stat-card-value mt-2 font-mono">{member.bodyFat[member.bodyFat.length - 1]}<span className="text-caption">%</span></p>
                </div>
                <div className="stat-card text-center">
                  <p className="stat-card-label">BMI</p>
                  <p className="stat-card-value mt-2 font-mono">
                    {(member.weight[member.weight.length - 1] / ((member.gender === 'Male' ? 1.75 : 1.63) ** 2)).toFixed(1)}
                  </p>
                </div>
                <div className="stat-card text-center">
                  <p className="stat-card-label">Goal</p>
                  <p className="stat-card-value mt-2 font-mono">{member.weight[member.weight.length - 1] - 5} <span className="text-caption">kg</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FEES ═══ */}
        {activeTab === 'fees' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-card-pad py-4 border-b border-divider flex items-center justify-between">
              <h3 className="text-card-heading text-text-primary">Fee History</h3>
              {member.feesDue > 0 && (
                <span className="badge badge-overdue">
                  {formatCurrency(member.feesDue)} pending
                </span>
              )}
            </div>
            {memberFees.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">Plan</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Due Date</th>
                    <th className="table-header text-left">Status</th>
                    <th className="table-header text-left">Paid Via</th>
                  </tr>
                </thead>
                <tbody>
                  {memberFees.map((fee) => (
                    <tr key={fee.id} className="table-row">
                      <td className="px-4 text-table-row text-text-primary">{fee.plan}</td>
                      <td className="px-4 text-table-row text-text-primary font-mono">{formatCurrency(fee.amount)}</td>
                      <td className="px-4 text-table-row text-text-secondary">{formatDate(fee.dueDate)}</td>
                      <td className="px-4">
                        <span className={`badge ${
                          fee.status === 'paid' ? 'badge-paid' :
                          fee.status === 'overdue' ? 'badge-overdue' : 'badge-fee-due'
                        }`}>
                          {fee.status === 'paid' ? 'Paid' : fee.status === 'overdue' ? 'Overdue' : 'Due'}
                        </span>
                      </td>
                      <td className="px-4 text-table-row text-text-secondary capitalize">
                        {fee.method || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state py-12">
                <CreditCard className="empty-state-icon" />
                <p className="empty-state-title">No fee records</p>
                <p className="empty-state-description">Fee history will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ NOTIFICATIONS ═══ */}
        {activeTab === 'notifications' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-card-pad py-4 border-b border-divider">
              <h3 className="text-card-heading text-text-primary">Notification Log</h3>
            </div>
            {memberNotifications.length > 0 ? (
              <div className="divide-y divide-divider">
                {memberNotifications.map((n) => (
                  <div key={n.id} className="px-card-pad py-4 hover:bg-page/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${
                            n.type === 'fee_reminder' ? 'badge-fee-due' :
                            n.type === 'birthday' ? 'badge-active' :
                            n.type === 'inactivity' ? 'badge-expiring' :
                            n.type === 'promo' ? 'badge-coach' : 'badge-receptionist'
                          }`}>
                            {n.type.replace('_', ' ')}
                          </span>
                          <span className={`badge ${
                            n.channel === 'whatsapp' ? 'badge-active' :
                            n.channel === 'sms' ? 'badge-coach' : 'badge-receptionist'
                          }`}>
                            {n.channel}
                          </span>
                        </div>
                        <p className="text-body text-text-primary font-medium">{n.title}</p>
                        <p className="text-caption text-text-secondary mt-1">{n.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`badge ${
                          n.status === 'delivered' ? 'badge-active' :
                          n.status === 'failed' ? 'badge-overdue' : 'badge-expiring'
                        }`}>
                          {n.status}
                        </span>
                        <p className="text-caption text-text-muted mt-1">{formatDate(n.sentAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-12">
                <Bell className="empty-state-icon" />
                <p className="empty-state-title">No notifications sent</p>
                <p className="empty-state-description">Notification history will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
