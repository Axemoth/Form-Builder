"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Plus, Compass, ChevronRight, HelpCircle, Eye } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { FieldTypeIcon } from "~/components/form-builder/field-type-icon";
import { FieldEditor } from "~/components/form-builder/field-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface FieldOption {
  label: string;
  value: string;
  order: number;
}

interface FieldValidations {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  logic?: {
    fieldId: string;
    value: string | number | boolean;
  };
}

interface FormField {
  id?: string;
  clientId?: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: FieldOption[];
  validations?: FieldValidations;
}

interface FieldListProps {
  fields: FormField[];
  onFieldsChange: (updatedFields: FormField[]) => void;
}

const FIELD_TYPES = [
  {
    type: "short_text",
    name: "Short Text Field",
    secondary: "Gomu Gomu Input",
    desc: "Single-line short text",
  },
  {
    type: "long_text",
    name: "Long Text Area",
    secondary: "Mera Mera Scroll",
    desc: "Detailed multi-line logs",
  },
  {
    type: "email",
    name: "Email Address",
    secondary: "Den Den Receptor",
    desc: "Valid email address capture",
  },
  {
    type: "number",
    name: "Numeric Field",
    secondary: "Beri Beri Count",
    desc: "Quantities, counts, or values",
  },
  {
    type: "single_select",
    name: "Single Select Bloom",
    secondary: "Hana Hana Choices",
    desc: "Choose one from choices list",
  },
  {
    type: "multi_select",
    name: "Multi Select Shadows",
    secondary: "Kage Kage Shadows",
    desc: "Choose multiple from options",
  },
  {
    type: "checkbox",
    name: "Switch Toggle",
    secondary: "Sube Sube Smooth",
    desc: "Simple binary yes/no toggle",
  },
  {
    type: "rating",
    name: "Rating Scale",
    secondary: "Gura Gura Stars",
    desc: "Visual star scale array",
  },
  {
    type: "date",
    name: "Date Picker",
    secondary: "Toki Toki Calendar",
    desc: "Calendar date input select",
  },
];

