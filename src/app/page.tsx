import Header from "@/components/Header"
import HeroSlider from "@/components/HeroSlider"
import FeatureSection from "@/components/FeatureSection"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import UploadZone from "@/components/UploadZone"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSlider />
        <div id="features">
          <FeatureSection />
        </div>
        <div id="cases">
          <TestimonialsCarousel />
        </div>
        <UploadZone />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
