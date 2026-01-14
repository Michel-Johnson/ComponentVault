import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, User, Microchip, Moon, Sun, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const { data: lowStockComponents = [] } = useQuery({
    queryKey: ["/api/components/alerts/low-stock"],
    queryFn: async () => {
      const response = await fetch("/api/components/alerts/low-stock");
      if (!response.ok) throw new Error("Failed to fetch low stock components");
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Microchip className="text-primary-foreground text-sm" />
                </div>
                <h1 className="text-xl font-bold text-foreground">{t("app.name")}</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Button 
                  variant={location === "/" || location === "/inventory" ? "default" : "ghost"}
                  size="sm" 
                  data-testid="nav-inventory"
                  onClick={() => setLocation("/inventory")}
                >
                  {t("nav.inventory")}
                </Button>
                <Button 
                  variant={location === "/reports" ? "default" : "ghost"}
                  size="sm" 
                  className={location === "/reports" ? "" : "text-muted-foreground hover:text-foreground"}
                  data-testid="nav-reports"
                  onClick={() => setLocation("/reports")}
                >
                  {t("nav.reports")}
                </Button>
                <Button 
                  variant={location === "/settings" ? "default" : "ghost"}
                  size="sm" 
                  className={location === "/settings" ? "" : "text-muted-foreground hover:text-foreground"}
                  data-testid="nav-settings"
                  onClick={() => setLocation("/settings")}
                >
                  {t("nav.settings")}
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    English {language === "en" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("zh")}>
                    中文 {language === "zh" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Switcher */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
                className="hidden md:flex"
              >
                {actualTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <div className="relative hidden md:block">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {lowStockComponents.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="user-menu">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
