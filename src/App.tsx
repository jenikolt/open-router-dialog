import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from '@/components/layouts/AppLayout';
import MainPage from '@/pages/MainPage';
import SettingsPage from '@/pages/SettingsPage';
import './App.css'; // You might want to keep or remove this depending on your styling needs

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<MainPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* You can add a 404 Not Found route here later if needed */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
      <Toaster richColors />
    </BrowserRouter>
  );
}

export default App;
