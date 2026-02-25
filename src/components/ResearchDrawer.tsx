import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import ResearchChat from "@/components/ResearchChat";

export default function ResearchDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 rounded-full border-primary/30 hover:bg-primary/10"
          title="AI Research"
        >
          <Bot className="h-4 w-4 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border/50">
          <SheetTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            AI Research Assistant
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ResearchChat compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
