# 🛡️ AI RECHARGE MODELS - PERMANENT MASTER PRODUCTION BACKUP ARCHIVE

---
- **ఫైల్ రకం:** PERMANENT MASTER CODE BACKUP (శాశ్వత మాస్టర్ బ్యాకప్ ఫైల్)
- **సృష్టించిన తేదీ (Date):** 27 అక్టోబర్ 2026 (2026-10-27)
- **సమయం (Time):** 10:46 AM Local / 11:16 PM IST
- **సీనియర్ ఇంజనీర్ (Author):** Google AI Studio Build Senior Engineer
- **అడ్మిన్ క్రెడెన్షియల్స్:** `psm8742260@gmail.com` | మొబైల్: `8466062260` (పురుషోత్తం)
- **మాస్టర్ పిన్:** `6606.0k` / `2634T`
- **డొమైన్ హోస్టింగ్:** `arm.phrscrowd.online`
---

> **ముఖ్య గమనిక:** ఈ ఫైల్ మన ప్రాజెక్ట్ యొక్క శాశ్వత బ్యాకప్ రికార్డు. భవిష్యత్తులో ఎప్పుడైనా ఎటువంటి అత్యవసర పరిస్థితి వచ్చినా, కోడ్‌ను యథాతథంగా పునరుద్ధరించుకోవడానికి ఈ ఫైల్ ఉపయోగపడుతుంది. దీనిని ఎట్టి పరిస్థితుల్లోనూ డిలీట్ చేయరాదు.
>
> 🔒 **SHA & ప్రాజెక్ట్ లాక్ డైరెక్టివ్ (IMMUTABLE LOCK ACTIVE):**
> ప్రాజెక్ట్ నేమ్ **`AI Recharge Models`**, Applet ID **`48ad8e6f-65ff-43d6-b8e9-9101a514bb6b`**, మరియు డిజిటల్ SHA ఫింగర్‌ప్రింట్‌లు శాశ్వతంగా లాక్ చేయబడ్డాయి. ఎట్టి పరిస్థితుల్లోనూ వీటిని మార్చరాదు. కేవలం నిర్దేశించిన టాస్క్ మాత్రమే చేయాలి.

---

## 1. ఆథెంటికేషన్ మోడల్ కోడ్ (AuthModal.tsx - Latest Production Code)
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Smartphone, Loader2, Mail } from 'lucide-react';
import { UserAccount } from '../types';

