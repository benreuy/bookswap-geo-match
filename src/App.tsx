
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Wishlist from "./pages/Wishlist";
import FindBooks from "./pages/FindBooks";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/library" element={<Layout><Library /></Layout>} />
            <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
            <Route path="/find-books" element={<Layout><FindBooks /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
