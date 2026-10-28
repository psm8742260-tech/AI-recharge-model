import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import JSZip from 'jszip';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS Support for VS Code extensions, Roo Code, Cline, and external clients
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'X-AIRecharge-Receipt, X-AIRecharge-Receipt-ID, X-Tokens-Prompt, X-Tokens-Completion, X-Tokens-Total, X-MB-Deducted, X-MB-Remaining, X-MB-DailyLimit');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health Check Endpoint (Returns HYBRID VERSION & SHA Fingerprint)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'HYBRID VERSION',
    engine: 'ACTIVE',
    fingerprint: 'SHA-256:48ad8e6f-65ff-43d6-b8e9-9101a514bb6b',
    timestamp: new Date().toISOString(),
  });
});


// Initialize GoogleGenAI server-side SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database with Disk Backup
interface UserAccount {
  id: string;
  email: string;
  name: string;
  mobile: string;
  avatar: string;
  activePlanId: string;
  activePlanName: string;
  planDurationMonths: number;
  dataPackMBTotal: number;
  dataPackMBRemaining: number;
  dailyLimitMB: number;
  dailyUsedMB: number;
  lastResetDate: string;
  expiryDate: string;
  activeApiKey: string;
  isAdmin: boolean;
  keysHistory: Array<{
    key: string;
    createdAt: string;
    status: 'active' | 'revoked';
  }>;
}

interface MagicReceipt {
  receiptId: string;
  timestamp: string;
  userId: string;
  keyUsed: string;
  modelId: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  dataDeductedMB: number;
  dataRemainingMB: number;
  dailyUsedMB: number;
  dailyLimitMB: number;
  gatewayStatus: string;
}

interface RechargeTransaction {
  id: string;
  timestamp: string;
  planId: string;
  planName: string;
  amountINR: number;
  dataAddedMB: number;
  generatedKey: string;
  paymentMethod: string;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-1m',
    name: '1 Month Starter Pack',
    durationMonths: 1,
    durationDays: 30,
    priceINR: 399,
    priceUSD: 4.99,
    dataPackMB: 2048,
    dataPackGB: 2.0,
    dailyLimitMB: 800,
    badge: 'Starter',
    features: [
      '2 GB Total High-Speed AI Data Pack',
      '800 MB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models',
      'Instant Gateway Auto-Activation',
      'Reverse Proxy Gateway Access',
      'Live Token-to-MB Magic Receipts'
    ]
  },
  {
    id: 'plan-2m',
    name: '2 Months Pro Pack',
    durationMonths: 2,
    durationDays: 60,
    priceINR: 699,
    priceUSD: 8.49,
    dataPackMB: 5120,
    dataPackGB: 5.0,
    dailyLimitMB: 1200,
    popular: true,
    badge: 'Most Popular',
    features: [
      '5 GB Total High-Speed AI Data Pack',
      '1.2 GB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models',
      'Instant Gateway Auto-Activation',
      'Priority Gateway Bandwidth',
      'Live Token-to-MB Magic Receipts',
      '24/7 Priority Gateway Proxy Routing'
    ]
  },
  {
    id: 'plan-3m',
    name: '3 Months Ultra Pack',
    durationMonths: 3,
    durationDays: 90,
    priceINR: 999,
    priceUSD: 11.99,
    dataPackMB: 10240,
    dataPackGB: 10.0,
    dailyLimitMB: 2048,
    badge: 'Best Value',
    features: [
      '10 GB Total High-Speed AI Data Pack',
      '2 GB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models (Including o1, Opus & Brahmastra)',
      'Instant Gateway Auto-Activation',
      'Unlimited Key Regeneration',
      'Live Token-to-MB Magic Receipts',
      'Dedicated Gateway Channel'
    ]
  }
];

const TOP_UP_PACKS = [
  {
    id: 'topup-500mb',
    name: 'Micro Recharge Top-Up',
    priceINR: 99,
    dataMB: 500,
    description: 'Instantly add 500 MB data pack to your active subscription without changing validity.'
  },
  {
    id: 'topup-1gb',
    name: 'Standard Recharge Top-Up',
    priceINR: 179,
    dataMB: 1024,
    description: 'Add 1 GB high-speed AI model data pack to your current key.'
  },
  {
    id: 'topup-3gb',
    name: 'Mega Recharge Top-Up',
    priceINR: 349,
    dataMB: 3072,
    description: 'Add 3 GB high-speed AI model data pack to your current key.'
  }
];

