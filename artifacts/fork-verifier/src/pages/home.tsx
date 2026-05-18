import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { SiGithub, SiHeroku } from "react-icons/si";
import { Check, X, Loader2, ArrowRight } from "lucide-react";

import { useVerifyFork } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import bannerImg from "@assets/ultra-guru-banner.jpg";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .trim()
    .refine((val) => !val.includes(" "), {
      message: "Username cannot contain spaces",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const [verificationResult, setVerificationResult] = useState<{
    hasFork?: boolean;
    redirectUrl?: string | null;
  } | null>(null);

  const verifyFork = useVerifyFork({
    mutation: {
      onSuccess: (data) => {
        setVerificationResult({
          hasFork: data.hasFork,
          redirectUrl: data.redirectUrl,
        });
        if (data.hasFork && data.redirectUrl) {
          toast({ title: "Access Granted", description: "Redirecting to Heroku..." });
          setTimeout(() => { window.location.href = data.redirectUrl!; }, 1500);
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Error checking your GitHub account. Please try again.",
        });
      },
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    setVerificationResult(null);
    verifyFork.mutate({ data: { username: values.username } });
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden scanlines">

      {/* Green top-left glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(57,255,20,0.1) 0%, transparent 65%)" }} />
      {/* Purple bottom-right glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 100% 100%, rgba(139,0,255,0.1) 0%, transparent 65%)" }} />

      <div className="w-full max-w-lg relative z-10 flex flex-col items-center gap-5">

        {/* ── Banner image ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-sm overflow-hidden relative"
          style={{
            boxShadow: "0 0 0 1px rgba(57,255,20,0.25), 0 0 40px rgba(57,255,20,0.12), 0 0 80px rgba(139,0,255,0.08)",
          }}
        >
          {/* Green neon top border line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: "linear-gradient(90deg, transparent 5%, #39ff14 30%, #39ff14 70%, transparent 95%)", boxShadow: "0 0 10px #39ff14, 0 0 20px rgba(57,255,20,0.5)" }} />
          {/* Purple neon bottom border line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10"
            style={{ background: "linear-gradient(90deg, transparent 5%, #8b00ff 30%, #8b00ff 70%, transparent 95%)", boxShadow: "0 0 10px #8b00ff, 0 0 20px rgba(139,0,255,0.5)" }} />
          {/* Corner bolts */}
          {[["top-2 left-2"], ["top-2 right-2"], ["bottom-2 left-2"], ["bottom-2 right-2"]].map((pos, i) => (
            <div key={i} className={`absolute ${pos[0]} w-3 h-3 rounded-full z-10`}
              style={{
                background: "radial-gradient(circle, rgba(220,230,240,0.6) 0%, rgba(100,110,130,0.3) 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 0 4px rgba(57,255,20,0.4)",
              }} />
          ))}
          <img
            src={bannerImg}
            alt="ULTRA GURU MD BOT"
            className="w-full object-cover"
            data-testid="img-banner"
          />
        </motion.div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center"
        >
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tighter mb-1"
            style={{
              color: "#e8eef4",
              textShadow: "0 0 20px rgba(57,255,20,0.25), 0 1px 0 rgba(0,0,0,0.8)",
            }}
          >
            ULTRA GURU
          </h1>
          <p
            className="text-sm font-mono tracking-[0.3em]"
            style={{ color: "rgba(57,255,20,0.7)", textShadow: "0 0 10px rgba(57,255,20,0.4)" }}
          >
            DEPLOYMENT GATEWAY_
          </p>
        </motion.div>

        {/* ── Main steel panel card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full steel-card steel-corner rounded-sm p-8"
        >
          <AnimatePresence mode="wait">

            {/* Form state */}
            {!verificationResult ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-sm leading-relaxed font-mono"
                  style={{ color: "rgba(180,195,180,0.7)" }}>
                  <span style={{ color: "#39ff14" }}>&gt;</span> Access requires an active fork of GuruhTech/ULTRA-GURU.<br />
                  <span style={{ color: "#39ff14" }}>&gt;</span> Enter your GitHub username to proceed.
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <SiGithub className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                                style={{ color: "rgba(180,195,180,0.5)" }} />
                              <Input
                                placeholder="GitHub Username"
                                className="pl-10 h-12 font-mono text-base"
                                style={{
                                  background: "rgba(10,14,18,0.7)",
                                  border: "1px solid rgba(57,255,20,0.2)",
                                  color: "#c8d5c0",
                                  outline: "none",
                                }}
                                autoComplete="off"
                                spellCheck="false"
                                data-testid="input-username"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold tracking-widest transition-all duration-200"
                      disabled={verifyFork.isPending}
                      data-testid="button-submit"
                      style={{
                        background: verifyFork.isPending
                          ? "rgba(57,255,20,0.15)"
                          : "linear-gradient(135deg, rgba(57,255,20,0.9) 0%, rgba(0,200,10,0.9) 100%)",
                        color: "#050c00",
                        border: "1px solid rgba(57,255,20,0.5)",
                        boxShadow: verifyFork.isPending ? "none" : "0 0 20px rgba(57,255,20,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {verifyFork.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" style={{ color: "#39ff14" }} />
                          <span style={{ color: "#39ff14" }}>VERIFYING...</span>
                        </>
                      ) : (
                        <>
                          VERIFY & DEPLOY
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>

            /* Success state */
            ) : verificationResult.hasFork ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                    style={{ border: "1px solid #39ff14", boxShadow: "0 0 10px #39ff14" }}
                  />
                  <div className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(57,255,20,0.1)",
                      border: "1px solid rgba(57,255,20,0.4)",
                      boxShadow: "0 0 20px rgba(57,255,20,0.2)",
                    }}>
                    <Check className="w-8 h-8 green-glow" style={{ color: "#39ff14" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-widest mb-2 green-glow font-mono"
                  style={{ color: "#39ff14" }}>ACCESS GRANTED</h3>
                <p className="text-sm mb-8 font-mono" style={{ color: "rgba(180,195,180,0.6)" }}>
                  Fork verified. Initializing deployment sequence...
                </p>
                {verificationResult.redirectUrl && (
                  <button
                    className="w-full h-12 font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 rounded-sm transition-all"
                    onClick={() => { window.location.href = verificationResult.redirectUrl!; }}
                    data-testid="button-manual-deploy"
                    style={{
                      background: "rgba(139,0,255,0.12)",
                      border: "1px solid rgba(139,0,255,0.4)",
                      color: "#c084fc",
                      boxShadow: "0 0 20px rgba(139,0,255,0.15)",
                    }}
                  >
                    <SiHeroku className="w-5 h-5" style={{ color: "#c084fc" }} />
                    DEPLOY TO HEROKU MANUALLY
                  </button>
                )}
              </motion.div>

            /* Denied state */
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(220,40,40,0.1)",
                    border: "1px solid rgba(220,40,40,0.35)",
                    boxShadow: "0 0 20px rgba(220,40,40,0.12)",
                  }}>
                  <X className="w-8 h-8" style={{ color: "#f87171" }} />
                </div>
                <h3 className="text-xl font-bold tracking-widest mb-2 font-mono"
                  style={{ color: "#f87171", textShadow: "0 0 12px rgba(248,113,113,0.5)" }}>ACCESS DENIED</h3>
                <p className="text-sm mb-8 font-mono leading-relaxed"
                  style={{ color: "rgba(180,195,180,0.6)" }}>
                  Repository fork not found.<br />You must fork the project before deploying.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full h-12 font-mono text-sm font-bold tracking-wider flex items-center justify-center gap-2 rounded-sm transition-all"
                    onClick={() => window.open("https://github.com/GuruhTech/ULTRA-GURU/fork", "_blank")}
                    data-testid="button-fork"
                    style={{
                      background: "linear-gradient(135deg, rgba(57,255,20,0.85) 0%, rgba(0,200,10,0.85) 100%)",
                      color: "#050c00",
                      border: "1px solid rgba(57,255,20,0.5)",
                      boxShadow: "0 0 16px rgba(57,255,20,0.25)",
                    }}
                  >
                    <SiGithub className="w-5 h-5" />
                    FORK ON GITHUB
                  </button>
                  <button
                    className="w-full h-10 font-mono text-xs tracking-widest rounded-sm transition-all"
                    onClick={() => { setVerificationResult(null); form.reset(); }}
                    data-testid="button-retry"
                    style={{
                      background: "transparent",
                      color: "rgba(180,195,180,0.45)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    TRY AGAIN
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs font-mono tracking-[0.25em] text-center"
          style={{ color: "rgba(139,0,255,0.55)", textShadow: "0 0 8px rgba(139,0,255,0.3)" }}
          data-testid="text-footer"
        >
          FORK AND STAR THE REPO BEFORE DEPLOYMENT
        </motion.p>
      </div>
    </div>
  );
}
