import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Settings, Loader2, X } from 'lucide-react';
import { useUIStateStore } from '@/stores/uiStateStore';
import { useAISettingsStore } from '@/stores/aiSettingsStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SimpleThemeToggle } from "@/components/ui/theme-toggle";

const AppLayout: React.FC = () => {
  const globalLoading = useUIStateStore(state => state.globalLoading);
  const globalError = useUIStateStore(state => state.globalError);
  const setGlobalError = useUIStateStore(state => state.setGlobalError);
  const loadSettings = useAISettingsStore(state => state.loadSettings);

  // Load AI settings when app starts
  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="h-screen flex flex-col relative">
      {globalLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      {globalError && (
        <div className="fixed top-4 right-4 z-50 w-auto max-w-md">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-1 right-1 h-6 w-6 p-0" 
              onClick={() => setGlobalError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}

      <header className="bg-background text-foreground shadow-md">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-primary transition-colors">
            OpenRouter Dialog
          </Link>
          <div className="flex items-center gap-2">
            <SimpleThemeToggle />
            <Link 
              to="/settings" 
              className="hover:text-primary p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Settings"
            >
              <Settings size={24} />
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
      <footer className="bg-background text-muted-foreground py-4 text-center text-sm">
        © {new Date().getFullYear()} OpenRouter Dialog App
      </footer>
    </div>
  );
};

export default AppLayout; 