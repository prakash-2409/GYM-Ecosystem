'use client';

import {
  Smartphone, LogOut, Edit3, Phone, MapPin,
  Clock, MessageCircle, Shield, Heart,
  CreditCard, ChevronRight, ExternalLink,
} from 'lucide-react';
import {
  MEMBER_APP_USER, MEMBER_APP_STATS,
  MEMBER_APP_EMERGENCY_CONTACT, MEMBER_APP_FEE_STATUS,
} from '@/lib/mock-data';
import { useGymConfig } from '@/lib/gym-config-store';

interface ProfileTabProps {
  brandColor: string;
  isStandalone: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  onInstallClick: () => void;
}

export function ProfileTab({ brandColor, isStandalone, isInstallable, isIOS, onInstallClick }: ProfileTabProps) {
  const { config } = useGymConfig();
  const user = MEMBER_APP_USER;
  const stats = MEMBER_APP_STATS;
  const emergency = MEMBER_APP_EMERGENCY_CONTACT;
  const feeStatus = MEMBER_APP_FEE_STATUS;

  const daysRemaining = Math.max(0, Math.ceil((new Date(user.planEnd).getTime() - Date.now()) / 86400000));

  return (
    <div className="member-tab-enter">
      {/* Profile Header */}
      <div className="px-5 pt-14 pb-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-full p-[3px] mb-4" style={{ background: `linear-gradient(135deg, ${brandColor}, #22D3EE)` }}>
          <div className="w-full h-full rounded-full bg-[#0F0F0F] flex items-center justify-center">
            <span
              className="text-3xl font-semibold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${brandColor}cc, #22D3EEcc)` }}
            >
              {user.name[0]}
            </span>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-[#F5F5F0]">{user.name}</h1>
        <p className="text-sm text-[#888] mt-0.5 font-mono">ID: {user.memberCode}</p>
        <p className="text-[11px] text-[#555] mt-1">
          Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* QR Code */}
      <div className="px-5 mb-5">
        <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/[0.07] text-center">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-3">Your Check-in QR</p>
          <div className="w-44 h-44 mx-auto bg-white rounded-2xl p-3 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect x="5" y="5" width="25" height="25" fill="black" rx="3" />
              <rect x="8" y="8" width="19" height="19" fill="white" rx="2" />
              <rect x="11" y="11" width="13" height="13" fill="black" rx="1" />
              <rect x="70" y="5" width="25" height="25" fill="black" rx="3" />
              <rect x="73" y="8" width="19" height="19" fill="white" rx="2" />
              <rect x="76" y="11" width="13" height="13" fill="black" rx="1" />
              <rect x="5" y="70" width="25" height="25" fill="black" rx="3" />
              <rect x="8" y="73" width="19" height="19" fill="white" rx="2" />
              <rect x="11" y="76" width="13" height="13" fill="black" rx="1" />
              {[35,40,45,50,55,60,65].map((x) =>
                [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                  (x + y) % 10 < 6 ? <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                ))
              )}
              {[5,10,15,20,25,30].map((x) =>
                [35,40,45,50,55,60,65].map((y) => (
                  (x * y) % 7 < 4 ? <rect key={`b-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                ))
              )}
              {[70,75,80,85,90].map((x) =>
                [35,40,45,50,55,60,65,70,75,80,85,90].map((y) => (
                  (x + y) % 8 < 5 ? <rect key={`c-${x}-${y}`} x={x} y={y} width="4" height="4" fill="black" rx="0.5" /> : null
                ))
              )}
            </svg>
          </div>
          <p className="text-xs text-[#555]">Show this at the kiosk to check in</p>
        </div>
      </div>

      {/* Membership Details */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0] flex items-center gap-2">
          <CreditCard size={14} style={{ color: brandColor }} /> Membership Details
        </h3>
        <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.07] overflow-hidden">
          {[
            { label: 'Plan', value: user.plan },
            { label: 'Amount', value: `₹${user.planAmount.toLocaleString('en-IN')}` },
            { label: 'Valid Till', value: new Date(user.planEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Days Left', value: String(daysRemaining), color: daysRemaining > 30 ? '#22C55E' : daysRemaining > 7 ? '#F59E0B' : '#EF4444' },
            { label: 'Status', value: user.status === 'active' ? 'Active' : user.status === 'expiring' ? 'Expiring' : 'Expired' },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-4 px-5 ${
                idx < 4 ? 'border-b border-white/[0.05]' : ''
              }`}
            >
              <span className="text-sm text-[#888]">{item.label}</span>
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: (item as any).color || '#F5F5F0' }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Status */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0] flex items-center gap-2">
          <CreditCard size={14} className="text-emerald-400" /> Fee Status
        </h3>
        <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.07] overflow-hidden">
          {[
            { label: 'Last Payment', value: `₹${feeStatus.lastPaymentAmount.toLocaleString('en-IN')}` },
            { label: 'Payment Date', value: feeStatus.lastPaymentDate },
            { label: 'Method', value: feeStatus.lastPaymentMethod },
            { label: 'Next Due', value: feeStatus.nextDueDate },
            { label: 'Status', value: feeStatus.status === 'paid' ? '✅ Paid' : '⚠️ Due', color: feeStatus.status === 'paid' ? '#22C55E' : '#F59E0B' },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3.5 px-5 ${
                idx < 4 ? 'border-b border-white/[0.05]' : ''
              }`}
            >
              <span className="text-sm text-[#888]">{item.label}</span>
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: (item as any).color || '#F5F5F0' }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Info */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0] flex items-center gap-2">
          <Edit3 size={14} className="text-cyan-400" /> Personal Info
        </h3>
        <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.07] overflow-hidden">
          {[
            { label: 'Phone', value: user.phone },
            { label: 'Email', value: user.email },
            { label: 'Gender', value: user.gender },
            { label: 'Age', value: `${user.age} years` },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-4 px-5 ${
                idx < 3 ? 'border-b border-white/[0.05]' : ''
              }`}
            >
              <span className="text-sm text-[#888]">{item.label}</span>
              <span className="text-sm font-medium text-[#F5F5F0]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0] flex items-center gap-2">
          <Shield size={14} className="text-red-400" /> Emergency Contact
        </h3>
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F5F5F0]">{emergency.name}</p>
              <p className="text-xs text-[#888]">{emergency.relation} · {emergency.phone}</p>
            </div>
            <a href={`tel:${emergency.phone.replace(/\s/g, '')}`} className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center active:scale-[0.95] transition-transform">
              <Phone size={16} className="text-emerald-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Gym Contact */}
      <div className="px-5 mb-5">
        <h3 className="text-sm font-medium mb-3 text-[#F5F5F0] flex items-center gap-2">
          <MapPin size={14} style={{ color: brandColor }} /> Gym Info
        </h3>
        <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.07] space-y-3">
          <div>
            <p className="text-sm font-medium text-[#F5F5F0]">{config.gymName}</p>
            <p className="text-xs text-[#888] mt-0.5">{config.address}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <Clock size={12} />
            <span>{config.openTime} — {config.closeTime}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <a
              href={`tel:${config.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs font-medium text-[#F5F5F0] active:scale-[0.97] transition-transform"
            >
              <Phone size={13} /> Call
            </a>
            <a
              href={`https://wa.me/91${config.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-xs font-medium text-emerald-400 active:scale-[0.97] transition-transform"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 mb-5 space-y-3">
        {!isStandalone && (isInstallable || isIOS) && (
          <button
            onClick={onInstallClick}
            className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Smartphone size={16} style={{ color: brandColor }} />
            Install App
          </button>
        )}
        <button className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium text-[#F5F5F0] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <Edit3 size={16} className="text-[#888]" />
          Edit Profile
        </button>
        <button className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/[0.07] text-sm font-medium text-red-400 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      {/* App Footer */}
      <div className="px-5 pb-8 text-center">
        <p className="text-[10px] text-[#333]">GymOS v2.0 · Powered with ❤️ for Indian gyms</p>
      </div>
    </div>
  );
}