export function FieldList({ fields, onFieldsChange }: FieldListProps) {
  const [expandedFieldKey, setExpandedFieldKey] = useState<string | null>(null);

  const createClientId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `field-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const getFieldKey = (field: FormField, index: number) =>
    field.id || field.clientId || `field-${index}`;

  const handleAddField = (type: string) => {
    const nextOrder = fields.length;
    const fieldTypeMeta = FIELD_TYPES.find((f) => f.type === type);
    const fruitCore = fieldTypeMeta?.secondary ? fieldTypeMeta.secondary.split(" ")[0] : "Query";
    const clientId = createClientId();

    const newField: FormField = {
      clientId,
      type,
      label: `What is your ${fruitCore}?`,
      placeholder: "",
      required: false,
      order: nextOrder,
      options:
        type === "single_select" || type === "multi_select"
          ? [
              { label: "Straw Hat Crew", value: "straw-hat", order: 0 },
              { label: "Beast Pirates", value: "beast-pirate", order: 1 },
            ]
          : undefined,
    };

    const updated = [...fields, newField];
    onFieldsChange(updated);
    // Auto expand newly added field
    setExpandedFieldKey(clientId);
  };

  const handleFieldChange = (index: number, updatedField: FormField) => {
    const updated = fields.map((f, i) => (i === index ? updatedField : f));
    onFieldsChange(updated);
  };

  const handleDeleteField = (index: number) => {
    const deletedFieldKey = fields[index] ? getFieldKey(fields[index], index) : null;
    const updated = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })); // Reset order index sequential
    onFieldsChange(updated);
    if (expandedFieldKey === deletedFieldKey) {
      setExpandedFieldKey(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...fields];

    const fieldA = updated[index];
    const fieldB = updated[targetIndex];
    if (!fieldA || !fieldB) return;

    // Swap orders
    const tempOrder = fieldA.order;
    fieldA.order = fieldB.order;
    fieldB.order = tempOrder;

    // Swap index position
    updated[index] = fieldB;
    updated[targetIndex] = fieldA;

    onFieldsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 border-b border-ocean-surface/30 pb-3">
        <h3 className="font-heading text-sm uppercase tracking-wider text-wano-gold font-bold flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          Devil Fruit Inventory ({fields.length})
        </h3>
        <span className="text-[10px] text-wano-cream/40 font-mono">
          Manual Reordering course active
        </span>
      </div>

      {/* Field Cards render loops */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 axe-scrollbar">
        {fields.map((field, idx) => {
          const fieldKey = getFieldKey(field, idx);
          const isExpanded = expandedFieldKey === fieldKey;
          const fieldTypeMeta = FIELD_TYPES.find((f) => f.type === field.type);

          return (
            <div
              key={fieldKey}
              className={cn(
                "rounded-xl border transition-all duration-300 p-3 bg-ocean-mid/60 border-ocean-surface/60 shadow-md",
                isExpanded && "border-wano-gold/30 bg-ocean-mid/90",
              )}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between gap-3">
                {/* Left: Icon & Label */}
                <div
                  className="flex-1 flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedFieldKey(isExpanded ? null : fieldKey)}
                >
                  <FieldTypeIcon type={field.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-wano-cream leading-tight truncate">
                      {field.label || "Configure query label..."}
                    </div>
                    <div className="text-[9px] text-wano-cream/40 font-mono mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
                      <span>{field.type.replace("_", " ")}</span>
                      {fieldTypeMeta && (
                        <>
                          <span>•</span>
                          <span className="text-wano-gold/80">{fieldTypeMeta.secondary}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: sorting up / down buttons & expand indicators */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="w-7 h-7 rounded-lg text-wano-cream/40 hover:text-wano-gold hover:bg-ocean-surface disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === fields.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="w-7 h-7 rounded-lg text-wano-cream/40 hover:text-wano-gold hover:bg-ocean-surface disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div className="h-4 w-[1px] bg-ocean-surface/60 mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedFieldKey(isExpanded ? null : fieldKey)}
                    className="w-7 h-7 rounded-lg text-wano-cream/40 hover:text-wano-cream hover:bg-ocean-surface"
                  >
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isExpanded && "rotate-90 text-wano-gold",
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Expansions form editor */}
              {isExpanded && (
                <FieldEditor
                  field={field}
                  onChange={(updated) => handleFieldChange(idx, updated)}
                  onDelete={() => handleDeleteField(idx)}
                />
              )}
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-ocean-mid/10 rounded-xl border border-dashed border-ocean-surface/50 p-6 text-center">
            <HelpCircle className="w-8 h-8 text-wano-cream/30 mb-3" />
            <p className="text-xs text-wano-cream/50 leading-relaxed max-w-[240px]">
              No powers equipped. Summon your first Devil Fruit question block using the selection
              dropdown.
            </p>
          </div>
        )}
      </div>

      {/* Add Field Button - Devil Fruit summon list */}
      <div className="pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full btn-crimson rounded-xl py-6 font-semibold flex items-center justify-center gap-2 text-xs shadow-md">
              <Plus className="w-4 h-4" />
              Discover a New Devil Fruit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-[280px] max-h-[350px] overflow-y-auto glass-panel border-ocean-surface text-wano-cream p-1.5 space-y-0.5 axe-scrollbar z-50"
          >
            {FIELD_TYPES.map((type) => (
              <DropdownMenuItem
                key={type.type}
                onClick={() => handleAddField(type.type)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-ocean-surface/60"
              >
                <FieldTypeIcon type={type.type} className="w-7 h-7" />
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-wano-cream truncate">
                      {type.name}
                    </span>
                    <span className="text-[8px] font-mono text-wano-gold/80 px-1 py-0.5 bg-wano-gold/10 border border-wano-gold/20 rounded shrink-0">
                      {type.secondary}
                    </span>
                  </div>
                  <div className="text-[9px] text-wano-cream/40 truncate leading-none mt-1">
                    {type.desc}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
