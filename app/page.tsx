import { BeliefBand } from "@/components/BeliefBand";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SiteShell } from "@/components/SiteShell";
import { ValueStrip } from "@/components/ValueStrip";

export default function Home() {
  return (
    <SiteShell home>
      <Hero />
      <BeliefBand />
      <HowItWorks />
      <ValueStrip />
    </SiteShell>
  );
}
