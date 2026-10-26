const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createZip() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist. Run npm run build first.');
    process.exit(1);
  }

  // 1. Prepare dist/ with all Node.js and cPanel production artifacts
  const serverJsPath = path.join(rootDir, 'server.js');
  if (fs.existsSync(serverJsPath)) {
    fs.copyFileSync(serverJsPath, path.join(distDir, 'server.js'));
  }

  const appJsPath = path.join(rootDir, 'app.js');
  if (fs.existsSync(appJsPath)) {
    fs.copyFileSync(appJsPath, path.join(distDir, 'app.js'));
  }

  const storePath = path.join(rootDir, 'server_store.json');
  if (fs.existsSync(storePath)) {
    fs.copyFileSync(storePath, path.join(distDir, 'server_store.json'));
  }

  // Passenger Auto-Restart trigger folder and file
  const tmpDir = path.join(distDir, 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'restart.txt'), `Restart triggered at: ${new Date().toISOString()}\nMode: HYBRID VERSION\n`);

  // Minimal Production package.json for cPanel Node.js Selector
  const prodPkg = {
    name: "ai-recharge-models",
    private: true,
    version: "HYBRID",
    type: "module",
    scripts: {
      "start": "node app.js"
    },
    dependencies: {
      "@google/genai": "^2.4.0",
      "dotenv": "^17.2.3",
      "express": "^4.21.2",
      "jszip": "^3.10.2"
    }
  };
  fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(prodPkg, null, 2));

  // Production .htaccess supporting Passenger and SPA client fallback
  const htaccessContent = `# AI RECHARGE MODELS - cPanel & Node.js Production Configuration
# HYBRID VERSION

<IfModule mod_passenger.c>
  PassengerEnabled on
  PassengerAppType node
  PassengerStartupFile app.js
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # 2. Allow direct access to real files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 3. SPA Fallback to index.html
  RewriteRule ^ index.html [L]
</IfModule>
`;
  fs.writeFileSync(path.join(distDir, '.htaccess'), htaccessContent);
  fs.writeFileSync(path.join(rootDir, '.htaccess'), htaccessContent);

  // Telugu Guide for Admin Garu
  const guideContent = `=====================================================
AI RECHARGE MODELS - cPanel & Node.js లైవ్ గైడ్ (TELUGU)
మోడ్: HYBRID VERSION
=====================================================

అడ్మిన్ గారు, మీ అప్లికేషన్ రెండు విధాలుగానూ పర్ఫెక్ట్‌గా పనిచేస్తుంది:

విధానం 1: cPanel "Setup Node.js App" (రైవర్స్ ప్రాక్సీ / బ్యాకెండ్)
1. cPanel లోకి లాగిన్ అయి "Setup Node.js App" ఓపెన్ చేయండి.
2. "Create Application" క్లిక్ చేయండి:
   - Node.js Version: 18.x, 20.x, లేదా 22.x ఎంచుకోండి.
   - Application mode: Production
   - Application root: arm (లేదా మీ ఫోల్డర్)
   - Application startup file: app.js
3. "Create" క్లిక్ చేసి, "Run NPM Install" బటన్ నొక్కండి.
4. "Restart" క్లిక్ చేయండి. అంతే! మీ Node.js సర్వర్ + AI గేట్‌వే లైవ్ అవుతాయి.

విధానం 2: డైరెక్ట్ public_html అప్‌లోడ్ (స్టాటిక్ హోస్టింగ్)
1. ఈ ZIP లోని అన్ని ఫైల్స్‌ను నేరుగా public_html లోకి Extract చేయండి.
2. ఇప్పటికే .htaccess మరియు క్లయింట్-సైడ్ ఫెయిల్‌సేఫ్ సిస్టమ్ చేర్చబడ్డాయి.
3. జిమెయిల్ మరియు మొబైల్ నంబర్ ఇవ్వగానే నేరుగా లాగిన్ అయిపోతుంది!
`;
  fs.writeFileSync(path.join(distDir, 'README_CPANEL_NODEJS_TELUGU.txt'), guideContent);

  // 2. Build ZIP from dist/
  const zip = new JSZip();

  const addDirectoryToZip = (dirPath, zipFolder) => {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item.endsWith('.zip')) continue;
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

  addDirectoryToZip(distDir, zip);

  console.log('Generating ZIP buffer with compression...');
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outputFiles = [
    path.join(rootDir, 'cpanel-bundle.zip'),
    path.join(rootDir, 'cpanel_public_html.zip'),
    path.join(rootDir, 'public', 'cpanel-bundle.zip'),
    path.join(rootDir, 'public', 'cpanel_public_html.zip'),
    path.join(distDir, 'cpanel-bundle.zip'),
    path.join(distDir, 'cpanel_public_html.zip'),
  ];

  for (const dest of outputFiles) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    console.log(`Saved: ${dest} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  }

  console.log('All zip bundles generated successfully with Node.js support!');
}

createZip().catch((err) => {
  console.error('Error generating zip:', err);
  process.exit(1);
});
