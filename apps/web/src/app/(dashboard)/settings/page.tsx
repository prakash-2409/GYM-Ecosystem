'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Building2, Palette, CreditCard, Bell, QrCode, Shield,
  Save, RotateCcw, Loader2, Upload, X, Download, Printer,
  RefreshCw, Pencil, UserPlus, Check, Phone, Mail, Clock,
  MapPin, User,
} from 'lucide-react';
import { useGymConfig, DEFAULT_GYM_CONFIG, type GymConfig } from '@/lib/gym-config-store';
import { useToast } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import QRCode from 'qrcode';

/* ─── Color Presets ─────────────────────────────────────────── */
const COLOR_PRESETS = [
  { hex: '#E85D04', name: 'Orange' },
  { hex: '#2563EB', name: 'Royal Blue' },
  { hex: '#16A34A', name: 'Forest Green' },
  { hex: '#DC2626', name: 'Strong Red' },
  { hex: '#7C3AED', name: 'Deep Purple' },
  { hex: '#0891B2', name: 'Cyan' },
  { hex: '#D97706', name: 'Amber' },
  { hex: '#DB2777', name: 'Pink' },
  { hex: '#111827', name: 'Charcoal' },
  { hex: '#0F172A', name: 'Navy' },
  { hex: '#059669', name: 'Emerald' },
  { hex: '#9333EA', name: 'Violet' },
];

/* ─── Staff Mock Data ───────────────────────────────────────── */
interface StaffEntry {
  id: string;
  name: string;
  role: 'owner' | 'coach' | 'receptionist';
  phone: string;
  status: 'active' | 'inactive';
}

const INITIAL_STAFF: StaffEntry[] = [
  { id: '1', name: 'Rajesh Menon', role: 'owner', phone: '9944556677', status: 'active' },
  { id: '2', name: 'Suresh Kumar', role: 'coach', phone: '9876543210', status: 'active' },
  { id: '3', name: 'Anita Singh', role: 'receptionist', phone: '9845678901', status: 'active' },
  { id: '4', name: 'Prakash V', role: 'coach', phone: '9823456789', status: 'active' },
];

/* ─── Notification Toggles ──────────────────────────────────── */
interface NotifToggle {
  key: string;
  label: string;
  desc: string;
  icon: typeof Bell;
  defaultOn: boolean;
}

const NOTIF_TOGGLES: NotifToggle[] = [
  { key: 'feeReminder', label: 'Fee reminder', desc: '3 days before due date', icon: CreditCard, defaultOn: true },
  { key: 'feeOverdue', label: 'Fee overdue alert', desc: 'On due date', icon: CreditCard, defaultOn: true },
  { key: 'planExpiry', label: 'Plan expiry warning', desc: '7 days before', icon: Clock, defaultOn: true },
  { key: 'birthday', label: 'Birthday wish', desc: "On member's birthday", icon: User, defaultOn: true },
  { key: 'inactivity', label: 'Inactivity nudge', desc: 'After 5 days absent', icon: Bell, defaultOn: true },
  { key: 'welcome', label: 'Welcome message', desc: 'When new member added', icon: UserPlus, defaultOn: true },
  { key: 'workoutAssigned', label: 'Workout plan assigned', desc: 'When coach assigns', icon: Shield, defaultOn: true },
  { key: 'weeklySummary', label: 'Weekly summary', desc: 'Every Monday to owner', icon: Mail, defaultOn: true },
];

