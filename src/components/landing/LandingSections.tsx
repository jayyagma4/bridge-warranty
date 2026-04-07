import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Clock,
  Users,
  Car,
  FileCheck,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Zap,
  Lock,
  Globe,
} from "lucide-react";

/* ─── Countdown Timer ─── */
const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) return;
      setTime({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3 sm:gap-4">
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-display font-bold text-white">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-white/60 mt-1.5 capitalize font-medium tracking-wide">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-display font-extrabold text-white">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-white/60 mt-1 font-medium">{label}</div>
    </motion.div>
  );
};

/* ─── Hero Section ─── */
const HeroSection = () => {
  const navigate = useNavigate();
  const launchDate = new Date("2026-07-01T00:00:00");

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(225,80%,20%)] via-[hsl(225,80%,35%)] to-[hsl(225,80%,56%)]" />
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.07]">
        <div className="absolute top-[10%] right-[10%] w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-[20%] right-[30%] w-64 h-64 rounded-full bg-[hsl(45,93%,58%)] blur-3xl" />
      </div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 relative z-10 py-32 md:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/20">
                <Clock className="w-4 h-4 text-accent" /> Launching July 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.1] mt-6 mb-6"
            >
              Canada's Dealer-Only{" "}
              <span className="text-accent">Warranty Marketplace</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed"
            >
              Connect with top-rated warranty providers, compare products side-by-side, and grow your F&I revenue — all in one modern platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base font-semibold px-8 shadow-lg shadow-accent/25"
              >
                Register Your Dealership <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/sign-in")}
                className="border-white/30 text-white hover:bg-white/10 text-base"
              >
                Sign In
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-6 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Free to register</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Ontario dealers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>8+ providers</span>
              </div>
            </motion.div>
          </div>

          {/* Right countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center lg:items-end"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10 w-full max-w-md">
              <h3 className="text-white font-display font-bold text-xl mb-2 text-center">
                Platform Launch Countdown
              </h3>
              <p className="text-white/50 text-sm mb-6 text-center">
                Be among the first dealerships on the platform
              </p>
              <div className="flex justify-center mb-8">
                <CountdownTimer targetDate={launchDate} />
              </div>
              <div className="space-y-3">
                {[
                  "Early access to all providers",
                  "Priority onboarding support",
                  "Exclusive launch pricing",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto lg:mx-0"
        >
          <AnimatedCounter end={50000} suffix="+" label="Active Users" />
          <AnimatedCounter end={500} suffix="+" label="Dealerships" />
          <AnimatedCounter end={99} suffix=".9%" label="Uptime" />
          <AnimatedCounter end={24} suffix="/7" label="Support" />
        </motion.div>
      </div>
    </section>
  );
};

/* ─── How It Works ─── */
const HowItWorksSection = () => {
  const steps = [
    { icon: FileCheck, title: "Register", desc: "Sign up your dealership in under 3 minutes with our streamlined wizard." },
    { icon: Globe, title: "Browse Providers", desc: "Access Ontario's top warranty providers and compare products side-by-side." },
    { icon: Car, title: "Draft Contracts", desc: "Create and submit warranty contracts digitally — no faxes or phone calls." },
    { icon: TrendingUp, title: "Grow Revenue", desc: "Track performance, manage remittances, and scale your F&I business." },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Four Simple Steps
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From registration to revenue — get set up and selling in minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border hidden md:block last:hidden" />
              <span className="text-xs font-bold text-primary/50 uppercase tracking-widest">Step {i + 1}</span>
              <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Features Section ─── */
const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "What is Bridge Warranty?",
      description: "A wholesale marketplace exclusively for Canadian dealerships to discover, compare, and purchase warranty and protection products from top-rated providers.",
    },
    {
      icon: Users,
      title: "Built for Dealerships",
      description: "Manage your entire F&I portfolio — from VSCs to GAP insurance, Tire & Rim, PPF, ceramic coating, and more — all from one dashboard.",
    },
    {
      icon: Zap,
      title: "Streamlined Contracts",
      description: "Draft, submit, and track contracts with providers in real time. No more fax machines, phone calls, or scattered spreadsheets.",
    },
    {
      icon: Lock,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with OMVIC compliance verification, role-based access control, and full audit trails.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your sales performance, monitor remittances, and gain insights into your protection product portfolio.",
    },
    {
      icon: Globe,
      title: "Multi-Provider Access",
      description: "Compare products across 8+ Ontario warranty providers without leaving the platform. Best rates, best coverage.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Platform Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Everything Your Dealership Needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            One platform to connect with providers, compare products, and grow your protection revenue.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Products Section ─── */
const ProductsSection = () => {
  const products = [
    { name: "Vehicle Service Contracts (VSC)", icon: Car },
    { name: "GAP Insurance", icon: Shield },
    { name: "Tire & Rim Protection", icon: CheckCircle2 },
    { name: "Paint Protection Film (PPF)", icon: Shield },
    { name: "Ceramic Coating", icon: Zap },
    { name: "Undercoating & Rust Protection", icon: Lock },
    { name: "Key Replacement", icon: CheckCircle2 },
    { name: "Dent Repair Coverage", icon: Car },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Product Catalog</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Products You Can Sell
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access a full catalog of warranty and protection products from multiple providers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <product.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{product.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Providers Section ─── */
const ProvidersSection = () => {
  const providers = [
    { name: "A-Protect Warranty Corporation", phone: "(905) 752-1778", email: "info@a-protect.com", address: "Markham, ON" },
    { name: "Global Warranty", phone: "(800) 265-3282", email: "info@globalwarranty.com", address: "London, ON" },
    { name: "Peoples Choice Warranty (PCW)", phone: "(905) 492-7295", email: "info@pcwcanada.com", address: "Whitby, ON" },
    { name: "Ensurall", phone: "(855) 367-8725", email: "info@ensurall.ca", address: "Toronto, ON" },
    { name: "First Canadian Protection Plans", phone: "(800) 668-4213", email: "info@fcpp.com", address: "Oakville, ON" },
    { name: "Lubrico Warranty", phone: "(800) 463-1028", email: "info@lubrico.com", address: "Hamilton, ON" },
    { name: "NationWide Auto Warranty", phone: "(866) 829-7782", email: "info@nwaw.ca", address: "Toronto, ON" },
    { name: "Auto Shield Canada", phone: "(888) 328-8818", email: "info@autoshield.ca", address: "Mississauga, ON" },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Provider Network</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Ontario Provider Directory
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trusted warranty and protection providers available at launch.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-sm text-foreground mb-3 leading-tight">
                {provider.name}
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{provider.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{provider.address}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Footer CTA ─── */
const FooterCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative overflow-hidden bg-gradient-to-br from-[hsl(225,80%,30%)] to-[hsl(225,80%,50%)] rounded-3xl p-12 md:p-16"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Be Part of the Launch?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto text-lg">
              Join dealerships getting early access to Canada's first dealer-only warranty marketplace.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base font-semibold px-8 shadow-lg shadow-accent/25"
            >
              Register Your Dealership <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Footer ─── */
const Footer = () => (
  <footer className="border-t border-border bg-card py-10">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">BW</span>
          </div>
          <div>
            <span className="font-display font-bold text-foreground">Bridge Warranty</span>
            <p className="text-xs text-muted-foreground">© 2026 All rights reserved.</p>
          </div>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
);

export { HeroSection, HowItWorksSection, FeaturesSection, ProductsSection, ProvidersSection, FooterCTA, Footer };
