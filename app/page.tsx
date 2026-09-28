import { BeliefBand } from "@/components/BeliefBand";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { IconSprite } from "@/components/IconSprite";
import { PageEffects } from "@/components/PageEffects";
import { ValueStrip } from "@/components/ValueStrip";

export default function Home() {
  return (
    <>
      <IconSprite />
      <Header />
      <main>
        <Hero />
        <BeliefBand />
        <HowItWorks />
        <ValueStrip />
      </main>
      <Footer />
      <PageEffects />
    </>
  );
}
