import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Box, AlertTriangle, Tag, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function StatsOverview() {
  const { t } = useLanguage();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  const statCards = [
    {
      title: t("stats.totalComponents"),
      value: stats?.totalComponents || 0,
      icon: Box,
      color: "blue",
      testId: "stat-total-components"
    },
    {
      title: t("stats.lowStockItems"), 
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "amber",
      testId: "stat-low-stock"
    },
    {
      title: t("stats.categories"),
      value: stats?.categories || 0, 
      icon: Tag,
      color: "green",
      testId: "stat-categories"
    },
    {
      title: t("stats.totalQuantity"),
      value: stats?.totalQuantity || 0,
      icon: DollarSign,
      color: "purple",
      testId: "stat-total-quantity"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const colorClass = {
          blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
          amber: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400", 
          green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
          purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        }[stat.color];

        return (
          <Card key={stat.title} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`} data-testid={stat.testId}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
