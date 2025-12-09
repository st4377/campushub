import { Layout } from "@/components/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How can I list my community on CampusHub?",
    answer: "Listing your community is simple! Click on the 'List Community' button in the navigation bar. Fill in the details about your community including the name, platform (WhatsApp, Telegram, Discord, etc.), category, invite link, and a brief description. Make sure you're an admin or moderator of the group before submitting. Once submitted, your community will be reviewed and listed shortly."
  },
  {
    question: "Can I list a community for only girls or only boys?",
    answer: "Yes, absolutely! When listing your community, you'll see a 'Who can join this community?' option at the top of the form. You can choose from three options: 'Public (Everyone)' for open communities, 'Boys Only' for male-exclusive groups, or 'Girls Only' for female-exclusive groups. This helps students find communities that match their preferences and ensures the right audience discovers your group."
  },
  {
    question: "Is there any cost to list my community?",
    answer: "No, listing your community on CampusHub is completely free! Our goal is to help students discover and connect with campus communities easily. There are no hidden charges or premium listings. Simply fill out the form and your community will be visible to thousands of students on campus."
  }
];

export default function FAQ() {
  return (
    <Layout>
      <div className="container px-4 md:px-6 py-16 max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-[#FFC400]/20 rounded-full">
            <HelpCircle className="w-6 h-6 text-[#FFC400]" />
          </div>
          <h1 className="text-4xl font-black font-heading mb-4 uppercase tracking-tight text-black">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-black/70">
            Got questions? We've got answers. Find help below.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-black/10 shadow-xl overflow-hidden">
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
        </div>

        <div className="mt-12 text-center">
          <p className="text-black/60 mb-4">Still have questions?</p>
          <a 
            href="mailto:support@campushub.com" 
            className="inline-flex items-center gap-2 text-black font-bold hover:scale-105 transition-transform underline underline-offset-4"
          >
            Contact us at support@campushub.com
          </a>
        </div>
      </div>
    </Layout>
  );
}
