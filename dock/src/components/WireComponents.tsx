import React from 'react';

// Placeholder box for images, avatars, charts, logos
export function WireBox({
  width, height, label, className = '', rounded = false, dark = false
}: {
  width?: number | string; height?: number | string; label?: string;
  className?: string; rounded?: boolean; dark?: boolean;
}) {
  return (
    <div
      className={`wire-box ${dark ? 'wire-box-dark' : ''} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height, minHeight: height, minWidth: width }}
    >
      {label && <span className="opacity-60 text-center px-2">{label}</span>}
    </div>
  );
}

// Chart placeholder
export function WireChart({
  width = '100%', height = 120, label = 'chart', type = 'bar', className = ''
}: {
  width?: number | string; height?: number; label?: string; type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}) {
  const barHeights = [40, 70, 55, 80, 45, 90, 60, 75, 50, 85, 65, 70];
  const linePoints = '0,90 40,60 80,75 120,40 160,55 200,30 240,50 280,35 320,60 360,40';

  return (
    <div className={`wire-box rounded ${className}`} style={{ width, height }}>
      <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`} preserveAspectRatio="none">
        {type === 'bar' && barHeights.map((h, i) => (
          <rect
            key={i}
            x={i * 34 + 4} y={height - h - 10}
            width={28} height={h}
            fill="#B8B8B8" opacity={0.7 + (i % 3) * 0.1}
          />
        ))}
        {type === 'line' && (
          <>
            <polyline points={linePoints} fill="none" stroke="#999" strokeWidth="2" />
            {linePoints.split(' ').map((pt, i) => {
              const [x, y] = pt.split(',');
              return <circle key={i} cx={x} cy={y} r={3} fill="#888" />;
            })}
          </>
        )}
        {type === 'area' && (
          <>
            <polygon
              points={`0,${height} ${linePoints} 360,${height}`}
              fill="#D0D0D0" opacity={0.6}
            />
            <polyline points={linePoints} fill="none" stroke="#999" strokeWidth="2" />
          </>
        )}
        {type === 'pie' && (
          <>
            <circle cx={200} cy={height / 2} r={height / 2 - 8} fill="#C8C8C8" />
            <path d={`M200,${height / 2} L200,${8} A${height / 2 - 8},${height / 2 - 8} 0 0,1 ${200 + (height / 2 - 8) * Math.sin(2)},${height / 2 - (height / 2 - 8) * Math.cos(2)} Z`} fill="#A0A0A0" />
            <path d={`M200,${height / 2} L${200 + (height / 2 - 8) * Math.sin(2)},${height / 2 - (height / 2 - 8) * Math.cos(2)} A${height / 2 - 8},${height / 2 - 8} 0 0,1 ${200 + (height / 2 - 8) * Math.sin(3.8)},${height / 2 - (height / 2 - 8) * Math.cos(3.8)} Z`} fill="#888" />
          </>
        )}
      </svg>
      <span className="absolute bottom-1 right-2 text-[10px] font-mono text-[#999]">{label}</span>
    </div>
  );
}

