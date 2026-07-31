import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import BackButton from "@/components/dom/BackButton";

export default function FAQPage() {
  const faqs = [
    {
      question: "How can I join IEEE CIS CUSB?",
      answer: "You can join by participating in our annual membership drive or by reaching out to any of our core team members during our events. Keep an eye on our social media for official registration links."
    },
    {
      question: "Do I need to be a computer science student to join?",
      answer: "Not at all! IEEE CIS welcomes students from all backgrounds who have an interest in computational intelligence, AI, and related fields."
    },
    {
      question: "Are the events only for IEEE members?",
      answer: "While some exclusive workshops are members-only, most of our flagship events, hackathons, and expert talks are open to all students."
    },
    {
      question: "How can I stay updated about upcoming events?",
      answer: "Follow us on our Instagram and LinkedIn pages, and regularly check the Events section of this website!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col">
      <Nav />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <BackButton fallback="/" />
        
        <div className="mt-8">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Help & Info
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/60 mb-12">
            Find answers to common questions about our society, events, and memberships.
          </p>

          <div className="flex flex-col gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-white/90">{faq.question}</h3>
                <p className="text-white/60 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-primary/10 border border-primary/20 rounded-3xl text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-white/70 mb-6">
              Feel free to reach out to our team directly. We're always here to help!
            </p>
            <a 
              href="mailto:ieeeciscusb@gmail.com" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
