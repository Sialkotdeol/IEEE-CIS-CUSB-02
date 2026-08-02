import { pastEvents } from "@/data/events";
import { notFound } from "next/navigation";
import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { Calendar, Tag, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import BackButton from "@/components/dom/BackButton";
import { SpotlightCard } from "@/components/ui/spotlight-card";

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
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto w-full">
        <BackButton fallback="/events" />
        
        <div className={`flex flex-col md:flex-row gap-12 lg:gap-16 items-start ${!hasMedia ? 'justify-center' : ''}`}>
          
          {/* Details Section */}
          <div className={`flex flex-col gap-8 shrink-0 ${hasMedia ? 'w-full md:w-1/3 md:sticky md:top-32' : 'w-full max-w-3xl'}`}>
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-md">
              <div className="inline-block px-3.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4 font-mono">
                {event.type === 'hackathon' ? '🏆 Hackathon' : '📚 IEEE Event'}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 mb-6">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-2.5 text-slate-600 font-semibold mb-6 bg-slate-50 w-fit px-4 py-2 rounded-full border border-slate-200 text-sm font-mono">
                <Calendar size={16} className="text-primary" />
                {event.date}
              </div>

              <div className="border-t border-slate-100 pt-6">
                <p className={`text-base md:text-lg text-slate-600 leading-relaxed font-normal ${!hasMedia ? 'text-justify' : ''}`}>
                  {event.description}
                </p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Tag size={13} />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-xs font-semibold text-primary cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Media Section */}
          {hasMedia && (
            <div className="w-full md:w-2/3 flex-grow">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" /> Event Media & Gallery
                  </h2>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {event.media!.length} {event.media!.some(isVideo) ? 'Items (Photos & Videos)' : 'Photos'}
                  </span>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {event.media!.map((url, idx) => (
                    <SpotlightCard
                      key={idx}
                      glowHue={205}
                      spotSize={260}
                      borderSize={2}
                      className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      {isVideo(url) ? (
                        <video 
                          src={url} 
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-103"
                        />
                      ) : (
                        <img 
                          src={getOptimizedUrl(url)} 
                          alt={`${event.title} image ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-103"
                        />
                      )}
                    </SpotlightCard>
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
