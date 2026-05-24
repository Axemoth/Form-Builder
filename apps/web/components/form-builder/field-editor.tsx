"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check, SwitchCamera } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";

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

interface FieldEditorProps {
  field: {
    id?: string;
    clientId?: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    order: number;
    options?: FieldOption[];
    validations?: FieldValidations;
  };
  onChange: (updatedField: any) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  const [label, setLabel] = useState(field.label);
  const [placeholder, setPlaceholder] = useState(field.placeholder || "");
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState<FieldOption[]>(field.options || []);

  useEffect(() => {
    setLabel(field.label);
    setPlaceholder(field.placeholder || "");
    setRequired(field.required);
    setOptions(field.options || []);
  }, [field.id, field.clientId]);

  const slugifyOptionValue = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleFieldUpdate = (updates: Partial<typeof field>) => {
    onChange({
      ...field,
      ...updates,
    });
  };

  const handleAddOption = () => {
    const nextOrder = options.length;
    const newOpt = {
      label: `Option ${nextOrder + 1}`,
      value: `option-${nextOrder + 1}`,
      order: nextOrder,
    };
    const updated = [...options, newOpt];
    setOptions(updated);
    handleFieldUpdate({ options: updated });
  };

  const handleRemoveOption = (indexToRemove: number) => {
    const updated = options
      .filter((_, i) => i !== indexToRemove)
      .map((opt, i) => ({ ...opt, order: i }));
    setOptions(updated);
    handleFieldUpdate({ options: updated });
  };

  const handleOptionChange = (index: number, key: keyof FieldOption, val: string) => {
    const updated = options.map((opt, i) => {
      if (i === index) {
        return {
          ...opt,
          [key]: val,
          value: key === "label" ? slugifyOptionValue(val) : val,
        };
      }
      return opt;
    });
    setOptions(updated);
    handleFieldUpdate({ options: updated });
  };

  const hasOptions = field.type === "single_select" || field.type === "multi_select";

  return (
    <div className="p-5 bg-ocean-surface/30 rounded-xl border border-ocean-surface flex flex-col gap-5 mt-2 animate-scale-in">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Label Config */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-wano-gold/80 font-heading">
            Question Label <span className="text-wano-crimson font-black">*</span>
          </Label>
          <Input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              handleFieldUpdate({ label: e.target.value });
            }}
            placeholder="e.g. Rate your Swordsmanship skill"
            className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs px-3 py-1.5 focus:border-wano-gold/30 rounded-lg"
          />
        </div>

        {/* Placeholder Config */}
        {field.type !== "rating" && field.type !== "date" && field.type !== "checkbox" && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-wano-gold/80 font-heading">
              Placeholder Guide
            </Label>
            <Input
              value={placeholder}
              onChange={(e) => {
                setPlaceholder(e.target.value);
                handleFieldUpdate({ placeholder: e.target.value });
              }}
              placeholder="e.g. Enter a skill rating from 1 to 5"
              className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs px-3 py-1.5 focus:border-wano-gold/30 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Options Builder (Dropdown types only) */}
      {hasOptions && (
        <div className="space-y-2 border-t border-ocean-surface/40 pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-wano-gold/80 font-heading">
              Swirl Choices (Options)
            </Label>
            <Button
              type="button"
              onClick={handleAddOption}
              variant="outline"
              size="sm"
              className="border-wano-gold/20 hover:border-wano-gold text-[10px] text-wano-gold h-7 rounded-lg flex items-center gap-1 hover:bg-wano-gold/5"
            >
              <Plus className="w-3 h-3" />
              Add Option
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto axe-scrollbar pr-1">
            {options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <Input
                  value={opt.label}
                  onChange={(e) => handleOptionChange(oIdx, "label", e.target.value)}
                  placeholder={`Option ${oIdx + 1}`}
                  className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs px-3 py-1.5 focus:border-wano-gold/30 rounded-lg flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(oIdx)}
                  className="w-8 h-8 rounded-lg text-wano-crimson hover:bg-wano-crimson/10 border border-transparent hover:border-wano-crimson/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

            {options.length === 0 && (
              <p className="text-[11px] text-wano-cream/40 italic">
                No options formulated. Tap "Add Option" to formulate select paths.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Row: Field Constraints (Required, Delete) */}
      <div className="flex items-center justify-between border-t border-ocean-surface/40 pt-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`required-${field.id || field.clientId || field.order}`}
              checked={required}
              onCheckedChange={(checked) => {
                const req = !!checked;
                setRequired(req);
                handleFieldUpdate({ required: req });
              }}
              className="border-ocean-surface data-[state=checked]:bg-wano-crimson"
            />
            <Label
              htmlFor={`required-${field.id || field.clientId || field.order}`}
              className="text-xs text-wano-cream/70 select-none cursor-pointer"
            >
              Required Response
            </Label>
          </div>
        </div>

        <Button
          type="button"
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-wano-crimson hover:bg-wano-crimson/10 hover:text-wano-crimson-light rounded-lg flex items-center gap-1 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaporize Field
        </Button>
      </div>
    </div>
  );
}
