========================================================================
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
