import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "500+", label: "Dealerships" },
  { value: "24/7", label: "Support" },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold">BW</span>
            </div>
            <span className="font-display font-bold text-xl text-primary-foreground">Bridge Warranty</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            {title || "Canada's Dealer-Only Warranty Marketplace"}
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            {subtitle || "Connect with top warranty providers, compare products, and grow your F&I revenue."}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-foreground/10 rounded-lg p-4"
            >
              <div className="text-2xl font-display font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
