import { z } from "zod";
import { tool } from "ai";

// Weather Tool
export const weatherTool = tool({
  description: "Get the current weather for a specific location",
  parameters: z.object({
    location: z.string().describe("The city name, e.g. London, New York"),
  }),
  execute: async ({ location }: { location: string }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
      };
    } catch (e) {
      return { location, temperature: 0, condition: "Unknown Location", humidity: 0 };
    }
  },
});

// Stock Tool
export const stockTool = tool({
  description: "Get the current stock price for a symbol",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol, e.g. AAPL, MSFT, IBM"),
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();
      const quote = data["Global Quote"];
      if (!quote || !quote["05. price"]) throw new Error("No Quote");
      return {
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]).toFixed(2),
        change: quote["10. change percent"],
      };
    } catch (e) {
      return { symbol: symbol.toUpperCase(), price: 0, change: "N/A (Rate Limit or Invalid)" };
    }
  },
});

// F1 Tool (using SportMonk)
export const f1Tool = tool({
  description: "Get the next upcoming Formula 1 race",
  parameters: z.object({}),
  execute: async () => {
    const apiKey = process.env.SPORTMONK_API_KEY;
    // console.log("SportMonk F1 Tool Started...");

    try {
      //fetch Races - Including Circuit details
      const response = await fetch(
        // `https://api.sportmonk.com/v3/f1/races?api_token=${apiKey}&include=circuit`,
        `https://api.openf1.org/v1/sessions?country_name=Belgium&session_name=Sprint&year=2025`,
        { next: { revalidate: 3600 } } // cache for 1 hour
      );

      if (!response.ok) throw new Error("SportMonk API Error");

      const json = await response.json();
      const races = json.data;

      if (!races || races.length === 0) throw new Error("No races found");

      // looking the NEXT race (Future Date)
      const now = new Date();
      
      // Sort races by date just in case
      const sortedRaces = races.sort((a: any, b: any) => 
        new Date(a.starting_at).getTime() - new Date(b.starting_at).getTime()
      );

      const nextRace = sortedRaces.find((race: any) => new Date(race.starting_at) > now);// Find first race where starting_at > now

      if (!nextRace) {
        // If no future races found, assume Season Finished
        return {
          raceName: "Season Finished",
          circuit: "See you next season!",
          date: new Date().getFullYear().toString(),
          time: "N/A",
        };
      }

      // console.log(`Found Next Race: ${nextRace.name}`);
      // SportMonk date format is usually "YYYY-MM-DD HH:MM:SS"
      const dateObj = new Date(nextRace.starting_at);
      const dateStr = dateObj.toISOString().split('T')[0];
      const timeStr = dateObj.toISOString().split('T')[1].slice(0, 5) + " UTC";

      return {
        raceName: nextRace.name,
        circuit: nextRace.circuit?.name || "Unknown Circuit",
        date: dateStr,
        time: timeStr,
      };

    } catch (error) {
      // console.error("F1 Tool Failed:", error);
      return {
        raceName: "Unknown Race",
        circuit: "API Error",
        date: "N/A",
        time: "N/A",
      };
    }
  },
});