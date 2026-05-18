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
import { Card } from "@/components/ui/card";
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
          toast({
            title: "Access Granted",
            description: "Redirecting to Heroku...",
          });
          setTimeout(() => {
            window.location.href = data.redirectUrl!;
          }, 1500);
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "There was an error checking your GitHub account. Please try again.",
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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 flex flex-col items-center gap-6">

        {/* Banner image */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_40px_rgba(0,229,255,0.15)]"
        >
          <img
            src={bannerImg}
            alt="ULTRA GURU"
            className="w-full object-cover"
            data-testid="img-banner"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-foreground drop-shadow-md">
            ULTRA GURU
          </h1>
          <p className="text-base text-muted-foreground font-mono tracking-widest">
            DEPLOYMENT GATEWAY_
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full"
        >
          <Card className="p-8 border-primary/20 bg-card/80 backdrop-blur-md shadow-[0_0_40px_rgba(0,229,255,0.1)]">
            <AnimatePresence mode="wait">
              {!verificationResult ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6 text-sm text-muted-foreground leading-relaxed font-mono">
                    <span className="text-primary">&gt;</span> Access requires an active fork of GuruhTech/ULTRA-GURU.<br />
                    <span className="text-primary">&gt;</span> Enter your GitHub username to proceed.
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
                                <SiGithub className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  placeholder="GitHub Username"
                                  className="pl-10 h-12 bg-background/50 border-border focus-visible:ring-primary font-mono text-base"
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
                        className="w-full h-12 text-base font-bold tracking-wider hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
                        disabled={verifyFork.isPending}
                        data-testid="button-submit"
                      >
                        {verifyFork.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            VERIFYING...
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
              ) : verificationResult.hasFork ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-full"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2 tracking-wide">ACCESS GRANTED</h3>
                  <p className="text-muted-foreground font-mono text-sm mb-8">
                    Fork verified. Initializing deployment sequence...
                  </p>
                  {verificationResult.redirectUrl && (
                    <Button
                      variant="outline"
                      className="w-full h-12 font-mono border-primary/50 hover:bg-primary/10"
                      onClick={() => { window.location.href = verificationResult.redirectUrl!; }}
                      data-testid="button-manual-deploy"
                    >
                      <SiHeroku className="w-5 h-5 mr-2 text-[#430098]" />
                      Deploy to Heroku Manually
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-destructive/30">
                    <X className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold text-destructive mb-2 tracking-wide">ACCESS DENIED</h3>
                  <p className="text-muted-foreground font-mono text-sm mb-8 leading-relaxed">
                    Repository fork not found. You must fork the project before deploying.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full h-12 font-mono"
                      onClick={() => window.open("https://github.com/GuruhTech/ULTRA-GURU/fork", "_blank")}
                      data-testid="button-fork"
                    >
                      <SiGithub className="w-5 h-5 mr-2" />
                      FORK ON GITHUB
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-12 font-mono text-muted-foreground hover:text-foreground"
                      onClick={() => { setVerificationResult(null); form.reset(); }}
                      data-testid="button-retry"
                    >
                      TRY AGAIN
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground font-mono text-center"
          data-testid="text-footer"
        >
          FORK AND STAR THE REPO BEFORE DEPLOYMENT
        </motion.p>
      </div>
    </div>
  );
}
