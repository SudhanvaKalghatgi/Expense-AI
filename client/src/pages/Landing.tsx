import { Link, useNavigate } from "react-router-dom";
import { Play, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();


  const handleGetStarted = () => {
    navigate("/sign-in");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "circOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,204,136,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,204,136,0.15),rgba(0,0,0,0))]" />
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" as const }}
        className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/10 dark:border-white/5 supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-foreground text-background p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <img src="/expenseAI.png" alt="ExpenseAI" className="h-5 w-auto invert dark:invert-0" />
            </div>
            <span className="font-bold text-xl tracking-tight">ExpenseAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Testimonials", "About"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/sign-in")} className="hover:bg-muted/50 rounded-full px-5">
              Log in
            </Button>
            <Button onClick={handleGetStarted} className="rounded-full px-6 shadow-[0_0_20px_-5px_rgba(0,204,136,0.5)] hover:shadow-[0_0_25px_-5px_rgba(0,204,136,0.6)] transition-all duration-300">
              Start Free Trial
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-sm font-medium backdrop-blur-sm self-start mx-auto shadow-inner hover:bg-secondary/70 transition-colors cursor-pointer">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v2.0 is now live
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-50" />
            </motion.div>

            <motion.h1 
              variants={fadeInUp} 
              className="text-6xl md:text-8xl font-bold tracking-tighter text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-[0.9]"
            >
              Master your money,
              <br />
              <span className="text-foreground">effortlessly.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground/80 text-balance leading-relaxed font-light">
              The only AI-powered finance tracker that categorizes, analyzes, and optimizes your spending automatically.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Button size="lg" onClick={handleGetStarted} className="h-14 px-10 rounded-full text-lg font-semibold shadow-[0_10px_40px_-10px_rgba(0,204,136,0.5)] hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground border-t border-white/20">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg gap-3 bg-background/50 backdrop-blur-sm hover:bg-white hover:text-black border-input/50 shadow-sm hover:shadow-md transition-all duration-300">
                <Play className="w-5 h-5 fill-current" />
                 Watch demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero Dashboard Preview with 3D Interaction */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="max-w-[1240px] mx-auto mt-24 relative px-4 perspective-[2000px]"
        >
          <div className="relative rounded-2xl border border-border/40 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-10" />
            
            <img 
              src="/dashboard.png" 
              alt="Dashboard Preview" 
              className="w-full h-auto object-cover rounded-xl shadow-inner"
            />
            
            {/* Floating Elements (Simulated) */}
            <motion.div 
              className="absolute -right-8 -bottom-12 md:right-12 md:-bottom-20 w-64 md:w-80 rounded-2xl shadow-premium-lg border border-border/50 bg-card p-4 hidden md:block"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Smart Insight</div>
                  <div className="text-xs text-muted-foreground">Just now</div>
                </div>
              </div>
              <p className="text-sm text-foreground/80">You've saved <span className="text-primary font-bold">$124.50</span> this month by optimizing subscriptions!</p>
            </motion.div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[50%] bg-primary/10 blur-[120px] -z-10 rounded-[100%]" />
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-32 px-6 bg-secondary/20 relative">
        <div className="max-w-[1400px] mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need.</h2>
            <p className="text-xl text-muted-foreground">Powered by advanced algorithms to handle the heavy lifting of financial management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* Feature 1: Large Span */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm hover:shadow-premium transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-10 flex flex-col h-full relative z-10">
                <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground mb-8 max-w-md">Visualize your spending habits with beautiful, interactive charts that update instantly as you spend.</p>
                <div className="flex-1 rounded-t-2xl border border-border/30 bg-card shadow-lg p-2 overflow-hidden relative">
                   <img src="/dashboard.png" className="w-full h-full object-cover object-top rounded-t-xl opacity-90 group-hover:opacity-100 transition-opacity duration-500" alt="Analytics" />
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Tall Profile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:row-span-2 relative group overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm hover:shadow-premium transition-all duration-500 cursor-pointer"
            >
              <div className="p-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Bank-Grade Security</h3>
                <p className="text-muted-foreground mb-8">Your data is encrypted with AES-256 bit encryption. We never sell your data.</p>
                
                <div className="flex-1 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                  <div className="relative w-full aspect-[3/4] rounded-2xl border border-border/50 bg-card p-6 shadow-inner flex flex-col items-center justify-center gap-4 group-hover:translate-y-[-10px] transition-transform duration-500">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                      <ShieldCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="h-2 w-24 bg-border/50 rounded-full" />
                    <div className="h-2 w-16 bg-border/30 rounded-full" />
                    <div className="h-2 w-20 bg-border/30 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Standard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm hover:shadow-premium transition-all duration-500 cursor-pointer"
            >
              <div className="p-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Instant Categorization</h3>
                <p className="text-muted-foreground">AI automatically sorts your expenses into the right categories.</p>
              </div>
            </motion.div>

            {/* Feature 4: Standard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative group overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm hover:shadow-premium transition-all duration-500 cursor-pointer"
            >
              <div className="p-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Multi-Currency</h3>
                <p className="text-muted-foreground">Seamlessly handle transactions in over 150 currencies.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Social Proof / Numbers */}
      <section className="py-24 border-y border-border/50 bg-background">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[ 
              { label: "Active Users", value: "50k+" },
              { label: "Transaction Tracked", value: "$2B+" },
              { label: "App Store Rating", value: "4.9" },
              { label: "Countries", value: "120+" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Large CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="max-w-[800px] mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Stop losing money.
            <br />
            <span className="text-muted-foreground">Start growing it.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted} className="h-16 px-12 rounded-full text-xl shadow-premium-lg bg-foreground text-background hover:bg-foreground/90 transition-all duration-300">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 pt-20 pb-10 px-6">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-5 gap-12 mb-20">
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-foreground text-background p-2 rounded-lg">
                <img src="/expenseAI.png" alt="ExpenseAI" className="h-5 w-auto invert dark:invert-0" />
              </div>
              <span className="font-bold text-xl tracking-tight">ExpenseAI</span>
            </Link>
            <p className="text-lg text-muted-foreground max-w-sm">
              The smartest way to track expenses, manage budgets, and achieve financial freedom.
            </p>
          </div>
          
          {[
            { title: "Product", links: ["Features", "Security", "Enterprise", "Pricing"] },
            { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy"] }
          ].map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold mb-6">{column.title}</h4>
              <ul className="space-y-4 text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="max-w-[1400px] mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} ExpenseAI Inc. All rights reserved.</div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-foreground">Twitter</a>
            <a href="#" className="hover:text-foreground">LinkedIn</a>
            <a href="#" className="hover:text-foreground">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
