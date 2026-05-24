"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormWorkspaceHeader } from "~/components/layout/form-workspace-header";
import { FieldList } from "~/components/form-builder/field-list";
import { FormPreview } from "~/components/form-builder/form-preview";
import { Compass, Eye, Hammer, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

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

export default function FormEditPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  // States
  const [fields, setFields] = useState<FormField[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("public");
  const [slug, setSlug] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [previewTheme, setPreviewTheme] = useState("wano");

  // tRPC query to load form
  const {
    data: form,
    isLoading,
    error,
    refetch,
  } = trpc.form.getFormById.useQuery(
    { id: formId },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Initialize page details when fetched
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setStatus(form.status);
      setVisibility(form.visibility);
      setSlug(form.slug);
      setPreviewTheme(form.themeName || "wano");

      // Sort fields by order and set state
      const dbFields = (form.fields || []).map((f) => ({
        id: f.id,
        clientId: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder || "",
        required: f.required,
        order: f.order,
        validations: f.validations || undefined,
        options: f.options?.map((o) => ({
          label: o.label,
          value: o.value,
          order: o.order,
        })),
      }));
      setFields(dbFields.sort((a, b) => a.order - b.order));
      setIsDirty(false);
    }
  }, [form]);

  // Handle mutations
  const updateFormMutation = trpc.form.updateForm.useMutation();
  const saveFieldsMutation = trpc.form.saveFormFields.useMutation();

  const handleFieldsChange = (updatedFields: FormField[]) => {
    setFields(updatedFields);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // 1. Sync title & description if changed
      if (title !== form?.title || description !== form?.description) {
        await updateFormMutation.mutateAsync({
          id: formId,
          title,
          description: description || undefined,
          visibility: visibility as "public" | "unlisted",
        });
      }

      // 2. Sync fields
      // Format options properly
      const formattedFields = fields.map((f, idx) => ({
        id: f.id,
        type: f.type as any,
        label: f.label,
        placeholder: f.placeholder || undefined,
        required: f.required,
        order: idx,
        validations: f.validations,
        options: f.options?.map((o) => ({
          label: o.label,
          value: o.value,
          order: o.order,
        })),
      }));

      await saveFieldsMutation.mutateAsync({
        formId,
        fields: formattedFields,
      });

      toast.success("Course logged successfully! Navigator is sync'd.");
      setIsDirty(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save form details.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-wano-cream/40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-wano-gold" />
        <h3 className="font-heading text-lg font-bold text-wano-cream">Consulting Sea Charts...</h3>
        <p className="text-xs">Locating island credentials and equipping Devil Fruits.</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-ocean-mid/20 rounded-2xl border-2 border-dashed border-wano-crimson/30 max-w-xl mx-auto p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-wano-crimson/10 border border-wano-crimson/30 flex items-center justify-center text-wano-crimson mb-6">
          <Compass className="w-7 h-7 animate-pulse" />
        </div>
        <h3 className="font-heading text-lg font-bold text-wano-cream mb-2">Island Lost at Sea</h3>
        <p className="text-xs text-wano-cream/50 leading-relaxed mb-6">
          {error?.message ||
            "We could not trace this island route on the Grand Line map. Check credentials or navigate back."}
        </p>
        <Button onClick={() => router.push("/dashboard")} className="btn-crimson rounded-xl">
          Return to Cabin
        </Button>
      </div>
    );
  }

  const isSaving = updateFormMutation.isPending || saveFieldsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Shared Header Navigation */}
      <FormWorkspaceHeader
        formId={formId}
        title={title}
        status={status}
        slug={slug}
        activeTab="builder"
        onSave={handleSave}
        isSaving={isSaving}
        isDirty={isDirty}
      />

      {/* Editor & Preview Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mobile View Toggle Tabs */}
        <div className="lg:hidden flex items-center gap-1.5 p-1 bg-ocean-mid/60 border border-ocean-surface/30 rounded-xl w-full">
          <Button
            type="button"
            onClick={() => setMobileView("editor")}
            className={`flex-1 rounded-lg text-xs py-2.5 font-heading flex items-center justify-center gap-1.5 ${
              mobileView === "editor"
                ? "bg-wano-gold/10 text-wano-gold font-bold border border-wano-gold/20 shadow-none hover:bg-wano-gold/10"
                : "bg-transparent text-wano-cream/60 hover:text-wano-cream shadow-none"
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            Summon Fruits
          </Button>
          <Button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`flex-1 rounded-lg text-xs py-2.5 font-heading flex items-center justify-center gap-1.5 ${
              mobileView === "preview"
                ? "bg-wano-gold/10 text-wano-gold font-bold border border-wano-gold/20 shadow-none hover:bg-wano-gold/10"
                : "bg-transparent text-wano-cream/60 hover:text-wano-cream shadow-none"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Island Preview
          </Button>
        </div>

        {/* LEFT COLUMN: FIELD EDITOR */}
        <div
          className={`lg:col-span-5 space-y-6 bg-ocean-mid/40 p-5 rounded-2xl border border-ocean-surface/30 shadow-md ${
            mobileView === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Inline Title / Description Editing */}
          <div className="space-y-4 pb-4 border-b border-ocean-surface/20">
            <h4 className="text-[10px] text-wano-gold uppercase font-mono tracking-wider font-bold">
              Island Course Attributes
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  htmlFor="edit-title"
                  className="text-[10px] text-wano-cream/60 font-semibold font-heading uppercase tracking-wide"
                >
                  Course Title (Form Name)
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder=" Straw Hat Recruitment..."
                  className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs focus:border-wano-gold/45 focus:ring-0 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="edit-desc"
                  className="text-[10px] text-wano-cream/60 font-semibold font-heading uppercase tracking-wide"
                >
                  Log entry description
                </Label>
                <Input
                  id="edit-desc"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Record summary coordinates..."
                  className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs focus:border-wano-gold/45 focus:ring-0 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Fields list editor */}
          <FieldList fields={fields} onFieldsChange={handleFieldsChange} />

          {/* Quick Actions (Draft Mode check) */}
          {isDirty && (
            <div className="pt-2 flex items-center justify-between text-[10px] text-wano-cream/40 font-mono">
              <span>* Unsaved coordinates</span>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-crimson px-3 py-1.5 text-[10px] h-auto rounded-lg flex items-center gap-1.5"
              >
                <Save className="w-3 h-3" />
                Save Course
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL TIME PREVIEW */}
        <div
          className={`lg:col-span-7 sticky top-24 ${
            mobileView === "editor" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="bg-ocean-deep/20 rounded-2xl border border-wano-gold/10 p-2 shadow-inner relative overflow-hidden flex flex-col gap-2">
            {/* Quick Theme Preview Selector */}
            <div className="flex items-center justify-between px-3 py-2 bg-ocean-dark/40 border-b border-wano-gold/10 text-xs text-wano-cream/70 select-none z-20 relative rounded-t-xl">
              <span className="font-heading tracking-wider text-[10px] text-wano-gold uppercase flex items-center gap-1">
                🎨 Real-Time Theme Preview
              </span>
              <div className="flex items-center gap-2 bg-ocean-deep/60 p-0.5 rounded-lg border border-wano-gold/10">
                <button
                  onClick={() => setPreviewTheme("wano")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                    previewTheme === "wano"
                      ? "bg-wano-gold text-ocean-dark shadow-sm"
                      : "text-wano-cream/60 hover:text-wano-cream",
                  )}
                >
                  🌸 Wano
                </button>
                <button
                  onClick={() => setPreviewTheme("stark")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                    previewTheme === "stark"
                      ? "bg-[#00f0ff] text-[#070b13] shadow-sm"
                      : "text-wano-cream/60 hover:text-wano-cream",
                  )}
                >
                  🛡️ Stark
                </button>
                <button
                  onClick={() => setPreviewTheme("batman")}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                    previewTheme === "batman"
                      ? "bg-[#F5B921] text-[#0B0C10] shadow-sm"
                      : "text-wano-cream/60 hover:text-wano-cream",
                  )}
                >
                  🦇 Batman
                </button>
              </div>
            </div>

            {/* Swirl Pulse background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] fruit-swirl-subtle rounded-full opacity-5 blur-3xl pointer-events-none" />

            {/* Custom Form previewer component */}
            <FormPreview
              title={title}
              description={description}
              fields={fields}
              submitButtonText={form?.submitButtonText || "Send Your Response"}
              themeName={previewTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
