// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import JSZip from "jszip";

// src/data/plansData.ts
var SUBSCRIPTION_PLANS = [
  {
    id: "plan-1m",
    name: "1 Month Starter Pack",
    durationMonths: 1,
    durationDays: 30,
    priceINR: 399,
    priceUSD: 4.99,
    dataPackMB: 2048,
    // 2 GB
    dataPackGB: 2,
    dailyLimitMB: 800,
    badge: "Starter",
    features: [
      "2 GB Total High-Speed AI Data Pack",
      "800 MB Daily High-Speed Usage Limit",
      "Access to ALL 26 AI Models",
      "Instant Gateway Auto-Activation",
      "Reverse Proxy Gateway Access",
      "Live Token-to-MB Magic Receipts"
    ]
  },
  {
    id: "plan-2m",
    name: "2 Months Pro Pack",
    durationMonths: 2,
    durationDays: 60,
    priceINR: 699,
    priceUSD: 8.49,
    dataPackMB: 5120,
    // 5 GB
    dataPackGB: 5,
    dailyLimitMB: 1200,
    popular: true,
    badge: "Most Popular",
    features: [
      "5 GB Total High-Speed AI Data Pack",
      "1.2 GB Daily High-Speed Usage Limit",
      "Access to ALL 26 AI Models",
      "Instant Gateway Auto-Activation",
      "Priority Gateway Bandwidth",
      "Live Token-to-MB Magic Receipts",
      "24/7 Priority Gateway Proxy Routing"
    ]
  },
  {
    id: "plan-3m",
    name: "3 Months Ultra Pack",
    durationMonths: 3,
    durationDays: 90,
    priceINR: 999,
    priceUSD: 11.99,
    dataPackMB: 10240,
    // 10 GB
    dataPackGB: 10,
    dailyLimitMB: 2048,
    badge: "Best Value",
    features: [
      "10 GB Total High-Speed AI Data Pack",
      "2 GB Daily High-Speed Usage Limit",
      "Access to ALL 26 AI Models (Including o1, Opus & Brahmastra)",
      "Instant Gateway Auto-Activation",
      "Unlimited Key Regeneration",
      "Live Token-to-MB Magic Receipts",
      "Dedicated Gateway Channel"
    ]
  }
];
var TOP_UP_PACKS = [
  {
    id: "topup-500mb",
    name: "Micro Recharge Top-Up",
    priceINR: 99,
    dataMB: 500,
    description: "Instantly add 500 MB data pack to your active subscription without changing validity."
  },
  {
    id: "topup-1gb",
    name: "Standard Boost Pack",
    priceINR: 179,
    dataMB: 1024,
    description: "Instantly add 1 GB (1,024 MB) data pack for high-volume developer coding sessions."
  },
  {
    id: "topup-2gb",
    name: "Power Booster Pack",
    priceINR: 299,
    dataMB: 2048,
    description: "Instantly add 2 GB (2,048 MB) turbo data pack for extended model execution."
  },
  {
    id: "topup-5gb",
    name: "Ultra Data Vault",
    priceINR: 599,
    dataMB: 5120,
    description: "Instantly add 5 GB (5,120 MB) massive data reservoir for production workloads."
  },
  {
    id: "topup-10gb",
    name: "Mega Cloud Pack",
    priceINR: 999,
    dataMB: 10240,
    description: "Instantly add 10 GB (10,240 MB) enterprise-grade AI tokens data allocation."
  }
];

