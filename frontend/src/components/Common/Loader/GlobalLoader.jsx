import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import FullPageLoader from './FullPageLoader';

/**
 * 🛠️ GlobalLoader - Intelligent State Management
 * 
 * Logic:
 * 1. Initial Boot: Wait for (Session Ready) AND (Min 1s/2s duration)
 * 2. Route Changes: Ensure loading states are cleaned up if stuck
 * 3. Real Actions: Show loader during appLoading/logoutLoading
 * 4. Safety: Force stop after 10s if state is stuck
 */
const GlobalLoader = () => {
    const { loading: authLoading, logoutLoading, appLoading, setAppLoading } = useAuth();
    const location = useLocation();
    const prevPathRef = useRef(location.pathname);
    
    // ⏱️ TIMING CONSTANTS
    const TIME_NEW_TAB = 2000;
    const TIME_REFRESH = 1000;
    const TIME_MIN_ACTION = 150; // Short min-time to prevent flicker
    const GLOBAL_SAFETY_TIMEOUT = 4000;

    // 1️⃣ BOOT SEQUENCE (Initial Load)
    const [bootMinTimeElapsed, setBootMinTimeElapsed] = useState(false);

    useEffect(() => {
        const isFreshTab = !sessionStorage.getItem('lexiqo_tab_initialized');
        const duration = isFreshTab ? TIME_NEW_TAB : TIME_REFRESH;
        
        const timer = setTimeout(() => {
            setBootMinTimeElapsed(true);
            sessionStorage.setItem('lexiqo_tab_initialized', 'true');
            // We transition out of initial boot mode after the first timer fires
            // But we only stop showing loader if data is also ready (authLoading)
        }, duration);
        
        return () => clearTimeout(timer);
    }, []);

    // 2️⃣ ROUTE PROTECTION & CLEANUP
    useEffect(() => {
        if (prevPathRef.current !== location.pathname) {
            // Clear any stuck loading state from the previous page
            setAppLoading(false);
            setActionMinTimeElapsed(true);
            prevPathRef.current = location.pathname;
        }
    }, [location.pathname, setAppLoading]);

    // 3️⃣ ACTION TRACKING (Min duration for later actions to avoid flickering)
    const [actionMinTimeElapsed, setActionMinTimeElapsed] = useState(true);
    const isLoading = appLoading || logoutLoading;
    const prevLoadingRef = useRef(false);

    useEffect(() => {
        // When loading STARTS (false -> true)
        if (isLoading && !prevLoadingRef.current) {
            setActionMinTimeElapsed(false);
            setTimeout(() => {
                setActionMinTimeElapsed(true);
            }, TIME_MIN_ACTION);
        }
        prevLoadingRef.current = isLoading;
    }, [isLoading]);

    // 4️⃣ GLOBAL SAFETY FALLBACK
    useEffect(() => {
        if (appLoading) {
            const timer = setTimeout(() => {
                console.warn('GlobalLoader: Safety timeout triggered. Forcing appLoading to false.');
                setAppLoading(false);
            }, GLOBAL_SAFETY_TIMEOUT);
            return () => clearTimeout(timer);
        }
    }, [appLoading, setAppLoading]);

    // 5️⃣ FINAL VISIBILITY CALCULATION
    // First, complete the initial boot sequence: (Min Time Passed) AND (Session Auth Fetched)
    const isBooting = !bootMinTimeElapsed || authLoading;
    
    // Then, for later actions: (Ready State) AND (Min Action Time Passed)
    const actionActive = isLoading || !actionMinTimeElapsed;

    // Final result: Show if we are still booting OR if a subsequent action is happening.
    // This naturally covers the initial page load which triggers during boot.
    const showLoader = isBooting || actionActive;

    return (
        <FullPageLoader isVisible={showLoader} />
    );
};

export default GlobalLoader;
