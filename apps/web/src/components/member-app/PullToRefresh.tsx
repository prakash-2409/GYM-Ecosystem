'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  brandColor: string;
}

export function PullToRefresh({ children, onRefresh, brandColor }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = Math.max(0, currentY - startY.current);
    // Apply resistance
    const distance = Math.min(diff * 0.5, THRESHOLD * 1.5);
    setPullDistance(distance);
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pulling, pullDistance, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto pb-20 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : '0px' }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
          style={{
            borderColor: `${brandColor}40`,
            borderTopColor: 'transparent',
            borderRightColor: refreshing ? brandColor : `${brandColor}${Math.round(progress * 255).toString(16).padStart(2, '0')}`,
            transform: `rotate(${progress * 360}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