// server.ts
dotenv.config();
var app = express();
var PORT = parseInt(process.env.PORT || "8080", 10);
process.env.NODE_ENV = "production";
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var DB_FILE = path.resolve(process.cwd(), "server_store.json");
var defaultUser = {
  id: "usr_demo_8829",
  email: "psm8742260@gmail.com",
  name: "Priya Sharma",
  mobile: "8466062260",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  activePlanId: "plan-1m",
  activePlanName: "1 Month Starter Pack",
  planDurationMonths: 1,
  dataPackMBTotal: 2048,
  // 2 GB
  dataPackMBRemaining: 1840.25,
  // ~1.84 GB left
  dailyLimitMB: 800,
  dailyUsedMB: 124.75,
  lastResetDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
  activeApiKey: "phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5",
  isAdmin: true,
  keysHistory: [
    {
      key: "phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "active"
    }
  ]
};
var store = {
  users: [defaultUser],
  receipts: [],
  transactions: [],
  plans: SUBSCRIPTION_PLANS,
  topups: TOP_UP_PACKS,
  systemConfig: {
    gatewayName: "AI Recharge HYBRID GATEWAY",
    tokenDeductionMultiplier: 1.15,
    defaultDailyLimitMB: 800,
    isMaintenanceMode: false,
    hybridEngineStatus: "ACTIVE",
    adminEmail: "psm8742260@gmail.com",
    adminPassword: "2634T",
    adminMobile: "8466062260",
    masterPin: "6606.0k",
    authorizedAdminEmails: ["psm8742260@gmail.com"],
    authorizedAdminMobiles: ["8466062260"],
    isPaymentEnabled: true,
    upiId: "psm8742260@upi",
    qrCodeUrl: ""
  }
};
function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      store = {
        ...store,
        ...parsed,
        systemConfig: { ...store.systemConfig, ...parsed.systemConfig || {} }
      };
      if (!store.topups || store.topups.length < 5) {
        const existingIds = new Set((store.topups || []).map((t) => t.id));
        const missing = TOP_UP_PACKS.filter((t) => !existingIds.has(t.id));
        store.topups = [...store.topups || [], ...missing];
        saveStore();
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.error("Error loading server store:", err);
  }
}
function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving server store:", err);
  }
}
loadStore();
function checkDailyReset(user) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (user.lastResetDate !== today) {
    user.dailyUsedMB = 0;
    user.lastResetDate = today;
    saveStore();
  }
}
function generateApiKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let rand = "";
  for (let i = 0; i < 32; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `phrs-${rand}`;
}
app.get("/api/admin/bundle-info", (req, res) => {
  try {
    const rootDir = process.cwd();
    const rootBundle = path.join(rootDir, "cpanel-bundle.zip");
    const publicBundle = path.join(rootDir, "public", "cpanel-bundle.zip");
    const target = fs.existsSync(rootBundle) ? rootBundle : fs.existsSync(publicBundle) ? publicBundle : null;
    if (target && fs.existsSync(target)) {
      const stats = fs.statSync(target);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
      return res.json({
        exists: true,
        bytes: stats.size,
        sizeMb: `${sizeMb} MB`,
        filename: "cpanel-bundle.zip"
      });
    }
    return res.json({ exists: false, sizeMb: "36.5 MB" });
  } catch (e) {
    return res.json({ exists: false, sizeMb: "36.5 MB" });
  }
});
app.get(["/cpanel-bundle.zip", "/airecharge-cpanel-bundle.zip", "/api/export-zip", "/api/download-bundle", "/api/download-cpanel-bundle"], async (req, res) => {
  try {
    const rootDir = process.cwd();
    const rootBundle = path.join(rootDir, "cpanel-bundle.zip");
    const distBundle = path.join(rootDir, "dist", "cpanel-bundle.zip");
    const publicBundle = path.join(rootDir, "public", "cpanel-bundle.zip");
    const targetBundle = fs.existsSync(rootBundle) ? rootBundle : fs.existsSync(distBundle) ? distBundle : fs.existsSync(publicBundle) ? publicBundle : null;
    if (targetBundle) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="airecharge-cpanel-bundle.zip"');
      return res.sendFile(targetBundle);
    }
    const zip = new JSZip();
    const addDirectoryToZip = (dirPath, zipFolder) => {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === "node_modules" || item === ".git" || item.endsWith(".zip") || item === "aistudio") continue;
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
    const distDir = path.join(rootDir, "dist");
    if (fs.existsSync(distDir)) {
      const distFolder = zip.folder("dist");
      if (distFolder) addDirectoryToZip(distDir, distFolder);
    }
    const srcDir = path.join(rootDir, "src");
    if (fs.existsSync(srcDir)) {
      const srcFolder = zip.folder("src");
      if (srcFolder) addDirectoryToZip(srcDir, srcFolder);
    }
    const rootFiles = [
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "server.ts",
      "server.js",
      "index.html",
      "server_store.json",
      ".env.example",
      "deploy-vps.sh",
      "cPanel_Setup_Guide.txt",
      "README_CPANEL_TELUGU.txt"
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
    zip.file(".htaccess", htaccessContent);
    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="airecharge-cpanel-bundle.zip"');
    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (err) {
    console.error("Export ZIP error:", err);
    res.status(500).json({ success: false, message: "Export failed: " + err.message });
  }
});
app.get(["/api/export-public-html", "/cpanel_public_html.zip"], async (req, res) => {
  try {
    const rootDir = process.cwd();
    const rootPub = path.join(rootDir, "cpanel_public_html.zip");
    const distPub = path.join(rootDir, "dist", "cpanel_public_html.zip");
    const publicPub = path.join(rootDir, "public", "cpanel_public_html.zip");
    const targetPub = fs.existsSync(rootPub) ? rootPub : fs.existsSync(distPub) ? distPub : fs.existsSync(publicPub) ? publicPub : null;
    if (targetPub) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="cpanel_public_html.zip"');
      return res.sendFile(targetPub);
    }
    const zip = new JSZip();
    const addFolderToZip = (dirPath, zipFolder) => {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item === "node_modules" || item.endsWith(".zip") || item === "aistudio") continue;
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
    const distDir = path.join(rootDir, "dist");
    if (fs.existsSync(distDir)) {
      addFolderToZip(distDir, zip);
    } else {
      const publicDir = path.join(rootDir, "public");
      if (fs.existsSync(publicDir)) {
        addFolderToZip(publicDir, zip);
      }
      const indexPath = path.join(rootDir, "index.html");
      if (fs.existsSync(indexPath)) {
        zip.file("index.html", fs.readFileSync(indexPath));
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
    zip.file(".htaccess", htaccessContent);
    const publicHtmlGuide = `=====================================================
cPanel public_html \u0C21\u0C48\u0C30\u0C46\u0C15\u0C4D\u0C1F\u0C4D \u0C05\u0C2A\u0C4D\u200C\u0C32\u0C4B\u0C21\u0C4D \u0C17\u0C48\u0C21\u0C4D (TELUGU)
=====================================================

1. \u0C08 ZIP \u0C2B\u0C48\u0C32\u0C4D \u0C32\u0C4B\u0C28\u0C3F \u0C05\u0C28\u0C4D\u0C28\u0C3F \u0C2B\u0C48\u0C32\u0C4D\u0C38\u0C4D\u200C\u0C28\u0C41 \u0C2E\u0C40 cPanel "public_html" \u0C2B\u0C4B\u0C32\u0C4D\u0C21\u0C30\u0C4D \u0C32\u0C4B\u0C15\u0C3F \u0C05\u0C2A\u0C4D\u200C\u0C32\u0C4B\u0C21\u0C4D \u0C1A\u0C47\u0C38\u0C3F \u0C0E\u0C15\u0C4D\u0C38\u0C4D\u200C\u0C1F\u0C4D\u0C30\u0C3E\u0C15\u0C4D\u0C1F\u0C4D (Extract) \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F.
2. \u0C08 ZIP \u0C32\u0C4B \u0C07\u0C2A\u0C4D\u0C2A\u0C1F\u0C3F\u0C15\u0C47 ".htaccess" \u0C2B\u0C48\u0C32\u0C4D \u0C1A\u0C47\u0C30\u0C4D\u0C1A\u0C2C\u0C21\u0C3F\u0C02\u0C26\u0C3F. \u0C07\u0C26\u0C3F cPanel \u0C32\u0C4B \u0C2A\u0C47\u0C1C\u0C40 \u0C30\u0C40\u0C2B\u0C4D\u0C30\u0C46\u0C37\u0C4D \u0C1A\u0C47\u0C38\u0C3F\u0C28\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 404 \u0C0E\u0C30\u0C4D\u0C30\u0C30\u0C4D \u0C30\u0C3E\u0C15\u0C41\u0C02\u0C21\u0C3E \u0C1A\u0C42\u0C38\u0C4D\u0C24\u0C41\u0C02\u0C26\u0C3F.
3. cPanel File Manager Settings \u0C32\u0C4B "Show Hidden Files (.dotfiles)" \u0C06\u0C28\u0C4D \u0C32\u0C4B \u0C09\u0C02\u0C26\u0C4B \u0C32\u0C47\u0C26\u0C4B \u0C38\u0C30\u0C3F\u0C1A\u0C42\u0C38\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F.
4. \u0C05\u0C02\u0C24\u0C47! \u0C2E\u0C40 \u0C35\u0C46\u0C2C\u0C4D\u200C\u0C38\u0C48\u0C1F\u0C4D \u0C28\u0C47\u0C30\u0C41\u0C17\u0C3E \u0C2E\u0C40 \u0C21\u0C4A\u0C2E\u0C48\u0C28\u0C4D \u0C32\u0C4B \u0C32\u0C48\u0C35\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C41\u0C02\u0C26\u0C3F.
`;
    zip.file("README_PUBLIC_HTML_TELUGU.txt", publicHtmlGuide);
    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="cpanel_public_html.zip"');
    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (err) {
    console.error("Export public_html ZIP error:", err);
    res.status(500).json({ success: false, message: "Export public_html failed: " + err.message });
  }
});
app.post("/api/admin/verify-pin", (req, res) => {
  const { pin, email, password, mobile } = req.body;
  const cfg = store.systemConfig;
  const isPinValid = pin && (pin === cfg.masterPin || pin === "6606.0k" || pin === "2634T");
  const isPassValid = password && (password === cfg.adminPassword || password === "2634T");
  const isEmailValid = email && (cfg.authorizedAdminEmails.includes(email.toLowerCase()) || email.toLowerCase() === "psm8742260@gmail.com");
  const isMobileValid = mobile && (cfg.authorizedAdminMobiles.includes(mobile) || mobile === "8466062260");
  if (isPinValid || isPassValid || isEmailValid || isMobileValid) {
    let adminUser = store.users.find((u) => u.isAdmin || u.email === cfg.adminEmail);
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
  return res.status(401).json({ success: false, message: "\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C28\u0C3F \u0C05\u0C21\u0C4D\u0C2E\u0C3F\u0C28\u0C4D \u0C2E\u0C3E\u0C38\u0C4D\u0C1F\u0C30\u0C4D \u0C2A\u0C3F\u0C28\u0C4D \u0C32\u0C47\u0C26\u0C3E \u0C2A\u0C3E\u0C38\u0C4D\u200C\u0C35\u0C30\u0C4D\u0C21\u0C4D (Invalid Admin PIN or Password)." });
});
app.get("/api/admin/config", (req, res) => {
  let adminUser = store.users.find((u) => u.isAdmin);
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
app.post("/api/admin/config", (req, res) => {
  const { config } = req.body;
  if (config) {
    store.systemConfig = { ...store.systemConfig, ...config };
    saveStore();
  }
  res.json({ success: true, config: store.systemConfig });
});
app.get("/api/plans", (req, res) => {
  res.json({
    plans: store.plans,
    topups: store.topups
  });
});
app.post("/api/admin/plans", (req, res) => {
  const { plans, topups } = req.body;
  if (plans) store.plans = plans;
  if (topups) store.topups = topups;
  saveStore();
  res.json({ success: true, plans: store.plans, topups: store.topups });
});
app.post("/api/admin/plans/:id", (req, res) => {
  const { id } = req.params;
  const planUpdate = req.body;
  const index = store.plans.findIndex((p) => p.id === id);
  if (index !== -1) {
    store.plans[index] = { ...store.plans[index], ...planUpdate };
    saveStore();
    return res.json({ success: true, plan: store.plans[index] });
  }
  res.status(404).json({ success: false, message: "Plan not found" });
});
app.get("/api/admin/users", (req, res) => {
  res.json({ users: store.users });
});
app.get("/api/admin/receipts", (req, res) => {
  res.json({ receipts: store.receipts });
});
app.post("/api/admin/security", (req, res) => {
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
app.get("/api/user/me", (req, res) => {
  const user = store.users[0];
  checkDailyReset(user);
  res.json({
    user,
    receipts: store.receipts.filter((r) => r.userId === user.id).slice(0, 20),
    transactions: store.transactions
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email, name, provider, password, mobile, isAdminRequest } = req.body;
  const isAuthorizedEmail = email && store.systemConfig.authorizedAdminEmails.includes(email);
  const isAuthorizedMobile = mobile && store.systemConfig.authorizedAdminMobiles.includes(mobile);
  const isFinalAdmin = isAuthorizedEmail || isAuthorizedMobile;
  let user = store.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      email: email || "user@airecharge.com",
      name: name || "AI Developer",
      mobile: mobile || "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      activePlanId: "plan-1m",
      activePlanName: "1 Month Starter Pack",
      planDurationMonths: 1,
      dataPackMBTotal: 0,
      dataPackMBRemaining: 0,
      dailyLimitMB: 800,
      dailyUsedMB: 0,
      lastResetDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
      activeApiKey: generateApiKey(),
      isAdmin: isFinalAdmin,
      keysHistory: []
    };
    user.keysHistory.push({
      key: user.activeApiKey,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "active"
    });
    store.users.push(user);
    saveStore();
  } else {
    user.isAdmin = isFinalAdmin;
    if (mobile) user.mobile = mobile;
    saveStore();
  }
  checkDailyReset(user);
  res.json({ success: true, user });
});
app.post("/api/plans/recharge", (req, res) => {
  const { planId, paymentMethod } = req.body;
  const user = store.users[0];
  const plan = store.plans.find((p) => p.id === planId);
  const topup = store.topups.find((t) => t.id === planId);
  if (!plan && !topup) {
    return res.status(400).json({ success: false, message: "Invalid Plan ID" });
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
    user.expiryDate = new Date(Date.now() + (plan.durationMonths || 1) * 30 * 24 * 60 * 60 * 1e3).toISOString();
    user.activeApiKey = generatedKey;
    user.keysHistory.unshift({
      key: generatedKey,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "active"
    });
  }
  const tx = {
    id: `tx_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    planId,
    planName: plan?.name || topup?.name || "Unknown",
    amountINR: plan?.priceINR || topup?.priceINR || 0,
    dataAddedMB: plan?.dataPackMB || topup?.dataMB || 0,
    generatedKey: isTopUp ? user.activeApiKey : generatedKey,
    paymentMethod: paymentMethod || "UPI Instant"
  };
  store.transactions.unshift(tx);
  saveStore();
  res.json({
    success: true,
    user,
    transaction: tx,
    generatedKey: isTopUp ? user.activeApiKey : generatedKey
  });
});
app.post("/api/keys/regenerate", (req, res) => {
  const user = store.users[0];
  user.keysHistory.forEach((k) => k.status = "revoked");
  const newKey = generateApiKey();
  user.activeApiKey = newKey;
  user.keysHistory.unshift({
    key: newKey,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "active"
  });
  saveStore();
  res.json({ success: true, activeApiKey: newKey, user });
});
app.post("/api/v1/chat/completions", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const tokenKey = authHeader.replace("Bearer ", "").trim();
  const user = store.users.find((u) => u.activeApiKey === tokenKey || u.keysHistory.some((k) => k.key === tokenKey && k.status === "active"));
  if (!tokenKey || !user) {
    res.status(401).json({
      error: {
        message: "Invalid or revoked phrs- API Key. Please provide a valid Bearer token.",
        type: "authentication_error",
        code: "invalid_api_key"
      }
    });
    return;
  }
  checkDailyReset(user);
  if (user.dataPackMBRemaining <= 0) {
    res.status(402).json({
      error: {
        message: `AI Data Pack Exhausted (0 MB remaining). Please recharge your subscription to continue using sk-airecharge keys.`,
        type: "quota_exceeded_error",
        code: "insufficient_data_pack",
        remainingMB: user.dataPackMBRemaining
      }
    });
    return;
  }
  if (user.dailyUsedMB >= user.dailyLimitMB) {
    res.status(429).json({
      error: {
        message: `Daily high-speed quota limit reached (${user.dailyUsedMB.toFixed(1)} / ${user.dailyLimitMB} MB). Resets at midnight.`,
        type: "daily_limit_exceeded",
        code: "rate_limit_exceeded",
        dailyUsedMB: user.dailyUsedMB,
        dailyLimitMB: user.dailyLimitMB
      }
    });
    return;
  }
  const { model = "deepseek-v3", messages = [], temperature = 0.7 } = req.body;
  const fullPromptText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const promptTokens = Math.max(12, Math.ceil(fullPromptText.length / 3.8));
  let completionText = "";
  let completionTokens = 0;
  try {
    if (process.env.GEMINI_API_KEY) {
      const geminiModel = model.includes("reasoning") || model.includes("r1") || model.includes("o1") ? "gemini-4-argon" : "gemini-3.8-flash";
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: `You are acting as the AI model "${model}". Answer the following request concisely and accurately as requested by the developer using the sk-airecharge proxy gateway:

${fullPromptText}`,
        config: {
          temperature
        }
      });
      completionText = response.text || "No response generated.";
    } else {
      completionText = `[AI Recharge Proxy Gateway response for model "${model}"]

Hello! Your request was processed via sk-airecharge reverse proxy. Here is the output generated for your prompt:
"${messages[messages.length - 1]?.content || "Hello"}"`;
    }
    completionTokens = Math.max(15, Math.ceil(completionText.length / 3.8));
    const totalTokens = promptTokens + completionTokens;
    const tokensPerMB = model.includes("flash") || model.includes("mini") ? 3e4 : model.includes("r1") || model.includes("o1") ? 15e3 : 22e3;
    const dataDeductedMB = parseFloat(((promptTokens * 1 + completionTokens * 1.3) / tokensPerMB).toFixed(4));
    user.dataPackMBRemaining = Math.max(0, parseFloat((user.dataPackMBRemaining - dataDeductedMB).toFixed(4)));
    user.dailyUsedMB = parseFloat((user.dailyUsedMB + dataDeductedMB).toFixed(4));
    const receipt = {
      receiptId: `rcpt_${Math.floor(1e5 + Math.random() * 9e5)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
      gatewayStatus: "200 OK - Deducted successfully"
    };
    store.receipts.unshift(receipt);
    if (store.receipts.length > 100) store.receipts.pop();
    saveStore();
    res.setHeader("X-AIRecharge-Receipt", "Validated");
    res.setHeader("X-AIRecharge-Receipt-ID", receipt.receiptId);
    res.setHeader("X-Tokens-Prompt", promptTokens.toString());
    res.setHeader("X-Tokens-Completion", completionTokens.toString());
    res.setHeader("X-Tokens-Total", totalTokens.toString());
    res.setHeader("X-MB-Deducted", dataDeductedMB.toString());
    res.setHeader("X-MB-Remaining", user.dataPackMBRemaining.toString());
    res.setHeader("X-MB-DailyLimit", user.dailyLimitMB.toString());
    res.json({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: completionText
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens
      },
      magicReceipt: receipt
    });
  } catch (err) {
    console.error("Proxy execution error:", err);
    res.status(500).json({
      error: {
        message: err.message || "Error communicating with AI model backend.",
        type: "proxy_execution_error"
      }
    });
  }
});
app.get("/api/proxy/receipts", (req, res) => {
  const user = store.users[0];
  res.json({
    receipts: store.receipts.filter((r) => r.userId === user.id)
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} AI Recharge Models Server listening on http://localhost:${PORT}`);
  });
}
startServer();
