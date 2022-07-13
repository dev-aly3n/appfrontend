import React from 'react';

import { RouteType } from '@/global/types';
import StakePage from '@/pages/stake';
import TradePage from '@/pages/trade';
import DashboardPage from '@/pages/dashboard';
import { MarginTradingPage } from '@/pages/trade/margin-trading';

const APP_ROUTES: RouteType[] = [
  {
    path: '/trade',
    component: <TradePage />,
    title: 'Trade',
    isNavLinked: true,
  },
  {
    path: '/stake',
    component: <StakePage />,
    title: 'Stake',
    isNavLinked: true,
  },
  {
    path: '/dashboard',
    component: <DashboardPage />,
    title: 'Dashboard',
    isNavLinked: true,
  },
  {
    path: '/trade/margin-trading',
    component: <MarginTradingPage />,
    title: 'Margin Trading',
    isNavLinked: false,
  },
];

export default APP_ROUTES;
