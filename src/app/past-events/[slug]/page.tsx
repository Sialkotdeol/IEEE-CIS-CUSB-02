import { pastEvents } from "@/data/events";
import { notFound } from "next/navigation";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import BackButton from "@/components/dom/BackButton";

export function generateStaticParams() {
  return pastEvents.map((event) => ({
    slug: event.slug,
  }));
}

export default async function PastEventDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = pastEvents.find((e) => e.slug === slug);

  if (!event) {
    notFound();
  }

  const hasMedia = event.media && event.media.length > 0;
  const isVideo = (url: string) => {
    return url.toLowerCase().includes('/video/upload/') || 
           url.toLowerCase().split('?')[0].match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
  };

  const getOptimizedUrl = (url: string) => {
    if (isVideo(url)) return url;
    if (url.includes('/upload/q_auto/f_auto/')) {
      return url.replace('/upload/q_auto/f_auto/', '/upload/w_800,q_auto,f_auto/');
    }
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col">
      <Nav />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto w-full">
        <BackButton fallback="/events" />
        
        <div className={`flex flex-col md:flex-row gap-12 lg:gap-24 items-start ${!hasMedia ? 'justify-center' : ''}`}>
          {/* Details Section */}
          <div className={`flex flex-col gap-8 shrink-0 ${hasMedia ? 'w-full md:w-1/3 md:sticky md:top-32' : 'w-full max-w-3xl'}`}>
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                {event.type === 'hackathon' ? 'Hackathon 🏆' : 'Event 📚'}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-6">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-3 text-white/80 font-medium mb-8 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
                <Calendar size={18} className="text-primary" />
                {event.date}
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className={`text-lg md:text-xl text-white/70 leading-relaxed ${!hasMedia ? 'text-justify' : ''}`}>
                {event.description}
              </p>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2 text-white/50 text-sm font-semibold uppercase tracking-wider">
                  <Tag size={14} />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Media Section */}
          {hasMedia && (
            <div className="w-full md:w-2/3 flex-grow">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold">Event Media</h2>
                  <span className="text-white/50">
                    {event.media!.length} {event.media!.some(isVideo) ? 'Photos & Videos' : 'Photos'}
                  </span>
                </div>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {event.media!.map((url, idx) => (
                    <div 
                      key={idx} 
                      className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      {isVideo(url) ? (
                        <video 
                          src={url} 
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <img 
                          src={getOptimizedUrl(url)} 
                          alt={`${event.title} image ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
