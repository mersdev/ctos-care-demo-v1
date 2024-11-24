import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/task';
import { CTOSReport } from '../types/ctos';

export class TaskService {
  private static instance: TaskService;
  private readonly STORAGE_KEY = 'ctosTasks';

  private constructor() {}

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async generateTasks(report: CTOSReport): Promise<Task[]> {
    const tasks: Task[] = [];
    const now = new Date().toISOString();

    // Credit Score Tasks
    if (report.score.score < 700) {
      tasks.push({
        id: uuidv4(),
        title: 'Improve Credit Score',
        description: 'Your credit score is below 700. Focus on timely payments and reducing credit utilization to improve it.',
        priority: 'high',
        status: 'pending' as const,
        category: 'credit',
        createdAt: now
      });
    }

    // Credit Utilization Tasks
    if (report.score.factors.creditUtilization > 70) {
      tasks.push({
        id: uuidv4(),
        title: 'Reduce Credit Utilization',
        description: 'Your credit utilization is high. Aim to keep credit card balances below 30% of your credit limits.',
        priority: 'high',
        status: 'pending' as const,
        category: 'credit',
        createdAt: now
      });
    }

    // Payment History Tasks
    if (report.score.factors.paymentHistory < 70) {
      tasks.push({
        id: uuidv4(),
        title: 'Improve Payment History',
        description: 'Set up automatic payments for all your credit facilities to ensure timely payments.',
        priority: 'high',
        status: 'pending' as const,
        category: 'payment',
        createdAt: now
      });
    }

    // Special Attention Accounts
    if (report.bankingHistory.ccrisSummary.specialAttentionAccounts > 0) {
      tasks.push({
        id: uuidv4(),
        title: 'Address Special Attention Accounts',
        description: 'Contact your banks to resolve any special attention accounts and create a repayment plan.',
        priority: 'high',
        status: 'pending' as const,
        category: 'payment',
        createdAt: now
      });
    }

    // Legal Cases
    if (report.litigationIndex.activeCases > 0) {
      tasks.push({
        id: uuidv4(),
        title: 'Address Legal Cases',
        description: `Consult with a legal advisor to address ${report.litigationIndex.activeCases} outstanding legal case(s).`,
        priority: 'high',
        status: 'pending' as const,
        category: 'legal',
        createdAt: now
      });
    }

    // Recent Credit Applications
    if (report.score.factors.recentInquiries > 3) {
      tasks.push({
        id: uuidv4(),
        title: 'Limit Credit Applications',
        description: 'Multiple recent credit applications can lower your score. Avoid applying for new credit for the next 6 months.',
        priority: 'medium',
        status: 'pending' as const,
        category: 'credit',
        createdAt: now
      });
    }

    // Credit History Length
    if (report.score.factors.creditHistoryLength < 50) {
      tasks.push({
        id: uuidv4(),
        title: 'Build Credit History',
        description: 'Consider getting a secured credit card or becoming an authorized user on a family member\'s card to build credit history.',
        priority: 'medium',
        status: 'pending' as const,
        category: 'credit',
        createdAt: now
      });
    }

    // Outstanding Debt
    if (report.score.factors.outstandingDebt > 70) {
      tasks.push({
        id: uuidv4(),
        title: 'Reduce Outstanding Debt',
        description: 'Create a debt reduction plan focusing on high-interest debts first. Consider debt consolidation options.',
        priority: 'high',
        status: 'pending' as const,
        category: 'credit',
        createdAt: now
      });
    }

    // Bankruptcy Status
    if (report.snapshot.bankruptcyStatus) {
      tasks.push({
        id: uuidv4(),
        title: 'Address Bankruptcy Status',
        description: 'Consult with a financial advisor to create a plan for rebuilding your credit after bankruptcy.',
        priority: 'high',
        status: 'pending' as const,
        category: 'legal',
        createdAt: now
      });
    }

    // ID Verification
    if (!report.snapshot.idVerification) {
      tasks.push({
        id: uuidv4(),
        title: 'Complete ID Verification',
        description: 'Visit your nearest CTOS branch to complete your ID verification process.',
        priority: 'medium',
        status: 'pending' as const,
        category: 'general',
        createdAt: now
      });
    }

    // Save the generated tasks
    await this.saveTasks(tasks);
    return tasks;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = localStorage.getItem(this.STORAGE_KEY);
      if (!tasksJson) {
        // If no tasks exist, generate some default tasks
        const defaultTasks: Task[] = [
          {
            id: uuidv4(),
            title: 'Review Your Credit Report',
            description: 'Take time to review your credit report for accuracy and identify areas for improvement.',
            priority: 'high',
            status: 'pending' as const,
            category: 'credit',
            createdAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            title: 'Set Up Payment Reminders',
            description: 'Set up automatic payment reminders for all your credit accounts to avoid missing payments.',
            priority: 'medium',
            status: 'pending' as const,
            category: 'payment',
            createdAt: new Date().toISOString()
          }
        ];
        await this.saveTasks(defaultTasks);
        return defaultTasks;
      }
      
      const parsed = JSON.parse(tasksJson);
      if (Array.isArray(parsed)) {
        return parsed as Task[];
      } else if (parsed && Array.isArray(parsed.tasks)) {
        return parsed.tasks as Task[];
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      if (!Array.isArray(tasks)) {
        console.error('Invalid tasks data:', tasks);
        return;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  async toggleTaskStatus(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const updatedTasks = tasks.map((task: Task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === 'completed' ? ('pending' as const) : ('completed' as const)
          };
        }
        return task;
      });
      await this.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  }

  async updateTaskStatus(taskId: string, status: 'pending' | 'completed'): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const updatedTasks = tasks.map((task: Task) => {
        if (task.id === taskId) {
          return { ...task, status };
        }
        return task;
      });
      await this.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const updatedTasks = tasks.filter((task: Task) => task.id !== taskId);
      await this.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async clearTasks(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tasks:', error);
    }
  }
}
