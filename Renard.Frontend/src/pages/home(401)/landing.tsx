import { Footer } from "@/components/common/footer";
import { Navbar } from "@/components/common/navbar";
import { Features } from "@/components/home(401)/features";
import { FlowSection } from "@/components/home(401)/flow";
import { Hero } from "@/components/home(401)/hero";
import { Pricing } from "@/components/home(401)/pricing";
import { Logos } from "@/components/home(401)/trusted";

function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />
      <Hero />
      <Logos />
      <FlowSection />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}

export default Landing;