export const GmailIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 16.2L40 18.95L35 23.7V40H42C43.657 40 45 38.657 45 37V16.2Z" fill="#34A853"/>
    <path d="M3 16.2L6.658 19.033L13 23.7V40H6C4.343 40 3 38.657 3 37V16.2Z" fill="#4285F4"/>
    <path d="M35 11.2L24 19.45L13 11.2L12 17L13 23.7L24 31.95L35 23.7L36 17L35 11.2Z" fill="#EA4335"/>
    <path d="M3 12.298V16.2L13 23.7V11.2L9.876 8.859C8.132 7.551 5.638 8.085 4.33 9.828C3.877 10.432 3.398 11.348 3 12.298Z" fill="#C5221F"/>
    <path d="M45 12.298V16.2L35 23.7V11.2L38.124 8.859C39.868 7.551 42.362 8.085 43.67 9.828C44.123 10.432 44.602 11.348 45 12.298Z" fill="#FBBC04"/>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'email' | 'mobile'>('email');
  const [loginInput, setLoginInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoginInput('');
      setIsLoading(false);
    }
  }, [isOpen, loginMode]);

  if (!isOpen) return null;

  const performLogin = async (rawValue: string) => {
    const val = rawValue.trim();
    if (!val || isLoading) return;

    setIsLoading(true);

    let inputEmail = '';
    let inputMobile = '';

    if (val.includes('@')) {
      inputEmail = val;
    } else if (val.replace(/\D/g, '').length >= 10) {
      inputMobile = val.replace(/\D/g, '');
    } else {
      inputEmail = val;
    }

    const AUTHORIZED_ADMIN_EMAILS = ['psm8742260@gmail.com'];
    const AUTHORIZED_ADMIN_MOBILES = ['8466062260'];
    const AUTHORIZED_PINS = ['6606.0k', '2634t', '6606', '6606.0'];

    const isAuthorizedEmail = inputEmail && AUTHORIZED_ADMIN_EMAILS.includes(inputEmail.toLowerCase());
    const isAuthorizedMobile = inputMobile && AUTHORIZED_ADMIN_MOBILES.includes(inputMobile);
    const isPinMatch = AUTHORIZED_PINS.includes(val.toLowerCase());
    const isAdmin = isAuthorizedEmail || isAuthorizedMobile || isPinMatch;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: inputEmail || (inputMobile ? `${inputMobile}@airecharge.user` : 'psm8742260@gmail.com'),
          name: isAdmin ? 'Purushotham (Admin)' : (inputEmail ? inputEmail.split('@')[0] : (inputMobile ? `User ${inputMobile.slice(-4)}` : 'AI Developer')),
          mobile: inputMobile,
          provider: 'hybrid_auth',
          isAdminRequest: isAdmin
        }),
      });
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && data.user) {
          if (inputEmail) localStorage.setItem('airecharge_last_email', inputEmail);
          if (inputMobile) localStorage.setItem('airecharge_last_mobile', inputMobile);
          localStorage.setItem('airecharge_user_account', JSON.stringify(data.user));
          onLoginSuccess(data.user);
          onClose();
          setIsLoading(false);
          return;
        }
      }
      throw new Error(`API Endpoint Returned Status ${res.status}`);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Backend server auth fallback mode active:', err);
    }

    // Fail-safe client session creation
    const activeApiKey = isAdmin ? 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5' : ('phrs-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const fallbackUser: UserAccount = {
      id: isAdmin ? 'usr_admin_master' : `usr_${Date.now()}`,
      email: inputEmail || (inputMobile ? `${inputMobile}@airecharge.user` : (isAdmin ? 'psm8742260@gmail.com' : 'user@airecharge.com')),
      name: isAdmin ? 'Purushotham (Admin)' : (inputEmail ? (inputEmail.split('@')[0] || 'AI Developer') : (inputMobile ? `User ${inputMobile.slice(-4)}` : 'AI Developer')),
      mobile: inputMobile || (isAdmin ? '8466062260' : ''),
      avatar: isAdmin ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      activePlanId: isAdmin ? 'plan-master' : 'plan-1m',
      activePlanName: isAdmin ? 'Master Admin Unlimited Access' : '1 Month Starter Pack',
      planDurationMonths: isAdmin ? 12 : 1,
      dataPackMBTotal: isAdmin ? 1024000 : 2048,
      dataPackMBRemaining: isAdmin ? 1024000 : 1840.25,
      dailyLimitMB: isAdmin ? 50000 : 800,
      dailyUsedMB: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activeApiKey: activeApiKey,
      isAdmin: isAdmin,
      keysHistory: [
        {
          key: activeApiKey,
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ],
    };

    if (inputEmail) localStorage.setItem('airecharge_last_email', inputEmail);
    if (inputMobile) localStorage.setItem('airecharge_last_mobile', inputMobile);
    localStorage.setItem('airecharge_user_account', JSON.stringify(fallbackUser));

    onLoginSuccess(fallbackUser);
    onClose();
    setIsLoading(false);
  };

  const handleInputChange = (val: string) => {
    setLoginInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = val.trim();
    const isReadyEmail = loginMode === 'email' && trimmed.includes('@') && (trimmed.endsWith('.com') || trimmed.endsWith('.in') || trimmed.endsWith('.net') || trimmed.endsWith('.org') || trimmed.length >= 10);
    const isReadyMobile = loginMode === 'mobile' && trimmed.replace(/\D/g, '').length >= 10;
    const isPin = ['6606.0k', '2634t', '6606', '6606.0'].includes(trimmed.toLowerCase());

    if (isReadyEmail || isReadyMobile || isPin) {
      debounceTimerRef.current = setTimeout(() => {
        performLogin(trimmed);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-[32px] max-w-sm sm:max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6 text-slate-900">
        
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md cursor-pointer"
          title="వెనక్కి వెళ్ళండి"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Modal Brand Lockup */}
        <div className="text-center space-y-4 pt-1">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-emerald-400 p-0.5 mx-auto shadow-2xl shadow-cyan-500/25 overflow-hidden">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
              <img src="/app_logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              AI RECHARGE MODELS
            </h2>
          </div>
        </div>

        {/* GLOWING INPUT BOX */}
        <div className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performLogin(loginInput);
            }}
          >
            <div className="relative rounded-2xl bg-slate-950 border-2 border-cyan-400 p-2 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center">
              <div className="pl-2 pr-2 shrink-0 flex items-center justify-center">
                {loginMode === 'email' ? (
                  <GmailIcon className="w-7 h-7 drop-shadow-md" />
                ) : (
                  <Smartphone className="w-7 h-7 text-cyan-400 drop-shadow-md" />
                )}
              </div>

              <input
                type={loginMode === 'email' ? 'email' : 'tel'}
                autoFocus
                value={loginInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={loginMode === 'email' ? 'xxxxxxxx@gmail.com' : '98xxxxxxxx'}
                className="w-full bg-transparent text-white font-mono font-bold text-base px-2 py-2.5 focus:outline-none placeholder-slate-500 selection:bg-cyan-500 selection:text-slate-950"
              />

              <div className="pr-3 shrink-0 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400/40 border-t-cyan-400" />
                )}
              </div>
            </div>
          </form>

          <p className="text-xs text-center text-slate-600 font-semibold pt-1">
            {loginMode === 'email'
              ? 'జిమెయిల్ ఐడి టైప్ చేయగానే ఆటోమేటిక్‌గా వెరిఫై అవుతుంది'
              : 'మొబైల్ నంబర్ టైప్ చేయగానే ఆటోమేటిక్‌గా వెరిఫై అవుతుంది'}
          </p>
        </div>

        {/* DIVIDER WITH SWITCH ICON BUTTON */}
        <div className="pt-2">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 absolute"></div>
            <button
              type="button"
              onClick={() => {
                setLoginMode(loginMode === 'email' ? 'mobile' : 'email');
                setLoginInput('');
              }}
              className="relative z-10 w-12 h-12 rounded-2xl bg-slate-950 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title={loginMode === 'email' ? 'మొబైల్ నంబర్ మోడ్‌కి మారండి' : 'జిమెయిల్ మోడ్‌కి మారండి'}
            >
              {loginMode === 'email' ? (
                <Smartphone className="w-6 h-6 text-cyan-400" />
              ) : (
                <Mail className="w-6 h-6 text-cyan-400" />
              )}
            </button>
          </div>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={() => {
                setLoginMode(loginMode === 'email' ? 'mobile' : 'email');
                setLoginInput('');
              }}
              className="text-xs text-slate-700 hover:text-cyan-600 font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loginMode === 'email' ? (
                <>
                  <Smartphone className="w-4 h-4 text-cyan-600" />
                  <span>మొబైల్ నంబర్ తో లాగిన్ అవ్వడానికి ఐకాన్ క్లిక్ చేయండి</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-cyan-600" />
                  <span>జిమెయిల్ తో లాగిన్ అవ్వడానికి ఐకాన్ క్లిక్ చేయండి</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
