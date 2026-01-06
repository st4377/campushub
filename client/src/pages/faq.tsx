import { Layout } from "@/components/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How do I list my community on CampusHub?",
    answer: "Click on “List Community”, fill in the required details, and submit your community for review. Once approved, it will be visible to all users on the platform."
  },
  {
    question: "Is listing a community free?",
    answer: "Yes, listing a community on CampusHub is completely free."
  },
  {
    question: "How many communities can I list?",
    answer: "You can list multiple communities, as long as each one is genuine and serves a clear campus-related purpose."
  },
  {
    question: "What is the “Bump” feature and how does it work?",
    answer: "The Bump feature pushes your community higher in the listings, increasing visibility so more students can discover it."
  },
  {
    question: "How often can I bump my community?",
    answer: "Each community can be bumped once every 12 hours."
  },
  {
    question: "What types of communities are allowed?",
    answer: "All types of communities are allowed, as long as they are genuine and intended for students."
  },
  {
    question: "Can I edit my community details after listing?",
    answer: "Yes, community details can be updated if you need to correct or modify information after submission."
  }
];

export default function FAQ() {
  return (
    <Layout>
      <div className="w-full px-4 md:px-6 py-16 max-w-3xl mx-auto">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-[#FFC400]/20 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <HelpCircle className="w-6 h-6 text-[#FFC400]" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-black font-heading mb-4 uppercase tracking-tight text-black"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-lg text-black/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Got questions? We've got answers. Find help below.
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-3xl border border-black/10 shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-1.5 bg-gradient-to-r from-[#FFC400] to-[#FF8C00]"></div>
          <Accordion type="single" collapsible className="p-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-black/10 last:border-0">
                <AccordionTrigger className="text-left text-lg font-bold text-black hover:text-[#FFC400] py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-black/70 text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-black/60 mb-4">Still have questions?</p>
          <motion.a 
            href="https://wa.me/919754424866?text=Hi%2C%20I%E2%80%99m%20reaching%20out%20for%20support%20related%20to%20CampusHub" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-black font-bold transition-transform underline underline-offset-4 button-hover"
            whileHover={{ scale: 1.05 }}
          >
            Contact me for support
          </motion.a>
        </motion.div>
      </div>
    </Layout>
  );
}
