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
export const BUILD_STAMP = 'HYBRID BUILD';
export const NODE_BACKEND_STATUS = 'NODE.JS HYBRID READY';

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

export const SYSTEM_INTEGRITY_LOCK = 'STRICT_ENFORCED';
export const LAST_MODIFIED_BY = 'AI_ENGINEER_HYBRID_CORE';
export const LAST_MODIFIED_TIME = 'HYBRID CORE';

export const getDisplayVersion = () => APP_VERSION_MODE;
export const getBuildInfo = () => `${APP_VERSION_MODE} [${APP_ENGINE_STATUS}] [LOCK: ${SYSTEM_INTEGRITY_LOCK}]`;
export const getFingerprint = () => PROJECT_SHA_FINGERPRINT;
export const getNodeStatus = () => NODE_BACKEND_STATUS;
export const getDeploymentMode = () => 'CPANEL & NODE.JS HYBRID';
export const getIntegrityStatus = () => ({
  lock: SYSTEM_INTEGRITY_LOCK,
  modifiedBy: LAST_MODIFIED_BY,
  timestamp: LAST_MODIFIED_TIME
});

