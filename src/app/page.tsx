import HeroSlider from "@/components/HeroSlider"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import UploadZone from "@/components/UploadZone"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSlider />
      <TestimonialsCarousel />
      <UploadZone />
    </main>
  )
}