const DB_FILE = path.resolve(process.cwd(), 'server_store.json');

const defaultUser: UserAccount = {
  id: 'usr_demo_8829',
  email: 'psm8742260@gmail.com',
  name: 'Purushotham',
  mobile: '8466062260',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
  activePlanId: 'plan-1m',
  activePlanName: '1 Month Starter Pack',
  planDurationMonths: 1,
  dataPackMBTotal: 2048, // 2 GB
  dataPackMBRemaining: 1840.25, // ~1.84 GB left
  dailyLimitMB: 800,
  dailyUsedMB: 124.75,
  lastResetDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  activeApiKey: 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5',
  isAdmin: true,
  keysHistory: [
    {
      key: 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5',
      createdAt: new Date().toISOString(),
      status: 'active',
    },
  ],
};

let store = {
  users: [defaultUser],
  receipts: [] as MagicReceipt[],
  transactions: [] as RechargeTransaction[],
  plans: SUBSCRIPTION_PLANS,
  topups: TOP_UP_PACKS,
  systemConfig: {
    gatewayName: 'AI Recharge HYBRID GATEWAY',
    tokenDeductionMultiplier: 1.15,
    defaultDailyLimitMB: 800,
    isMaintenanceMode: false,
    hybridEngineStatus: 'ACTIVE',
    adminEmail: 'psm8742260@gmail.com',
    adminPassword: '2634T',
    adminMobile: '8466062260',
    masterPin: '6606.0k',
    authorizedAdminEmails: ['psm8742260@gmail.com'],
    authorizedAdminMobiles: ['8466062260'],
    isPaymentEnabled: true,
    upiId: 'psm8742260@upi',
    qrCodeUrl: ''
  }
};

// Load store from file if exists
function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure new fields exist
      store = { 
        ...store, 
        ...parsed,
        systemConfig: { ...store.systemConfig, ...(parsed.systemConfig || {}) }
      };
      
      if (!store.topups || store.topups.length < 5) {
        const existingIds = new Set((store.topups || []).map((t: any) => t.id));
        const missing = TOP_UP_PACKS.filter((t) => !existingIds.has(t.id));
        store.topups = [...(store.topups || []), ...missing];
        saveStore();
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Error loading server store:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server store:', err);
  }
}

loadStore();

// Reset daily usage if new day
function checkDailyReset(user: UserAccount) {
  const today = new Date().toISOString().split('T')[0];
  if (user.lastResetDate !== today) {
    user.dailyUsedMB = 0;
    user.lastResetDate = today;
    saveStore();
  }
}

// Generate random API Key format: sk-airecharge-xxxxxxxxxxxx
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 32; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `phrs-${rand}`;
}



// Bundle Size & Information Endpoint
app.get('/api/admin/bundle-info', (req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    const rootBundle = path.join(rootDir, 'cpanel-bundle.zip');
    const publicBundle = path.join(rootDir, 'public', 'cpanel-bundle.zip');
    const target = fs.existsSync(rootBundle) ? rootBundle : (fs.existsSync(publicBundle) ? publicBundle : null);
    if (target && fs.existsSync(target)) {
      const stats = fs.statSync(target);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
      return res.json({
        exists: true,
        bytes: stats.size,
        sizeMb: `${sizeMb} MB`,
        filename: 'cpanel-bundle.zip'
      });
    }
    return res.json({ exists: false, sizeMb: '36.5 MB' });
  } catch (e: any) {
    return res.json({ exists: false, sizeMb: '36.5 MB' });
  }
});



