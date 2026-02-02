import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "@/app/components/router";
import { Loader2 } from "lucide-react";

type Mode = "password" | "otp";

export function AdminLoginPage() {
  const { navigate } = useRouter();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // auto redirect if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin/dashboard");
    });
  }, []);

  // OTP resend timer
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  /* ---------------- PASSWORD LOGIN ---------------- */

  async function loginWithPassword() {
    if (!email || !password) return toast.error("Enter email + password");

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return toast.error(error.message);

    toast.success("Login successful!");
    navigate("/admin/dashboard");
  }

  /* ---------------- OTP LOGIN ---------------- */

  async function sendOTP() {
    if (!email) return toast.error("Enter email first");

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);

    if (error) return toast.error(error.message);

    toast.success("OTP sent!");
    setStep("otp");
    setTimer(30);
  }

  async function verifyOTP() {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);

    if (error) return toast.error("Invalid OTP");

    toast.success("Login successful!");
    navigate("/admin/dashboard");
  }

  /* ---------------- PASSWORD RESET ---------------- */

  async function resetPassword() {
    if (!email) return toast.error("Enter your email first");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return toast.error(error.message);

    toast.success("Password reset email sent!");
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">

      {/* glow */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-600/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <h1 className="text-3xl font-extrabold text-center mb-2">
          Admin Login
        </h1>

        <p className="text-gray-500 text-center mb-6 text-sm">
          Secure hybrid authentication
        </p>

        {/* mode toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode("password")}
            className={`flex-1 py-2 rounded-lg font-semibold ${
              mode === "password" ? "bg-white shadow" : ""
            }`}
          >
            Password
          </button>

          <button
            onClick={() => setMode("otp")}
            className={`flex-1 py-2 rounded-lg font-semibold ${
              mode === "otp" ? "bg-white shadow" : ""
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* email */}
        <Input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 mb-4"
        />

        {/* PASSWORD MODE */}
        {mode === "password" && (
          <>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 mb-4"
            />

            <Button
              onClick={loginWithPassword}
              disabled={loading}
              className="w-full h-12"
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Login with Password
            </Button>

            <button
              onClick={resetPassword}
              className="text-sm text-blue-600 mt-4 w-full text-center"
            >
              Forgot password?
            </button>
          </>
        )}

        {/* OTP MODE */}
        {mode === "otp" && step === "email" && (
          <Button
            onClick={sendOTP}
            disabled={loading}
            className="w-full h-12"
          >
            {loading && <Loader2 className="animate-spin mr-2" />}
            Send OTP
          </Button>
        )}

        {mode === "otp" && step === "otp" && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 mb-4 text-center text-xl tracking-widest"
            />

            <Button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full h-12"
            >
              {loading && <Loader2 className="animate-spin mr-2" />}
              Verify OTP
            </Button>

            <button
              disabled={timer > 0}
              onClick={sendOTP}
              className="text-sm text-blue-600 mt-4 w-full text-center disabled:opacity-40"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          Powered by Supabase Auth
        </p>
      </div>
    </div>
  );
}
