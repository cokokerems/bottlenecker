import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import CompanyDetail from "./pages/CompanyDetail";
import SupplyChainGraph from "./pages/SupplyChainGraph";
import BottleneckAnalysis from "./pages/BottleneckAnalysis";
import Notes from "./pages/Notes";
import TradeLog from "./pages/TradeLog";
import News from "./pages/News";
import Research from "./pages/Research";
import StockComparison from "./pages/StockComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
            <Route path="/supply-chain" element={<SupplyChainGraph />} />
            <Route path="/bottlenecks" element={<BottleneckAnalysis />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/trade-log" element={<TradeLog />} />
            <Route path="/news" element={<News />} />
            <Route path="/research" element={<Research />} />
            <Route path="/compare" element={<StockComparison />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
