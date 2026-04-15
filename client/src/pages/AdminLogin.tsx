/* =============================================================
   KSETRAVID — ADMIN LOGIN PAGE
   Custom username + password login (no OAuth)
   Design: Cosmic Tech-Death Noir
   ============================================================= */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663502701477/hsCtMSAamD8xKhZV5LbA6R/ksetravid_logo_transparent_83965f35.png";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: adminCheck, isLoading: checking } = trpc.admin.check.useQuery();
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("Access granted");
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  useEffect(() => {
    if (!checking && adminCheck?.isAdmin) {
      navigate("/admin");
    }
  }, [adminCheck, checking, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "oklch(0.06 0.005 285)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.87 0.02 80) 1px, transparent 1px), linear-gradient(90deg, oklch(0.87 0.02 80) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Crimson glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
        style={{ backgroundColor: "oklch(0.52 0.24 25)" }}
      />

      <div
        className="relative z-10 w-full max-w-sm mx-4 p-8"
        style={{
          backgroundColor: "oklch(0.09 0.008 285 / 0.97)",
          border: "1px solid oklch(0.42 0.22 25 / 0.35)",
          boxShadow: "0 0 80px oklch(0.52 0.24 25 / 0.1), 0 0 0 1px oklch(0.87 0.02 80 / 0.03)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={LOGO_URL} alt="Ksetravid" className="h-14 w-auto object-contain" />
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <p
            className="font-mono text-[10px] tracking-[0.35em] uppercase mb-1"
            style={{ color: "oklch(0.52 0.24 25)" }}
          >
            ◆ Restricted Access
          </p>
          <h1
            className="font-display text-xl tracking-[0.2em] uppercase"
            style={{ color: "oklch(0.87 0.02 80)" }}
          >
            Admin Control Panel
          </h1>
        </div>

        {/* Divider */}
        <div className="w-full h-px mb-7" style={{ background: "linear-gradient(90deg, transparent, oklch(0.42 0.22 25 / 0.5), transparent)" }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              className="block font-mono text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: "oklch(0.55 0.015 285)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              className="w-full px-4 py-3 font-mono text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: "oklch(0.12 0.008 285)",
                border: "1px solid oklch(0.25 0.01 285)",
                color: "oklch(0.87 0.02 80)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.42 0.22 25)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(0.25 0.01 285)"; }}
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block font-mono text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{ color: "oklch(0.55 0.015 285)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 font-mono text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "oklch(0.12 0.008 285)",
                  border: "1px solid oklch(0.25 0.01 285)",
                  color: "oklch(0.87 0.02 80)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.42 0.22 25)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(0.25 0.01 285)"; }}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs"
                style={{ color: "oklch(0.45 0.015 285)" }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending || checking}
            className="w-full py-4 font-mono text-sm tracking-[0.2em] uppercase transition-all duration-300 mt-2 disabled:opacity-50"
            style={{
              backgroundColor: loginMutation.isPending ? "oklch(0.35 0.18 25)" : "oklch(0.42 0.22 25)",
              color: "oklch(0.95 0.01 80)",
              border: "1px solid oklch(0.52 0.24 25)",
            }}
            onMouseEnter={(e) => {
              if (!loginMutation.isPending) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.52 0.24 25)";
            }}
            onMouseLeave={(e) => {
              if (!loginMutation.isPending) (e.currentTarget as HTMLElement).style.backgroundColor = "oklch(0.42 0.22 25)";
            }}
          >
            {loginMutation.isPending ? "Verifying..." : "▶ Enter"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center font-mono text-[10px]" style={{ color: "oklch(0.3 0.01 285)" }}>
          Ksetravid — Official Website Admin
        </p>
      </div>
    </div>
  );
}