/* ─── Toggle Component ──────────────────────────────────────── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="toggle-switch"
      style={{ backgroundColor: checked ? 'var(--brand-color, #E85D04)' : '#D1D5DB' }}
    >
      <div
        className="toggle-switch-thumb"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

/* ─── Main Settings Page ────────────────────────────────────── */
export default function SettingsPage() {
  const { config, updateConfig, saveConfig, resetConfig, isDirty } = useGymConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRegenerateQR, setShowRegenerateQR] = useState(false);

  // Staff
  const [staff, setStaff] = useState<StaffEntry[]>(INITIAL_STAFF);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', role: 'coach' as string, password: '' });

  // Notifications
  const [notifStates, setNotifStates] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_TOGGLES.map(t => [t.key, t.defaultOn]))
  );
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(config.whatsappNumber);

  // Annual discount toggle
  const [annualDiscount, setAnnualDiscount] = useState(true);

  // Logo upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSecret, setQrSecret] = useState(() => 'gymos_' + btoa(config.gymName));
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code
  useEffect(() => {
    const data = JSON.stringify({
      gymId: config.gymName.replace(/\s+/g, '_').toUpperCase() + '_001',
      gymName: config.gymName,
      secret: qrSecret,
      version: '1.0',
    });

    QRCode.toDataURL(data, {
      width: 440,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(url => setQrDataUrl(url)).catch(() => {});
  }, [config.gymName, qrSecret]);

  // Load logo from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gymos_gym_logo');
      if (stored) setLogoPreview(stored);
    }
  }, []);

  // Update ownerWhatsapp when config changes
  useEffect(() => {
    setOwnerWhatsapp(config.whatsappNumber);
  }, [config.whatsappNumber]);

  /* ─── Handlers ────────────────────────────────────────────── */

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig();
      if (logoPreview) {
        localStorage.setItem('gymos_gym_logo', logoPreview);
      }
      toast('success', '✓ Settings saved — Changes reflected across app');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetConfig();
    setLogoPreview(null);
    localStorage.removeItem('gymos_gym_logo');
    setShowResetModal(false);
    toast('success', 'Settings reset to default');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('error', 'File size must be under 2MB');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast('error', 'Only PNG and JPG files are allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${config.gymName.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrintQR = () => {
    if (!qrDataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Print QR - ${config.gymName}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}
      img{width:300px;height:300px;}h2{margin-top:16px;}</style></head>
      <body><img src="${qrDataUrl}" /><h2>${config.gymName}</h2><p>Scan with GymOS member app to check in</p></body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleRegenerateQR = () => {
    setQrSecret('gymos_' + btoa(config.gymName + '_' + Date.now()));
    setShowRegenerateQR(false);
    toast('warning', 'QR code regenerated — old QR is now invalid');
  };

  const handleAddStaff = () => {
    if (!staffForm.name || !staffForm.phone || !staffForm.password) return;
    const newStaff: StaffEntry = {
      id: String(Date.now()),
      name: staffForm.name,
      role: staffForm.role as StaffEntry['role'],
      phone: staffForm.phone,
      status: 'active',
    };
    setStaff(prev => [...prev, newStaff]);
    setStaffForm({ name: '', phone: '', role: 'coach', password: '' });
    setShowAddStaff(false);
    toast('success', `${newStaff.name} added as ${newStaff.role}`);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev =>
      prev.map(s => s.id === id
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
      )
    );
  };

  const phoneValid = (val: string) => /^\d{10}$/.test(val);

  /* ─── Effective monthly for platinum ──────────────────────── */
  const platinumMonthly = Math.round(config.planPrices.platinumAnnual / 12);

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div className="settings-page">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="settings-header stagger-1">
        <div className="settings-header-left">
          <h1 className="text-page-title text-text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Settings
            {isDirty && <span className="settings-dirty-dot" title="Unsaved changes" />}
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Configure your gym branding, plans, and notifications
          </p>
        </div>
        <div className="settings-header-actions">
          <button
            onClick={() => setShowResetModal(true)}
            className="btn btn-secondary"
          >
            <RotateCcw size={15} strokeWidth={1.5} />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="btn btn-primary"
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" strokeWidth={1.5} /> Saving...</>
            ) : (
              <><Save size={15} strokeWidth={1.5} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* ── Unsaved Changes Banner ───────────────────────────── */}
      {isDirty && (
        <div className="settings-unsaved-banner stagger-2">
          <span>⚡ You have unsaved changes</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { resetConfig(); }} className="btn btn-secondary" style={{ height: '32px', fontSize: '12px' }}>
              Discard
            </button>
            <button onClick={handleSave} className="btn btn-primary" style={{ height: '32px', fontSize: '12px' }}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — GYM IDENTITY                               */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-2">
        <div className="settings-section-header">
          <Building2 size={20} strokeWidth={1.5} style={{ color: 'var(--brand-color, #E85D04)' }} />
          <div>
            <h2 className="settings-section-title">Gym Identity</h2>
            <p className="settings-section-subtitle">Basic information about your gym</p>
          </div>
        </div>

        <div className="settings-identity-grid">
          {/* Left — Form Fields */}
          <div className="settings-identity-form">
            {/* Gym Name */}
            <div className="settings-field">
              <label htmlFor="gymName" className="input-label">
                Gym Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="gymName"
                  type="text"
                  className="input"
                  value={config.gymName}
                  onChange={(e) => updateConfig({ gymName: e.target.value.slice(0, 50) })}
                  maxLength={50}
                  placeholder="Your gym name"
                />
                <span className="settings-char-count">{config.gymName.length}/50</span>
              </div>
            </div>

            {/* Tagline */}
            <div className="settings-field">
              <label htmlFor="tagline" className="input-label">Tagline</label>
              <input
                id="tagline"
                type="text"
                className="input"
                value={config.tagline}
                onChange={(e) => updateConfig({ tagline: e.target.value.slice(0, 80) })}
                maxLength={80}
                placeholder="Short motivational phrase for members"
              />
              <span className="settings-field-hint">{config.tagline.length}/80 characters</span>
            </div>

            {/* City */}
            <div className="settings-field">
              <label htmlFor="city" className="input-label">City / Location</label>
              <input
                id="city"
                type="text"
                className="input"
                value={config.city}
                onChange={(e) => updateConfig({ city: e.target.value })}
                placeholder="Mumbai, Delhi, Chennai..."
              />
            </div>

            {/* Address */}
            <div className="settings-field">
              <label htmlFor="address" className="input-label">Address</label>
              <textarea
                id="address"
                className="input"
                style={{ height: 'auto', padding: '10px 12px', resize: 'none' }}
                rows={2}
                value={config.address}
                onChange={(e) => updateConfig({ address: e.target.value })}
                placeholder="Full street address"
              />
            </div>

            {/* Phone + Email */}
            <div className="settings-row-2">
              <div className="settings-field">
                <label htmlFor="phone" className="input-label">Phone Number</label>
                <div className="settings-input-prefix">
                  <span className="settings-prefix-text">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    className="input"
                    style={{ paddingLeft: '44px' }}
                    value={config.phone}
                    onChange={(e) => updateConfig({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                  />
                </div>
                {config.phone && !phoneValid(config.phone) && (
                  <span className="input-helper-error">Enter a valid 10-digit number</span>
                )}
              </div>
              <div className="settings-field">
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={config.email}
                  onChange={(e) => updateConfig({ email: e.target.value })}
                  placeholder="info@yourgym.in"
                />
              </div>
            </div>

            {/* Owner + Coach */}
            <div className="settings-row-2">
              <div className="settings-field">
                <label htmlFor="ownerName" className="input-label">Owner Name</label>
                <input
                  id="ownerName"
                  type="text"
                  className="input"
                  value={config.ownerName}
                  onChange={(e) => updateConfig({ ownerName: e.target.value })}
                  placeholder="Gym owner's name"
                />
              </div>
              <div className="settings-field">
                <label htmlFor="coachName" className="input-label">Coach Name</label>
                <input
                  id="coachName"
                  type="text"
                  className="input"
                  value={config.coachName}
                  onChange={(e) => updateConfig({ coachName: e.target.value })}
                  placeholder="Head coach name"
                />
                <span className="settings-field-hint">Shown on workout plans as &quot;Assigned by&quot;</span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="settings-field">
              <label className="input-label">Opening Hours</label>
              <div className="settings-row-2">
                <div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Open</span>
                  <input
                    type="text"
                    className="input"
                    value={config.openTime}
                    onChange={(e) => updateConfig({ openTime: e.target.value })}
                    placeholder="06:00 AM"
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Close</span>
                  <input
                    type="text"
                    className="input"
                    value={config.closeTime}
                    onChange={(e) => updateConfig({ closeTime: e.target.value })}
                    placeholder="10:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Logo Initials */}
            <div className="settings-field">
              <label htmlFor="logoInitials" className="input-label">Logo Initials</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  id="logoInitials"
                  type="text"
                  className="input"
                  style={{ width: '80px', textAlign: 'center', textTransform: 'uppercase', fontWeight: 500 }}
                  value={config.logoInitials}
                  onChange={(e) => updateConfig({ logoInitials: e.target.value.toUpperCase().slice(0, 2) })}
                  maxLength={2}
                  placeholder="IP"
                />
                <div
                  className="settings-logo-preview-circle"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.logoInitials || '?'}
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="settings-field">
              <label className="input-label">Logo Upload (optional)</label>
              <div
                className="settings-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileUpload(fakeEvent);
                  }
                }}
              >
                {logoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>Logo uploaded</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLogoPreview(null); localStorage.removeItem('gymos_gym_logo'); }}
                        style={{ fontSize: '12px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={24} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Drag image here or click to browse</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF' }}>PNG, JPG up to 2MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Right — Live Preview */}
          <div className="settings-identity-preview">
            {/* Dark preview card */}
            <div className="settings-preview-card">
              <div className="settings-preview-logo" style={{ backgroundColor: config.primaryColor }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  config.logoInitials || '?'
                )}
              </div>
              <h3 className="settings-preview-name">{config.gymName || 'Your Gym Name'}</h3>
              <p className="settings-preview-tagline">{config.tagline || 'Your tagline here'}</p>
              <div className="settings-preview-color-swatch">
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: config.primaryColor }} />
                <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>{config.primaryColor}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#555', marginTop: '16px', textAlign: 'center' }}>
                This is how your kiosk and member app look
              </p>
            </div>

            {/* Mini kiosk preview */}
            <div className="settings-mini-kiosk">
              <div className="settings-mini-kiosk-header" style={{ borderBottomColor: config.primaryColor }}>
                <span style={{ color: config.primaryColor, fontSize: '9px', fontWeight: 500, letterSpacing: '1px' }}>
                  {config.gymName.toUpperCase()}
                </span>
              </div>
              <div style={{ padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '8px', color: '#888', marginBottom: '4px' }}>MEMBER ID</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                  {['1', '0', '4', '2'].map((d, i) => (
                    <div key={i} style={{
                      width: 18, height: 22, borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: '#fff', fontFamily: 'monospace',
                    }}>
                      {d}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '6px', fontSize: '9px', color: '#ccc' }}>Rahul Kumar</div>
                <div style={{ marginTop: '2px', fontSize: '7px', color: config.primaryColor }}>✓ CHECKED IN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — BRAND COLOR                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-3">
        <div className="settings-section-header">
          <Palette size={20} strokeWidth={1.5} style={{ color: config.primaryColor }} />
          <div>
            <h2 className="settings-section-title">Brand Color</h2>
            <p className="settings-section-subtitle">This color appears on buttons, badges, and accents across the entire app</p>
          </div>
        </div>

        <div className="settings-color-grid">
          {/* Preset swatches */}
          <div className="settings-color-presets">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.hex}
                className={`settings-color-swatch-btn ${config.primaryColor.toUpperCase() === c.hex.toUpperCase() ? 'settings-color-swatch-btn--active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => updateConfig({ primaryColor: c.hex })}
                title={c.name}
              />
            ))}
          </div>

          {/* Custom color */}
          <div className="settings-custom-color">
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Custom color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E5E5E5', cursor: 'pointer', padding: 0 }}
              />
              <input
                type="text"
                className="input"
                style={{ width: '120px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                value={config.primaryColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    updateConfig({ primaryColor: val });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Live color preview */}
        <div className="settings-color-preview">
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>This is how your primary color looks</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn"
              style={{ backgroundColor: config.primaryColor, color: '#fff', cursor: 'default' }}
            >
              Check In
            </button>
            <span
              className="badge"
              style={{ backgroundColor: config.primaryColor + '18', color: config.primaryColor }}
            >
              Active
            </span>
            <span
              className="badge"
              style={{ backgroundColor: config.primaryColor, color: '#fff' }}
            >
              Premium
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — MEMBERSHIP PLAN PRICES                      */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-4">
        <div className="settings-section-header">
          <CreditCard size={20} strokeWidth={1.5} style={{ color: 'var(--brand-color, #E85D04)' }} />
          <div>
            <h2 className="settings-section-title">Membership Plans & Pricing</h2>
            <p className="settings-section-subtitle">These prices show in member communications and fee reminders</p>
          </div>
        </div>

        <div className="settings-plans-grid">
          {/* Silver Monthly */}
          <div className="settings-plan-card">
            <span className="settings-plan-badge" style={{ backgroundColor: '#94A3B820', color: '#6B7280' }}>Silver Monthly</span>
            <p className="settings-plan-duration">1 Month</p>
            <div className="settings-plan-price-row">
              <span className="settings-plan-currency">₹</span>
              <input
                type="number"
                className="settings-plan-price-input"
                value={config.planPrices.silverMonthly}
                onChange={(e) => updateConfig({
                  planPrices: { ...config.planPrices, silverMonthly: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <p className="settings-plan-per">per member</p>
          </div>

          {/* Gold 3 Months */}
          <div className="settings-plan-card">
            <span className="settings-plan-badge" style={{ backgroundColor: '#D9770618', color: '#D97706' }}>Gold 3 Months</span>
            <p className="settings-plan-duration">3 Months</p>
            <div className="settings-plan-price-row">
              <span className="settings-plan-currency">₹</span>
              <input
                type="number"
                className="settings-plan-price-input"
                value={config.planPrices.goldThreeMonth}
                onChange={(e) => updateConfig({
                  planPrices: { ...config.planPrices, goldThreeMonth: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <p className="settings-plan-per">per member</p>
          </div>

          {/* Gold 6 Months */}
          <div className="settings-plan-card">
            <span className="settings-plan-badge" style={{ backgroundColor: '#D9770618', color: '#D97706' }}>Gold 6 Months</span>
            <p className="settings-plan-duration">6 Months</p>
            <div className="settings-plan-price-row">
              <span className="settings-plan-currency">₹</span>
              <input
                type="number"
                className="settings-plan-price-input"
                value={config.planPrices.goldSixMonth}
                onChange={(e) => updateConfig({
                  planPrices: { ...config.planPrices, goldSixMonth: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <p className="settings-plan-per">per member</p>
          </div>

          {/* Platinum Annual */}
          <div className="settings-plan-card">
            <span className="settings-plan-badge" style={{ backgroundColor: '#7C3AED18', color: '#7C3AED' }}>Platinum Annual</span>
            <p className="settings-plan-duration">12 Months</p>
            <div className="settings-plan-price-row">
              <span className="settings-plan-currency">₹</span>
              <input
                type="number"
                className="settings-plan-price-input"
                value={config.planPrices.platinumAnnual}
                onChange={(e) => updateConfig({
                  planPrices: { ...config.planPrices, platinumAnnual: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <p className="settings-plan-per">per member</p>
            {annualDiscount && (
              <p style={{ fontSize: '11px', color: '#16A34A', marginTop: '4px' }}>
                Effective: ₹{platinumMonthly.toLocaleString('en-IN')}/month
              </p>
            )}
          </div>
        </div>

        {/* Annual discount toggle */}
        <div className="settings-toggle-row" style={{ marginTop: '16px', border: 'none', paddingBottom: 0 }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>Annual discount</p>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Offer 2 months free on annual payment</p>
          </div>
          <ToggleSwitch checked={annualDiscount} onChange={setAnnualDiscount} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — NOTIFICATION SETTINGS                       */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-5">
        <div className="settings-section-header">
          <Bell size={20} strokeWidth={1.5} style={{ color: 'var(--brand-color, #E85D04)' }} />
          <div>
            <h2 className="settings-section-title">Automated Notifications</h2>
            <p className="settings-section-subtitle">Control which WhatsApp messages go out automatically</p>
          </div>
        </div>

        <div>
          {NOTIF_TOGGLES.map((toggle, idx) => {
            const Icon = toggle.icon;
            return (
              <div key={toggle.key} className="settings-toggle-row" style={idx === NOTIF_TOGGLES.length - 1 ? { borderBottom: 'none' } : {}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={16} strokeWidth={1.5} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>{toggle.label}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>{toggle.desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={notifStates[toggle.key] ?? true}
                  onChange={(v) => setNotifStates(prev => ({ ...prev, [toggle.key]: v }))}
                />
              </div>
            );
          })}
        </div>

        {/* WhatsApp number for owner summary */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #EBEBEB' }}>
          <label className="input-label">WhatsApp Number for Owner Summary</label>
          <div className="settings-input-prefix">
            <span className="settings-prefix-text">+91</span>
            <input
              type="tel"
              className="input"
              style={{ paddingLeft: '44px' }}
              value={ownerWhatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setOwnerWhatsapp(val);
                updateConfig({ whatsappNumber: val });
              }}
              placeholder="9876543210"
            />
          </div>
          <span className="settings-field-hint">Weekly summary is sent to this number every Monday</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — GYM QR CODE                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-6">
        <div className="settings-section-header">
          <QrCode size={20} strokeWidth={1.5} style={{ color: 'var(--brand-color, #E85D04)' }} />
          <div>
            <h2 className="settings-section-title">Gym Check-in QR Code</h2>
            <p className="settings-section-subtitle">Print this and place at your gym entrance. Members scan this to check in.</p>
          </div>
        </div>

        <div className="settings-qr-layout">
          {/* Left — QR display */}
          <div className="settings-qr-left">
            <div className="settings-qr-frame">
              {qrDataUrl ? (
                <div style={{ position: 'relative' }}>
                  <img src={qrDataUrl} alt="Gym QR Code" style={{ width: 220, height: 220, borderRadius: 4 }} />
                  {/* Center overlay with logo initials */}
                  <div className="settings-qr-center-logo" style={{ backgroundColor: config.primaryColor }}>
                    {config.logoInitials}
                  </div>
                </div>
              ) : (
                <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                  <QrCode size={80} strokeWidth={1} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '12px' }}>
              Scan with GymOS member app to check in
            </p>
          </div>

          {/* Right — Instructions + Actions */}
          <div className="settings-qr-right">
            <div className="settings-qr-steps">
              {[
                'Print this QR code on paper',
                'Laminate it for durability',
                'Place at gym entrance or front desk',
                'Members open app and tap Check In',
                'Point camera at QR → auto check-in',
              ].map((step, idx) => (
                <div key={idx} className="settings-qr-step">
                  <div className="settings-qr-step-num">{idx + 1}</div>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{step}</span>
                </div>
              ))}
            </div>

            <div className="settings-qr-actions">
              <button onClick={handleDownloadQR} className="btn btn-primary" style={{ flex: 1 }}>
                <Download size={15} strokeWidth={1.5} /> Download QR as PNG
              </button>
              <button onClick={handlePrintQR} className="btn btn-secondary" style={{ flex: 1 }}>
                <Printer size={15} strokeWidth={1.5} /> Print QR
              </button>
              <button onClick={() => setShowRegenerateQR(true)} className="btn btn-danger" style={{ flex: 1 }}>
                <RefreshCw size={15} strokeWidth={1.5} /> Regenerate QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — STAFF MANAGEMENT                            */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="settings-section stagger-6">
        <div className="settings-section-header">
          <Shield size={20} strokeWidth={1.5} style={{ color: 'var(--brand-color, #E85D04)' }} />
          <div>
            <h2 className="settings-section-title">Staff Accounts</h2>
            <p className="settings-section-subtitle">Manage who has access to your gym dashboard</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="w-full" style={{ minWidth: '500px' }}>
            <thead>
              <tr>
                <th className="table-header" style={{ textAlign: 'left' }}>Name</th>
                <th className="table-header" style={{ textAlign: 'left' }}>Role</th>
                <th className="table-header" style={{ textAlign: 'left' }}>Phone</th>
                <th className="table-header" style={{ textAlign: 'left' }}>Status</th>
                <th className="table-header" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="table-row group">
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar" style={{ fontSize: '12px' }}>{s.name[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <span
                      className="badge"
                      style={
                        s.role === 'owner'
                          ? { backgroundColor: '#111827', color: '#fff' }
                          : s.role === 'coach'
                          ? { backgroundColor: '#EFF6FF', color: '#2563EB' }
                          : { backgroundColor: '#F5F3FF', color: '#7C3AED' }
                      }
                    >
                      {s.role === 'owner' ? 'Owner' : s.role === 'coach' ? 'Coach' : 'Receptionist'}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: '13px', fontFamily: 'monospace', color: '#6B7280' }}>
                    {s.phone}
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <span className={`badge ${s.status === 'active' ? 'badge-active' : 'badge-expired'}`}>
                      {s.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', textAlign: 'right' }}>
                    <div className="row-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="btn btn-ghost" style={{ height: '30px', fontSize: '12px', padding: '0 8px' }}>
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      {s.role !== 'owner' && (
                        <button
                          onClick={() => toggleStaffStatus(s.id)}
                          className="btn btn-secondary"
                          style={{ height: '30px', fontSize: '12px', padding: '0 8px' }}
                        >
                          {s.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setShowAddStaff(true)}
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
        >
          <UserPlus size={15} strokeWidth={1.5} /> Add Staff Member
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODALS                                                   */}
      {/* ════════════════════════════════════════════════════════ */}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Reset all settings?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              Reset all settings to default demo values? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowResetModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleReset} className="btn btn-danger">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate QR Confirmation Modal */}
      {showRegenerateQR && (
        <div className="modal-overlay" onClick={() => setShowRegenerateQR(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Regenerate QR Code?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              This will invalidate the old QR. All members will need to scan the new one. Are you sure?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowRegenerateQR(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleRegenerateQR} className="btn btn-danger">Regenerate</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Drawer */}
      <Drawer
        open={showAddStaff}
        onClose={() => setShowAddStaff(false)}
        title="Add Staff Member"
        footer={
          <>
            <button onClick={() => setShowAddStaff(false)} className="btn btn-secondary">Cancel</button>
            <button
              onClick={handleAddStaff}
              disabled={!staffForm.name || !staffForm.phone || !staffForm.password}
              className="btn btn-primary"
            >
              Add Staff
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="new-staff-name" className="input-label">Name <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              id="new-staff-name"
              type="text"
              className="input"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              placeholder="Staff member name"
            />
          </div>
          <div>
            <label htmlFor="new-staff-phone" className="input-label">Phone <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              id="new-staff-phone"
              type="tel"
              className="input"
              value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label htmlFor="new-staff-role" className="input-label">Role</label>
            <select
              id="new-staff-role"
              className="input"
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
            >
              <option value="coach">Coach</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-staff-pass" className="input-label">Temporary Password <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              id="new-staff-pass"
              type="text"
              className="input"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
