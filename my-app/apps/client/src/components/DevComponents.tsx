import React from 'react';
import { getLanguageColor } from '../lib/utils';

// Simplified Avatar – solid background colour, no gradient logic
export function Avatar({
  name = '',
  size = 36,
  rounded = true,
  className = '',
  src,
}: {
  name?: string;
  size?: number;
  rounded?: boolean;
  className?: string;
  src?: string;
}) {
  const initials = name
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'DH';

  // Use a deterministic solid background based on first character code
  const colors = ['#238636', '#1f6feb', '#d29922', '#8b949e'];
  const charCode = name.charCodeAt(0) || 0;
  const bgColor = colors[charCode % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover border border-[#30363d] ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-mono font-semibold select-none ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(10, Math.floor(size * 0.38)),
        backgroundColor: bgColor,
        color: '#fff',
        border: '1px solid #30363d',
      }}
      title={name}
      role="img"
      aria-label={name}
    >
      {initials}
    </div>
  );
}

// Minimal VectorChart – single line or area, no grid or gradients
export function VectorChart({
  height = 100,
  type = 'area',
  label = 'activity',
  className = '',
}: {
  height?: number;
  type?: 'bar' | 'line' | 'area';
  label?: string;
  className?: string;
}) {
  const points = '0,75 30,55 60,65 90,30 120,45 150,20 180,40 210,25 240,50 270,30 300,45 330,20 360,35';
  const stroke = '#2f81f7';
  const fill = type === 'area' ? '#2f81f7' : 'none';
  return (
    <div className={`relative bg-[#0d1117] rounded-md overflow-hidden p-2 ${className}`}>
      <svg width="100%" height="100%" viewBox={`0 0 360 ${height}`} preserveAspectRatio="none">
        {type === 'area' && (
          <polygon points={`0,${height} ${points} 360,${height}`} fill={fill} opacity="0.3" />
        )}
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider bg-[#0d1117]/80 px-1 rounded">
        {label}
      </span>
    </div>
  );
}

// Simplified SaveButton – solid colour, no border transition
export function SaveButton({ saved = false, onToggle }: { saved?: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onToggle?.();
      }}
      type="button"
      className={`p-1.5 rounded-md ${saved ? 'bg-[#d29922] text-[#fff]' : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]'} `}
      title={saved ? 'Remove from saved' : 'Save item'}
      aria-label={saved ? 'Remove from saved' : 'Save item'}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path d="M3 2h10a1 1 0 0 1 1 1v12l-6-3-6 3V3a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

export function StarCount({ count }: { count: string | number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#8b949e] font-mono">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-[#e3b341]">
        <polygon points="8,2 10,6 14.5,6.5 11,10 12,14.5 8,12 4,14.5 5,10 1.5,6.5 6,6" />
      </svg>
      <span>{count}</span>
    </span>
  );
}

export function ForkCount({ count }: { count: string | number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#8b949e] font-mono">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="8" cy="13" r="1.5" />
        <path d="M5 4.5v3l3 2 3-2V4.5" />
      </svg>
      <span>{count}</span>
    </span>
  );
}

export function WatchCount({ count }: { count: string | number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#8b949e] font-mono">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M1.5 8C3 4 5.2 2 8 2s5 2 6.5 6c-1.5 4-3.7 6-6.5 6s-5-2-6.5-6z" />
      </svg>
      <span>{count}</span>
    </span>
  );
}

export function LanguageDot({ lang }: { lang: string }) {
  const color = getLanguageColor(lang);
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#8b949e]">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{lang}</span>
    </span>
  );
}

export function LanguageBar({ langs = [] }: { langs: { name: string; pct: number; color?: string }[] }) {
  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-[#0d1117]">
        {langs.map((l, i) => (
          <div
            key={i}
            className="h-full transition-all"
            style={{
              width: `${l.pct}%`,
              backgroundColor: l.color || getLanguageColor(l.name),
            }}
            title={`${l.name}: ${l.pct}%`}
          />
        ))}
      </div>
    </div>
  );
}

