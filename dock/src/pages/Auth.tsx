import React, { useState } from 'react';
import { WireBox } from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

function FieldRow({ label, type = 'text', placeholder, error, hint }: {
  label: string; type?: string; placeholder: string; error?: string; hint?: string;
}) {
  const [val, setVal] = useState('');
  const [touched, setTouched] = useState(false);

  return (
    <div>
      <label className="block text-xs font-semibold text-[#3A3A3A] mb-1">{label}</label>
      <input
        type={type}
        className={`wire-input ${touched && error ? 'border-[#8A8A8A] bg-[#FAF8F8]' : ''}`}
        placeholder={placeholder}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => setTouched(true)}
      />
      {touched && error && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[#5A5A5A] text-[11px]">⚠ {error}</span>
        </div>
      )}
      {hint && !error && <div className="text-[11px] text-[#9A9A9A] mt-1">{hint}</div>}
    </div>
  );
}

export function LoginPage({ onNav }: { onNav: (page: Page) => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <WireBox width={48} height={48} label="logo" className="text-[9px] mb-3" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Sign in to DevHub</h1>
          <p className="text-sm text-[#7A7A7A] mt-1">Access your repositories and developer analytics</p>
        </div>

        {/* GitHub OAuth button */}
        <button
          className="wire-btn wire-btn-secondary w-full py-3 text-sm gap-2 mb-6"
          onClick={() => onNav('dashboard')}
        >
          <WireBox width={18} height={18} label="" className="text-[7px]" />
          Continue with GitHub
          <span className="annotation ml-auto">OAuth placeholder</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[11px] text-[#A0A0A0]">or sign in with email</span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Form */}
        <div className="wire-card p-6 space-y-4">
          <FieldRow
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={submitted ? '' : undefined}
          />
          <FieldRow
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={submitted ? '' : undefined}
          />

          {/* Validation state demo */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="text-[11px] font-mono text-[#7A7A7A] mb-1">— Validation states —</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 wire-input border-[#C8C8C8]" />
              <span className="annotation">valid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 wire-input border-[#888] bg-[#FAF8F8]" />
              <span className="annotation">error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 wire-input bg-[#EFEFEF] border-[#E0E0E0] opacity-60" />
              <span className="annotation">disabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-[#4A4A4A] cursor-pointer">
              <div className="w-3.5 h-3.5 border border-[#B0B0B0] rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-[#3A3A3A] rounded-sm" />
              </div>
              Remember me
            </label>
            <button className="text-[#4A4A4A] hover:underline">Forgot password?</button>
          </div>

          <button
            onClick={() => { setSubmitted(true); onNav('dashboard'); }}
            className="wire-btn wire-btn-primary w-full py-2.5"
          >
            Sign In
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#7A7A7A] mt-4">
          Don't have an account?{' '}
          <button onClick={() => onNav('register')} className="text-[#1A1A1A] font-medium hover:underline">Create one</button>
        </p>
        <p className="text-center text-[11px] text-[#A0A0A0] mt-2">
          By signing in you agree to our{' '}
          <button className="underline">Terms</button> and{' '}
          <button className="underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage({ onNav }: { onNav: (page: Page) => void }) {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <WireBox width={48} height={48} label="logo" className="text-[9px] mb-3" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Create your account</h1>
          <p className="text-sm text-[#7A7A7A] mt-1">Start discovering GitHub repositories & developers</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-6">
          {['Account', 'Profile', 'Interests'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 ${i + 1 <= step ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`}>
                <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  i + 1 < step ? 'bg-[#3A3A3A] text-white' : i + 1 === step ? 'border-2 border-[#1A1A1A]' : 'border-2 border-[#D0D0D0]'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-2 ${i + 1 < step ? 'bg-[#3A3A3A]' : 'bg-[#D0D0D0]'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* GitHub OAuth */}
        <button
          className="wire-btn wire-btn-secondary w-full py-3 text-sm gap-2 mb-5"
          onClick={() => onNav('dashboard')}
        >
          <WireBox width={18} height={18} label="" className="text-[7px]" />
          Sign up with GitHub
          <span className="annotation ml-auto">OAuth placeholder</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[11px] text-[#A0A0A0]">or create with email</span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Form steps */}
        <div className="wire-card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <FieldRow label="Email address" type="email" placeholder="you@example.com" hint="We'll send a confirmation email" />
              <FieldRow label="Username" placeholder="choose a unique username" hint="Only letters, numbers, and hyphens" />
              <FieldRow label="Password" type="password" placeholder="Create a strong password" hint="At least 8 characters" />
              <FieldRow label="Confirm password" type="password" placeholder="Repeat your password" error="Passwords must match" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FieldRow label="Full name" placeholder="Your display name" />
              <FieldRow label="Bio" placeholder="Tell developers about yourself" />
              <FieldRow label="Location" placeholder="City, Country" />
              <FieldRow label="Website" placeholder="https://yoursite.com" />
              <div>
                <label className="block text-xs font-semibold text-[#3A3A3A] mb-2">Avatar</label>
                <div className="flex items-center gap-3">
                  <WireBox width={56} height={56} rounded label="avatar" className="text-[9px]" />
                  <button className="wire-btn wire-btn-secondary text-xs">Upload photo</button>
                  <span className="annotation">JPEG, PNG, max 5MB</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#3A3A3A] mb-1">Select your interests</div>
              <p className="text-xs text-[#7A7A7A] -mt-2 mb-3">We'll use these to personalize your feed</p>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'React', 'Vue', 'Machine Learning', 'DevOps', 'Web3', 'Mobile', 'AI', 'Systems', 'Databases', 'Security'].map((t, i) => {
                  const defaultActive = [0, 1, 4, 5, 11].includes(i);
                  return (
                    <button key={t} className={`wire-chip ${defaultActive ? 'active' : ''}`}>{t}</button>
                  );
                })}
              </div>
              <div className="text-[11px] text-[#9A9A9A] mt-1">Select at least 3 topics</div>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="wire-btn wire-btn-secondary flex-1">Back</button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : onNav('dashboard')}
              className="wire-btn wire-btn-primary flex-1"
            >
              {step === 3 ? 'Create Account' : 'Continue'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#7A7A7A] mt-4">
          Already have an account?{' '}
          <button onClick={() => onNav('login')} className="text-[#1A1A1A] font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
