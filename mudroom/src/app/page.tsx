import { Hero } from "@/components/sections/Hero";
import { LiveStatus } from "@/components/sections/LiveStatus";
import { BikeSelector } from "@/components/sections/BikeSelector";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CleaningTech } from "@/components/sections/CleaningTech";
import { ScrollTransformation } from "@/components/sections/ScrollTransformation";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { TechnicalSpecs } from "@/components/sections/TechnicalSpecs";
import { BuySection } from "@/components/sections/BuySection";
import { RentSection } from "@/components/sections/RentSection";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <LiveStatus />
      <BikeSelector />
      <HowItWorks />
      <CleaningTech />
      <ScrollTransformation />
      <ProductShowcase />
      <TechnicalSpecs />
      <BuySection />
      <RentSection />
      <Reviews />
      <Faq />
      <FinalCta />
    </>
  );
}
