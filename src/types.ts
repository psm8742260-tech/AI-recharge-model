export interface UserAccount {
  id: string;
  email: string;
  name: string;
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

export interface MagicReceipt {
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

export interface RechargeTransaction {
  id: string;
  timestamp: string;
  planId: string;
  planName: string;
  amountINR: number;
  dataAddedMB: number;
  generatedKey: string;
  paymentMethod: string;
}
