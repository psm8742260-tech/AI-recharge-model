/**
 * AI RECHARGE MODELS - cPanel Node.js Application Startup File
 * Configured for cPanel CloudLinux Node.js Selector, Phusion Passenger & PM2
 *
 * Mode: HYBRID VERSION
 * Digital Fingerprint: SHA-256:48ad8e6f-65ff-43d6-b8e9-9101a514bb6b
 */

import app, { startServer } from './server.js';

export default app;
export { app, startServer };
