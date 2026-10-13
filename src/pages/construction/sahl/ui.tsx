import type { ReactNode } from "react";

export const inputCls =
  "w-full border border-[#777] bg-white px-1.5 py-1 text-[12px] text-black outline-none focus:border-black";
export const btnCls =
  "border border-[#555] bg-[#f5f5f5] px-3 py-1 text-[12px] text-black hover:bg-white active:bg-[#ddd] disabled:opacity-50";
export const btnGreenCls =
  "border border-[#0a5c2a] px-3 py-1 text-[12px] font-bold text-white hover:brightness-110 disabled:opacity-50";

export function SahlField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-2 text-[12px]">
      <span className="w-28 shrink-0">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

export function GreenDialog({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="border border-black" style={{ background: "#00c853" }} role="dialog" aria-label={title}>
      <div className="px-3 py-1.5 text-[13px] font-bold text-white" style={{ background: "#006d34" }}>
        {title}
      </div>
      <div className="p-3">{children}</div>
      {footer && (
        <div className="flex justify-end gap-2 px-3 py-2" style={{ background: "#006d34" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function WhiteDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="border border-[#bdbdbd] bg-white text-black" role="dialog" aria-label={title}>
      <div className="flex items-center justify-between border-b border-[#ddd] px-3 py-1.5">
        <span className="text-[15px] font-bold" style={{ color: "#d81b60" }}>
          {title}
        </span>
        {onClose && (
          <button onClick={onClose} className={btnCls} aria-label="close">
            ×
          </button>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function SectionHead({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 px-2 py-1 text-[12px] font-bold text-black" style={{ background: "#c8e6c9" }}>
      {children}
    </div>
  );
}

export function SahlGrid({
  columns,
  rows,
  onSelect,
  selected,
  emptyText,
}: {
  columns: string[];
  rows: (string | number)[][];
  onSelect?: (i: number) => void;
  selected?: number;
  emptyText?: string;
}) {
  return (
    <div className="max-h-[260px] overflow-auto border border-[#888] bg-white text-black">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: "#2fae4e", color: "#fff" }}>
            {columns.map((c, i) => (
              <th key={i} className="whitespace-nowrap border border-[#1d7a37] px-1.5 py-1 font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 text-center text-[#777]">
                {emptyText ?? "—"}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={i}
                onClick={() => onSelect?.(i)}
                className="cursor-pointer hover:bg-[#e8f5e9]"
                style={i === selected ? { background: "#a5d6a7" } : undefined}
              >
                {r.map((c, j) => (
                  <td key={j} className="whitespace-nowrap border border-[#ccc] px-1.5 py-1">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FuncKey({
  k,
  label,
  onClick,
  color,
}: {
  k: string;
  label: string;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-w-[64px] flex-col items-center border border-black px-2 py-1.5 text-[11px] leading-tight text-white hover:brightness-110"
      style={{ background: color ?? "#455a64" }}
    >
      <span className="font-bold">{k}</span>
      <span>{label}</span>
    </button>
  );
}
