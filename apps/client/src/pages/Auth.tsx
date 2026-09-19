import { login, register, githubLogin } from '../services/authService';
import { Page } from '../types';

interface AuthProps {
  onNav: (page: Page) => void;
  initialMode?: 'login' | 'register';
}

export function AuthPage({ onNav, initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (email && password) {
      // Real auth – call backend and rely on HTTP‑only cookie
      try {
        if (mode === 'login') {
          await login(email, password);
        } else {
          await register(username || email, email, password);
        }
        onNav('dashboard');
      } catch (err) {
        console.error(err);
        // In a real UI you'd show an error toast here
      }
      onNav('dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#238636] border border-[#2ea043] flex items-center justify-center text-white font-mono font-bold text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] mb-3">
            &gt;_
          </div>
          <h1 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">
            {mode === 'login' ? 'Sign in to DevHub' : 'Create your DevHub account'}
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Access developer analytics, personalized feeds, and repo bookmarks
          </p>
        </div>

        {/* GitHub OAuth Button */}
        <button
          onClick={githubLogin}
          className="dev-btn dev-btn-secondary w-full py-2.5 text-sm gap-2.5 mb-5 justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="font-semibold text-[#f0f6fc]">Continue with GitHub</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] text-[#3fb950] border border-[#238636]/40 ml-auto">
            OAuth 2.0
          </span>
        </button>

        {/* Hairline Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#30363d]" />
          <span className="text-xs font-mono text-[#6e7681]">or with email credentials</span>
          <div className="flex-1 h-px bg-[#30363d]" />
        </div>

        {/* Credentials Form */}
        <div className="dev-card p-6 border border-[#30363d]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">
                  GitHub Username
                </label>
                <input
                  type="text"
                  className="dev-input"
                  placeholder="e.g. torvalds"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="dev-input"
                placeholder="developer@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-[#c9d1d9]">
                  Password
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-[#2f81f7] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                type="password"
                className="dev-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'register' ? "new-password" : "current-password"}
                aria-label="Password"
              />
            </div>

            <button
              type="submit"
              className="dev-btn dev-btn-primary w-full py-2 text-sm mt-2 font-semibold"
            >
              {mode === 'login' ? 'Sign In' : 'Create Developer Account'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
            {mode === 'login' ? (
              <span>
                New to DevHub?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-[#2f81f7] font-semibold hover:underline"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#2f81f7] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ onNav }: { onNav: (page: Page) => void }) {
  return <AuthPage onNav={onNav} initialMode="login" />;
}

export function RegisterPage({ onNav }: { onNav: (page: Page) => void }) {
  return <AuthPage onNav={onNav} initialMode="register" />;
}
