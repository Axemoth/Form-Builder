import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Anchor, CheckCircle2, Compass, Loader2, Sparkles, Shield } from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { BatLogo } from "~/components/ui/bat-logo";
import {
  ThemedInput,
  ThemedTextarea,
  ThemedSelect,
  ThemedMultiSelect,
  ThemedCheckbox,
  ThemedRating,
  ThemedDate,
} from "./themed-inputs";

// Option interface for select dropdowns
interface Option {
  id?: string;
  label: string;
  value: string;
}

// Field interface from backend
interface FormField {
  id: string;
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "checkbox"
    | "rating"
    | "date"
    | string;
  label: string;
  placeholder?: string | null;
  required: boolean;
  order: number;
  options?: Option[];
  validations?: any;
}

interface FormRendererProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    submitButtonText: string | null;
    successMessage: string | null;
    redirectUrl: string | null;
    requireEmail: boolean;
    fields: FormField[];
    themeName?: string;
    notifyRespondent?: boolean;
    isMultiPage?: boolean;
  };
  password?: string;
}

export function FormRenderer({ form, password }: FormRendererProps) {
  const themeName = form.themeName || "wano";
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successResponseId, setSuccessResponseId] = useState("");
  const [completionTimeStart] = useState(() => Date.now());
  const [currentStep, setCurrentStep] = useState(0);

  const submitMutation = trpc.form.submitFormResponse.useMutation();

  // 1. DYNAMIC SCHEMAS COMPILATION PIPELINE
  // We formulate a dynamic Zod validator for our form answers
  const formSchemaShape: Record<string, z.ZodTypeAny> = {};

  // Email collector field (if required by Captain's ship log)
  if (form.requireEmail) {
    formSchemaShape["respondentEmail"] = z.string().email("Please declare a valid email address.");
  } else {
    formSchemaShape["respondentEmail"] = z
      .string()
      .email("Invalid email address.")
      .optional()
      .or(z.literal(""));
  }

  // Register email copy checkbox choice
  formSchemaShape["emailMeCopy"] = z.boolean().default(false);

  // Map each individual question field
  form.fields.forEach((field) => {
    let schema: z.ZodTypeAny = z.any();

    switch (field.type) {
      case "short_text":
      case "long_text": {
        let txtSchema: z.ZodTypeAny = z.string();

        // Add dynamic bounds constraints
        const bounds = field.validations;
        if (bounds) {
          if (typeof bounds.minLength === "number") {
            txtSchema = (txtSchema as z.ZodString).min(
              bounds.minLength,
              `Answer must be at least ${bounds.minLength} characters.`,
            );
          }
          if (typeof bounds.maxLength === "number") {
            txtSchema = (txtSchema as z.ZodString).max(
              bounds.maxLength,
              `Answer cannot exceed ${bounds.maxLength} characters.`,
            );
          }
        }

        if (field.required) {
          txtSchema = (txtSchema as z.ZodString).min(1, "This question requires an answer.");
        } else {
          txtSchema = txtSchema.optional().or(z.literal(""));
        }
        schema = txtSchema;
        break;
      }

      case "email": {
        let emailSchema: z.ZodTypeAny = z.string();
        if (field.required) {
          emailSchema = (emailSchema as z.ZodString)
            .email("Please enter a valid email address.")
            .min(1, "This question requires an answer.");
        } else {
          emailSchema = (emailSchema as z.ZodString)
            .email("Invalid email.")
            .optional()
            .or(z.literal(""));
        }
        schema = emailSchema;
        break;
      }

      case "number": {
        if (field.required) {
          let numSchema: z.ZodTypeAny = z.preprocess(
            (val) => (val === "" ? undefined : Number(val)),
            z.number().refine((val) => !isNaN(val), "Must be a number."),
          );

          const bounds = field.validations;
          if (bounds) {
            if (typeof bounds.min === "number") {
              numSchema = numSchema.refine(
                (val) => Number(val) >= bounds.min,
                `Value must be at least ${bounds.min}.`,
              );
            }
            if (typeof bounds.max === "number") {
              numSchema = numSchema.refine(
                (val) => Number(val) <= bounds.max,
                `Value cannot exceed ${bounds.max}.`,
              );
            }
          }
          schema = numSchema;
        } else {
          schema = z.preprocess(
            (val) => (val === "" || val === undefined ? null : Number(val)),
            z.number().nullable().optional(),
          );
        }
        break;
      }

      case "single_select": {
        let selSchema: z.ZodTypeAny = z.string();
        if (field.required) {
          selSchema = (selSchema as z.ZodString).min(1, "Please select one choice.");
        } else {
          selSchema = selSchema.optional().or(z.literal(""));
        }
        schema = selSchema;
        break;
      }

      case "multi_select": {
        let multiSchema: z.ZodTypeAny = z.array(z.string());
        if (field.required) {
          multiSchema = (multiSchema as z.ZodArray<z.ZodString>).min(
            1,
            "Please pick at least one option.",
          );
        } else {
          multiSchema = multiSchema.optional();
        }
        schema = multiSchema;
        break;
      }

      case "checkbox": {
        let chkSchema: z.ZodTypeAny = z.boolean();
        if (field.required) {
          chkSchema = chkSchema.refine(
            (val) => val === true,
            "You must check this box to proceed.",
          );
        } else {
          chkSchema = chkSchema.optional();
        }
        schema = chkSchema;
        break;
      }

      case "rating": {
        if (field.required) {
          schema = z.number().min(1, "Please specify a rating between 1 and 5.").max(5);
        } else {
          schema = z.number().optional().nullable();
        }
        break;
      }

      case "date": {
        let dateSchema: z.ZodTypeAny = z.string();
        if (field.required) {
          dateSchema = (dateSchema as z.ZodString).min(1, "Please select a date.");
        } else {
          dateSchema = dateSchema.optional().or(z.literal(""));
        }
        schema = dateSchema;
        break;
      }

      default:
        schema = z.any();
    }

    formSchemaShape[field.id] = schema;
  });

  let mainSchema = z.object(formSchemaShape);

  // If email is not mandatory, validate that it is entered if user opts in for copy
  if (!form.requireEmail) {
    mainSchema = mainSchema.refine(
      (data: any) => {
        if (data.emailMeCopy && !data.respondentEmail) {
          return false;
        }
        return true;
      },
      {
        message: "Please enter your email to receive a copy of your responses.",
        path: ["respondentEmail"],
      },
    ) as any;
  }

  type FormValues = z.infer<typeof mainSchema>;

  const {
    control,
    handleSubmit,
    register,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(mainSchema),
    defaultValues: {
      emailMeCopy: false,
      respondentEmail: "",
    } as any,
  });

  // Watch all values to resolve Observation Haki (conditional logic branching)
  const watchedValues = watch();

  // 2. OBSERVATION HAKI CONDITIONAL LOGIC CHECKER
  const isFieldVisible = (field: FormField) => {
    if (!field.validations || typeof field.validations !== "object") {
      return true;
    }

    const logic = field.validations.logic;
    if (!logic || typeof logic !== "object") {
      return true;
    }

    const dependFieldId = logic.fieldId;
    const expectedValue = logic.value;

    const actualValue = watchedValues[dependFieldId];
    if (actualValue === undefined) {
      return false;
    }

    // Array support (for checkboxes or multi select matching)
    if (Array.isArray(actualValue)) {
      return actualValue.includes(expectedValue);
    }

    return String(actualValue) === String(expectedValue);
  };

  // Compile visible fields
  const visibleFields = form.fields.filter(isFieldVisible);

  // Helper to render type-specific inputs cleanly
  const renderFieldInput = (field: FormField, val: any, onChange: any, onBlur: any) => {
    switch (field.type) {
      case "short_text":
        return (
          <ThemedInput
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        );

      case "long_text":
        return (
          <ThemedTextarea
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        );

      case "email":
        return (
          <ThemedInput
            type="email"
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        );

      case "number":
        return (
          <ThemedInput
            type="number"
            label={field.label}
            placeholder={field.placeholder || ""}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val === undefined || val === null ? "" : val}
            onChange={onChange}
            onBlur={onBlur}
          />
        );

      case "single_select":
        return (
          <ThemedSelect
            label={field.label}
            options={field.options || []}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || ""}
            onChange={onChange}
          />
        );

      case "multi_select":
        return (
          <ThemedMultiSelect
            label={field.label}
            options={field.options || []}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || []}
            onChange={onChange}
          />
        );

      case "checkbox":
        return (
          <ThemedCheckbox
            label={field.label}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={!!val}
            onChange={onChange}
          />
        );

      case "rating":
        return (
          <ThemedRating
            label={field.label}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={Number(val || 0)}
            onChange={onChange}
          />
        );

      case "date":
        return (
          <ThemedDate
            label={field.label}
            required={field.required}
            themeName={themeName}
            error={errors[field.id]?.message as string}
            value={val || ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        );

      default:
        return (
          <p
            className={cn(
              "text-xs",
              isStark ? "text-red-400 font-mono" : "text-wano-crimson font-heading",
            )}
          >
            {isStark
              ? `Unknown telemetry channel: ${field.type}`
              : `Unknown field coordinate type: ${field.type}`}
          </p>
        );
    }
  };

  // 3. LOG POSE COMPASS PROGRESS GAUGE
  // Count visible fields that have been answered
  const computeProgress = () => {
    let answeredCount = 0;
    let totalCount = visibleFields.length;

    if (form.requireEmail && watchedValues["respondentEmail"]) {
      answeredCount++;
      totalCount++;
    } else if (form.requireEmail) {
      totalCount++;
    }

    visibleFields.forEach((field) => {
      const val = watchedValues[field.id];
      const isBlank =
        val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);

      if (!isBlank) {
        answeredCount++;
      }
    });

    if (totalCount === 0) return 0;
    return Math.min(100, Math.round((answeredCount / totalCount) * 100));
  };

  const stepsCount = visibleFields.length + (form.requireEmail ? 1 : 0);
  const safeCurrentStep = Math.min(currentStep, Math.max(0, stepsCount - 1));

  const progressPercent = form.isMultiPage
    ? stepsCount > 0
      ? Math.round(((safeCurrentStep + 1) / stepsCount) * 100)
      : 0
    : computeProgress();

  const handleNext = async () => {
    if (form.requireEmail && safeCurrentStep === 0) {
      const isValid = await trigger("respondentEmail");
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      const activeFieldIdx = form.requireEmail ? safeCurrentStep - 1 : safeCurrentStep;
      const activeField = visibleFields[activeFieldIdx];
      if (activeField) {
        const isValid = await trigger(activeField.id);
        if (isValid) {
          setCurrentStep((prev) => prev + 1);
        }
      }
    }
  };

  // 4. SUBMIT ACTION
  const onSubmit = async (values: FormValues) => {
    try {
      const answers: Array<{ fieldId: string; value: any }> = [];

      // Pack answers only for fields that are visible/active
      visibleFields.forEach((field) => {
        const val = values[field.id];
        if (val !== undefined && val !== null && val !== "") {
          answers.push({
            fieldId: field.id,
            value: val,
          });
        }
      });

      const completionTime = Math.round((Date.now() - completionTimeStart) / 1000);

      const result = await submitMutation.mutateAsync({
        formId: form.id,
        password,
        respondentEmail: (values as any).respondentEmail || undefined,
        emailMeCopy: !!(values as any).emailMeCopy,
        answers,
        metadata: {
          ipHash: "respondent-ip-hash",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown-navigator",
          country: "Grand Line",
          completionTime,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        },
      });

      if (result.success) {
        setIsSubmitted(true);
        setSuccessResponseId(result.responseId);

        // Auto-redirect if designated
        if (form.redirectUrl) {
          toast.success("Redirecting your ship to custom ports...");
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = form.redirectUrl!;
            }
          }, 3500);
        }
      } else {
        toast.error(result.message || "Submission rejected by the backend.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Storm damage: Failed to transmit responses.");
    }
  };

  const isPending = submitMutation.isPending;

  // SUCCESS CHEST TEMPLATE VIEW
  if (isSubmitted) {
    return (
      <div
        className={cn(
          "text-center py-16 px-6 max-w-xl mx-auto space-y-8 animate-scale-in",
          isBatman ? "font-sans" : isStark && "font-mono",
        )}
      >
        {/* Glowing floating reactor / treasure chest container */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          {isBatman ? (
            <>
              <div className="absolute inset-0 bg-[#F5B921]/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div
                className="absolute -inset-2 bg-gradient-to-tr from-[#F5B921] to-amber-600 rounded-full opacity-10 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative z-10 animate-bounce" style={{ animationDuration: "3.5s" }}>
                <BatLogo className="w-32 h-32" glow />
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#F5B921] animate-pulse" />
              </div>
            </>
          ) : isStark ? (
            <>
              <div className="absolute inset-0 bg-[#00f0ff]/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div
                className="absolute -inset-2 bg-gradient-to-tr from-[#00f0ff] to-[#0080ff] rounded-full opacity-10 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative z-10 animate-bounce" style={{ animationDuration: "3.5s" }}>
                <svg
                  viewBox="0 0 100 100"
                  className="w-32 h-32 fill-none stroke-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                    className="animate-spin"
                    style={{ animationDuration: "40s" }}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#00f0ff"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="28"
                    stroke="#00f0ff"
                    strokeWidth="4"
                    strokeDasharray="12,4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="16"
                    stroke="#00f0ff"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <circle cx="50" cy="50" r="8" className="fill-[#00f0ff] animate-pulse" />
                  <path
                    d="M50 14l6 12h-12zM50 86l6-12h-12zM14 50l12 6v-12zM86 50l-12 6v-12z"
                    fill="#00f0ff"
                  />
                </svg>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#00f0ff] animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-wano-gold/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div
                className="absolute -inset-2 bg-gradient-to-tr from-wano-crimson to-wano-gold rounded-full opacity-10 animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <div className="relative z-10 animate-bounce" style={{ animationDuration: "3s" }}>
                <svg
                  viewBox="0 0 100 100"
                  className="w-32 h-32 fill-wano-gold drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]"
                >
                  <path
                    d="M15 45c0-10 8-18 18-18h34c10 0 18 8 18 18v10H15V45z"
                    className="fill-wano-gold/80"
                  />
                  <path
                    d="M10 55h80v25c0 5-4 10-10 10H20c-6 0-10-5-10-10V55z"
                    className="fill-wano-gold"
                  />
                  <rect x="45" y="45" width="10" height="18" rx="2" className="fill-wano-crimson" />
                  <circle cx="50" cy="54" r="2.5" className="fill-wano-gold" />
                  <path
                    d="M10 55h8v8h-8v-8z M82 55h8v8h-8v-8z M10 82h8v8h-8v-8z M82 82h8v8h-8v-8z"
                    className="fill-wano-gold-light opacity-50"
                  />
                </svg>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-wano-gold animate-pulse" />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2
            className={cn(
              "text-3xl font-bold tracking-wide flex items-center justify-center gap-2",
              isBatman
                ? "text-[#F5B921] font-sans font-black uppercase tracking-widest"
                : isStark
                  ? "text-[#00f0ff] font-mono"
                  : "text-wano-cream font-heading",
            )}
          >
            {isBatman ? (
              <>
                <svg
                  viewBox="0 0 100 60"
                  className="w-8 h-5 fill-[#F5B921] stroke-[#8B6508] stroke-1 animate-pulse"
                >
                  <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
                </svg>
                SIGNAL SECURED
              </>
            ) : isStark ? (
              <>
                <Shield className="w-8 h-8 text-[#00f0ff] animate-pulse" />
                TRANSMISSION SECURED
              </>
            ) : (
              <>
                <CheckCircle2 className="w-8 h-8 text-fruit-glow animate-pulse" />
                Treasure Logged!
              </>
            )}
          </h2>
          <p
            className={cn(
              "text-sm leading-relaxed max-w-md mx-auto",
              isBatman
                ? "text-zinc-400 font-sans"
                : isStark
                  ? "text-cyan-100/70 font-mono"
                  : "text-wano-cream/70 font-sans",
            )}
          >
            {form.successMessage ||
              (isBatman
                ? "Secure Gotham Com-Link transmission complete: Intel package has been encrypted and stored in the Batcomputer mainframe."
                : isStark
                  ? "Stark secure network interface: Data package compiled, encrypted, and successfully stored in database storage cores."
                  : "Thank you! Your survey coordinates have been safely locked inside our treasure chest and added to the sea charts.")}
          </p>
        </div>

        {form.redirectUrl && (
          <div className="pt-4 animate-pulse">
            <Button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = form.redirectUrl!;
              }}
              className={cn(
                "flex items-center gap-2 mx-auto rounded-xl",
                isBatman
                  ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_15px_rgba(245,185,33,0.4)] text-[#0B0C10] font-sans text-xs tracking-wider font-bold"
                  : isStark
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-[#070b13] border border-cyan-300/40 font-mono text-xs tracking-wider font-bold"
                    : "btn-crimson",
              )}
            >
              {isBatman ? (
                <>
                  <svg
                    viewBox="0 0 100 60"
                    className="w-4 h-3 fill-[#0B0C10] stroke-[#0B0C10] stroke-1"
                  >
                    <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
                  </svg>
                  PROCEED TO PORT
                </>
              ) : isStark ? (
                <>
                  <Shield className="w-4 h-4 text-[#070b13]" />
                  PROCEED TO PORT
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-wano-gold" />
                  Set Sail Now
                </>
              )}
            </Button>
          </div>
        )}

        <div className="pt-6 border-t border-ocean-surface/20">
          <p
            className={cn(
              "text-[9px] uppercase tracking-widest",
              isBatman
                ? "text-[#F5B921]/40 font-sans"
                : isStark
                  ? "text-[#00f0ff]/40 font-mono"
                  : "text-wano-cream/30 font-mono",
            )}
          >
            Logged Response UUID: {successResponseId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fadeIn select-none">
      {/* 1. Log Pose / Telemetry HUD Progress bar */}
      <div
        className={cn(
          "px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md relative overflow-hidden border",
          isBatman
            ? "bg-zinc-950/60 border-zinc-800/80 font-sans text-zinc-100"
            : isStark
              ? "bg-[#0B1528]/50 border-[#00f0ff]/20 font-mono text-cyan-50"
              : "bg-ocean-mid/50 border-ocean-surface/30 text-wano-cream",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            isBatman
              ? "bg-gradient-to-r from-[#F5B921]/5 to-transparent"
              : isStark
                ? "bg-gradient-to-r from-[#00f0ff]/5 to-transparent"
                : "bg-gradient-to-r from-wano-gold/5 to-transparent",
          )}
        />

        <div className="flex items-center gap-2.5 z-10">
          {isBatman ? (
            <svg
              viewBox="0 0 100 60"
              className="w-6 h-4 fill-[#F5B921] stroke-[#8B6508] stroke-1 shrink-0 animate-pulse"
            >
              <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
            </svg>
          ) : isStark ? (
            <Shield className="w-5 h-5 text-[#00f0ff] shrink-0 animate-pulse" />
          ) : (
            <Compass
              className={cn(
                "w-5 h-5 text-wano-gold shrink-0",
                progressPercent > 0 && "animate-spin",
              )}
              style={{ animationDuration: "15s" }}
            />
          )}
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isBatman
                ? "text-[#F5B921] font-sans tracking-widest"
                : isStark
                  ? "text-[#00f0ff] font-mono"
                  : "text-wano-cream/65 font-heading",
            )}
          >
            {isBatman
              ? "BAT-TRACKER SYSTEMS SYNC"
              : isStark
                ? "SYSTEM TELEMETRY SYNCHRONIZED"
                : "Log Pose Alignment"}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64 z-10">
          <div
            className={cn(
              "w-full h-2 rounded-full overflow-hidden border",
              isBatman
                ? "bg-zinc-900 border-zinc-800"
                : isStark
                  ? "bg-[#070b13] border-[#00f0ff]/20"
                  : "bg-ocean-deep border-ocean-surface/60",
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isBatman
                  ? "bg-gradient-to-r from-amber-500 to-[#F5B921] shadow-[0_0_8px_rgba(245,185,33,0.4)]"
                  : isStark
                    ? "bg-gradient-to-r from-blue-500 to-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                    : "bg-gradient-to-r from-wano-crimson to-wano-gold shadow-[0_0_8px_rgba(201,168,76,0.3)]",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            className={cn(
              "text-xs font-bold shrink-0",
              isBatman
                ? "text-[#F5B921] font-sans"
                : isStark
                  ? "text-[#00f0ff] font-mono"
                  : "text-wano-gold shrink-0 font-heading",
            )}
          >
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* 2. Questions Canvas */}
      <div className="space-y-6">
        {!form.isMultiPage ? (
          <>
            {/* Email collection wrapper */}
            {form.requireEmail && (
              <div
                className={cn(
                  "p-5 rounded-2xl border space-y-4 transition-all duration-300",
                  isBatman
                    ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    : isStark
                      ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                      : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
                )}
              >
                <ThemedInput
                  label={
                    isBatman
                      ? "OPERATOR ACCESS KEY (EMAIL ADDRESS)"
                      : isStark
                        ? "OPERATOR SECURITY IDENTIFICATION (EMAIL)"
                        : "Captain's Identity (Your Email Address)"
                  }
                  required
                  themeName={themeName}
                  error={errors.respondentEmail?.message as string}
                  placeholder={
                    isBatman
                      ? "e.g. bruce@gotham.com"
                      : isStark
                        ? "e.g. tony@starkindustries.com"
                        : "e.g. luffy@thousandsunny.com"
                  }
                  {...register("respondentEmail")}
                />
              </div>
            )}

            {/* Dynamic Fields List */}
            {visibleFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "p-5 rounded-2xl border space-y-4 transition-all duration-300 animate-slide-up",
                  isBatman
                    ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    : isStark
                      ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                      : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
                )}
              >
                <Controller
                  control={control}
                  name={field.id as any}
                  render={({ field: { onChange, onBlur, value } }) => {
                    const val = value as any;
                    return renderFieldInput(field, val, onChange, onBlur);
                  }}
                />
              </div>
            ))}
          </>
        ) : (
          /* Multi-Page Experience */
          <div className="space-y-6 min-h-[140px] flex flex-col justify-center">
            {form.requireEmail && safeCurrentStep === 0 ? (
              <div
                className={cn(
                  "p-6 rounded-2xl border space-y-4 transition-all duration-300 animate-scale-in",
                  isBatman
                    ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    : isStark
                      ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                      : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
                )}
              >
                <ThemedInput
                  label={
                    isBatman
                      ? "OPERATOR ACCESS KEY (EMAIL ADDRESS)"
                      : isStark
                        ? "OPERATOR SECURITY IDENTIFICATION (EMAIL)"
                        : "Captain's Identity (Your Email Address)"
                  }
                  required
                  themeName={themeName}
                  error={errors.respondentEmail?.message as string}
                  placeholder={
                    isBatman
                      ? "e.g. bruce@gotham.com"
                      : isStark
                        ? "e.g. tony@starkindustries.com"
                        : "e.g. luffy@thousandsunny.com"
                  }
                  {...register("respondentEmail")}
                />
              </div>
            ) : (
              (() => {
                const activeFieldIdx = form.requireEmail ? safeCurrentStep - 1 : safeCurrentStep;
                const field = visibleFields[activeFieldIdx];
                if (!field) return null;

                return (
                  <div
                    key={field.id}
                    className={cn(
                      "p-6 rounded-2xl border space-y-4 transition-all duration-500 animate-scale-in",
                      isBatman
                        ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                        : isStark
                          ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                          : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
                    )}
                  >
                    <Controller
                      control={control}
                      name={field.id as any}
                      render={({ field: { onChange, onBlur, value } }) => {
                        const val = value as any;
                        return renderFieldInput(field, val, onChange, onBlur);
                      }}
                    />
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Empty fields condition */}
        {form.fields.length === 0 && (
          <div
            className={cn(
              "text-center py-12 border-2 border-dashed rounded-2xl",
              isBatman
                ? "bg-zinc-950/10 border-zinc-800 text-zinc-500 font-sans"
                : isStark
                  ? "bg-[#0B1528]/10 border-[#00f0ff]/20 text-cyan-200/30 font-mono"
                  : "bg-ocean-mid/10 border-ocean-surface/60 text-wano-cream/40",
            )}
          >
            {isBatman ? (
              <>
                <svg
                  viewBox="0 0 100 60"
                  className="w-10 h-7 mx-auto fill-zinc-700 stroke-zinc-800 stroke-1 mb-4 animate-pulse"
                >
                  <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
                </svg>
                <p className="text-xs">No encrypted transmission channels detected.</p>
              </>
            ) : isStark ? (
              <>
                <Shield className="w-8 h-8 mx-auto stroke-1 animate-pulse mb-4 text-[#00f0ff]/30" />
                <p className="text-xs">No telemetry fields detected on this HUD interface.</p>
              </>
            ) : (
              <>
                <Compass
                  className="w-8 h-8 mx-auto stroke-1 animate-spin mb-4"
                  style={{ animationDuration: "20s" }}
                />
                <p className="text-xs font-heading">
                  No Devil Fruit fields discovered on this island yet.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Email Copy Opt-In Panel */}
      {form.notifyRespondent && (!form.isMultiPage || safeCurrentStep === stepsCount - 1) && (
        <div
          className={cn(
            "p-5 rounded-2xl border space-y-4 transition-all duration-300 animate-slide-up",
            isBatman
              ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
              : isStark
                ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
          )}
        >
          <Controller
            control={control}
            name="emailMeCopy"
            render={({ field: { value: chVal, onChange: chOnChange } }) => (
              <ThemedCheckbox
                label={
                  isBatman
                    ? "TRANSMIT ENCRYPTED SYSTEM BACKUP COPY (EMAIL)"
                    : isStark
                      ? "TRANSMIT DATA BACKUP COPY TO MY SYSTEM DECK (EMAIL)"
                      : "Send a copy of my response log to my email"
                }
                value={!!chVal}
                onChange={chOnChange}
                themeName={themeName}
              />
            )}
          />

          {!form.requireEmail && !!watch("emailMeCopy") && (
            <div className="pt-2 animate-fadeIn">
              <ThemedInput
                label={
                  isBatman
                    ? "RECIPIENT SECURE ACCESS KEY (EMAIL)"
                    : isStark
                      ? "RECIPIENT SYSTEM ACCESS ADDRESS (EMAIL)"
                      : "Your Email Address"
                }
                required
                themeName={themeName}
                error={errors.respondentEmail?.message as string}
                placeholder={
                  isBatman
                    ? "e.g. bruce@gotham.com"
                    : isStark
                      ? "e.g. tony@starkindustries.com"
                      : "e.g. luffy@thousandsunny.com"
                }
                {...register("respondentEmail")}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Action submission triggers */}
      <div className="pt-4 border-t border-ocean-surface/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className={cn(
            "text-[10px] text-center sm:text-left",
            isBatman
              ? "text-[#F5B921]/40 font-sans"
              : isStark
                ? "text-[#00f0ff]/40 font-mono"
                : "text-wano-cream/30 font-mono",
          )}
        >
          {isBatman
            ? "🔒 SECURE GOTHAM COM-LINK PORT ACTIVE."
            : isStark
              ? "🔒 SECURE SEC-NET COM-LINK ACTIVE."
              : "🔒 Encrypted cargo transmission active."}
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {form.isMultiPage && safeCurrentStep > 0 && (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className={cn(
                "transition-all duration-300 rounded-xl font-bold px-5 h-12 text-xs flex items-center justify-center gap-2 border select-none hover:scale-[1.02]",
                isBatman
                  ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-100 font-sans"
                  : isStark
                    ? "bg-[#0B1528] border-[#00f0ff]/20 hover:bg-[#00f0ff]/10 text-[#00f0ff] font-mono"
                    : "bg-ocean-deep border-ocean-surface hover:bg-ocean-surface/50 text-wano-cream font-heading",
              )}
            >
              Back
            </Button>
          )}

          {form.isMultiPage && safeCurrentStep < stepsCount - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className={cn(
                "transition-all duration-300 rounded-xl font-bold px-6 h-12 text-xs flex items-center justify-center gap-2 select-none hover:scale-[1.02] border",
                isBatman
                  ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_20px_rgba(245,185,33,0.5)] text-[#0B0C10] font-sans border-[#F5B921]/30"
                  : isStark
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] text-[#070b13] border-cyan-300/40 font-mono"
                    : "btn-gold font-heading",
              )}
            >
              {isBatman ? "NEXT FIELD" : isStark ? "NEXT TELEMETRY" : "Next step 🧭"}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending || form.fields.length === 0}
              className={cn(
                "transition-all duration-300",
                isBatman
                  ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_20px_rgba(245,185,33,0.5)] text-[#0B0C10] font-sans font-bold px-8 py-3.5 h-12 rounded-xl text-xs flex items-center justify-center gap-2 select-none group tracking-wider uppercase border border-[#F5B921]/30 hover:scale-[1.02]"
                  : isStark
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] text-[#070b13] font-bold px-8 py-3.5 h-12 rounded-xl text-xs flex items-center justify-center gap-2 select-none group font-mono tracking-wider uppercase border border-cyan-300/40 hover:scale-[1.02]"
                    : "btn-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.4)] text-wano-cream font-bold px-8 py-3.5 h-12 rounded-xl text-xs flex items-center justify-center gap-2 select-none group font-heading tracking-wider uppercase",
              )}
            >
              {isPending ? (
                isBatman ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B0C10]" />
                    TRANSMITTING TO BATCOMPUTER...
                  </>
                ) : isStark ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#070b13]" />
                    TRANSMITTING CORES...
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-wano-cream" />
                    Logging cargo...
                  </>
                )
              ) : isBatman ? (
                <>
                  <svg
                    viewBox="0 0 100 60"
                    className="w-4 h-3 fill-[#0B0C10] stroke-[#0B0C10] stroke-1 group-hover:scale-110 transition-transform"
                  >
                    <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
                  </svg>
                  {form.submitButtonText || "TRANSMIT SIGNAL"}
                </>
              ) : isStark ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#070b13] group-hover:scale-110 transition-transform" />
                  {form.submitButtonText || "TRANSMIT TELEMETRY"}
                </>
              ) : (
                <>
                  <Anchor className="w-3.5 h-3.5 text-wano-gold group-hover:rotate-12 transition-transform" />
                  {form.submitButtonText || "Send Your Response"} ⚓
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
