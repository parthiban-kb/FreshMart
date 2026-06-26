import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroCarousel />
      <FeaturesSection />
      <FeaturedProducts />
      <CategoriesSection />
      <Footer />
    </div>
  );
}
