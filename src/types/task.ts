export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  category: 'payment' | 'credit' | 'legal' | 'general';
  dueDate?: string;
  createdAt: string;
}

export interface TaskList {
  tasks: Task[];
  lastUpdated: string;
}
