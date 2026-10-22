import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

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

import { SUBSCRIPTION_PLANS, TOP_UP_PACKS } from './src/data/plansData';

const DB_FILE = path.resolve(process.cwd(), 'server_store.json');

const defaultUser: UserAccount = {
  id: 'usr_demo_8829',
  email: 'psm8742260@gmail.com',
  name: 'Priya Sharma',
  mobile: '8466062260',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
    gatewayName: 'AI Recharge Hybrid Gateway v2.1',
    tokenDeductionMultiplier: 1.15,
    defaultDailyLimitMB: 800,
    isMaintenanceMode: false,
    hybridVersion: '2.1.0-stable',
    adminEmail: 'psm8742260@gmail.com',
    adminPassword: '2634T',
    adminMobile: '8466062260',
    masterPin: '6606',
    authorizedAdminEmails: ['psm8742260@gmail.com'],
    authorizedAdminMobiles: ['8466062260'],
    isPaymentEnabled: true
  }
};

// Load store from file if exists
function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure new fields exist
      store = { ...store, ...parsed };
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

// ==========================================
// API ENDPOINTS
// ==========================================

// Admin API
app.get('/api/admin/config', (req, res) => {
  const user = store.users[0];
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access denied.' });
  }
  res.json({
    config: store.systemConfig,
    plans: store.plans,
    topups: store.topups
  });
});

app.post('/api/admin/config', (req, res) => {
  const user = store.users[0];
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access denied.' });
  }
  const { config } = req.body;
  store.systemConfig = { ...store.systemConfig, ...config };
  saveStore();
  res.json({ success: true, config: store.systemConfig });
});

app.post('/api/admin/plans', (req, res) => {
  const user = store.users[0];
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access denied.' });
  }
  const { plans, topups } = req.body;
  if (plans) store.plans = plans;
  if (topups) store.topups = topups;
  saveStore();
  res.json({ success: true, plans: store.plans, topups: store.topups });
});

app.post('/api/admin/plans/:id', (req, res) => {
  const user = store.users[0];
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access denied.' });
  }
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
  const user = store.users.find(u => u.isAdmin);
  if (!user) return res.status(403).json({ success: false, message: 'Admin access denied.' });
  res.json({ users: store.users });
});

// GET /api/admin/receipts
app.get('/api/admin/receipts', (req, res) => {
  const user = store.users.find(u => u.isAdmin);
  if (!user) return res.status(403).json({ success: false, message: 'Admin access denied.' });
  res.json({ receipts: store.receipts });
});

