"use client";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { RouterProvider, useRoute } from "./router";

import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FlyToCart } from "@/components/cart/FlyToCart";

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

import { Checkout } from "@/components/checkout/Checkout";
import { RentalFlowWithParams } from "@/components/rental/RentalFlow";

function Landing() {
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

function Routes() {
  const { route } = useRoute();
  if (route.path === "/checkout") return <Checkout />;
  if (route.path === "/rental") return <RentalFlowWithParams />;
  return <Landing />;
}

function App() {
  return (
    <RouterProvider>
      <MotionProvider>
        <CartProvider>
          <ToastProvider>
            <SkipLink />
            <Navbar />
            <main id="main">
              <Routes />
            </main>
            <Footer />
            <CartDrawer />
            <FlyToCart />
          </ToastProvider>
        </CartProvider>
      </MotionProvider>
    </RouterProvider>
  );
}

const container = document.getElementById("mudroom-root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
