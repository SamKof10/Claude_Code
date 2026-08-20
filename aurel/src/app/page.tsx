import { Hero } from "@/components/sections/Hero";
import { PressStrip } from "@/components/sections/PressStrip";
import { ShopStrip } from "@/components/sections/ShopStrip";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { ProductReveal } from "@/components/sections/ProductReveal";
import { Features } from "@/components/sections/Features";
import { SmartControl } from "@/components/sections/SmartControl";
import { Technology } from "@/components/sections/Technology";
import { Variants } from "@/components/sections/Variants";
import { Accessories } from "@/components/sections/Accessories";
import { SocialProof } from "@/components/sections/SocialProof";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopStrip />
      <PressStrip />
      <Problem />
      <Solution />
      <ProductReveal />
      <Features />
      <SmartControl />
      <Technology />
      <Variants />
      <Accessories />
      <SocialProof />
      <Faq />
      <FinalCta />
    </>
  );
}
