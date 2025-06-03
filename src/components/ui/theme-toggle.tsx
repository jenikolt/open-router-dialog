import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getCurrentIcon = () => {
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Выберите тему</DialogTitle>
          <DialogDescription>
            Настройте внешний вид приложения
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            className="justify-start"
            onClick={() => setTheme('light')}
          >
            <Sun className="mr-2 h-4 w-4" />
            Светлая тема
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="justify-start"
            onClick={() => setTheme('dark')}
          >
            <Moon className="mr-2 h-4 w-4" />
            Тёмная тема
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            className="justify-start"
            onClick={() => setTheme('system')}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Системная тема
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Alternative simple toggle button (just switches between light/dark)
export function SimpleThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      // If system, switch based on current appearance
      setTheme(isDark ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
} 