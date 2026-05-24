"use client";

import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  List,
  CheckSquare,
  Star,
  Calendar,
  Layers,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Field types supported by database:
// 'short_text' | 'long_text' | 'email' | 'number' | 'single_select' | 'multi_select' | 'checkbox' | 'rating' | 'date'

interface FieldTypeIconProps {
  type: string;
  className?: string;
}

export function FieldTypeIcon({ type, className }: FieldTypeIconProps) {
  const config: Record<
    string,
    {
      label: string;
      fruitName: string;
      colorClass: string;
      icon: typeof Type;
      description: string;
    }
  > = {
    short_text: {
      label: "Short Text",
      fruitName: "Gomu Gomu Fruit",
      colorClass: "bg-purple-600/20 text-purple-400 border-purple-500/30",
      icon: Type,
      description: "Stretching text inputs",
    },
    long_text: {
      label: "Long Text",
      fruitName: "Mera Mera Fruit",
      colorClass: "bg-orange-600/20 text-orange-400 border-orange-500/30",
      icon: AlignLeft,
      description: "Fiery expanding inputs",
    },
    email: {
      label: "Email",
      fruitName: "Den Den Mushi",
      colorClass: "bg-rose-600/20 text-rose-400 border-rose-500/30",
      icon: Mail,
      description: "Communication snail",
    },
    number: {
      label: "Number",
      fruitName: "Beri Beri Fruit",
      colorClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: Hash,
      description: "Split counting berries",
    },
    single_select: {
      label: "Single Select",
      fruitName: "Hana Hana Fruit",
      colorClass: "bg-pink-600/20 text-pink-400 border-pink-500/30",
      icon: List,
      description: "Choose a single bloom",
    },
    multi_select: {
      label: "Multi Select",
      fruitName: "Kage Kage Fruit",
      colorClass: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
      icon: Layers,
      description: "Summon multiple shadows",
    },
    checkbox: {
      label: "Checkbox",
      fruitName: "Sube Sube Fruit",
      colorClass: "bg-teal-600/20 text-teal-400 border-teal-500/30",
      icon: CheckSquare,
      description: "Slippery smooth switches",
    },
    rating: {
      label: "Rating",
      fruitName: "Gura Gura Fruit",
      colorClass: "bg-red-600/20 text-red-400 border-red-500/30",
      icon: Star,
      description: "Epic rating vibrations",
    },
    date: {
      label: "Date",
      fruitName: "Toki Toki Fruit",
      colorClass: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
      icon: Calendar,
      description: "Voyage time travel",
    },
  };

  const item = config[type] || {
    label: "Standard",
    fruitName: "Smile Fruit",
    colorClass: "bg-ocean-surface text-wano-cream/70 border-ocean-surface",
    icon: Type,
    description: "Basic items",
  };

  const IconComponent = item.icon;

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center border font-semibold shrink-0 group relative cursor-help transition-all duration-300",
        item.colorClass,
        className,
      )}
      title={`${item.label} (Power: ${item.fruitName}) - ${item.description}`}
    >
      {/* Mini swirl pulse element */}
      <span className="absolute inset-[2px] rounded-lg fruit-swirl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      <IconComponent className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110 duration-300" />
    </div>
  );
}
