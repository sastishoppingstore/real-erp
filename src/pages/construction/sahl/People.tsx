import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SahlField, SahlGrid, inputCls, btnCls, btnGreenCls } from "./ui";

// مندوبو المبيعات + المستخدمون (sahl.salesman* + sahl.user*).
export function SahlSalesmen() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [f, setF] = useState({ name: "", nameAr: "", phone: "", commissionRate: 0 });
  const [msg, setMsg] = useState("");
  const { data: rows } = trpc.sahl.salesmanList.useQuery();
  const create = trpc.sahl.salesmanCreate.useMutation({
    onSuccess: () => { setF({ name: "", nameAr: "", phone: "", commissionRate: 0 }); utils.sahl.salesmanList.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const update = trpc.sahl.salesmanUpdate.useMutation({
    onSuccess: () => utils.sahl.salesmanList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const T = (ar: string, en: string) => (rtl ? ar : en);
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("إدخال مندوبى المبيعات", "Sales representatives")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
      </div>
      <SahlGrid
        columns={[T("الاسم", "Name"), T("الهاتف", "Phone"), T("العمولة %", "Comm %"), T("الحالة", "Status")]}
        rows={(rows ?? []).map((r: any) => [r.nameAr || r.name, r.phone ?? "", Number(r.commissionRate || 0), r.isActive ? T("نشط", "Active") : T("موقوف", "Inactive")])}
        emptyText={T("لا يوجد مناديب", "No salesmen")}
      />
      <div className="mt-2 border border-[#333] bg-[#111] p-2">
        <div className="grid gap-x-4 lg:grid-cols-2">
          <div>
            <SahlField label={T("الاسم", "Name")}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></SahlField>
            <SahlField label={T("عربي", "Arabic")}><input className={inputCls} value={f.nameAr} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></SahlField>
          </div>
          <div>
            <SahlField label={T("الهاتف", "Phone")}><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></SahlField>
            <SahlField label={T("العمولة %", "Comm %")}><input type="number" min="0" max="100" className={inputCls} value={f.commissionRate} onChange={(e) => setF({ ...f, commissionRate: Number(e.target.value) })} /></SahlField>
          </div>
        </div>
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={create.isPending}
          onClick={() => f.name.trim() ? create.mutate({ ...f, name: f.name.trim() }) : setMsg(T("الاسم مطلوب", "Name required"))}>
          {T("حفظ", "Save")}
        </button>
        <div className="mt-2 border-t border-[#333] pt-1">
          {(rows ?? []).filter((r: any) => r.isActive).map((r: any) => (
            <button key={r.id} className={btnCls} onClick={() => update.mutate({ id: r.id, isActive: false })}>
              {T("إيقاف", "Deactivate")}: {r.nameAr || r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ROLES = ["admin", "manager", "accountant", "salesman", "cashier", "store_keeper", "user"];

export function SahlUsers() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [f, setF] = useState({ name: "", username: "", password: "", role: "cashier", phone: "" });
  const [msg, setMsg] = useState("");
  const usersQ = trpc.sahl.userList.useQuery(undefined, { retry: false });
  const rows: any[] = Array.isArray(usersQ.data) ? usersQ.data : [];
  const create = trpc.sahl.userCreate.useMutation({
    onSuccess: () => { setF({ name: "", username: "", password: "", role: "cashier", phone: "" }); utils.sahl.userList.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const setActive = trpc.sahl.userSetActive.useMutation({
    onSuccess: () => utils.sahl.userList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const T = (ar: string, en: string) => (rtl ? ar : en);
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("المستخدمين", "Users")}</b>
        <span className="ms-2 text-[11px] text-white/60">{T("إدارة فقط", "Admins only")}</span>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
      </div>
      {usersQ.error ? (
        <div className="border border-red-700 bg-[#1a0000] p-3 text-[12px]">
          {T("غير مصرح — تتطلب صلاحية مدير", "Forbidden — admin role required")}
        </div>
      ) : (
        <>
          <SahlGrid
            columns={[T("الاسم", "Name"), T("المستخدم", "Login"), T("الدور", "Role"), T("الحالة", "Status")]}
            rows={rows.map((r: any) => [r.name ?? "", r.username ?? "", r.role ?? "", r.isActive ? T("نشط", "Active") : T("موقوف", "Inactive")])}
            emptyText={T("لا يوجد مستخدمون", "No users")}
          />
          <div className="mt-2 border border-[#333] bg-[#111] p-2">
            <div className="grid gap-x-4 lg:grid-cols-2">
              <div>
                <SahlField label={T("الاسم", "Name")}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></SahlField>
                <SahlField label={T("الدخول", "Login")}><input className={inputCls} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></SahlField>
                <SahlField label={T("كلمة السر", "Password")}><input type="password" className={inputCls} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></SahlField>
              </div>
              <div>
                <SahlField label={T("الدور", "Role")}>
                  <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </SahlField>
                <SahlField label={T("الهاتف", "Phone")}><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></SahlField>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={create.isPending}
                onClick={() => f.name.trim() && f.username.trim().length >= 3 && f.password.length >= 4
                  ? create.mutate({ name: f.name.trim(), username: f.username.trim(), password: f.password, role: f.role as any, phone: f.phone || undefined })
                  : setMsg(T("أكمل الحقول المطلوبة", "Fill required fields"))}>
                {T("حفظ", "Save")}
              </button>
              {rows.filter((r: any) => r.isActive).map((r: any) => (
                <button key={r.id} className={btnCls} onClick={() => setActive.mutate({ id: r.id, isActive: false })}>
                  {T("إيقاف", "Deactivate")}: {r.name || r.username}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
