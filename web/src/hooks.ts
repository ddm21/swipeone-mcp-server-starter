/**
 * React hooks for accessing OpenAI API
 */

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import type { OpenAiGlobals, SetGlobalsEvent } from './types';

const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals';

/**
 * Hook to subscribe to a specific OpenAI global value
 */
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
    key: K
): OpenAiGlobals[K] {
    return useSyncExternalStore(
        (onChange) => {
            const handleSetGlobal = (event: Event) => {
                const customEvent = event as SetGlobalsEvent;
                const value = customEvent.detail.globals[key];
                if (value === undefined) {
                    return;
                }
                onChange();
            };

            window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
                passive: true,
            } as AddEventListenerOptions);

            return () => {
                window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
            };
        },
        () => window.openai?.[key]
    );
}

/**
 * Hook to access tool input
 */
export function useToolInput() {
    return useOpenAiGlobal('toolInput');
}

/**
 * Hook to access tool output
 */
export function useToolOutput() {
    return useOpenAiGlobal('toolOutput');
}

/**
 * Hook to access tool response metadata
 */
export function useToolResponseMetadata() {
    return useOpenAiGlobal('toolResponseMetadata');
}

/**
 * Hook to access and persist widget state
 */
export function useWidgetState<T = any>(
    defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: T | ((prev: T | null) => T | null)) => void] {
    const widgetStateFromWindow = useOpenAiGlobal('widgetState') as T;

    const [widgetState, _setWidgetState] = useState<T | null>(() => {
        if (widgetStateFromWindow != null) {
            return widgetStateFromWindow;
        }

        return typeof defaultState === 'function'
            ? (defaultState as () => T | null)()
            : defaultState ?? null;
    });

    useEffect(() => {
        _setWidgetState(widgetStateFromWindow);
    }, [widgetStateFromWindow]);

    const setWidgetState = useCallback(
        (state: T | ((prev: T | null) => T | null)) => {
            _setWidgetState((prevState) => {
                const newState = typeof state === 'function' ? state(prevState) : state;

                if (newState != null && window.openai?.setWidgetState) {
                    window.openai.setWidgetState(newState);
                }

                return newState;
            });
        },
        []
    );

    return [widgetState, setWidgetState] as const;
}

/**
 * Hook to access theme
 */
export function useTheme() {
    return useOpenAiGlobal('theme');
}

/**
 * Hook to access display mode
 */
export function useDisplayMode() {
    return useOpenAiGlobal('displayMode');
}
