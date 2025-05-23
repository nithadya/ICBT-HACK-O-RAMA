
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

const data = [
  {
    name: "Mon",
    notes: 4,
    flashcards: 2,
    discussions: 1,
  },
  {
    name: "Tue",
    notes: 3,
    flashcards: 5,
    discussions: 2,
  },
  {
    name: "Wed",
    notes: 7,
    flashcards: 9,
    discussions: 3,
  },
  {
    name: "Thu",
    notes: 6,
    flashcards: 3,
    discussions: 4,
  },
  {
    name: "Fri",
    notes: 8,
    flashcards: 4,
    discussions: 1,
  },
  {
    name: "Sat",
    notes: 9,
    flashcards: 6,
    discussions: 5,
  },
  {
    name: "Sun",
    notes: 5,
    flashcards: 7,
    discussions: 0,
  },
];

const ActivityChart = () => {
  const { theme } = useTheme();
  
  const textColor = theme === "dark" ? "#CBD5E1" : "#475569";
  const gridColor = theme === "dark" ? "#334155" : "#E2E8F0";
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <YAxis 
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === "dark" ? "#1E293B" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#334155" : "#E2E8F0",
                  color: textColor
                }}
              />
              <Line
                type="monotone"
                dataKey="notes"
                stroke="#3B82F6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="flashcards"
                stroke="#8B5CF6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="discussions"
                stroke="#10B981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