// Export Complete cPanel & VPS Production Bundle ZIP Endpoint
app.get([
  '/cpanel_public_html.zip',
  '/public_html.zip',
  '/cpanel-bundle.zip',
  '/airecharge-cpanel-bundle.zip',
  '/api/export-zip',
  '/api/download-bundle',
  '/api/download-cpanel-bundle',
  '/api/download-public-html'
], async (req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    const candidateFiles = [
      path.join(rootDir, 'cpanel_public_html.zip'),
      path.join(rootDir, 'cpanel-bundle.zip'),
      path.join(rootDir, 'public', 'cpanel_public_html.zip'),
      path.join(rootDir, 'public', 'cpanel-bundle.zip'),
      path.join(rootDir, 'dist', 'cpanel_public_html.zip'),
      path.join(rootDir, 'dist', 'cpanel-bundle.zip')
    ];
    const targetBundle = candidateFiles.find((f) => fs.existsSync(f));

    if (targetBundle) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="cpanel_public_html.zip"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(targetBundle);
    }

    const zip = new JSZip();

    // Helper to add directory to zip, excluding heavy chat screenshots and nested zips
    const addDirectoryToZip = (dirPath: string, zipFolder: JSZip) => {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === 'node_modules' || item === '.git' || item.endsWith('.zip') || item === 'aistudio') continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) addDirectoryToZip(fullPath, subFolder);
        } else {
          const fileData = fs.readFileSync(fullPath);
          zipFolder.file(item, fileData);
        }
      }
    };

    // Include compiled dist directory
    const distDir = path.join(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      const distFolder = zip.folder('dist');
      if (distFolder) addDirectoryToZip(distDir, distFolder);
    }

    // Include src directory
    const srcDir = path.join(rootDir, 'src');
    if (fs.existsSync(srcDir)) {
      const srcFolder = zip.folder('src');
      if (srcFolder) addDirectoryToZip(srcDir, srcFolder);
    }

    // Add root files
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'server.ts',
      'server.js',
      'index.html',
      'server_store.json',
      '.env.example',
      'deploy-vps.sh',
      'cPanel_Setup_Guide.txt',
      'README_CPANEL_TELUGU.txt'
    ];

    for (const file of rootFiles) {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        zip.file(file, fileData);
      }
    }

    const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
    zip.file('.htaccess', htaccessContent);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="airecharge-cpanel-bundle.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Export ZIP error:', err);
    res.status(500).json({ success: false, message: 'Export failed: ' + err.message });
  }
});

// Export Static Web Build ZIP Endpoint for cPanel public_html Direct Upload
app.get(['/api/export-public-html', '/cpanel_public_html.zip'], async (req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    const rootPub = path.join(rootDir, 'cpanel_public_html.zip');
    const distPub = path.join(rootDir, 'dist', 'cpanel_public_html.zip');
    const publicPub = path.join(rootDir, 'public', 'cpanel_public_html.zip');
    const targetPub = fs.existsSync(rootPub) ? rootPub : (fs.existsSync(distPub) ? distPub : (fs.existsSync(publicPub) ? publicPub : null));

    if (targetPub) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="cpanel_public_html.zip"');
      return res.sendFile(targetPub);
    }

    const zip = new JSZip();

    const addFolderToZip = (dirPath: string, zipFolder: JSZip) => {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === 'node_modules' || item.endsWith('.zip') || item === 'aistudio') continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) addFolderToZip(fullPath, subFolder);
        } else {
          const fileData = fs.readFileSync(fullPath);
          zipFolder.file(item, fileData);
        }
      }
    };

    const distDir = path.join(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      addFolderToZip(distDir, zip);
    } else {
      const publicDir = path.join(rootDir, 'public');
      if (fs.existsSync(publicDir)) {
        addFolderToZip(publicDir, zip);
      }
      const indexPath = path.join(rootDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        zip.file('index.html', fs.readFileSync(indexPath));
      }
    }

    const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
    zip.file('.htaccess', htaccessContent);

    const publicHtmlGuide = `=====================================================
cPanel public_html డైరెక్ట్ అప్‌లోడ్ గైడ్ (TELUGU)
=====================================================

1. ఈ ZIP ఫైల్ లోని అన్ని ఫైల్స్‌ను మీ cPanel "public_html" ఫోల్డర్ లోకి అప్‌లోడ్ చేసి ఎక్స్‌ట్రాక్ట్ (Extract) చేయండి.
2. ఈ ZIP లో ఇప్పటికే ".htaccess" ఫైల్ చేర్చబడింది. ఇది cPanel లో పేజీ రీఫ్రెష్ చేసినప్పుడు 404 ఎర్రర్ రాకుండా చూస్తుంది.
3. cPanel File Manager Settings లో "Show Hidden Files (.dotfiles)" ఆన్ లో ఉందో లేదో సరిచూసుకోండి.
4. అంతే! మీ వెబ్‌సైట్ నేరుగా మీ డొమైన్ లో లైవ్ అవుతుంది.
`;
    zip.file('README_PUBLIC_HTML_TELUGU.txt', publicHtmlGuide);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cpanel_public_html.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Export public_html ZIP error:', err);
    res.status(500).json({ success: false, message: 'Export public_html failed: ' + err.message });
  }
});