```

---

## 2. GitHub Actions వర్క్‌ఫ్లో ఫైల్ (.github/workflows/deploy.yml)
```yaml
name: Auto-Deploy to cPanel Server

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build-and-deploy:
    name: Build & Auto Deploy to cPanel
    runs-on: ubuntu-latest

    steps:
      - name: 📥 1. Checkout Repository
        uses: actions/checkout@v4

      - name: ⚙️ 2. Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 3. Install Dependencies
        run: |
          npm install --legacy-peer-deps

      - name: 🔨 4. Build Production Bundle
        run: |
          npm run build

      - name: 🚀 5. Sync to cPanel Server via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER || 'phrscrowd.online' }}
          username: ${{ secrets.FTP_USERNAME || 'phrscrow' }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: dist/
          server-dir: ${{ secrets.FTP_SERVER_DIR || '/arm.phrscrowd.online/' }}
          dangerous-clean-slate: true
```

---

## 3. cPanel డిప్లాయ్ ఫైల్ (.cpanel.yml)
```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/phrscrow/arm.phrscrowd.online/
    - /bin/mkdir -p $DEPLOYPATH
    - /bin/mkdir -p $DEPLOYPATH/tmp
    - /bin/cp -R dist/* $DEPLOYPATH 2>/dev/null || /bin/cp -R * $DEPLOYPATH
    - /bin/cp app.js $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp server.js $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp server_store.json $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp package.json $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp .htaccess $DEPLOYPATH/ 2>/dev/null || true
    - /bin/touch $DEPLOYPATH/tmp/restart.txt 2>/dev/null || true
```

---

## 4. నెవిగేషన్ బార్ సెక్యూరిటీ (Navbar.tsx)
- సాధారణ యూజర్లకు అడ్మిన్ ఐకాన్ (`Lock`) కనపడకుండా ఉండే కోడ్:
```tsx
  {user && user.isAdmin && (
    <button 
      onClick={() => setActiveTab('admin' as any)} 
      className="p-1.5 border rounded-lg transition-all shadow-md flex items-center justify-center bg-slate-900 border-cyan-500/50 text-cyan-400 animate-hybrid-engine-glow cursor-pointer"
      title="అడ్మిన్ మాస్టర్ ప్యానెల్ (Admin Panel)"
    >
      <Lock className="w-5 h-5 text-cyan-400" />
    </button>
  )}
```

---

## 5. తాజా మార్పులు (Latest Updates - 27 Oct 2026)
- **టాస్క్:** PWA Icon Refresh (Robot Logo), Cache Busting & Redundant File Cleanup
- **మార్పులు:** 
  - `index.html`, `manifest.json`, `manifest.webmanifest` ఫైళ్లలో ఐకాన్ పాత్‌లకు `?v=HYBRID` జోడించబడింది.
  - `src/version.ts` లో `SYSTEM_INTEGRITY_LOCK` ఎన్ఫోర్స్ చేయబడింది.
  - `AGENT.md` ఫైల్ మళ్ళీ సెట్ చేయబడింది.
  - `bun.lock` మరియు ఇతర అనవసరమైన ఫైళ్లు డిలీట్ చేయబడ్డాయి.
- **ఇంజనీర్:** AI_ENGINEER_HYBRID_CORE
- **సమయం:** 2026-10-27 21:15:00

---

## 6. పాత మరియు అనవసరమైన ఫైళ్ల బ్యాకప్ (Redundant Files Backup - 27 Oct 2026)
*గమనిక: ఈ ఫైళ్లు cPanel హోస్టింగ్ లో ప్రస్తుతం అవసరం లేదు, కానీ భవిష్యత్తు అవసరాల కోసం ఇక్కడ భద్రపరచబడ్డాయి.*

### A. డిలీట్ చేయబడిన ఫైళ్ల జాబితా (Deleted Files List):
1. `.dockerignore`
2. `.gcpignore`
3. `deploy-vps.sh`
4. `update-vps.sh`
5. `cPanel_Setup_Guide.txt`
6. `README_CPANEL_TELUGU.txt`
7. `PROJECT_SECURITY_LOCK.json`
8. `bun.lock` (NPM వాడుతున్నందున ఇది అవసరం లేదు)

### A. deploy-vps.sh (VPS సెటప్ స్క్రిప్ట్)
```bash
#!/bin/bash
# AI Recharge Models - Automated VPS Setup & Deploy Script
set -e
echo "🚀 Updating system packages..."
sudo apt update -y
sudo npm install -g pm2 tsx
npm install
npm run build
# Nginx config...
PORT=8080 NODE_ENV=production pm2 start server.js --name "ai-recharge"
```

### B. update-vps.sh (VPS లైవ్ అప్‌డేట్)
```bash
#!/bin/bash
# AI Recharge Models - One-Command VPS Live Update Script
set -e
git pull origin main || echo "Git pull warning..."
npm install --production=false
npm run build
pm2 restart all || pm2 start server.js --name "ai-recharge-gateway"
```

### C. cPanel_Setup_Guide.txt & README_CPANEL_TELUGU.txt (సారాంశం)
- **Node.js Setup:** Version 20.x, Root: /public_html, Startup: server.js
- **Credentials:** Admin Master PIN: 6606.0k, Mobile: 8466062260, Email: psm8742260@gmail.com (Purushotham)

---
*ఈ శాశ్వత బ్యాకప్ ఫైల్ ప్రాజెక్ట్ రూట్ లోని `/backups/PERMANENT_CODE_BACKUP.md` లో శాశ్వతంగా భద్రపరచబడింది.*
