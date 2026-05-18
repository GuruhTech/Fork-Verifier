import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { SiGithub, SiHeroku } from "react-icons/si";
import { CheckCircle2, XCircle, Loader2, ArrowRight, GitFork } from "lucide-react";

import { useVerifyFork } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import bannerImg from "@assets/ultra-guru-banner.jpg";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .trim()
    .refine((v) => !v.includes(" "), { message: "No spaces allowed" }),
});
type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<{ hasFork: boolean; redirectUrl?: string | null } | null>(null);

  const verifyFork = useVerifyFork({
    mutation: {
      onSuccess: (data) => {
        setResult({ hasFork: data.hasFork, redirectUrl: data.redirectUrl });
        if (data.hasFork && data.redirectUrl) {
          toast({ title: "ACCESS GRANTED", description: "Redirecting to Heroku deploy..." });
          setTimeout(() => { window.location.href = data.redirectUrl!; }, 1800);
        }
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to check GitHub. Try again." });
      },
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    setResult(null);
    verifyFork.mutate({ data: { username: values.username } });
  }

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">

      {/* ── Full-bleed background: bot image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.35) saturate(1.2)",
        }}
      />

      {/* ── Dark gradient overlay for readability ── */}
      <div className="absolute inset-0 z-10" style={{
        background: "linear-gradient(180deg, rgba(4,8,12,0.55) 0%, rgba(4,8,12,0.82) 40%, rgba(4,8,12,0.95) 100%)",
      }} />

      {/* ── Hex grid overlay ── */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33L28 66zM28 100L0 84V51l28-16 28 16v33L28 100z' fill='none' stroke='rgba(0,255,65,0.04)' stroke-width='1'/%3E%3C/svg%3E\")",
        backgroundSize: "56px 100px",
      }} />

      {/* ── Green top glow ── */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #00ff41 30%, #00ff41 70%, transparent 100%)", boxShadow: "0 0 30px #00ff41, 0 0 60px rgba(0,255,65,0.4)" }} />
      {/* ── Purple bottom glow ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #9b30ff 30%, #9b30ff 70%, transparent 100%)", boxShadow: "0 0 30px #9b30ff, 0 0 60px rgba(155,48,255,0.4)" }} />

      {/* ── Content ── */}
      <div className="relative z-30 w-full max-w-md px-4 py-10 flex flex-col items-center gap-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest"
          style={{
            background: "rgba(0,255,65,0.08)",
            border: "1px solid rgba(0,255,65,0.25)",
            color: "#00ff41",
            boxShadow: "0 0 16px rgba(0,255,65,0.1)",
          }}
        >
          <GitFork className="w-3 h-3" />
          FORK VERIFICATION GATEWAY
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center"
        >
          <h1
            className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-3"
            style={{
              color: "#ffffff",
              textShadow: "0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            ULTRA<br />
            <span style={{ color: "#00ff41", textShadow: "0 0 30px #00ff41, 0 0 60px rgba(0,255,65,0.5)" }}>GURU</span>
          </h1>
          <p className="text-xs font-mono tracking-[0.35em]"
            style={{ color: "rgba(155,48,255,0.8)", textShadow: "0 0 12px rgba(155,48,255,0.5)" }}>
            MD BOT · DEPLOYMENT GATEWAY
          </p>
        </motion.div>

        {/* ── Glass panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full rounded-xl overflow-hidden"
          style={{
            background: "rgba(8,14,20,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,255,65,0.2)",
            boxShadow: "0 0 0 1px rgba(0,255,65,0.06), 0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Top accent bar */}
          <div className="h-px w-full" style={{
            background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.6) 30%, rgba(155,48,255,0.6) 70%, transparent)",
          }} />

          <div className="p-7">
            <AnimatePresence mode="wait">

              {/* ── FORM ── */}
              {!result ? (
                <motion.div key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs font-mono mb-6 leading-relaxed"
                    style={{ color: "rgba(0,255,65,0.55)" }}>
                    <span style={{ color: "#00ff41" }}>&gt;_</span> Enter your GitHub username to verify your fork of{" "}
                    <span style={{ color: "rgba(155,48,255,0.9)" }}>GuruhTech/ULTRA-GURU</span>
                  </p>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <SiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                                  style={{ color: "rgba(0,255,65,0.5)" }} />
                                <input
                                  placeholder="your-github-username"
                                  autoComplete="off"
                                  spellCheck="false"
                                  data-testid="input-username"
                                  className="w-full h-12 pl-10 pr-4 rounded-lg text-sm font-mono outline-none transition-all"
                                  style={{
                                    background: "rgba(0,255,65,0.04)",
                                    border: "1px solid rgba(0,255,65,0.18)",
                                    color: "#d0e8d4",
                                    caretColor: "#00ff41",
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.border = "1px solid rgba(0,255,65,0.5)";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.08)";
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.border = "1px solid rgba(0,255,65,0.18)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs font-mono" style={{ color: "#f87171" }} />
                          </FormItem>
                        )}
                      />

                      <button
                        type="submit"
                        disabled={verifyFork.isPending}
                        data-testid="button-submit"
                        className="w-full h-12 rounded-lg font-black tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #00cc33 0%, #00ff41 50%, #00cc33 100%)",
                          color: "#020d04",
                          fontFamily: "'Orbitron', sans-serif",
                          boxShadow: "0 0 20px rgba(0,255,65,0.35), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                        }}
                        onMouseEnter={(e) => {
                          if (!verifyFork.isPending) {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(0,255,65,0.55), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,255,65,0.35), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)";
                          (e.currentTarget as HTMLButtonElement).style.transform = "none";
                        }}
                      >
                        {verifyFork.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING...</>
                        ) : (
                          <> VERIFY & DEPLOY <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  </Form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 h-px" style={{ background: "rgba(0,255,65,0.1)" }} />
                    <span className="text-xs font-mono" style={{ color: "rgba(0,255,65,0.3)" }}>OR</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(155,48,255,0.1)" }} />
                  </div>

                  {/* Fork link */}
                  <a
                    href="https://github.com/GuruhTech/ULTRA-GURU/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-4 h-10 rounded-lg text-xs font-mono tracking-widest transition-all"
                    style={{
                      background: "rgba(155,48,255,0.07)",
                      border: "1px solid rgba(155,48,255,0.2)",
                      color: "rgba(155,48,255,0.8)",
                    }}
                    data-testid="link-fork"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    FORK THE REPO FIRST
                  </a>
                </motion.div>

              /* ── SUCCESS ── */
              ) : result.hasFork ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center relative"
                    style={{
                      background: "rgba(0,255,65,0.08)",
                      border: "2px solid rgba(0,255,65,0.5)",
                      boxShadow: "0 0 40px rgba(0,255,65,0.25), inset 0 0 20px rgba(0,255,65,0.05)",
                    }}
                  >
                    <motion.div className="absolute inset-0 rounded-full"
                      animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                      style={{ border: "1px solid #00ff41" }} />
                    <CheckCircle2 className="w-9 h-9" style={{ color: "#00ff41", filter: "drop-shadow(0 0 8px #00ff41)" }} />
                  </motion.div>

                  <h3 className="text-2xl font-black tracking-widest mb-2"
                    style={{ color: "#00ff41", textShadow: "0 0 20px #00ff41, 0 0 40px rgba(0,255,65,0.4)" }}>
                    ACCESS GRANTED
                  </h3>
                  <p className="text-xs font-mono mb-8" style={{ color: "rgba(0,255,65,0.5)" }}>
                    Fork verified — launching Heroku deploy...
                  </p>

                  {result.redirectUrl && (
                    <button
                      onClick={() => { window.location.href = result.redirectUrl!; }}
                      data-testid="button-manual-deploy"
                      className="w-full h-12 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: "rgba(155,48,255,0.12)",
                        border: "1px solid rgba(155,48,255,0.4)",
                        color: "#c084fc",
                        boxShadow: "0 0 20px rgba(155,48,255,0.15)",
                      }}
                    >
                      <SiHeroku className="w-4 h-4" />
                      OPEN HEROKU DEPLOY
                    </button>
                  )}
                </motion.div>

              /* ── DENIED ── */
              ) : (
                <motion.div key="denied"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(220,38,38,0.08)",
                      border: "2px solid rgba(220,38,38,0.4)",
                      boxShadow: "0 0 30px rgba(220,38,38,0.15)",
                    }}>
                    <XCircle className="w-9 h-9" style={{ color: "#f87171", filter: "drop-shadow(0 0 6px rgba(248,113,113,0.6))" }} />
                  </div>
                  <h3 className="text-2xl font-black tracking-widest mb-2"
                    style={{ color: "#f87171", textShadow: "0 0 16px rgba(248,113,113,0.4)" }}>
                    ACCESS DENIED
                  </h3>
                  <p className="text-xs font-mono mb-8 leading-relaxed"
                    style={{ color: "rgba(200,180,180,0.55)" }}>
                    No fork found for this username.<br />Fork the repo, then come back.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href="https://github.com/GuruhTech/ULTRA-GURU/fork"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-fork"
                      className="w-full h-12 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #00cc33 0%, #00ff41 100%)",
                        color: "#020d04",
                        fontFamily: "'Orbitron', sans-serif",
                        boxShadow: "0 0 20px rgba(0,255,65,0.3)",
                      }}
                    >
                      <SiGithub className="w-4 h-4" /> FORK ON GITHUB
                    </a>
                    <button
                      onClick={() => { setResult(null); form.reset(); }}
                      data-testid="button-retry"
                      className="h-10 rounded-lg text-xs font-mono tracking-widest transition-all"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.25)",
                      }}
                    >
                      TRY ANOTHER USERNAME
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom accent bar */}
          <div className="h-px w-full" style={{
            background: "linear-gradient(90deg, transparent, rgba(155,48,255,0.5) 30%, rgba(0,255,65,0.5) 70%, transparent)",
          }} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-3 text-xs font-mono"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <span style={{ color: "rgba(0,255,65,0.4)" }}>▲</span>
          GURUTECH LAB · ULTRA-GURU MD BOT
          <span style={{ color: "rgba(155,48,255,0.4)" }}>▲</span>
        </motion.div>
      </div>
    </div>
  );
}