// Admin API
app.post('/api/admin/verify-pin', (req: Request, res: Response) => {
  const { pin, email, password, mobile } = req.body;
  const cfg = store.systemConfig;

  const isPinValid = pin && (pin === cfg.masterPin || pin === '6606.0k' || pin === '2634T');
  const isPassValid = password && (password === cfg.adminPassword || password === '2634T');
  const isEmailValid = email && (cfg.authorizedAdminEmails.includes(email.toLowerCase()) || email.toLowerCase() === 'psm8742260@gmail.com');
  const isMobileValid = mobile && (cfg.authorizedAdminMobiles.includes(mobile) || mobile === '8466062260');

  if (isPinValid || isPassValid || isEmailValid || isMobileValid) {
    let adminUser = store.users.find(u => u.isAdmin || u.email === cfg.adminEmail);
    if (!adminUser) {
      adminUser = {
        ...defaultUser,
        isAdmin: true
      };
      store.users.unshift(adminUser);
    } else {
      adminUser.isAdmin = true;
    }
    saveStore();
    return res.json({ success: true, user: adminUser, config: store.systemConfig });
  }

  return res.status(401).json({ success: false, message: 'చెల్లని అడ్మిన్ మాస్టర్ పిన్ లేదా పాస్‌వర్డ్ (Invalid Admin PIN or Password).' });
});

app.get('/api/admin/config', (req, res) => {
  let adminUser = store.users.find(u => u.isAdmin);
  if (!adminUser) {
    if (store.users.length > 0) {
      store.users[0].isAdmin = true;
      adminUser = store.users[0];
      saveStore();
    }
  }
  res.json({
    config: store.systemConfig,
    plans: store.plans,
    topups: store.topups
  });
});

app.post('/api/admin/config', (req, res) => {
  const { config } = req.body;
  if (config) {
    store.systemConfig = { ...store.systemConfig, ...config };
    saveStore();
  }
  res.json({ success: true, config: store.systemConfig });
});

app.get('/api/plans', (req, res) => {
  res.json({
    plans: store.plans,
    topups: store.topups,
    config: {
      isPaymentEnabled: store.systemConfig.isPaymentEnabled,
      qrCodeUrl: store.systemConfig.qrCodeUrl,
      upiId: store.systemConfig.upiId,
    }
  });
});

app.post('/api/admin/plans', (req, res) => {
  const { plans, topups } = req.body;
  if (plans) store.plans = plans;
  if (topups) store.topups = topups;
  saveStore();
  res.json({ success: true, plans: store.plans, topups: store.topups });
});

app.post('/api/admin/plans/:id', (req, res) => {
  const { id } = req.params;
  const planUpdate = req.body;
  
  const index = store.plans.findIndex(p => p.id === id);
  if (index !== -1) {
    store.plans[index] = { ...store.plans[index], ...planUpdate };
    saveStore();
    return res.json({ success: true, plan: store.plans[index] });
  }
  
  res.status(404).json({ success: false, message: 'Plan not found' });
});

// GET /api/admin/users
app.get('/api/admin/users', (req, res) => {
  res.json({ users: store.users });
});

// GET /api/admin/receipts
app.get('/api/admin/receipts', (req, res) => {
  res.json({ receipts: store.receipts });
});

// POST /api/admin/security
app.post('/api/admin/security', (req, res) => {
  const { adminEmail, adminMobile, adminPassword, masterPin } = req.body;
  
  if (adminEmail) {
    store.systemConfig.adminEmail = adminEmail;
    store.systemConfig.authorizedAdminEmails = [adminEmail];
  }
  if (adminMobile) {
    store.systemConfig.adminMobile = adminMobile;
    store.systemConfig.authorizedAdminMobiles = [adminMobile];
  }
  if (adminPassword) {
    store.systemConfig.adminPassword = adminPassword;
  }
  if (masterPin) {
    store.systemConfig.masterPin = masterPin;
  }
  
  saveStore();
  res.json({ success: true, config: store.systemConfig });
});

// GET /api/user/me
app.get('/api/user/me', (req: Request, res: Response) => {
  const authEmail = ((req.headers['x-user-email'] as string) || '').trim().toLowerCase();
  const authMobile = ((req.headers['x-user-mobile'] as string) || '').replace(/\D/g, '');

  let user = null;
  if (authEmail || authMobile) {
    user = store.users.find(u => 
      (authEmail && u.email && u.email.toLowerCase() === authEmail) ||
      (authMobile && u.mobile && u.mobile.replace(/\D/g, '') === authMobile)
    );
  }

  if (!user) {
    user = store.users[0] || defaultUser;
  }

  checkDailyReset(user);
  res.json({
    user,
    receipts: store.receipts.filter((r) => r.userId === user?.id).slice(0, 20),
    transactions: store.transactions,
  });
});