// Star/bookmark/save icon buttons
export function WireSaveBtn({ saved, onToggle }: { saved?: boolean; onToggle?: () => void }) {
  return (
    <button onClick={onToggle} className="wire-btn wire-btn-ghost p-1.5 !leading-none" title="Save">
      <svg width="14" height="14" viewBox="0 0 16 16" fill={saved ? '#3A3A3A' : 'none'} stroke="#4A4A4A" strokeWidth="1.5">
        <path d="M3 2h10a1 1 0 0 1 1 1v12l-6-3-6 3V3a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

// Star count widget
export function WireStarCount({ count }: { count: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-[#7A7A7A] font-mono">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="8,2 10,6 14.5,6.5 11,10 12,14.5 8,12 4,14.5 5,10 1.5,6.5 6,6" />
      </svg>
      {count}
    </span>
  );
}

// Fork count
export function WireForkCount({ count }: { count: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-[#7A7A7A] font-mono">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="8" cy="13" r="1.5" />
        <path d="M5 4.5v3l3 2 3-2V4.5" />
      </svg>
      {count}
    </span>
  );
}

// Language dot badge
export function WireLangDot({ lang }: { lang: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-[#7A7A7A]">
      <span className="w-2.5 h-2.5 rounded-full bg-[#A0A0A0] inline-block" />
      {lang}
    </span>
  );
}

// Metric card
export function WireMetricCard({
  label, value, sublabel, trend
}: {
  label: string; value: string; sublabel?: string; trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <div className="wire-card p-4">
      <div className="text-[11px] text-[#7A7A7A] mb-1 uppercase tracking-wider font-medium">{label}</div>
      <div className="text-2xl font-bold text-[#1A1A1A] leading-none mb-1">{value}</div>
      {sublabel && (
        <div className="flex items-center gap-1 text-[11px]">
          {trend === 'up' && <span className="text-[#5A5A5A]">↑</span>}
          {trend === 'down' && <span className="text-[#5A5A5A]">↓</span>}
          <span className="text-[#7A7A7A]">{sublabel}</span>
        </div>
      )}
    </div>
  );
}

// Tab bar
export function WireTabs({
  tabs, active, onChange, className = ''
}: {
  tabs: string[]; active: string; onChange: (t: string) => void; className?: string;
}) {
  return (
    <div className={`flex border-b border-[#E0E0E0] ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#7A7A7A] hover:text-[#4A4A4A]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// Search bar
export function WireSearch({
  placeholder = 'Search...', value, onChange, onSubmit, size = 'md', className = ''
}: {
  placeholder?: string; value?: string; onChange?: (v: string) => void;
  onSubmit?: () => void; size?: 'sm' | 'md' | 'lg'; className?: string;
}) {
  const heights: Record<string, string> = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
  const pads: Record<string, string> = { sm: 'pl-8 pr-3 text-sm', md: 'pl-10 pr-4 text-sm', lg: 'pl-12 pr-5 text-base' };
  const iconSize: Record<string, number> = { sm: 14, md: 16, lg: 18 };
  const iconPos: Record<string, string> = { sm: 'left-2', md: 'left-3', lg: 'left-4' };

  return (
    <div className={`relative flex items-center ${className}`}>
      <svg
        className={`absolute ${iconPos[size]} text-[#A0A0A0] pointer-events-none`}
        width={iconSize[size]} height={iconSize[size]} viewBox="0 0 16 16"
        fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3 3" strokeLinecap="round" />
      </svg>
      <input
        className={`wire-input ${heights[size]} ${pads[size]}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
      />
    </div>
  );
}

// Skeleton loader
export function WireSkeleton({ width = '100%', height = 16, className = '' }: {
  width?: number | string; height?: number; className?: string;
}) {
  return <div className={`skeleton ${className}`} style={{ width, height }} />;
}

// Empty state
export function WireEmpty({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <WireBox width={64} height={64} rounded className="mb-2" />
      <div className="text-[#4A4A4A] font-medium">{title}</div>
      {subtitle && <div className="text-sm text-[#7A7A7A] text-center max-w-xs">{subtitle}</div>}
      {action && <button className="wire-btn wire-btn-secondary mt-2">{action}</button>}
    </div>
  );
}

// Error state
export function WireError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="wire-box rounded w-12 h-12 wire-box-dark">!</div>
      <div className="text-sm text-[#4A4A4A]">{message}</div>
      <button className="wire-btn wire-btn-secondary text-xs">Try again</button>
    </div>
  );
}

// Rate limit alert
export function WireRateLimitAlert({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="border border-[#C8C8C8] bg-[#F0F0F0] rounded p-3 flex items-start gap-3">
      <div className="wire-box w-5 h-5 rounded text-[10px] flex-shrink-0">!</div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-[#3A3A3A]">GitHub API rate limit reached</div>
        <div className="text-xs text-[#7A7A7A] mt-0.5">Limit resets in 42 minutes. Sign in to increase your rate limit.</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-[#9A9A9A] hover:text-[#4A4A4A] text-lg leading-none">×</button>
      )}
    </div>
  );
}

// Pagination
export function WirePagination({
  current, total, onChange
}: {
  current: number; total: number; onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 justify-center py-4">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        className="wire-btn wire-btn-secondary px-3 py-1.5 text-xs"
        disabled={current === 1}
      >
        ← Prev
      </button>
      {Array.from({ length: Math.min(5, total) }, (_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`wire-btn px-3 py-1.5 text-xs min-w-[34px] ${
              page === current ? 'wire-btn-primary' : 'wire-btn-secondary'
            }`}
          >
            {page}
          </button>
        );
      })}
      {total > 5 && <span className="text-[#9A9A9A] text-xs px-1">…</span>}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        className="wire-btn wire-btn-secondary px-3 py-1.5 text-xs"
        disabled={current === total}
      >
        Next →
      </button>
    </div>
  );
}

// Language bar
export function WireLangBar({ langs }: { langs: { name: string; pct: number }[] }) {
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {langs.map((l, i) => {
          const shades = ['#3A3A3A', '#6A6A6A', '#8A8A8A', '#AAAAAA', '#C0C0C0'];
          return (
            <div key={i} style={{ width: `${l.pct}%`, background: shades[i % shades.length] }} />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {langs.map((l, i) => {
          const shades = ['#3A3A3A', '#6A6A6A', '#8A8A8A', '#AAAAAA', '#C0C0C0'];
          return (
            <span key={i} className="flex items-center gap-1 text-xs text-[#4A4A4A]">
              <span className="w-2 h-2 rounded-full" style={{ background: shades[i % shades.length] }} />
              {l.name} <span className="text-[#9A9A9A]">{l.pct}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Contribution grid (GitHub-style)
export function WireContribGrid() {
  const weeks = 52;
  const days = 7;
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {Array.from({ length: days }, (_, d) => {
            const level = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
            const shades = ['#EBEBEB', '#D0D0D0', '#ABABAB', '#808080', '#505050'];
            return (
              <div
                key={d}
                className="w-[10px] h-[10px] rounded-[2px]"
                style={{ background: shades[level] }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Sidebar section wrapper
export function WireSidebarSection({ title, children, action }: {
  title: string; children: React.ReactNode; action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="wire-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#3A3A3A] uppercase tracking-wider">{title}</span>
        {action && (
          <button onClick={action.onClick} className="text-xs text-[#7A7A7A] hover:text-[#3A3A3A]">{action.label}</button>
        )}
      </div>
      {children}
    </div>
  );
}

// Filter panel
export function WireFilterPanel({
  filters, values, onChange
}: {
  filters: { label: string; key: string; options: string[] }[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="space-y-4">
      {filters.map(f => (
        <div key={f.key}>
          <div className="text-xs font-semibold text-[#4A4A4A] mb-2 uppercase tracking-wider">{f.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {f.options.map(opt => (
              <button
                key={opt}
                onClick={() => onChange(f.key, opt)}
                className={`wire-chip text-xs ${values[f.key] === opt ? 'active' : ''}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sort selector
export function WireSortBar({
  options, value, onChange
}: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#7A7A7A]">Sort:</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`wire-chip text-xs ${value === opt ? 'active' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
