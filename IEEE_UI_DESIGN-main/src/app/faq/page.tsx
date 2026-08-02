import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import BackButton from "@/components/dom/BackButton";
import { HelpCircle, Mail, Sparkles } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function FAQPage() {
  const faqs = [
    {
      question: "How can I join IEEE CIS CUSB?",
      answer: "You can join by participating in our annual membership drive or by reaching out to any of our core team members during our events. Keep an eye on our social media for official registration links."
    },
    {
      question: "Do I need to be a computer science student to join?",
      answer: "Not at all! IEEE CIS welcomes students from all engineering and science backgrounds who have an interest in computational intelligence, AI, and related fields."
    },
    {
      question: "Are the events only for IEEE members?",
      answer: "While some exclusive hands-on workshops are members-only, most of our flagship events, hackathons, and expert talks are open to all students."
    },
    {
      question: "How can I stay updated about upcoming events?",
      answer: "Follow us on our Instagram and LinkedIn pages, and regularly check the Events section of this website!"
    }
  ];

  return (
    <div className="min-h-screen pixel-grid-bg text-slate-900 flex flex-col">
      <Nav />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <BackButton fallback="/" />
        
        <div className="mt-8">
          <div className="section-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            <HelpCircle size={14} className="text-primary" /> Help & Info
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 font-light mb-12">
            Find answers to common questions about our society, events, and memberships.
          </p>

          <div className="flex flex-col gap-5">
            {faqs.map((faq, idx) => (
              <SpotlightCard
                key={idx}
                glowHue={205}
                spotSize={260}
                borderSize={2}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-bold mb-3 text-slate-900">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">{faq.answer}</p>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-14 p-8 md:p-10 bg-white border border-slate-200 rounded-3xl text-center shadow-md">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Still have questions?</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
              Feel free to reach out to our team directly. We're always happy to assist!
            </p>
            <a 
              href="mailto:ieeeciscusb@gmail.com" 
              className="inline-flex items-center gap-2 justify-center px-6 py-3 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold text-sm transition-all shadow-md"
            >
              <Mail size={16} /> Contact Webmaster Team
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
