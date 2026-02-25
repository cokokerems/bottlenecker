import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetOverlay, SheetPortal } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import ResearchChat from "@/components/ResearchChat";
import * as SheetPrimitive from "@radix-ui/react-dialog";

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
      <SheetPortal>
        {/* No overlay — no dark background shadow */}
        <SheetPrimitive.Content className="fixed z-50 inset-y-0 right-0 h-full w-[420px] sm:w-[480px] border-l bg-background shadow-lg p-0 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500">
          <SheetHeader className="px-4 py-3 border-b border-border/50">
            <SheetTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              AI Research Assistant
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ResearchChat compact />
          </div>
          <SheetPrimitive.Close className="absolute right-4 top-3 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}