// POST /api/admin/security
app.post('/api/admin/security', (req, res) => {
  const user = store.users.find(u => u.isAdmin);
  if (!user) return res.status(403).json({ success: false, message: 'Admin access denied.' });
  
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
  const user = store.users[0];
  checkDailyReset(user);
  res.json({
    user,
    receipts: store.receipts.filter((r) => r.userId === user.id).slice(0, 20),
    transactions: store.transactions,
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name, provider, password, mobile, isAdminRequest } = req.body;
  
  let isFinalAdmin = false;

  // Manual Admin Login Path
  if (isAdminRequest) {
    const isAuthorizedEmail = store.systemConfig.authorizedAdminEmails.includes(email);
    const isAuthorizedMobile = store.systemConfig.authorizedAdminMobiles.includes(mobile);
    const isCorrectPassword = password === store.systemConfig.adminPassword;

    if (!isAuthorizedEmail || !isAuthorizedMobile || !isCorrectPassword) {
      return res.status(401).json({ success: false, message: 'Invalid Admin Credentials (Email, Mobile, or Password).' });
    }
    isFinalAdmin = true;
  } else {
    // Normal User (Google) Path - Always Non-Admin as requested
    isFinalAdmin = false;
  }

  let user = store.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      email: email || 'user@airecharge.com',
      name: name || 'AI Developer',
      mobile: mobile || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      activePlanId: 'plan-1m',
      activePlanName: '1 Month Starter Pack',
      planDurationMonths: 1,
      dataPackMBTotal: 2048,
      dataPackMBRemaining: 2048,
      dailyLimitMB: 800,
      dailyUsedMB: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      activeApiKey: generateApiKey(),
      isAdmin: isFinalAdmin,
      keysHistory: [],
    };
    user.keysHistory.push({
      key: user.activeApiKey,
      createdAt: new Date().toISOString(),
      status: 'active',
    });
    store.users.push(user);
    saveStore();
  } else {
    // Update existing user's admin status for this session
    user.isAdmin = isFinalAdmin;
    if (mobile) user.mobile = mobile;
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
// REVERSE PROXY GATEWAY: Intercepts sk-airecharge- requests & deducts MB
// =========================================================================
app.post('/api/v1/chat/completions', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const tokenKey = authHeader.replace('Bearer ', '').trim();

  // Find user with this active key
  const user = store.users.find((u) => u.activeApiKey === tokenKey || u.keysHistory.some((k) => k.key === tokenKey && k.status === 'active'));

  if (!tokenKey || !user) {
    res.status(401).json({
      error: {
        message: 'Invalid or revoked phrs- API Key. Please provide a valid Bearer token.',
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
        message: `AI Data Pack Exhausted (0 MB remaining). Please recharge your subscription to continue using sk-airecharge keys.`,
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
        message: `Daily high-speed quota limit reached (${user.dailyUsedMB.toFixed(1)} / ${user.dailyLimitMB} MB). Resets at midnight.`,
        type: 'daily_limit_exceeded',
        code: 'rate_limit_exceeded',
        dailyUsedMB: user.dailyUsedMB,
        dailyLimitMB: user.dailyLimitMB,
      },
    });
    return;
  }

  const { model = 'deepseek-v3', messages = [], temperature = 0.7 } = req.body;

  // Compute Incoming Prompt Tokens (~4 chars per token)
  const fullPromptText = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
  const promptTokens = Math.max(12, Math.ceil(fullPromptText.length / 3.8));

  let completionText = '';
  let completionTokens = 0;

  try {
    // Forward request to Master AI Engine using @google/genai SDK
    if (process.env.GEMINI_API_KEY) {
      const geminiModel = model.includes('reasoning') || model.includes('r1') || model.includes('o1') ? 'gemini-4-argon' : 'gemini-3.8-flash';

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: `You are acting as the AI model "${model}". Answer the following request concisely and accurately as requested by the developer using the sk-airecharge proxy gateway:\n\n${fullPromptText}`,
        config: {
          temperature,
        },
      });

      completionText = response.text || 'No response generated.';
    } else {
      // Fallback response for offline / preview sandbox
      completionText = `[AI Recharge Proxy Gateway response for model "${model}"]\n\nHello! Your request was processed via sk-airecharge reverse proxy. Here is the output generated for your prompt:\n"${messages[messages.length - 1]?.content || 'Hello'}"`;
    }

    completionTokens = Math.max(15, Math.ceil(completionText.length / 3.8));
    const totalTokens = promptTokens + completionTokens;

    // Tokens to MB deduction formula
    // Models have varying efficiency ratios (e.g. 20,000 tokens per MB)
    const tokensPerMB = model.includes('flash') || model.includes('mini') ? 30000 : model.includes('r1') || model.includes('o1') ? 15000 : 22000;

    const dataDeductedMB = parseFloat(((promptTokens * 1.0 + completionTokens * 1.3) / tokensPerMB).toFixed(4));

    // Deduct MB from user quota
    user.dataPackMBRemaining = Math.max(0, parseFloat((user.dataPackMBRemaining - dataDeductedMB).toFixed(4)));
    user.dailyUsedMB = parseFloat((user.dailyUsedMB + dataDeductedMB).toFixed(4));

    // Create Magic Receipt
    const receipt: MagicReceipt = {
      receiptId: `rcpt_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      keyUsed: user.activeApiKey,
      modelId: model,
      modelName: model,
      promptTokens,
      completionTokens,
      totalTokens,
      dataDeductedMB,
      dataRemainingMB: user.dataPackMBRemaining,
      dailyUsedMB: user.dailyUsedMB,
      dailyLimitMB: user.dailyLimitMB,
      gatewayStatus: '200 OK - Deducted successfully',
    };

    store.receipts.unshift(receipt);
    if (store.receipts.length > 100) store.receipts.pop();
    saveStore();

    // Set Magic Receipt HTTP Headers
    res.setHeader('X-AIRecharge-Receipt', 'Validated');
    res.setHeader('X-AIRecharge-Receipt-ID', receipt.receiptId);
    res.setHeader('X-Tokens-Prompt', promptTokens.toString());
    res.setHeader('X-Tokens-Completion', completionTokens.toString());
    res.setHeader('X-Tokens-Total', totalTokens.toString());
    res.setHeader('X-MB-Deducted', dataDeductedMB.toString());
    res.setHeader('X-MB-Remaining', user.dataPackMBRemaining.toString());
    res.setHeader('X-MB-DailyLimit', user.dailyLimitMB.toString());

    // OpenAI OpenAI-compatible Response with magicReceipt metadata
    res.json({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
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
    res.status(500).json({
      error: {
        message: err.message || 'Error communicating with AI model backend.',
        type: 'proxy_execution_error',
      },
    });
  }
});

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
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Recharge Models Server listening on http://localhost:${PORT}`);
  });
}

startServer();
