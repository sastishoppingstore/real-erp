import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
};

export function ImageUpload({ value, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      setBusy(false);
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative h-16 w-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden flex items-center justify-center",
          value && "border-solid"
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <ImagePlus className="h-4 w-4 mx-auto text-slate-400" />
            <span className="text-[9px] text-slate-400">{busy ? "..." : "Image"}</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-red-500 hover:text-red-700" title="Remove image">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
