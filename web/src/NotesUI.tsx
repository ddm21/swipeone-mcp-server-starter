/**
 * Notes UI Components
 */

import React from 'react';
import { Card, List, Badge } from './components';

interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

interface NotesListProps {
    notes: Note[];
    contactName?: string;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, contactName }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(window.openai?.locale || 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <div className="notes-header">
                <h2>Notes{contactName ? ` for ${contactName}` : ''}</h2>
                <p className="count">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>
            <List
                items={notes}
                emptyMessage="No notes found"
                renderItem={(note: Note) => (
                    <Card>
                        <div className="note-item">
                            <div className="note-header">
                                <h3 className="note-title">{note.title}</h3>
                                {note.createdAt && (
                                    <span className="note-date">{formatDate(note.createdAt)}</span>
                                )}
                            </div>
                            <p className="note-content">{note.content}</p>
                            {note.updatedAt && note.updatedAt !== note.createdAt && (
                                <div className="note-footer">
                                    <Badge variant="info">Updated {formatDate(note.updatedAt)}</Badge>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            />
            <style>{`
        .notes-header {
          margin-bottom: 16px;
          padding: 0 4px;
        }
        .notes-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .notes-header .count {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .note-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .note-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
          flex: 1;
        }
        .note-date {
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
          white-space: nowrap;
        }
        .note-content {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary, #374151);
          white-space: pre-wrap;
        }
        .note-footer {
          display: flex;
          justify-content: flex-end;
        }
        @media (prefers-color-scheme: dark) {
          .notes-header h2,
          .note-title {
            --text-primary: #f9fafb;
          }
          .notes-header .count,
          .note-date {
            --text-secondary: #9ca3af;
          }
          .note-content {
            --text-primary: #d1d5db;
          }
        }
      `}</style>
        </>
    );
};

interface NoteCardProps {
    note: Note;
    action: 'created' | 'updated';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, action }) => {
    return (
        <>
            <Card>
                <div className="note-card">
                    <div className="success-icon">✓</div>
                    <h2 className="success-title">Note {action === 'created' ? 'Created' : 'Updated'}</h2>
                    <div className="note-details">
                        <h3 className="note-title">{note.title}</h3>
                        <p className="note-content">{note.content}</p>
                    </div>
                </div>
            </Card>
            <style>{`
        .note-card {
          text-align: center;
          padding: 8px;
        }
        .success-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        .success-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .note-details {
          text-align: left;
          padding: 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
        }
        .note-details .note-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .note-details .note-content {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary, #374151);
          white-space: pre-wrap;
        }
        @media (prefers-color-scheme: dark) {
          .success-title,
          .note-details .note-title {
            --text-primary: #f9fafb;
          }
          .note-details .note-content {
            --text-primary: #d1d5db;
          }
          .note-details {
            --bg-secondary: #374151;
          }
        }
      `}</style>
        </>
    );
};
