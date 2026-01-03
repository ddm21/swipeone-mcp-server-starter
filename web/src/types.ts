/**
 * Type definitions for window.openai API
 * Based on OpenAI Apps SDK documentation
 */

export interface OpenAiGlobals {
    toolInput: any;
    toolOutput: any;
    toolResponseMetadata: any;
    widgetState: any;
    theme: 'light' | 'dark';
    displayMode: 'inline' | 'fullscreen' | 'pip';
    maxHeight: number;
    safeArea: { top: number; right: number; bottom: number; left: number };
    view: string;
    userAgent: string;
    locale: string;
}

export interface OpenAiAPI {
    // State & Data
    toolInput: any;
    toolOutput: any;
    toolResponseMetadata: any;
    widgetState: any;
    setWidgetState: (state: any) => void;

    // Widget Runtime APIs
    callTool: (name: string, args: any) => Promise<any>;
    sendFollowUpMessage: (params: { prompt: string }) => Promise<void>;
    uploadFile: (file: File) => Promise<{ fileId: string }>;
    getFileDownloadUrl: (params: { fileId: string }) => Promise<{ downloadUrl: string }>;
    requestDisplayMode: (params: { mode: 'inline' | 'fullscreen' | 'pip' }) => Promise<void>;
    requestModal: (params: any) => Promise<void>;
    notifyIntrinsicHeight: (height: number) => void;
    openExternal: (params: { href: string }) => void;
    requestClose: () => void;

    // Context
    theme: 'light' | 'dark';
    displayMode: 'inline' | 'fullscreen' | 'pip';
    maxHeight: number;
    safeArea: { top: number; right: number; bottom: number; left: number };
    view: string;
    userAgent: string;
    locale: string;
}

declare global {
    interface Window {
        openai: OpenAiAPI;
    }
}

export const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals';

export interface SetGlobalsEvent extends CustomEvent {
    detail: {
        globals: Partial<OpenAiGlobals>;
    };
}
