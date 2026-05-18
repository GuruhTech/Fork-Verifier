import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { SiGithub, SiHeroku } from "react-icons/si";
import { CheckCircle2, XCircle, Loader2, ArrowRight, GitFork } from "lucide-react";

import { useVerifyFork, useGetForkCount } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import bannerImg from "@assets/ultra-guru-banner.jpg";

// Softer emerald green + muted purple — matches the bot image without being eye-searing
const G = "#4ade80";
const G20 = "rgba(74,222,128,0.20)";
const G12 = "rgba(74,222,128,0.12)";
const G08 = "rgba(74,222,128,0.08)";
const G04 = "rgba(74,222,128,0.04)";
const P  = "#a855f7";
const P20 = "rgba(168,85,247,0.20)";
const P12 = "rgba(168,85,247,0.12)";
const P08 = "rgba(168,85,247,0.08)";

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

  const forkCount = useGetForkCount();

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

  const count = forkCount.data?.count;

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">

      {/* ── Background: bot image, dimmed ── */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url(${bannerImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        filter: "brightness(0.28) saturate(1.1)",
      }} />

      {/* ── Dark gradient overlay ── */}
      <div className="absolute inset-0 z-10" style={{
        background: "linear-gradient(180deg, rgba(4,8,12,0.5) 0%, rgba(4,8,12,0.78) 35%, rgba(4,8,12,0.96) 100%)",
      }} />

      {/* ── Hex grid overlay ── */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33L28 66zM28 100L0 84V51l28-16 28 16v33L28 100z' fill='none' stroke='rgba(74,222,128,0.035)' stroke-width='1'/%3E%3C/svg%3E\")",
        backgroundSize: "56px 100px",
      }} />

      {/* ── Top neon bar ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent 0%, ${G} 30%, ${G} 70%, transparent 100%)`,
        boxShadow: `0 0 18px ${G}, 0 0 40px ${G20}`,
        opacity: 0.75,
      }} />
      {/* ── Bottom neon bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20 pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent 0%, ${P} 30%, ${P} 70%, transparent 100%)`,
        boxShadow: `0 0 18px ${P}, 0 0 40px ${P20}`,
        opacity: 0.7,
      }} />

      {/* ── Content ── */}
      <div className="relative z-30 w-full max-w-md px-4 py-10 flex flex-col items-center gap-7">

        {/* Badge with live fork counter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          {/* Gateway badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest" style={{
            background: G08,
            border: `1px solid ${G20}`,
            color: G,
          }}>
            <GitFork className="w-3 h-3" />
            FORK VERIFICATION GATEWAY
          </div>

          {/* Live fork counter pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono" style={{
            background: P08,
            border: `1px solid ${P20}`,
            color: P,
          }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: P }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: P }} />
            </span>
            {forkCount.isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : forkCount.isError ? (
              <span>—</span>
            ) : (
              <span>{count?.toLocaleString()} FORKS</span>
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-3" style={{
            color: "#ffffff",
            textShadow: `0 0 30px ${G20}, 0 2px 4px rgba(0,0,0,0.9)`,
          }}>
            ULTRA<br />
            <span style={{ color: G, textShadow: `0 0 20px ${G20}, 0 0 50px ${G12}` }}>GURU</span>
          </h1>
          <p className="text-xs font-mono tracking-[0.3em]" style={{ color: `${P}cc` }}>
            MD BOT · DEPLOYMENT GATEWAY
          </p>
        </motion.div>

        {/* ── Glass panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full rounded-xl overflow-hidden"
          style={{
            background: "rgba(6,12,18,0.78)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: `1px solid ${G20}`,
            boxShadow: `0 0 0 1px ${G08}, 0 20px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* Top gradient rule */}
          <div className="h-px w-full" style={{
            background: `linear-gradient(90deg, transparent, ${G} 30%, ${P} 70%, transparent)`,
            opacity: 0.55,
          }} />

          <div className="p-7">
            <AnimatePresence mode="wait">

              {/* ── FORM ── */}
              {!result ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs font-mono mb-6 leading-relaxed" style={{ color: `${G}88` }}>
                    <span style={{ color: G }}>&gt;_</span> Enter your GitHub username to verify your fork of{" "}
                    <span style={{ color: `${P}cc` }}>GuruhTech/ULTRA-GURU</span>
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
                                <SiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${G}66` }} />
                                <input
                                  placeholder="your-github-username"
                                  autoComplete="off"
                                  spellCheck="false"
                                  data-testid="input-username"
                                  className="w-full h-12 pl-10 pr-4 rounded-lg text-sm font-mono outline-none transition-all"
                                  style={{
                                    background: G04,
                                    border: `1px solid ${G20}`,
                                    color: "#cde8d4",
                                    caretColor: G,
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.border = `1px solid ${G}88`;
                                    e.target.style.boxShadow = `0 0 0 3px ${G08}`;
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.border = `1px solid ${G20}`;
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
                        className="w-full h-12 rounded-lg font-black tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: verifyFork.isPending
                            ? G12
                            : `linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)`,
                          color: "#030e06",
                          fontFamily: "'Orbitron', sans-serif",
                          boxShadow: verifyFork.isPending ? "none" : `0 0 16px ${G20}, 0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                        }}
                      >
                        {verifyFork.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" style={{ color: G }} /><span style={{ color: G }}>VERIFYING...</span></>
                        ) : (
                          <>VERIFY & DEPLOY <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  </Form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 h-px" style={{ background: G12 }} />
                    <span className="text-xs font-mono" style={{ color: `${G}44` }}>OR</span>
                    <div className="flex-1 h-px" style={{ background: P12 }} />
                  </div>

                  {/* Fork link */}
                  <a
                    href="https://github.com/GuruhTech/ULTRA-GURU/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-fork"
                    className="flex items-center justify-center gap-2 mt-4 h-10 rounded-lg text-xs font-mono tracking-widest transition-all"
                    style={{
                      background: P08,
                      border: `1px solid ${P20}`,
                      color: `${P}cc`,
                    }}
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
                      background: G08,
                      border: `2px solid ${G}88`,
                      boxShadow: `0 0 30px ${G20}`,
                    }}
                  >
                    <motion.div className="absolute inset-0 rounded-full"
                      animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                      style={{ border: `1px solid ${G}` }} />
                    <CheckCircle2 className="w-9 h-9" style={{ color: G, filter: `drop-shadow(0 0 6px ${G})` }} />
                  </motion.div>
                  <h3 className="text-2xl font-black tracking-widest mb-2"
                    style={{ color: G, textShadow: `0 0 16px ${G20}` }}>
                    ACCESS GRANTED
                  </h3>
                  <p className="text-xs font-mono mb-8" style={{ color: `${G}66` }}>
                    Fork verified — launching Heroku deploy...
                  </p>
                  {result.redirectUrl && (
                    <button
                      onClick={() => { window.location.href = result.redirectUrl!; }}
                      data-testid="button-manual-deploy"
                      className="w-full h-12 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: P08,
                        border: `1px solid ${P20}`,
                        color: `${P}cc`,
                        boxShadow: `0 0 16px ${P12}`,
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
                    style={{ background: "rgba(220,38,38,0.08)", border: "2px solid rgba(220,38,38,0.35)", boxShadow: "0 0 24px rgba(220,38,38,0.12)" }}>
                    <XCircle className="w-9 h-9" style={{ color: "#f87171", filter: "drop-shadow(0 0 5px rgba(248,113,113,0.5))" }} />
                  </div>
                  <h3 className="text-2xl font-black tracking-widest mb-2"
                    style={{ color: "#f87171", textShadow: "0 0 14px rgba(248,113,113,0.35)" }}>
                    ACCESS DENIED
                  </h3>
                  <p className="text-xs font-mono mb-8 leading-relaxed" style={{ color: "rgba(200,180,180,0.5)" }}>
                    No fork found for this username.<br />Fork the repo first, then come back.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href="https://github.com/GuruhTech/ULTRA-GURU/fork"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-fork"
                      className="w-full h-12 rounded-lg font-mono text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
                        color: "#030e06",
                        fontFamily: "'Orbitron', sans-serif",
                        boxShadow: `0 0 16px ${G20}`,
                      }}
                    >
                      <SiGithub className="w-4 h-4" /> FORK ON GITHUB
                    </a>
                    <button
                      onClick={() => { setResult(null); form.reset(); }}
                      data-testid="button-retry"
                      className="h-10 rounded-lg text-xs font-mono tracking-widest transition-all"
                      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.22)" }}
                    >
                      TRY ANOTHER USERNAME
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom gradient rule */}
          <div className="h-px w-full" style={{
            background: `linear-gradient(90deg, transparent, ${P} 30%, ${G} 70%, transparent)`,
            opacity: 0.45,
          }} />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-xs font-mono tracking-[0.2em] text-center"
          style={{ color: `${P}55` }}
          data-testid="text-footer"
        >
          GURUTECH LAB · ULTRA-GURU MD BOT
        </motion.p>
      </div>
    </div>
  );
}
