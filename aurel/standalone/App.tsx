"use client";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { RouterProvider, useRoute } from "./router";

import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SkipLink } from "@/components/layout/SkipLink";
import { FlyToCart } from "@/components/cart/FlyToCart";
import { ClickSparkArea } from "@/components/ui/reactbits";

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

import { ProductDetail } from "@/components/product/ProductDetail";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { FINISHES, MODELS, type FinishId, type ModelId } from "@/lib/products";

function Landing() {
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

function ProductRoute({ query }: { query: string }) {
  const params = new URLSearchParams(query);
  const model = MODELS.find((m) => m.id === params.get("modell"))?.id ?? "arc";
  const finish = FINISHES.find((f) => f.id === params.get("oberflaeche"))?.id ?? "graphite";
  return <ProductDetail initialModel={model as ModelId} initialFinish={finish as FinishId} />;
}

function Routes() {
  const { route } = useRoute();
  if (route.path === "/produkt") return <ProductRoute query={route.query} />;
  if (route.path === "/checkout") return <CheckoutForm />;
  return <Landing />;
}

function App() {
  return (
    <RouterProvider>
      <I18nProvider>
      <CartProvider>
        <ToastProvider>
          <SkipLink />
          <Navbar />
          <ClickSparkArea>
            <main id="inhalt">
              <Routes />
            </main>
          </ClickSparkArea>
          <Footer />
          <CartDrawer />
          <FlyToCart />
        </ToastProvider>
      </CartProvider>
      </I18nProvider>
    </RouterProvider>
  );
}

const container = document.getElementById("aurel-root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
