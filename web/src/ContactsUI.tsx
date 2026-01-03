/**
 * Contacts UI Components
 */

import React from 'react';
import { Card, List, Button } from './components';

interface Contact {
    _id: string;
    fullName?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
    customProperties?: Record<string, any>;
}

interface ContactsListProps {
    contacts: Contact[];
}

export const ContactsList: React.FC<ContactsListProps> = ({ contacts }) => {
    const handleViewContact = (contactId: string) => {
        window.openai?.sendFollowUpMessage({
            prompt: `Show me details for contact ${contactId}`
        });
    };

    return (
        <>
            <div className="contacts-header">
                <h2>Contacts</h2>
                <p className="count">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
            </div>
            <List
                items={contacts}
                emptyMessage="No contacts found"
                renderItem={(contact: Contact) => (
                    <Card>
                        <div className="contact-item">
                            <div className="contact-avatar">
                                {(contact.fullName || contact.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="contact-info">
                                <h3 className="contact-name">{contact.fullName || 'Unnamed Contact'}</h3>
                                {contact.email && <p className="contact-email">{contact.email}</p>}
                                {contact.phone && <p className="contact-phone">{contact.phone}</p>}
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => handleViewContact(contact._id)}
                            >
                                View
                            </Button>
                        </div>
                    </Card>
                )}
            />
            <style>{`
        .contacts-header {
          margin-bottom: 16px;
          padding: 0 4px;
        }
        .contacts-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .contacts-header .count {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .contact-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .contact-info {
          flex: 1;
          min-width: 0;
        }
        .contact-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary, #111827);
        }
        .contact-email, .contact-phone {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (prefers-color-scheme: dark) {
          .contacts-header h2,
          .contact-name {
            --text-primary: #f9fafb;
          }
          .contacts-header .count,
          .contact-email,
          .contact-phone {
            --text-secondary: #9ca3af;
          }
        }
      `}</style>
        </>
    );
};

interface ContactPropertiesProps {
    properties: Array<{
        name: string;
        label: string;
        type: string;
        fieldType?: string;
    }>;
}

export const ContactProperties: React.FC<ContactPropertiesProps> = ({ properties }) => {
    return (
        <>
            <div className="properties-header">
                <h2>Contact Properties</h2>
                <p className="count">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</p>
            </div>
            <Card>
                <div className="properties-grid">
                    {properties.map((prop, index) => (
                        <div key={index} className="property-item">
                            <span className="property-label">{prop.label}</span>
                            <span className="property-type">{prop.type}</span>
                        </div>
                    ))}
                </div>
            </Card>
            <style>{`
        .properties-header {
          margin-bottom: 16px;
          padding: 0 4px;
        }
        .properties-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .properties-header .count {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .property-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
        }
        .property-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #111827);
        }
        .property-type {
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
        }
        @media (prefers-color-scheme: dark) {
          .properties-header h2,
          .property-label {
            --text-primary: #f9fafb;
          }
          .properties-header .count,
          .property-type {
            --text-secondary: #9ca3af;
          }
          .property-item {
            --bg-secondary: #374151;
          }
        }
      `}</style>
        </>
    );
};
