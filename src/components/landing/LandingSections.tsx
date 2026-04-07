import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";

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
    <div className="flex gap-3">
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-card border border-border rounded-lg w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-foreground">{String(value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 capitalize">{label}</span>
        </div>
      ))}
    </div>
  );
};

const AnimatedStat = ({ value, label }: { value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="text-3xl md:text-4xl font-display font-bold text-primary">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </motion.div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const launchDate = new Date("2026-07-01T00:00:00");

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Clock className="w-4 h-4" /> Launching Soon
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6"
          >
            Canada's Dealer-Only{" "}
            <span className="text-primary">Warranty Marketplace</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Connect your dealership with top-rated warranty and protection providers. Compare products, draft contracts, and grow your F&I revenue — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <CountdownTimer targetDate={launchDate} />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate("/register")} className="gap-2">
                Register Your Dealership <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/sign-in")}>
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-2xl mx-auto"
        >
          <AnimatedStat value="50K+" label="Active Users" />
          <AnimatedStat value="500+" label="Dealerships" />
          <AnimatedStat value="99.9%" label="Uptime" />
          <AnimatedStat value="24/7" label="Support" />
        </motion.div>
      </div>
    </section>
  );
};

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
      description: "Manage your entire F&I product portfolio, from Vehicle Service Contracts to GAP insurance, Tire & Rim, PPF, ceramic coating, and more.",
    },
    {
      icon: Clock,
      title: "Streamlined Contracts",
      description: "Draft, submit, and track contracts with providers in real time. No more fax machines, phone calls, or scattered spreadsheets.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything Your Dealership Needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            One platform to connect with providers, compare products, and grow your protection revenue.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductsSection = () => {
  const products = [
    "Vehicle Service Contracts (VSC)",
    "GAP Insurance",
    "Tire & Rim Protection",
    "Paint Protection Film (PPF)",
    "Ceramic Coating",
    "Undercoating & Rust Protection",
    "Key Replacement",
    "Dent Repair Coverage",
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Products You Can Sell
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access a full catalog of warranty and protection products from multiple providers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {products.map((product, i) => (
            <motion.div
              key={product}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{product}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProvidersSection = () => {
  const providers = [
    { name: "A-Protect Warranty Corporation", location: "Ontario" },
    { name: "Global Warranty", location: "Ontario" },
    { name: "Peoples Choice Warranty (PCW)", location: "Ontario" },
    { name: "Ensurall", location: "Ontario" },
    { name: "First Canadian Protection Plans", location: "Ontario" },
    { name: "Lubrico Warranty", location: "Ontario" },
    { name: "NationWide Auto Warranty", location: "Ontario" },
    { name: "Auto Shield Canada", location: "Ontario" },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ontario Provider Directory
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trusted warranty and protection providers available on the platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">{provider.name}</h3>
              <p className="text-xs text-muted-foreground">{provider.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FooterCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-primary rounded-2xl p-10 md:p-14"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
            Ready to Be Part of the Launch?
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Join dealerships getting early access to Canada's first dealer-only warranty marketplace.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/register")}
            className="gap-2"
          >
            Register Your Dealership <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-display font-bold text-xs">BW</span>
        </div>
        <span className="text-sm text-muted-foreground">© 2026 Bridge Warranty. All rights reserved.</span>
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

export { HeroSection, FeaturesSection, ProductsSection, ProvidersSection, FooterCTA, Footer };
