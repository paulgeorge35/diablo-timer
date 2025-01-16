'use client';
import dynamic from 'next/dynamic';

const Notifications = dynamic(() => import('./Notifications'), {
  ssr: false,
});

export default function NotificationsClient() {
  return <Notifications />;
} 