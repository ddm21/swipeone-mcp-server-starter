/**
 * Tasks UI Components
 */

import React from 'react';
import { Card, List, Badge, Button } from './components';

interface Task {
    _id: string;
    name: string;
    status: 'not_started' | 'in_progress' | 'completed';
    dueDate?: string;
    reminder?: string;
    assignedTo?: string;
    contactId?: string;
    createdAt?: string;
}

interface TasksListProps {
    tasks: Task[];
}

export const TasksList: React.FC<TasksListProps> = ({ tasks }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(window.openai?.locale || 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'info' => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'warning';
            default:
                return 'info';
        }
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        await window.openai?.callTool('update_task', {
            taskId,
            status: newStatus
        });
    };

    return (
        <>
            <div className="tasks-header">
                <h2>Tasks</h2>
                <p className="count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
            </div>
            <List
                items={tasks}
                emptyMessage="No tasks found"
                renderItem={(task: Task) => (
                    <Card>
                        <div className="task-item">
                            <div className="task-main">
                                <div className="task-header">
                                    <h3 className="task-name">{task.name}</h3>
                                    <Badge variant={getStatusVariant(task.status)}>
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                {task.dueDate && (
                                    <p className="task-due">
                                        <span className="label">Due:</span> {formatDate(task.dueDate)}
                                    </p>
                                )}
                                {task.reminder && (
                                    <p className="task-reminder">
                                        <span className="label">Reminder:</span> {formatDate(task.reminder)}
                                    </p>
                                )}
                            </div>
                            {task.status !== 'completed' && (
                                <div className="task-actions">
                                    {task.status === 'not_started' && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleUpdateStatus(task._id, 'in_progress')}
                                        >
                                            Start
                                        </Button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <Button
                                            variant="primary"
                                            onClick={() => handleUpdateStatus(task._id, 'completed')}
                                        >
                                            Complete
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            />
            <style>{`
        .tasks-header {
          margin-bottom: 16px;
          padding: 0 4px;
        }
        .tasks-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .tasks-header .count {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .task-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .task-main {
          flex: 1;
          min-width: 0;
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .task-name {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary, #111827);
          flex: 1;
        }
        .task-due, .task-reminder {
          margin: 4px 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .task-due .label, .task-reminder .label {
          font-weight: 500;
        }
        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (prefers-color-scheme: dark) {
          .tasks-header h2,
          .task-name {
            --text-primary: #f9fafb;
          }
          .tasks-header .count,
          .task-due,
          .task-reminder {
            --text-secondary: #9ca3af;
          }
        }
      `}</style>
        </>
    );
};

interface TaskCardProps {
    task: Task;
    action: 'created' | 'updated';
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, action }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(window.openai?.locale || 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'info' => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'warning';
            default:
                return 'info';
        }
    };

    return (
        <>
            <Card>
                <div className="task-card">
                    <div className="success-icon">✓</div>
                    <h2 className="success-title">Task {action === 'created' ? 'Created' : 'Updated'}</h2>
                    <div className="task-details">
                        <div className="task-header">
                            <h3 className="task-name">{task.name}</h3>
                            <Badge variant={getStatusVariant(task.status)}>
                                {task.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        {task.dueDate && (
                            <p className="task-info">
                                <span className="label">Due:</span> {formatDate(task.dueDate)}
                            </p>
                        )}
                        {task.reminder && (
                            <p className="task-info">
                                <span className="label">Reminder:</span> {formatDate(task.reminder)}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
            <style>{`
        .task-card {
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
        .task-details {
          text-align: left;
          padding: 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 8px;
        }
        .task-details .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .task-details .task-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
          flex: 1;
        }
        .task-info {
          margin: 4px 0;
          font-size: 14px;
          color: var(--text-secondary, #6b7280);
        }
        .task-info .label {
          font-weight: 500;
        }
        @media (prefers-color-scheme: dark) {
          .success-title,
          .task-details .task-name {
            --text-primary: #f9fafb;
          }
          .task-info {
            --text-secondary: #9ca3af;
          }
          .task-details {
            --bg-secondary: #374151;
          }
        }
      `}</style>
        </>
    );
};
