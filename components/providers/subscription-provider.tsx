'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSubscriptionStore } from '@/lib/store/useSubscriptionStore';

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { initialize } = useSubscriptionStore();

    useEffect(() => {
        if (user) {
            initialize(user);
        }
    }, [user, initialize]);

    return <>{children}</>;
}
