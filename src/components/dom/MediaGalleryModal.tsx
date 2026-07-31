"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  media: string[];
}

export default function MediaGalleryModal({ isOpen, onClose, eventTitle, media }: MediaGalleryModalProps) {
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0 }}
            className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden m-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-black/50">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{eventTitle}</h2>
                <p className="text-white/50 text-sm mt-1">Media Gallery • {media.length} items</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {media.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium text-white/60">No media available yet.</p>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {media.map((url, index) => {
                    const isVideo = url.toLowerCase().includes('/video/upload/') || 
                      url.toLowerCase().split('?')[0].match(/\.(mp4|webm|mov|ogg|avi)$/i) !== null;
                    
                    const getOptimizedUrl = (url: string) => {
                      if (isVideo) return url;
                      if (url.includes('/upload/q_auto/f_auto/')) {
                        return url.replace('/upload/q_auto/f_auto/', '/upload/w_1200,q_auto,f_auto/');
                      }
                      if (url.includes('/upload/')) {
                        return url.replace('/upload/', '/upload/w_1200,q_auto,f_auto/');
                      }
                      return url;
                    };

                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="break-inside-avoid relative group rounded-xl overflow-hidden bg-white/5"
                      >
                        {isVideo ? (
                          <video 
                            src={url} 
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <img 
                            src={getOptimizedUrl(url)} 
                            alt={`${eventTitle} media ${index + 1}`}
                            loading="lazy"
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          {/* Optional hover overlay, e.g., a zoom icon */}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
