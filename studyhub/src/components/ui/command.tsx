"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentProps<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn("flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    />
  )
);
Command.displayName = "Command";

function CommandDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[12vh] z-50 w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-[var(--surface-overlay)] shadow-2xl data-[state=open]:animate-scale-in">
          <DialogPrimitive.Title className="sr-only">Befehlspalette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Search StudyHub or run a command</DialogPrimitive.Description>
          <Command shouldFilter loop>
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, React.ComponentProps<typeof CommandPrimitive.Input>>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center gap-2.5 border-b border-border px-4">
      <Search className="size-4 shrink-0 text-ink-3" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-md bg-transparent py-3 t-body text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentProps<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List ref={ref} className={cn("max-h-[60vh] overflow-y-auto overflow-x-hidden p-2", className)} {...props} />
  )
);
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentProps<typeof CommandPrimitive.Empty>>(
  (props, ref) => <CommandPrimitive.Empty ref={ref} className="py-10 text-center t-callout text-ink-3" {...props} />
);
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentProps<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn("overflow-hidden p-1 text-ink", className)}
      {...props}
    />
  )
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentProps<typeof CommandPrimitive.Separator>>(
  ({ className, ...props }, ref) => <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
);
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentProps<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 t-callout text-ink-2 outline-none transition-colors data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 [&_svg]:size-[15px] [&_svg]:shrink-0 [&_svg]:text-ink-3",
        className
      )}
      {...props}
    />
  )
);
CommandItem.displayName = "CommandItem";

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto font-mono t-caption tracking-widest text-ink-3", className)} {...props} />;
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
