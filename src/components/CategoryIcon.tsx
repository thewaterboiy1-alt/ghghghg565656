import React from 'react';
import {
  Briefcase,
  Car,
  Coins,
  Gift,
  HeartPulse,
  Home,
  Receipt,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wallet,
} from 'lucide-react';
import { CategoryMeta } from '../types/finance';

interface CategoryIconProps {
  iconName: CategoryMeta['iconName'];
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName) {
    case 'utensils':
      return <Utensils className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'shopping-bag':
      return <ShoppingBag className={className} />;
    case 'heart-pulse':
      return <HeartPulse className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'receipt':
      return <Receipt className={className} />;
    case 'wallet':
      return <Wallet className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'coins':
    default:
      return <Coins className={className} />;
  }
};
