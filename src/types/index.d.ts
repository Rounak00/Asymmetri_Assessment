import { Message } from "ai";

// for APP main page
interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

//define custom Message manually to avoid SDK version conflicts
export interface CMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data" | "tool";
  content: string;
  toolInvocations?: ToolInvocation[];
}

// The shape of a Chat Session (from Database)
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
}

// Props for the Main Interface
export interface ChatInterfaceProps {
  key?: string;
  userName: string;
  initialChatId: string;
  history: ChatSession[];
  initialMessages?: CMessage[];
}

// tool data types (For the Cards)
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

export interface StockData {
  symbol: string;
  price: number;
  change: string;
}

export interface F1Data {
  raceName: string;
  circuit: string;
  date: string;
  time: string;
}

// define the shape of a tool Invocation
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  state?: "pending" | "result" | "error";
}