export function MetricCard({ label, value, sublabel, trend, icon }: { label: string; value: string | number; sublabel?: string; trend?: 'up' | 'down' | 'flat'; icon?: React.ReactNode }) {
  return (
    <div className="p-3 bg-[#21262d] rounded-md">
      <div className="flex items-center justify-between text-[#8b949e] mb-1">
        <span className="text-[11px] uppercase tracking-wider font-semibold">{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <div className="text-2xl font-bold font-mono text-[#f0f6fc] leading-tight my-0.5">{value}</div>
      {sublabel && (
        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 text-[#6e7681]">
          {trend === 'up' && <span className="text-[#3fb950]">↑</span>}
          {trend === 'down' && <span className="text-[#f85149]">↓</span>}
          <span>{sublabel}</span>
        </div>
      )}
    </div>
  );
}

export function DevTabs({ tabs, active, onChange, className = '', counts }: { tabs: string[]; active: string; onChange: (tab: string) => void; className?: string; counts?: Record<string, number | string> }) {
  return (
    <div className={`flex gap-1 overflow-x-auto ${className}`}>
      {tabs.map(tab => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-3.5 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-[#2f81f7] text-[#f0f6fc]' : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'} `}
          >
            {tab}
            {counts && counts[tab] !== undefined && (
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-[#2f81f7]/20 text-[#2f81f7]' : 'bg-[#21262d] text-[#8b949e]'}`}> {counts[tab]} </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DevSearch({ placeholder = 'Search...', value, onChange, onSubmit, size = 'md', className = '' }: { placeholder?: string; value?: string; onChange?: (val: string) => void; onSubmit?: () => void; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const padClass = size === 'sm' ? 'py-1 pl-8 pr-12 text-xs' : size === 'lg' ? 'py-2.5 pl-10 pr-14 text-sm' : 'py-1.5 pl-9 pr-14 text-sm';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const iconLeft = size === 'sm' ? 'left-2.5' : size === 'lg' ? 'left-3.5' : 'left-3';
  return (
    <div className={`relative flex items-center ${className}`}>
      <svg className={`absolute ${iconLeft} text-[#8b949e] pointer-events-none`} width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" strokeLinecap="round"/></svg>
      <input className={`dev-input ${padClass}`} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSubmit?.()} />
    </div>
  );
}

export function ContributionGrid() {
  const weeks = 52;
  const days = 7;
  const shades = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between text-[9px] font-mono text-[#6e7681] py-0.5">
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((lbl, idx) => (
            <span key={idx} className="h-[10px] leading-[10px]">{lbl}</span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {Array.from({ length: days }, (_, d) => {
                const seed = (w * 7 + d * 13) % 100;
                let level = 0;
                if (seed > 30) level = 1;
                if (seed > 55) level = 2;
                if (seed > 75) level = 3;
                if (seed > 90) level = 4;
                return (
                  <div key={d} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: shades[level] }} title={`${level * 3 + (seed % 3)} contributions`}/>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#21262d] text-[11px] text-[#6e7681] font-mono">
        <span>Learn how we count contributions</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {shades.map((c, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }}/>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export function RateLimitShield({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="border border-[#d29922]/40 bg-[#d29922]/10 rounded-md p-3 flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-[#d29922]/20 border border-[#d29922] text-[#d29922] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">!</div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-[#f0f6fc]">GitHub API Safe Mode Active</div>
        <div className="text-xs text-[#8b949e] mt-0.5">Authenticated proxy cache protects your requests. Sign in for higher limits.</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-[#8b949e] hover:text-[#f0f6fc] text-base leading-none">✕</button>
      )}
    </div>
  );
}

export function SidebarSection({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="p-4 bg-[#21262d] rounded-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">{title}</span>
        {action && (
          <button onClick={action.onClick} className="text-xs text-[#2f81f7] hover:underline">{action.label}</button>
        )}
      </div>
      {children}
    </div>
  );
}

export function FilterPanel({ filters, values, onChange }: { filters: { label: string; key: string; options: string[] }[]; values: Record<string, string>; onChange: (key: string, val: string) => void }) {
  return (
    <div className="space-y-4">
      {filters.map(f => (
        <div key={f.key}>
          <div className="text-xs font-semibold text-[#8b949e] mb-2 uppercase tracking-wider">{f.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {f.options.map(opt => (
              <button key={opt} onClick={() => onChange(f.key, opt)} className={`dev-chip text-xs ${values[f.key] === opt ? 'active' : ''}`}>{opt}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SortBar({ options, value, onChange }: { options: string[]; value: string; onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8b949e]">Sort:</span>
      <div className="flex gap-1 bg-[#161b22] p-0.5 rounded-md border border-[#30363d]">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)} className={`px-2.5 py-1 rounded text-xs ${value === opt ? 'bg-[#21262d] text-[#f0f6fc] font-semibold' : 'text-[#8b949e] hover:text-[#f0f6fc]'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DevPagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 justify-center py-6">
      <button onClick={() => onChange(Math.max(1, current - 1))} className="dev-btn dev-btn-secondary px-3 py-1 text-xs" disabled={current === 1}>← Previous</button>
      {Array.from({ length: Math.min(5, total) }, (_, i) => {
        const page = i + 1;
        return (
          <button key={page} onClick={() => onChange(page)} className={`dev-btn px-3 py-1 text-xs min-w-[34px] font-mono ${page === current ? 'dev-btn-blue' : 'dev-btn-secondary'}`}>{page}</button>
        );
      })}
      {total > 5 && <span className="text-[#6e7681] text-xs px-1 font-mono">…</span>}
      <button onClick={() => onChange(Math.min(total, current + 1))} className="dev-btn dev-btn-secondary px-3 py-1 text-xs" disabled={current === total}>Next →</button>
    </div>
  );
}

export function EmptyState({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3 dev-card">
      <div className="w-12 h-12 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#8b949e]">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5z"/></svg>
      </div>
      <div className="font-semibold text-[#f0f6fc]">{title}</div>
      {subtitle && <div className="text-sm text-[#8b949e] max-w-sm">{subtitle}</div>}
      {action && <button onClick={onAction} className="dev-btn dev-btn-primary mt-2">{action}</button>}
    </div>
  );
}
