"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ActionButton({
  caption,
  action,
  className = "w-full",
  variant = "default",
  size = "default",
}: {
  caption: string;
  action: () => Promise<{ success: boolean; message: string }>;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      className={cn("rounded-full", className)}
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await action();
          toast[res.success ? "success" : "error"](res.message);
        })
      }
    >
      {isPending ? "processing..." : caption}
    </Button>
  );
}
