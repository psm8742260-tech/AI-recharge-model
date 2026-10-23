import React from 'react';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { UserAccount } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onRechargeSuccess: (data: { user: UserAccount; generatedKey: string }) => void;
  onOpenPlayground: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = (props) => {
  return <PaymentGatewayModal {...props} />;
};