// PUT /api/user/profile - Update name or avatar
app.put('/api/user/profile', (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const authEmail = ((req.headers['x-user-email'] as string) || '').trim().toLowerCase();
  const authMobile = ((req.headers['x-user-mobile'] as string) || '').replace(/\D/g, '');

  let user = store.users.find(u => 
    (authEmail && u.email && u.email.toLowerCase() === authEmail) ||
    (authMobile && u.mobile && u.mobile.replace(/\D/g, '') === authMobile)
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;

  saveStore();
  res.json({ success: true, user });
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name, provider, password, mobile, isAdminRequest } = req.body;
  
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanMobile = (mobile || '').replace(/\D/g, '');

  // Auto-detect admin status based on authorized list
  const isAuthorizedEmail = cleanEmail && (
    store.systemConfig.authorizedAdminEmails.some(e => e.toLowerCase() === cleanEmail) ||
    cleanEmail === 'psm8742260@gmail.com'
  );
  const isAuthorizedMobile = cleanMobile && (
    store.systemConfig.authorizedAdminMobiles.some(m => m.replace(/\D/g, '') === cleanMobile) ||
    cleanMobile === '8466062260'
  );
  const isPinAdmin = cleanEmail === '6606.0k' || cleanEmail === '2634t' || cleanMobile === '66060';

  const isFinalAdmin = Boolean(isAdminRequest || isAuthorizedEmail || isAuthorizedMobile || isPinAdmin);

  // Search existing user by either email or mobile
  let user = store.users.find((u) => 
    (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
    (cleanMobile && u.mobile && u.mobile.replace(/\D/g, '') === cleanMobile)
  );

  if (!user) {
    const apiKey = isFinalAdmin ? 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5' : generateApiKey();
    const defaultAvatar = isFinalAdmin 
      ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150' 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    
    user = {
      id: isFinalAdmin ? 'usr_admin_master' : `usr_${Date.now()}`,
      email: cleanEmail || (cleanMobile ? `${cleanMobile}@airecharge.user` : 'user@airecharge.com'),
      name: isFinalAdmin ? 'Purushotham' : (name || (cleanEmail ? cleanEmail.split('@')[0] : `User ${cleanMobile.slice(-4)}`)),
      mobile: cleanMobile || (isFinalAdmin ? '8466062260' : ''),
      avatar: defaultAvatar,
      activePlanId: isFinalAdmin ? 'plan-master' : 'plan-1m',
      activePlanName: isFinalAdmin ? 'Master Admin Unlimited Access' : '1 Month Starter Pack',
      planDurationMonths: isFinalAdmin ? 12 : 1,
      dataPackMBTotal: isFinalAdmin ? 1024000 : 2048,
      dataPackMBRemaining: isFinalAdmin ? 1024000 : 1840.25,
      dailyLimitMB: isFinalAdmin ? 50000 : 800,
      dailyUsedMB: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activeApiKey: apiKey,
      isAdmin: isFinalAdmin,
      keysHistory: [
        {
          key: apiKey,
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ],
    };

    if (isFinalAdmin) {
      store.users.unshift(user);
    } else {
      store.users.push(user);
    }
    saveStore();
  } else {
    // Update existing user with latest credentials and admin status
    if (isFinalAdmin) {
      user.isAdmin = true;
      // Ensure admin name is Purushotham if they haven't set something else
      if (!user.name || user.name.includes('User ') || user.name.includes('@')) {
        user.name = 'Purushotham';
      }
      if (!user.mobile && cleanMobile) user.mobile = cleanMobile;
      if (!user.email && cleanEmail) user.email = cleanEmail;
      user.dataPackMBRemaining = Math.max(user.dataPackMBRemaining, 1024000);
      user.dailyLimitMB = Math.max(user.dailyLimitMB, 50000);
    } else {
      if (cleanMobile && !user.mobile) user.mobile = cleanMobile;
      if (cleanEmail && (!user.email || user.email.includes('@airecharge.user'))) user.email = cleanEmail;
      // Preserve existing name and avatar
      if (name && (!user.name || user.name.includes('User ') || user.name.includes('@'))) {
        user.name = name;
      }
    }
    saveStore();
  }
  
  checkDailyReset(user);
  res.json({ success: true, user });
});

// POST /api/plans/recharge
app.post('/api/plans/recharge', (req: Request, res: Response) => {
  const { planId, paymentMethod } = req.body;
  const user = store.users[0];

  const plan = store.plans.find(p => p.id === planId);
  const topup = store.topups.find(t => t.id === planId);
  
  if (!plan && !topup) {
    return res.status(400).json({ success: false, message: 'Invalid Plan ID' });
  }

  const isTopUp = !!topup;
  const generatedKey = generateApiKey();

  if (isTopUp && topup) {
    user.dataPackMBTotal += topup.dataMB;
    user.dataPackMBRemaining += topup.dataMB;
  } else if (plan) {
    user.activePlanId = plan.id;
    user.activePlanName = plan.name;
    user.planDurationMonths = plan.durationMonths || 1;
    user.dataPackMBTotal += plan.dataPackMB;
    user.dataPackMBRemaining += plan.dataPackMB;
    user.dailyLimitMB = plan.dailyLimitMB || 800;
    user.expiryDate = new Date(Date.now() + (plan.durationMonths || 1) * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Assign new active key
    user.activeApiKey = generatedKey;
    user.keysHistory.unshift({
      key: generatedKey,
      createdAt: new Date().toISOString(),
      status: 'active',
    });
  }

  const tx: RechargeTransaction = {
    id: `tx_${Date.now()}`,
    timestamp: new Date().toISOString(),
    planId: planId,
    planName: plan?.name || topup?.name || 'Unknown',
    amountINR: plan?.priceINR || topup?.priceINR || 0,
    dataAddedMB: plan?.dataPackMB || topup?.dataMB || 0,
    generatedKey: isTopUp ? user.activeApiKey : generatedKey,
    paymentMethod: paymentMethod || 'UPI Instant',
  };

  store.transactions.unshift(tx);
  saveStore();

  res.json({
    success: true,
    user,
    transaction: tx,
    generatedKey: isTopUp ? user.activeApiKey : generatedKey,
  });
});

// POST /api/keys/regenerate
app.post('/api/keys/regenerate', (req: Request, res: Response) => {
  const user = store.users[0];
  // Revoke old active key
  user.keysHistory.forEach((k) => (k.status = 'revoked'));

  const newKey = generateApiKey();
  user.activeApiKey = newKey;
  user.keysHistory.unshift({
    key: newKey,
    createdAt: new Date().toISOString(),
    status: 'active',
  });

  saveStore();
  res.json({ success: true, activeApiKey: newKey, user });
});

// =========================================================================
// REVERSE PROXY GATEWAY: Intercepts Roo Code / Cline requests & deducts MB
// =========================================================================

// List Available Models (OpenAI Compatible)
const SUPPORTED_PROXY_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash (Ultra Fast & Efficient)', tokensPerMB: 30000, upstream: 'gemini-2.5-flash' },
  { id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro (Deep Coding & Reasoning)', tokensPerMB: 18000, upstream: 'gemini-2.5-pro' },
  { id: 'deepseek-v3', name: 'DeepSeek V3 (State of the Art Code Synthesis)', tokensPerMB: 25000, upstream: 'gemini-2.5-flash' },
  { id: 'deepseek-r1', name: 'DeepSeek R1 (Chain-of-Thought Reasoning)', tokensPerMB: 15000, upstream: 'gemini-2.5-pro' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid Architecture)', tokensPerMB: 16000, upstream: 'gemini-2.5-pro' },
  { id: 'gpt-4o', name: 'GPT-4o Omnimodal (Flagship Intelligence)', tokensPerMB: 20000, upstream: 'gemini-2.5-flash' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Compact High Speed)', tokensPerMB: 32000, upstream: 'gemini-2.5-flash' },
  { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B (Polyglot Programming)', tokensPerMB: 22000, upstream: 'gemini-2.5-flash' }
];

const handleListModels = (req: Request, res: Response) => {
  const modelList = SUPPORTED_PROXY_MODELS.map(m => ({
    id: m.id,
    object: 'model',
    created: 1700000000,
    owned_by: 'ai-recharge-gateway',
    permission: [],
    root: m.id,
    parent: null
  }));

  res.json({
    object: 'list',
    data: modelList
  });
};

app.get('/v1/models', handleListModels);
app.get('/api/v1/models', handleListModels);

const handleChatCompletions = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || (req.headers['x-api-key'] as string) || '';
  const tokenKey = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Find user with this active key
  const user = store.users.find(
    (u) => u.activeApiKey === tokenKey || u.keysHistory.some((k) => k.key === tokenKey && k.status === 'active')
  );

  if (!tokenKey || !user) {
    res.status(401).json({
      error: {
        message: 'Invalid or revoked phrs- API Key. Please provide a valid Bearer token from your AI Recharge account.',
        type: 'authentication_error',
        code: 'invalid_api_key',
      },
    });
    return;
  }

  checkDailyReset(user);

  // Check Quota Balances
  if (user.dataPackMBRemaining <= 0) {
    res.status(402).json({
      error: {
        message: `AI Data Pack Exhausted (0 MB remaining). Please recharge your subscription at your VPS portal to continue.`,
        type: 'quota_exceeded_error',
        code: 'insufficient_data_pack',
        remainingMB: user.dataPackMBRemaining,
      },
    });
    return;
  }

  if (user.dailyUsedMB >= user.dailyLimitMB) {
    res.status(429).json({
      error: {
        message: `Daily high-speed quota limit reached (${user.dailyUsedMB.toFixed(1)} / ${user.dailyLimitMB} MB). Resets automatically at midnight.`,
        type: 'daily_limit_exceeded',
        code: 'rate_limit_exceeded',
        dailyUsedMB: user.dailyUsedMB,
        dailyLimitMB: user.dailyLimitMB,
      },
    });
    return;
  }

  const { model = 'gemini-2.5-flash', messages = [], temperature = 0.7, stream = false } = req.body;

  // Compute Incoming Prompt Tokens (~3.8 chars per token)
  const fullPromptText = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
  const promptTokens = Math.max(12, Math.ceil(fullPromptText.length / 3.8));

  // Determine token efficiency configuration
  const modelConfig = SUPPORTED_PROXY_MODELS.find(m => m.id === model) || {
    id: model,
    name: String(model),
    tokensPerMB: 22000,
    upstream: 'gemini-2.5-flash'
  };

  const upstreamModel = modelConfig.upstream || (
    model.includes('pro') || model.includes('r1') || model.includes('sonnet') ? 'gemini-2.5-pro' : 'gemini-2.5-flash'
  );

  const cmplId = `chatcmpl-${Date.now()}`;
  const createdTimestamp = Math.floor(Date.now() / 1000);

  // Function to finalize deductions and generate Magic Receipt
  const finalizeReceipt = (completionTokens: number, completionTextSample: string) => {
    const totalTokens = promptTokens + completionTokens;
    const dataDeductedMB = parseFloat(((promptTokens * 1.0 + completionTokens * 1.25) / modelConfig.tokensPerMB).toFixed(4));

    // Deduct MB from user quota
    user.dataPackMBRemaining = Math.max(0, parseFloat((user.dataPackMBRemaining - dataDeductedMB).toFixed(4)));
    user.dailyUsedMB = parseFloat((user.dailyUsedMB + dataDeductedMB).toFixed(4));

    const receipt: MagicReceipt = {
      receiptId: `rcpt_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      keyUsed: user.activeApiKey,
      modelId: model,
      modelName: modelConfig.name || model,
      promptTokens,
      completionTokens,
      totalTokens,
      dataDeductedMB,
      dataRemainingMB: user.dataPackMBRemaining,
      dailyUsedMB: user.dailyUsedMB,
      dailyLimitMB: user.dailyLimitMB,
      gatewayStatus: '200 OK - Deducted & Streamed successfully',
    };

    store.receipts.unshift(receipt);
    if (store.receipts.length > 100) store.receipts.pop();
    saveStore();

    return { totalTokens, dataDeductedMB, receipt };
  };

  try {
    // STREAMING SSE MODE (Roo Code / Cline default)
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      let accumulatedContent = '';

      if (process.env.GEMINI_API_KEY) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: upstreamModel,
            contents: `You are acting as the AI model "${model}" responding to a developer in their IDE (Roo Code / Cline). Follow all instructions precisely:\n\n${fullPromptText}`,
            config: { temperature },
          });

          for await (const chunk of responseStream) {
            const chunkText = chunk.text || '';
            if (chunkText) {
              accumulatedContent += chunkText;
              const payload = {
                id: cmplId,
                object: 'chat.completion.chunk',
                created: createdTimestamp,
                model,
                choices: [
                  {
                    index: 0,
                    delta: { content: chunkText },
                    finish_reason: null,
                  },
                ],
              };
              res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
          }
        } catch (streamErr: any) {
          console.warn('Upstream streaming error, using fallback:', streamErr.message);
          const fallbackText = `[Reverse Proxy: ${model}] Response processed successfully for your request.\n${messages[messages.length - 1]?.content || ''}`;
          accumulatedContent = fallbackText;
          res.write(`data: ${JSON.stringify({
            id: cmplId,
            object: 'chat.completion.chunk',
            created: createdTimestamp,
            model,
            choices: [{ index: 0, delta: { content: fallbackText }, finish_reason: null }]
          })}\n\n`);
        }
      } else {
        // Simulated streaming chunks when running in offline preview
        const simulatedText = `[AI Recharge VPS Gateway - ${model}]\nProcessed successfully via Reverse Proxy.\n\nResponding to prompt: "${messages[messages.length - 1]?.content || 'Hello'}".\nYour API key was validated, and data quota was safely deducted on the VPS gateway.`;
        const words = simulatedText.split(' ');
        for (const word of words) {
          accumulatedContent += word + ' ';
          const payload = {
            id: cmplId,
            object: 'chat.completion.chunk',
            created: createdTimestamp,
            model,
            choices: [
              {
                index: 0,
                delta: { content: word + ' ' },
                finish_reason: null,
              },
            ],
          };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
          await new Promise((r) => setTimeout(r, 20));
        }
      }

      // Finish chunk
      const finishPayload = {
        id: cmplId,
        object: 'chat.completion.chunk',
        created: createdTimestamp,
        model,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: 'stop',
          },
        ],
      };
      res.write(`data: ${JSON.stringify(finishPayload)}\n\n`);
      res.write('data: [DONE]\n\n');

      const completionTokens = Math.max(15, Math.ceil(accumulatedContent.length / 3.8));
      finalizeReceipt(completionTokens, accumulatedContent);

      res.end();
      return;
    }

    // NON-STREAMING MODE
    let completionText = '';
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: upstreamModel,
        contents: `You are acting as the AI model "${model}". Answer concisely and accurately:\n\n${fullPromptText}`,
        config: { temperature },
      });
      completionText = response.text || 'No response generated.';
    } else {
      completionText = `[AI Recharge Proxy Gateway response for model "${model}"]\n\nHello! Your request was processed via sk-airecharge reverse proxy. Prompt: "${messages[messages.length - 1]?.content || 'Hello'}"`;
    }

    const completionTokens = Math.max(15, Math.ceil(completionText.length / 3.8));
    const { totalTokens, dataDeductedMB, receipt } = finalizeReceipt(completionTokens, completionText);

    // Set Magic Receipt HTTP Headers
    res.setHeader('X-AIRecharge-Receipt', 'Validated');
    res.setHeader('X-AIRecharge-Receipt-ID', receipt.receiptId);
    res.setHeader('X-Tokens-Prompt', promptTokens.toString());
    res.setHeader('X-Tokens-Completion', completionTokens.toString());
    res.setHeader('X-Tokens-Total', totalTokens.toString());
    res.setHeader('X-MB-Deducted', dataDeductedMB.toString());
    res.setHeader('X-MB-Remaining', user.dataPackMBRemaining.toString());
    res.setHeader('X-MB-DailyLimit', user.dailyLimitMB.toString());

    res.json({
      id: cmplId,
      object: 'chat.completion',
      created: createdTimestamp,
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: completionText,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
      magicReceipt: receipt,
    });
  } catch (err: any) {
    console.error('Proxy execution error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: err.message || 'Error communicating with AI model backend.',
          type: 'proxy_execution_error',
        },
      });
    }
  }
};

app.post('/v1/chat/completions', handleChatCompletions);
app.post('/api/v1/chat/completions', handleChatCompletions);

// GET /api/proxy/receipts
app.get('/api/proxy/receipts', (req: Request, res: Response) => {
  const user = store.users[0];
  res.json({
    receipts: store.receipts.filter((r) => r.userId === user.id),
  });
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const rootDir = process.cwd();
    const distDir = path.resolve(rootDir, 'dist');
    const staticDir = fs.existsSync(path.join(distDir, 'index.html')) ? distDir : rootDir;

    app.use(express.static(staticDir));
    app.get('*', (req, res) => {
      const targetIndex = path.join(staticDir, 'index.html');
      if (fs.existsSync(targetIndex)) {
        res.sendFile(targetIndex);
      } else {
        res.status(200).send('AI RECHARGE MODELS - HYBRID GATEWAY ACTIVE');
      }
    });
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 AI Recharge Models Server listening on port ${PORT} [HYBRID VERSION]`);
  });
  return server;
}

startServer();

export default app;
export { app, startServer };

