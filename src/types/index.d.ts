import { Message } from "ai";

// The shape of a Chat Session (from Database)
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
}

//Props for the Main Interface
export interface ChatInterfaceProps {
  userName: string;
  initialChatId: string;
  history: ChatSession[];
  initialMessages?: Message[];
}

//tool Data Types (For the Cards)
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