"use client";
import { useState } from "react";
import SufiModal from "@/components/ui/SufiModal";
import SufiInput from "@/components/ui/SufiInput";
import SufiButton from "@/components/ui/SufiButton";
import { authApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const { setAuth } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data =
        tab === "login"
          ? await authApi.login(email, password)
          : await authApi.register(name, email, password, role);
      setAuth(data.user, data.access_token);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SufiModal isOpen={isOpen} onClose={onClose}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.04]">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-accent/20 text-accent"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {tab === "register" && (
          <SufiInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
        )}
        <SufiInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <SufiInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {tab === "register" && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "customer" | "owner")}
            className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60"
          >
            <option value="customer">Customer</option>
            <option value="owner">Restaurant Owner</option>
          </select>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <SufiButton type="submit" disabled={loading} className="w-full mt-1">
          {loading ? "..." : tab === "login" ? "Sign In" : "Create Account"}
        </SufiButton>
      </form>
    </SufiModal>
  );
}
