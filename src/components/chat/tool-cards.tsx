"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, TrendingUp, Trophy } from "lucide-react";
import { WeatherData, StockData, F1Data } from "@/types";

//Weather Card
export function WeatherCard({ data }: { data: WeatherData  }) {
  return (
    <Card className="w-64 bg-blue-50 border-blue-200 mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
          <CloudSun className="h-4 w-4" /> Weather in {data?.location}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data?.temperature}°F</div>
        <div className="text-sm text-gray-500">{data?.condition} • Humidity: {data?.humidity}%</div>
      </CardContent>
    </Card>
  );
}

//Stock Card
export function StockCard({ data }: { data: StockData  }) {
  return (
    <Card className="w-64 bg-green-50 border-green-200 mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
          <TrendingUp className="h-4 w-4" /> {data?.symbol} Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${data?.price}</div>
        <div className="text-sm text-green-600 font-medium">{data?.change} Today</div>
      </CardContent>
    </Card>
  );
}

//F1 Card
export function F1Card({ data }: { data: F1Data }) {
  return (
    <Card className="w-64 bg-red-50 border-red-200 mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
          <Trophy className="h-4 w-4" /> Next Race
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold">{data?.raceName}</div>
        <div className="text-sm text-gray-600">{data?.circuit}</div>
        <div className="text-xs text-gray-400 mt-1">{data?.date} @ {data?.time}</div>
      </CardContent>
    </Card>
  );
}