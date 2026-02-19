import { useState, useEffect } from 'react';

export type Region = 'IR' | 'GLOBAL';

export function useRegion() {
    const [region, setRegion] = useState<Region>('IR');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkRegion = () => {
            // 1. Check for Developer Override (for local testing)
            const debugOverride = localStorage.getItem('debug_region'); // Set to 'IR' or 'GLOBAL'
            if (debugOverride === 'IR') {
                setRegion('IR');
                setIsLoading(false);
                return;
            }
            if (debugOverride === 'GLOBAL') {
                setRegion('GLOBAL');
                setIsLoading(false);
                return;
            }

            // 2. Check real domain
            const hostname = window.location.hostname;
            // localhost defaults to IR for local development
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                setRegion('IR');
            } else if (hostname.endsWith('.ir')) {
                setRegion('IR');
            } else {
                setRegion('GLOBAL');
            }
            setIsLoading(false);
        };

        checkRegion();
    }, []);

    return {
        region,
        isIran: region === 'IR',
        isGlobal: region === 'GLOBAL',
        isLoading
    };
}
