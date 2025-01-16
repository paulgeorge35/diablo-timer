'use client'

import { env } from "@/env";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

const notificationsSupported = () =>
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window

export default function Notifications() {
    const router = useRouter()

    if (window.Notification.permission === 'granted' || !notificationsSupported()) {
        return null;
    }

    const handleSubscribe = async () => {
        await subscribe()
        router.refresh()
    }

    return <>
        <button type="button" onClick={handleSubscribe} className="flex items-center gap-2 ml-auto p-4 bg-muted/10">
            <Bell className="size-4" />
            Enable Notifications
        </button>
    </>
}

export const unregisterServiceWorkers = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
}

const registerServiceWorker = async () => {
    return navigator.serviceWorker.register('/service.js')
}

const subscribe = async () => {
    await unregisterServiceWorkers()

    const swRegistration = await registerServiceWorker()
    await window?.Notification.requestPermission()

    try {
        const options = {
            applicationServerKey: env.NEXT_PUBLIC_PUBLIC_KEY,
            userVisibleOnly: true,
        }
        const subscription = await swRegistration.pushManager.subscribe(options)

        await saveSubscription(subscription)
    } catch (err) {
        console.error('Error', err)
    }
};

const saveSubscription = async (subscription: PushSubscription) => {
    const BACKEND_URL = `${env.NEXT_PUBLIC_APP_URL}/api/subscription/save`

    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    })

    if (!response.ok) {
        throw new Error('Failed to save subscription')
    }

    return response.json()
}