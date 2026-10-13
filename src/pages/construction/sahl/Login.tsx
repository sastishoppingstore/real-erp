import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";

// Sahl-style desktop login: green header, user select, password, lock button,
// green footer. Same session backend as main login (passwordLogin + erp_sid).
export default function SahlLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLang } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const finish = async (data?: { token?: string }) => {
    if (data?.token) {
      try { localStorage.setItem("erp_sid", data.token); } catch { /* ignore */ }
    }
    await utils.auth.me.invalidate();
    const redirect = searchParams.get("redirect");
    navigate(redirect && redirect.startsWith("/app") ? redirect : "/app/construction");
  };

  const login = trpc.auth.passwordLogin.useMutation({
    onSuccess: (d) => finish(d),
    onError: (e) => setErr(e.message),
  });

  const go = (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!username.trim() || !password) {
      setErr(rtl ? "أدخل المستخدم وكلمة السر" : "Enter username and password");
      return;
    }
    login.mutate({ username: username.trim(), password });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#141414] p-4"
      dir={rtl ? "rtl" : "ltr"}
      style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "5px 5px" }}>
      <div className="w-full max-w-sm border border-black bg-white">
        <div className="px-4 py-3 text-center text-white" style={{ background: "#2fae4e" }}>
          <div className="text-[26px] font-bold leading-none">سهل</div>
          <div className="mt-1 text-[13px] font-bold">{rtl ? "أهلا وسهلا" : "Welcome"}</div>
          <div className="text-[11px] opacity-90">{rtl ? "برنامج إدارة المحلات والمخازن" : "Store & warehouse manager"}</div>
        </div>
        <form onSubmit={go} className="space-y-2 p-4">
          <label className="block text-[12px] text-black">{rtl ? "المستخدم" : "Username"}
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              className="mt-0.5 w-full border border-[#777] bg-white px-1.5 py-1 text-[13px] text-black outline-none focus:border-black" />
          </label>
          <label className="block text-[12px] text-black">{rtl ? "كلمة السر" : "Password"}
            <span className="mt-0.5 flex gap-1">
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#777] bg-white px-1.5 py-1 text-[13px] text-black outline-none focus:border-black" />
              <button type="button" onClick={() => setShow((s) => !s)}
                className="border border-[#777] px-2 text-[12px] text-black">{show ? "🙈" : "👁"}</button>
            </span>
          </label>
          {err && <div className="border border-red-700 bg-red-50 px-2 py-1 text-[12px] text-red-700" role="alert">{err}</div>}
          <button type="submit" disabled={login.isPending}
            className="w-full py-1.5 text-[14px] font-bold text-white hover:brightness-110 disabled:opacity-50"
            style={{ background: "#2fae4e" }}>
            🔒 {rtl ? "دخول النظام" : "Login"}
          </button>
        </form>
        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-white" style={{ background: "#1d7a37" }}>
          <button onClick={() => setLang(rtl ? "en" : "ar")} className="hover:underline">
            {rtl ? "English" : "العربية"}
          </button>
          <button onClick={() => navigate("/login")} className="hover:underline">
            {rtl ? "الدخول الرئيسي" : "Main login"}
          </button>
        </div>
      </div>
    </div>
  );
}
