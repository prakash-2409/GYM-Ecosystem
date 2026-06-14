'use client';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberCode: string;
}

export function QRModal({ isOpen, onClose, memberCode }: QRModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A1A] rounded-3xl p-6 w-full max-w-sm border border-white/[0.1] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-[#F5F5F0]">Check-in QR Code</h2>
          <p className="text-xs text-[#888] mt-1">Show this to the gym kiosk</p>
        </div>
        <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* QR finder patterns */}
            <rect x="5" y="5" width="25" height="25" fill="black" rx="3" />
            <rect x="8" y="8" width="19" height="19" fill="white" rx="2" />
            <rect x="11" y="11" width="13" height="13" fill="black" rx="1" />
            <rect x="70" y="5" width="25" height="25" fill="black" rx="3" />
            <rect x="73" y="8" width="19" height="19" fill="white" rx="2" />
            <rect x="76" y="11" width="13" height="13" fill="black" rx="1" />
            <rect x="5" y="70" width="25" height="25" fill="black" rx="3" />
            <rect x="8" y="73" width="19" height="19" fill="white" rx="2" />
            <rect x="11" y="76" width="13" height="13" fill="black" rx="1" />
            {/* Data pattern */}
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
        <p className="text-center text-sm font-mono text-[#888]">ID: {memberCode}</p>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-sm font-medium text-[#F5F5F0] active:scale-[0.98] transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  );
}
