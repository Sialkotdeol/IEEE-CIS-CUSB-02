import Nav from "@/components/dom/Nav";
import Hero from "@/components/dom/Hero";
import About from "@/components/dom/About";
import FlagshipEvents from "@/components/dom/FlagshipEvents";
import FeaturedContent from "@/components/dom/FeaturedContent";
import OngoingEvents from "@/components/dom/OngoingEvents";
import Footer from "@/components/dom/Footer";
import GsapScroller from "@/components/dom/GsapScroller";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="block w-full">
        <GsapScroller>
          <Hero />
          <About />
          <FlagshipEvents />
          <FeaturedContent />
          <OngoingEvents />
        </GsapScroller>
      </div>
      <Footer />
    </>
  );
}
