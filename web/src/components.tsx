/**
 * Shared UI components and styles
 */

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`card ${className}`}>
            {children}
            <style>{`
        .card {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        @media (prefers-color-scheme: dark) {
          .card {
            --bg-primary: #1f2937;
            --border-color: #374151;
          }
        }
      `}</style>
        </div>
    );
};

interface ListProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    emptyMessage?: string;
}

export const List: React.FC<ListProps> = ({ items, renderItem, emptyMessage = 'No items found' }) => {
    if (!items || items.length === 0) {
        return (
            <div className="empty-state">
                <p>{emptyMessage}</p>
                <style>{`
          .empty-state {
            text-align: center;
            padding: 32px 16px;
            color: var(--text-secondary, #6b7280);
          }
          @media (prefers-color-scheme: dark) {
            .empty-state {
              --text-secondary: #9ca3af;
            }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="list-container">
            {items.map((item, index) => (
                <div key={index} className="list-item">
                    {renderItem(item, index)}
                </div>
            ))}
            <style>{`
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .list-item {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false
}) => {
    return (
        <>
            <button
                className={`btn btn-${variant}`}
                onClick={onClick}
                disabled={disabled}
            >
                {children}
            </button>
            <style>{`
        .btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
          background: var(--bg-secondary, #f3f4f6);
          color: var(--text-primary, #111827);
          border: 1px solid var(--border-color, #e5e7eb);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-secondary-hover, #e5e7eb);
        }
        @media (prefers-color-scheme: dark) {
          .btn-secondary {
            --bg-secondary: #374151;
            --bg-secondary-hover: #4b5563;
            --text-primary: #f9fafb;
            --border-color: #4b5563;
          }
        }
      `}</style>
        </>
    );
};

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info' }) => {
    return (
        <>
            <span className={`badge badge-${variant}`}>
                {children}
            </span>
            <style>{`
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-error {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }
        @media (prefers-color-scheme: dark) {
          .badge-success {
            background: #064e3b;
            color: #a7f3d0;
          }
          .badge-warning {
            background: #78350f;
            color: #fde68a;
          }
          .badge-error {
            background: #7f1d1d;
            color: #fecaca;
          }
          .badge-info {
            background: #1e3a8a;
            color: #bfdbfe;
          }
        }
      `}</style>
        </>
    );
};
