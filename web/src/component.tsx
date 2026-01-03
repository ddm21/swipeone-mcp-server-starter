/**
 * Main component entry point
 * Routes to appropriate UI based on tool output
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { useToolOutput, useToolInput, useTheme } from './hooks';
import { ContactsList, ContactProperties } from './ContactsUI';
import { NotesList, NoteCard } from './NotesUI';
import { TasksList, TaskCard } from './TasksUI';

const App: React.FC = () => {
    const toolOutput = useToolOutput();
    const toolInput = useToolInput();
    const theme = useTheme();

    // Apply theme to document
    React.useEffect(() => {
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    if (!toolOutput) {
        return (
            <div className="loading">
                <p>Loading...</p>
            </div>
        );
    }

    const { data, toolName, action } = toolOutput;

    // Route to appropriate component based on tool
    const renderComponent = () => {
        switch (toolName) {
            case 'retrieve_all_contacts':
            case 'search_contacts':
                return <ContactsList contacts={data?.contacts || []} />;

            case 'get_contact_properties':
                return <ContactProperties properties={data?.properties || []} />;

            case 'retrieve_notes':
                return <NotesList notes={data?.notes || []} contactName={data?.contactName} />;

            case 'create_note':
                return <NoteCard note={data?.note || data} action="created" />;

            case 'update_note':
                return <NoteCard note={data?.note || data} action="updated" />;

            case 'retrieve_all_tasks':
                return <TasksList tasks={data?.tasks || []} />;

            case 'create_task':
                return <TaskCard task={data?.task || data} action="created" />;

            case 'update_task':
                return <TaskCard task={data?.task || data} action="updated" />;

            default:
                return (
                    <div className="error">
                        <p>Unknown tool: {toolName}</p>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <div className="app-container">
            {renderComponent()}
            <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .app-container {
          padding: 16px;
          max-width: 100%;
          min-height: 200px;
        }
        
        .loading, .error {
          text-align: center;
          padding: 32px 16px;
          color: var(--text-secondary, #6b7280);
        }
        
        .error pre {
          text-align: left;
          background: var(--bg-secondary, #f3f4f6);
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 12px;
        }
        
        @media (prefers-color-scheme: dark) {
          body {
            background: #111827;
            color: #f9fafb;
          }
          .loading, .error {
            --text-secondary: #9ca3af;
          }
          .error pre {
            --bg-secondary: #1f2937;
          }
        }
      `}</style>
        </div>
    );
};

// Mount the app
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
} else {
    console.error('Root element not found');
}
