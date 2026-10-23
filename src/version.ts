/**
 * AI RECHARGE MODELS - Centralized Version & Security Management
 * This file is the source of truth for the application's core identifiers.
 * AS PER ADMIN GARU'S REQUEST:
 * 1. Numerical versions are strictly disabled.
 * 2. HYBRID VERSION mode is enforced globally.
 * 3. Project Name and SHA Fingerprint are PERMANENTLY LOCKED.
 */

export const APP_VERSION_MODE = 'HYBRID VERSION';
export const APP_ENGINE_STATUS = 'ACTIVE';
export const GATEWAY_MODE = 'REVERSE PROXY';
export const BUILD_STAMP = '2026-10-23';

/** 
 * PROJECT LOCK: These identifiers must never be changed.
 * They represent the digital fingerprint of the project.
 */
export const PROJECT_NAME = 'AI Recharge Models';
export const PROJECT_SHA_FINGERPRINT = 'SHA-256:48ad8e6f-65ff-43d6-b8e9-9101a514bb6b';

/**
 * TESTING MODE: Set to true for comprehensive feature verification.
 */
export const TESTING_MODE = true;

export const getDisplayVersion = () => APP_VERSION_MODE;
export const getBuildInfo = () => `${APP_VERSION_MODE} [${APP_ENGINE_STATUS}]`;
export const getFingerprint = () => PROJECT_SHA_FINGERPRINT;
