"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";

export type Token = {
  symbol: string;
  name: string;
  chain: string;
  color: string;
  icon?: string;
  address: string;
};

export const defaultTokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ether",
    chain: "Ethereum",
    color: "from-indigo-500 to-purple-500",
    icon: "/coin/eth.png",
    address: "0x0000000000000000000000000000000000000000",
  },
  {
    symbol: "USDT",
    name: "Tether",
    chain: "Ethereum",
    color: "from-emerald-400 to-teal-500",
    icon: "/coin/usdt.png",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    symbol: "CP",
    name: "CP",
    chain: "Ethereum",
    color: "from-emerald-400 to-teal-500",
    icon: "/coin/cp.png",
    address: "0x0000000000000000000000000000000000000000",
  },
];

type TokenSelectProps<T> = {
  selected: T;
  items: T[];
  onSelect: (item: T) => void;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getSublabel?: (item: T) => string | undefined;
  getIcon?: (item: T) => string | undefined;
  title?: string;
  searchPlaceholder?: string;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
  renderTrigger?: (item: T) => React.ReactNode;
  triggerAsChild?: boolean;
};

export function TokenSelect<T>({
  selected,
  items,
  onSelect,
  getKey,
  getLabel,
  getSublabel,
  getIcon,
  title = "Select",
  searchPlaceholder = "Search",
  className,
  contentClassName,
  renderTrigger,
  triggerAsChild = false,
}: TokenSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedKey = getKey(selected);
  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => {
      const label = getLabel(item).toLowerCase();
      const sublabel = getSublabel?.(item)?.toLowerCase();
      return label.includes(normalized) || (sublabel?.includes(normalized) ?? false);
    });
  }, [getLabel, getSublabel, items, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerAsChild ? (
          renderTrigger ? (
            renderTrigger(selected)
          ) : (
            <SelectPill
              item={selected}
              getLabel={getLabel}
              getIcon={getIcon}
            />
          )
        ) : (
          <Button
            variant="outline"
            className={cn(
              "flex min-w-[120px] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left shadow-sm backdrop-blur transition hover:border-primary/40 dark:border-white/10 dark:bg-white/5",
              className
            )}
          >
            {renderTrigger ? (
              renderTrigger(selected)
            ) : (
              <SelectPill
                item={selected}
                getLabel={getLabel}
                getIcon={getIcon}
              />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "w-[92vw] max-w-md rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl backdrop-blur sm:max-w-lg",
          contentClassName
        )}
      >
        <DialogTitle className="text-2xl font-semibold text-white">{title}</DialogTitle>
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 rounded-full border-white/10 bg-white/5 px-5 text-base text-white placeholder:text-white/40 focus-visible:ring-0"
        />
        <div className="space-y-3">
          {options.map((item) => {
            const key = getKey(item);
            const isSelected = key === selectedKey;
            const label = getLabel(item);
            const sublabel = getSublabel?.(item);
            return (
            <button
              key={key}
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-primary/30 hover:bg-white/10",
                isSelected && "bg-white/10"
              )}
            >
              <SelectAvatar
                label={label}
                icon={getIcon?.(item)}
              />
              <div className="flex flex-1 flex-col">
                <span className="text-base font-semibold text-white">{label}</span>
                {sublabel ? (
                  <span className="text-xs text-white/50">{sublabel}</span>
                ) : null}
              </div>
              {isSelected ? <Check className="size-5 text-emerald-400" /> : null}
            </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SelectPill<T>({
  item,
  getLabel,
  getIcon,
}: {
  item: T;
  getLabel: (item: T) => string;
  getIcon?: (item: T) => string | undefined;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <SelectAvatar
        label={getLabel(item)}
        icon={getIcon?.(item)}
        sizeClassName="size-7 text-[10px]"
      />
      <span className="text-sm font-semibold">{getLabel(item)}</span>
    </div>
  );
}

function SelectAvatar({
  label,
  icon,
  text,
  color,
  sizeClassName = "size-9 text-xs",
}: {
  label: string;
  icon?: string;
  text?: string;
  color?: string;
  sizeClassName?: string;
}) {
  if (icon) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-white/10 shadow-inner shadow-black/20",
          sizeClassName
        )}
      >
        <Image src={icon} alt={label} width={36} height={36} />
      </span>
    );
  }

  const avatarText = text ?? label.slice(0, 3).toUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white shadow-inner shadow-black/20",
        sizeClassName,
        "bg-gradient-to-br",
        color ?? "from-slate-500 to-slate-700"
      )}
    >
      {avatarText}
    </span>
  );
}
