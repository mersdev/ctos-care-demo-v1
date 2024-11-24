export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export const OPERATIONS_HOURS_MESSAGE = `## Thank you for your inquiry

To ensure we provide you with accurate and detailed assistance, we'll need to connect you with one of our **CTOS specialists**.

### Business Hours
- Monday to Friday
- 9:00 AM to 6:00 PM

Please feel free to reach out during our business hours, and we'll be happy to assist you further.

*Your satisfaction is our priority.*`;
