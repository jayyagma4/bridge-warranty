import Navbar from "@/components/landing/Navbar";
import {
  HeroSection,
  FeaturesSection,
  ProductsSection,
  ProvidersSection,
  FooterCTA,
  Footer,
} from "@/components/landing/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <ProvidersSection />
      <FooterCTA />
      <Footer />
    </div>
  );
};

export default Index;
