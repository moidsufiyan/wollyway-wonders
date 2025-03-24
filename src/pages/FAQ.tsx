
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const FAQ = () => {
  const faqCategories = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping typically takes 3-5 business days within the continental U.S. Express shipping options are available at checkout for 1-2 business day delivery."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary by location, generally taking 7-14 business days. Additional customs fees may apply."
        },
        {
          question: "Can I track my order?",
          answer: "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history."
        },
        {
          question: "What if my order hasn't arrived yet?",
          answer: "If your order hasn't arrived within the expected timeframe, please check the tracking information first. If there appears to be an issue, contact our customer support team and we'll help resolve the situation."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer free returns within 30 days of delivery. Items must be unused and in original packaging with all tags attached."
        },
        {
          question: "How do I initiate a return?",
          answer: "To start a return, log into your account, navigate to your order history, select the order containing the item you wish to return, and follow the prompts. You'll receive a prepaid return shipping label via email."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are typically processed within 5-10 business days after we receive your return. The refund will be issued to your original payment method."
        },
        {
          question: "Can I exchange an item instead of returning it?",
          answer: "Yes, you can request an exchange for a different size or color when initiating your return through your account. If the item you want is in stock, we'll ship it as soon as we receive your return."
        }
      ]
    },
    {
      category: "Products & Materials",
      questions: [
        {
          question: "Are your products handmade?",
          answer: "Yes, all our products are handcrafted with care by skilled artisans. This ensures high quality and attention to detail in every piece."
        },
        {
          question: "What materials do you use?",
          answer: "We use premium, ethically sourced materials for all our products. Specific materials vary by product and are listed in each product description."
        },
        {
          question: "How should I care for my products?",
          answer: "Care instructions vary by product. Generally, we recommend storing items in a dry place away from direct sunlight. Specific care instructions are included with each product and can also be found on product pages."
        },
        {
          question: "Do you offer customization?",
          answer: "Yes, many of our products can be customized. Visit our Customize page to explore personalization options or contact our customer service team for special requests."
        }
      ]
    },
    {
      category: "Account & Payment",
      questions: [
        {
          question: "Do I need an account to order?",
          answer: "While we offer guest checkout, creating an account allows you to track orders, save favorites, and enjoy a smoother shopping experience."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay."
        },
        {
          question: "Is my payment information secure?",
          answer: "Absolutely. We use industry-standard encryption and secure payment processors to ensure your information is protected at all times."
        },
        {
          question: "How do I update my account information?",
          answer: "You can update your account details including shipping addresses, payment methods, and communication preferences by logging into your account and navigating to the Account Settings section."
        }
      ]
    }
  ];
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredQuestions, setFilteredQuestions] = React.useState<{category: string, questions: {question: string, answer: string}[]}[]>(faqCategories);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setFilteredQuestions(faqCategories);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = faqCategories.map(category => {
      const matchedQuestions = category.questions.filter(
        q => q.question.toLowerCase().includes(term) || q.answer.toLowerCase().includes(term)
      );
      
      return {
        category: category.category,
        questions: matchedQuestions
      };
    }).filter(category => category.questions.length > 0);
    
    setFilteredQuestions(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mb-8">
              Find answers to common questions about our products, orders, shipping, and more.
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search size={18} />
              </Button>
            </form>
          </div>
          
          <div className="space-y-10 max-w-4xl mx-auto">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((category, index) => (
                category.questions.length > 0 && (
                  <div key={index}>
                    <h2 className="text-xl font-bold mb-4">{category.category}</h2>
                    <Accordion type="single" collapsible className="border rounded-lg overflow-hidden">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilteredQuestions(faqCategories);
                  }}
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-16 max-w-2xl mx-auto text-center bg-wolly-pink/10 p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to help! Reach out to us via email, 
              phone, or live chat and we'll get back to you as soon as possible.
            </p>
            <Button 
              className="bg-wolly-magenta hover:bg-wolly-magenta/90"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
