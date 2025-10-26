import { createConsumer, Subscription } from '@rails/actioncable';

interface TaskMessage {
  action: 'create' | 'update' | 'destroy';
  task?: any;
  id?: number;
}

class WebSocketService {
  private consumer: ReturnType<typeof createConsumer>;
  private subscription: Subscription | null = null;
  private listeners: ((message: TaskMessage) => void)[] = [];
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.consumer = createConsumer(`${this.baseURL}/cable`);
  }

  subscribe(onMessage: (message: TaskMessage) => void): void {
    this.listeners.push(onMessage);

    if (!this.subscription) {
      this.subscription = this.consumer.subscriptions.create(
        { channel: 'TasksChannel' },
        {
          connected: () => {
            console.log('Connected to TasksChannel');
          },
          
          disconnected: () => {
            console.log('Disconnected from TasksChannel');
          },
          
          received: (data: TaskMessage) => {
            this.listeners.forEach((listener) => listener(data));
          },
        }
      );
    }
  }

  unsubscribe(listener: (message: TaskMessage) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);

    if (this.listeners.length === 0 && this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.listeners = [];
  }
}

export const webSocketService = new WebSocketService();
