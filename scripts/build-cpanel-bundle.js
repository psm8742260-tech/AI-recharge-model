import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create Telugu Readme
const teluguReadme = `========================================================================
AI RECHARGE MODELS - cPanel & VPS LIVE DEPLOYMENT GUIDE (తెలుగు)
========================================================================

నమస్కారం అడ్మిన్ గారు,
ఈ ZIP ఫైల్ లో మీ AI Recharge Models వెబ్‌సైట్ మరియు Node.js సర్వర్ ఫైల్స్ అన్నీ సిద్ధంగా ఉన్నాయి.
మీ cPanel లో లాగిన్ మరియు సర్వర్ తక్షణమే పనిచేయడానికి క్రింది స్టెప్స్ పాటించండి:

1. cPanel File Manager లోకి వెళ్ళండి:
   - పాత ఫైల్స్ ఉంటే వాటిని "old_backup" అనే ఫోల్డర్ లోకి తరలించండి (Move).
   - ఈ ZIP ఫైల్ ను అప్‌లోడ్ చేసి "Extract" చేయండి.

2. cPanel లో "Setup Node.js App" ఓపెన్ చేయండి:
   - Node.js Version: 18.x లేదా 20.x ఎంచుకోండి.
   - Application Mode: Production
   - Application Root: మీ ప్రాజెక్ట్ ఫోల్డర్ పాత్ (ఉదా: public_html లేదా airecharge)
   - Application Startup File: server.js
   - "Run NPM Install" బటన్ క్లిక్ చేయండి.
   - చివరగా "SAVE" చేసి, "RESTART" బటన్ నొక్కండి.

3. అడ్మిన్ లాగిన్ వివరాలు (Admin Master Credentials):
   - Admin Master PIN: 6606.0k
   - Admin Password: 2634T
   - Admin Mobile: 8466062260
   - Admin Email: psm8742260@gmail.com

4. VPS (Ubuntu / Linux) ద్వారా రన్ చేయాలనుకుంటే:
   - bash deploy-vps.sh
   (ఇది స్వయంచాలకంగా PM2 తో server.js ను పోర్ట్ 8080 లో రన్ చేస్తుంది)

అంతే! మీ లైవ్ వెబ్‌సైట్ మరియు లాగిన్ స్క్రీన్ ఎటువంటి సమస్య లేకుండా సూపర్ ఫాస్ట్‌గా పనిచేస్తాయి.
========================================================================
`;

fs.writeFileSync(path.join(rootDir, 'README_CPANEL_TELUGU.txt'), teluguReadme, 'utf-8');

function addDirectoryToZip(dirPath, zipFolder) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item.endsWith('.zip')) continue;
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
}

async function main() {
  console.log('Generating lean cpanel-bundle.zip using JSZip...');
  const zip = new JSZip();

  // 1. Add dist directory (production build ready to serve)
  if (fs.existsSync(distDir)) {
    const distZip = zip.folder('dist');
    if (distZip) addDirectoryToZip(distDir, distZip);
  }

  // 2. Add src directory (source files)
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const srcZip = zip.folder('src');
    if (srcZip) addDirectoryToZip(srcDir, srcZip);
  }

  // 3. Add root production files
  const rootFiles = [
    'server.js',
    'server.ts',
    'package.json',
    'server_store.json',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    '.env.example',
    'deploy-vps.sh',
    'cPanel_Setup_Guide.txt',
    'README_CPANEL_TELUGU.txt'
  ];

  for (const file of rootFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      zip.file(file, fs.readFileSync(filePath));
    }
  }

  // 4. Add Apache .htaccess
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

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const publicZip = path.join(publicDir, 'cpanel-bundle.zip');
  fs.writeFileSync(publicZip, buffer);
  console.log(`Saved ${publicZip} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

  if (fs.existsSync(distDir)) {
    const distZip = path.join(distDir, 'cpanel-bundle.zip');
    fs.writeFileSync(distZip, buffer);
    console.log(`Saved ${distZip}`);
  }
}

main().catch(console.error);
