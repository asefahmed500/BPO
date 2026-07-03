import { NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const knowledgeBase = [
  { keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"], response: "Hi there! Welcome to Northbridge BPO. How can I help you today? You can ask me about our services, industries we serve, pricing, or anything else about outsourcing with us." },
  { keywords: ["service", "what do you do", "offer", "capabilities", "solutions"], response: "Northbridge offers six core service lines:\n\n**1. Customer Support** — Voice, chat, email and social support 24/7 in 20+ languages\n**2. Back Office & Data** — Data processing, entry, validation and document management\n**3. IT & Technical Helpdesk** — Tier 1-3 technical support\n**4. Sales & Lead Generation** — Outbound prospecting and inbound conversion\n**5. Content Moderation** — Trust & safety review and policy enforcement\n**6. Finance & Accounting** — AP/AR, reconciliation, payroll and reporting\n\nWhich one would you like to learn more about?" },
  { keywords: ["customer support", "customer service", "voice", "chat support"], response: "Our Customer Support service covers voice, live chat, email and social media support — available 24/7 in 20+ languages. We integrate with Zendesk, Salesforce, Intercom, and most major CRM platforms. Our agents are trained on your brand voice and QA-calibrated within the first two weeks. Would you like to know about pricing or how to get started?" },
  { keywords: ["back office", "data processing", "data entry", "document management"], response: "Our Back Office & Data service handles data processing, entry, validation, and document management at scale. We use automated workflows combined with human review to ensure accuracy rates above 99.5%. Common use cases include invoice processing, CRM data cleanup, and migration projects." },
  { keywords: ["it helpdesk", "technical support", "helpdesk", "tech support", "tier 1", "tier 2", "tier 3"], response: "Our IT & Technical Helpdesk provides Tier 1 through Tier 3 support for your products and internal infrastructure. We staff certified technicians who handle everything from password resets to complex network troubleshooting. Average first-response time is under 2 minutes." },
  { keywords: ["sales", "lead generation", "outbound", "prospecting", "conversion"], response: "Our Sales & Lead Generation service covers outbound prospecting, qualification, and inbound sales conversion. We use multi-channel outreach (phone, email, LinkedIn) and integrate with your CRM for seamless lead handoff. Typical campaigns see 3-5x ROI within the first quarter." },
  { keywords: ["content moderation", "trust and safety", "moderation", "ugc", "policy enforcement"], response: "Our Content Moderation service handles trust & safety review, policy enforcement, and user-generated content moderation. We follow your guidelines precisely and maintain consistent quality through regular calibration sessions. Available 24/7 for real-time moderation needs." },
  { keywords: ["finance", "accounting", "ap", "ar", "payroll", "reconciliation", "bookkeeping"], response: "Our Finance & Accounting service covers accounts payable/receivable, reconciliation, payroll processing, and financial reporting. Our teams include certified accountants and use tools like QuickBooks, Xero, and NetSuite. All processes follow GAAP/IFRS standards." },
  { keywords: ["pricing", "cost", "price", "how much", "rate", "budget", "savings"], response: "Our pricing is customized based on your specific needs — scope, volume, language requirements, and service level. Most clients save 40-60% compared to onshore operations. We offer flexible engagement models: per-seat, per-hour, or outcome-based pricing. Would you like to schedule a call for a detailed proposal?" },
  { keywords: ["industry", "industries", "sector", "vertical"], response: "Northbridge serves five primary industries:\n\n**1. Fintech & Banking** — Secure, compliant support for financial services\n**2. Healthcare & MedTech** — HIPAA-compliant operations\n**3. E-Commerce & Retail** — Seasonal scaling and 24/7 support\n**4. SaaS & Technology** — Technical support and customer success\n**5. Travel & Hospitality** — Multi-language reservation and concierge support\n\nWould you like details on a specific industry?" },
  { keywords: ["fintech", "banking", "financial"], response: "In Fintech & Banking, we provide PCI-DSS compliant support for payments, lending, and digital banking platforms. Our agents are trained on financial regulations and data security protocols. Clients include payment processors, neobanks, and lending platforms." },
  { keywords: ["healthcare", "medtech", "health", "hipaa", "medical"], response: "In Healthcare & MedTech, we provide HIPAA-compliant support for patient engagement, claims processing, and medical device technical support. Our teams include certified medical coders and HIPAA-trained professionals." },
  { keywords: ["ecommerce", "retail", "e-commerce"], response: "In E-Commerce & Retail, we handle order management, returns processing, customer inquiries, and seasonal scaling. We integrate with Shopify, Magento, Salesforce Commerce Cloud, and major e-commerce platforms." },
  { keywords: ["saas", "technology", "software", "tech"], response: "In SaaS & Technology, we provide technical support, customer success operations, and NOC services. Our teams are trained on your product and can handle everything from onboarding to advanced troubleshooting." },
  { keywords: ["travel", "hospitality", "hotel", "airline"], response: "In Travel & Hospitality, we offer multi-language reservation support, concierge services, and customer care for airlines, hotels, and travel platforms. Available 24/7 across all time zones." },
  { keywords: ["cost saving", "save money", "cheaper", "offshore", "onshore"], response: "Most Northbridge clients save 40-60% compared to onshore operations while maintaining or improving quality. Our delivery centers are located in optimized cost markets with strong English proficiency and infrastructure. We pass the savings on through transparent pricing with no hidden fees." },
  { keywords: ["security", "soc 2", "iso", "iso 27001", "pci", "pci-dss", "compliance", "audit", "data protection", "gdpr"], response: "Northbridge maintains SOC 2 Type II, ISO 27001, and PCI-DSS certifications. We undergo annual audits by independent firms. Our security framework includes:\n• Encrypted data transmission (TLS 1.3)\n• Role-based access control\n• Regular penetration testing\n• GDPR-compliant data processing agreements\n• Dedicated InfoSec team\n\nAll client data is stored in SOC 2-compliant infrastructure." },
  { keywords: ["qa", "quality", "quality assurance", "csat", "calibration", "scorecard"], response: "Our QA framework is built on calibrated scorecards, weekly coaching sessions, and transparent reporting. Every agent is scored on accuracy, empathy, resolution time, and adherence. We maintain an average CSAT of 96.2% across all accounts." },
  { keywords: ["agent", "agents", "staff", "team", "employee", "recruit", "training", "onboard"], response: "We have 12,400+ agents deployed globally across 9 delivery centers. Our recruiting process includes language proficiency tests, domain knowledge assessments, and cultural fit interviews. New agents go through 4-6 weeks of structured training before taking live interactions." },
  { keywords: ["delivery center", "location", "office", "center", "philippines", "india", "where"], response: "Northbridge operates 9 delivery centers across 14 countries, including the Philippines, India, Kenya, Colombia, and South Africa. This geographic diversity ensures business continuity and follow-the-sun coverage for your operations." },
  { keywords: ["time", "timeline", "how long", "ramp", "launch", "pilot", "get started"], response: "A typical Northbridge pilot goes live in 4-6 weeks. The timeline includes:\n• Week 1-2: Discovery and scoping\n• Week 2-3: Agent recruitment and facility setup\n• Week 3-4: Training and QA calibration\n• Week 4-5: Shadowing and nesting\n• Week 5-6: Go-live with gradual ramp\n\nWe can accelerate to 3 weeks for urgent needs." },
  { keywords: ["contact", "talk", "speak", "call", "demo", "proposal", "quote", "sales"], response: "You can reach our sales team by:\n• Visiting our Contact page and filling out the form\n• Scheduling a call directly through our booking system\n\nOur team typically responds within 2-4 hours during business hours. Would you like me to take you to the contact page?" },
  { keywords: ["case study", "example", "client", "customer", "reference", "result"], response: "We have several case studies available. One example: a fintech company scaled from 50 to 250 agents with us in 6 months, improving CSAT from 82% to 94% and reducing cost per contact by 55%. You can read the full case study on our Resources page." },
  { keywords: ["thank", "thanks", "appreciate", "helpful"], response: "You're welcome! Glad I could help. If you have any more questions, feel free to ask. Otherwise, you can schedule a call with our team through the Contact page. Have a great day!" },
  { keywords: ["bye", "goodbye", "see you", "talk later"], response: "Goodbye! Thanks for chatting with Northbridge BPO. If you need anything else, we're here 24/7. Have a great day!" },
  { keywords: ["career", "job", "hiring", "position", "vacancy", "work at", "join"], response: "We're always looking for talented people! Visit our Careers page to see current openings. We offer competitive compensation, continuous learning programs, and clear growth trajectories across our global operations." },
  { keywords: ["language", "languages", "multilingual", "english", "spanish", "french"], response: "We provide support in 20+ languages including English, Spanish, French, German, Portuguese, Mandarin, Japanese, Korean, Arabic, and more. Our agents are native or near-native speakers with cultural training for each market." },
];

function findResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return "Thanks for reaching out! I'm not entirely sure I understand your question. Could you try rephrasing? You can ask me about our services, industries, pricing, security, or how to get started with Northbridge BPO. Or feel free to visit our Contact page to speak with a team member directly.";
}

let sessionContext: { [key: string]: string } = {};

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = findResponse(message);

    return NextResponse.json({ response });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
