import { HelpCircle, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppLayout } from "./AppLayout";

const FAQPage = () => {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Get Started' or 'Sign Up' button, fill in your details, verify your email, and you're ready to go. It takes less than 2 minutes to set up your account."
        },
        {
          q: "Is Harmony Shield free to use?",
          a: "We offer a free tier with essential protection features. Premium plans unlock advanced AI detection, priority support, and enhanced monitoring capabilities."
        },
        {
          q: "What platforms does Harmony Shield protect?",
          a: "We currently support Facebook, Instagram, Twitter/X, LinkedIn, TikTok, WhatsApp, and Telegram. We're constantly adding support for more platforms."
        }
      ]
    },
    {
      category: "Scam Detection & Reporting",
      questions: [
        {
          q: "How does the AI scam detection work?",
          a: "Our AI analyzes messages, profiles, and URLs using advanced machine learning models trained on millions of fraud patterns. It checks for suspicious language, known scam tactics, and malicious links in real-time."
        },
        {
          q: "What should I do if I receive a scam alert?",
          a: "Don't interact with the suspicious content. Report it through our platform, block the user, and share the alert with your network to help protect others."
        },
        {
          q: "How accurate is the scam detection?",
          a: "Our AI has a 97% accuracy rate with continuous learning. However, always use your judgment and report false positives to help us improve."
        },
        {
          q: "Can I report a scam anonymously?",
          a: "Yes, all reports can be submitted anonymously. Your identity is protected while helping others stay safe."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I enable two-factor authentication?",
          a: "Go to Profile → Security → Two-Factor Authentication. You can enable it via SMS, authenticator app, or email verification."
        },
        {
          q: "What happens if I forget my password?",
          a: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to your inbox."
        },
        {
          q: "How is my data protected?",
          a: "We use end-to-end encryption, secure data centers, and comply with GDPR and SOC 2 standards. Your data is never shared with third parties."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account anytime from Settings → Advanced → Delete Account. All your data will be permanently removed within 30 days."
        }
      ]
    },
    {
      category: "Features & Tools",
      questions: [
        {
          q: "What is Deep Search?",
          a: "Deep Search scans social media profiles, URLs, and digital footprints to uncover hidden fraud patterns and verify legitimacy."
        },
        {
          q: "How do tracking links work?",
          a: "Create secure tracking links to monitor who clicks them. Useful for identifying suspicious activity and gathering evidence."
        },
        {
          q: "What are Smart Feeds?",
          a: "Smart Feeds aggregate security news, scam alerts, and fraud trends personalized to your interests and risk profile."
        },
        {
          q: "Can I use the browser extension offline?",
          a: "The browser extension requires an internet connection for real-time threat detection and updates."
        }
      ]
    },
    {
      category: "Recovery Services",
      questions: [
        {
          q: "What is the recovery service?",
          a: "Our recovery service helps victims of fraud recover lost funds through legal channels, evidence gathering, and expert support."
        },
        {
          q: "How long does recovery take?",
          a: "Recovery timelines vary based on case complexity, typically ranging from 2-6 months. We provide regular updates throughout the process."
        },
        {
          q: "What is the success rate for recoveries?",
          a: "Our success rate is approximately 68% for cryptocurrency fraud and 45% for traditional financial fraud, depending on case specifics."
        },
        {
          q: "How much does recovery assistance cost?",
          a: "We offer a free initial consultation. Fees are case-dependent and only charged if recovery is successful (contingency basis)."
        }
      ]
    },
    {
      category: "Billing & Subscriptions",
      questions: [
        {
          q: "How do I upgrade my plan?",
          a: "Go to Profile → Subscription and select your desired plan. Billing is prorated automatically."
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, cancel anytime from your account settings. You'll retain access until the end of your billing period."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, PayPal, and cryptocurrency payments."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 30-day money-back guarantee if you're not satisfied with our service."
        }
      ]
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
            </div>
            <p className="text-muted-foreground">
              Find answers to common questions about Harmony Shield
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <section key={idx}>
                <h2 className="text-2xl font-semibold text-foreground mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-2">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact-support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQPage;
