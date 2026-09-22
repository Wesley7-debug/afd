import { connectDB } from "@/lib/mongodb";
import { Founder, Company } from "@/models";
import mongoose from "mongoose";

interface SeedFounder {
  name: string;
  role: string;
  location: string;
  industry: string;
  bio: string;
  xHandle: string;
  linkedinUrl: string;
  foundedYear: number;
  isHiring: boolean;
  teamSize: number;
}

interface SeedCompany {
  name: string;
  industry: string;
  location: string;
  country?: string;
  foundedYear: number;
  teamSize: number;
  isHiring: boolean;
  oneLiner: string;
  founders: SeedFounder[];
}

const COMPANIES: SeedCompany[] = [
  // FINTECH
  { name: "Paystack", industry: "Fintech", location: "Lagos", foundedYear: 2015, teamSize: 200, isHiring: true, oneLiner: "Payment processing platform for Africa", founders: [
    { name: "Shola Akinlade", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Shola Akinlade is the co-founder and CEO of Paystack, a payment processing company that was acquired by Stripe in 2020.", xHandle: "sholla", linkedinUrl: "https://www.linkedin.com/in/shola-akinlade", foundedYear: 2015, isHiring: true, teamSize: 200 },
    { name: "Ezra Olubi", role: "Co-founder & CTO", location: "Lagos", industry: "Fintech", bio: "Ezra Olubi is the co-founder and CTO of Paystack, leading the technology team.", xHandle: "ezraolubi", linkedinUrl: "https://www.linkedin.com/in/ezra-olubi", foundedYear: 2015, isHiring: true, teamSize: 200 },
  ]},
  { name: "Flutterwave", industry: "Fintech", location: "Lagos", foundedYear: 2016, teamSize: 500, isHiring: true, oneLiner: "Africa's leading payments technology company", founders: [
    { name: "Olugbenga Agboola", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Olugbenga Agboola is the CEO and co-founder of Flutterwave, a payments infrastructure company valued at over $3 billion.", xHandle: "gbengagboola", linkedinUrl: "https://www.linkedin.com/in/olugbenga-agboola", foundedYear: 2016, isHiring: true, teamSize: 500 },
    { name: "Iyinoluwa Aboyeji", role: "Co-founder", location: "Lagos", industry: "Fintech", bio: "Iyinoluwa Aboyeji is a serial entrepreneur who co-founded Flutterwave and Andela.", xHandle: "iaboyeji", linkedinUrl: "https://www.linkedin.com/in/iyinoluwa-aboyeji", foundedYear: 2016, isHiring: true, teamSize: 500 },
  ]},
  { name: "Interswitch", industry: "Fintech", location: "Lagos", foundedYear: 2002, teamSize: 1000, isHiring: true, oneLiner: "Africa's leading integrated payments and digital commerce company", founders: [
    { name: "Mitchell Elegbe", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Mitchell Elegbe founded Interswitch in 2002, pioneering electronic payment processing in Nigeria.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/mitchell-elegbe", foundedYear: 2002, isHiring: true, teamSize: 1000 },
  ]},
  { name: "OPay", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 500, isHiring: true, oneLiner: "Mobile money and payment platform for Africa", founders: [
    { name: "Yahui Zhou", role: "CEO", location: "Lagos", industry: "Fintech", bio: "Yahui Zhou is the CEO of OPay, a mobile money platform operating across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 500 },
  ]},
  { name: "Kuda Bank", industry: "Fintech", location: "Lagos", foundedYear: 2019, teamSize: 400, isHiring: true, oneLiner: "Digital-only bank for Africa", founders: [
    { name: "Babs Ogundeyi", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Babs Ogundeyi is the CEO and co-founder of Kuda, a digital bank serving millions of Africans.", xHandle: "babsogundeyi", linkedinUrl: "https://www.linkedin.com/in/babs-ogundeyi", foundedYear: 2019, isHiring: true, teamSize: 400 },
    { name: "Musty Mustapha", role: "Co-founder & CTO", location: "Lagos", industry: "Fintech", bio: "Musty Mustapha is the co-founder and CTO of Kuda Bank.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/musty-mustapha", foundedYear: 2019, isHiring: true, teamSize: 400 },
  ]},
  { name: "Moniepoint", industry: "Fintech", location: "Lagos", foundedYear: 2015, teamSize: 600, isHiring: true, oneLiner: "Business banking platform for Africa", founders: [
    { name: "Tosin Eniolorunda", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Tosin Eniolorunda is the CEO of Moniepoint, a business banking platform processing billions in transactions.", xHandle: "tosineniolorunda", linkedinUrl: "https://www.linkedin.com/in/tosin-eniolorunda", foundedYear: 2015, isHiring: true, teamSize: 600 },
    { name: "Felix Ike", role: "Co-founder & CTO", location: "Lagos", industry: "Fintech", bio: "Felix Ike is the co-founder and CTO of Moniepoint.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/felix-ike", foundedYear: 2015, isHiring: true, teamSize: 600 },
  ]},
  { name: "Paga", industry: "Fintech", location: "Lagos", foundedYear: 2009, teamSize: 500, isHiring: true, oneLiner: "Mobile payment company enabling financial inclusion", founders: [
    { name: "Tayo Oviosu", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Tayo Oviosu founded Paga in 2009 to drive financial inclusion in Nigeria through mobile payments.", xHandle: "tayoo", linkedinUrl: "https://www.linkedin.com/in/tayo-oviosu", foundedYear: 2009, isHiring: true, teamSize: 500 },
  ]},
  { name: "Chipper Cash", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 300, isHiring: true, oneLiner: "Cross-border mobile money transfers", founders: [
    { name: "Ham Serunjogi", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Ham Serunjogi co-founded Chipper Cash to enable free cross-border payments across Africa.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/ham-serunjogi", foundedYear: 2018, isHiring: true, teamSize: 300 },
    { name: "Maijid Moujaled", role: "Co-founder", location: "Lagos", industry: "Fintech", bio: "Maijid Moujaled is the co-founder of Chipper Cash.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 300 },
  ]},
  { name: "TeamApt", industry: "Fintech", location: "Lagos", foundedYear: 2015, teamSize: 400, isHiring: true, oneLiner: "Digital financial services provider", founders: [
    { name: "Tobias Andreyev", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Tobias Andreyev leads TeamApt, providing digital financial services across Nigeria.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 400 },
  ]},
  { name: "Carbon", industry: "Fintech", location: "Lagos", foundedYear: 2016, teamSize: 200, isHiring: true, oneLiner: "Digital lending and financial services platform", founders: [
    { name: "Chijioke Dozie", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Chijioke Dozie is the CEO of Carbon (formerly Paylater), a digital lending platform.", xHandle: "chijokedozie", linkedinUrl: "https://www.linkedin.com/in/chijioke-dozie", foundedYear: 2016, isHiring: true, teamSize: 200 },
    { name: "Ngozi Dozie", role: "Co-founder", location: "Lagos", industry: "Fintech", bio: "Ngozi Dozie co-founded Carbon, a leading digital lending platform in Nigeria.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 200 },
  ]},
  { name: "FairMoney", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 300, isHiring: true, oneLiner: "Digital bank and lending platform", founders: [
    { name: "Laurin Hainy", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Laurin Hainy is the CEO of FairMoney, a digital bank and lending platform.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/laurin-hainy", foundedYear: 2017, isHiring: true, teamSize: 300 },
  ]},
  { name: "Lidya", industry: "Fintech", location: "Lagos", foundedYear: 2016, teamSize: 100, isHiring: false, oneLiner: "Digital lending for SMEs in Africa", founders: [
    { name: "Tunde Kehinde", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Tunde Kehinde co-founded Lidya to provide digital lending solutions for SMEs in Africa.", xHandle: "tabornde", linkedinUrl: "https://www.linkedin.com/in/tunde-kehinde", foundedYear: 2016, isHiring: false, teamSize: 100 },
    { name: "Ercin Eksin", role: "Co-founder", location: "Lagos", industry: "Fintech", bio: "Ercin Eksin is the co-founder of Lidya.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: false, teamSize: 100 },
  ]},
  { name: "PiggyVest", industry: "Fintech", location: "Lagos", foundedYear: 2016, teamSize: 200, isHiring: true, oneLiner: "Savings and investment platform for Africa", founders: [
    { name: "Odunayo Eweniyi", role: "Co-founder & COO", location: "Lagos", industry: "Fintech", bio: "Odunayo Eweniyi is the COO and co-founder of PiggyVest, Africa's largest digital savings platform.", xHandle: "odunayoe", linkedinUrl: "https://www.linkedin.com/in/odunayo-eweniyi", foundedYear: 2016, isHiring: true, teamSize: 200 },
    { name: "Joshua Chibueze", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Joshua Chibueze is the CEO and co-founder of PiggyVest.", xHandle: "jabornde", linkedinUrl: "https://www.linkedin.com/in/joshua-chibueze", foundedYear: 2016, isHiring: true, teamSize: 200 },
  ]},
  { name: "Cowrywise", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "Wealth management platform for Africa", founders: [
    { name: "Razaq Ahmed", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Razaq Ahmed is the CEO of Cowrywise, a wealth management platform.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/razaq-ahmed", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},
  { name: "VBank", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 150, isHiring: true, oneLiner: "Digital banking platform", founders: [
    { name: "Abasi Ene-Obong", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Abasi Ene-Obong founded VBank, a digital banking platform.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 150 },
  ]},
  { name: "Sparkle", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 100, isHiring: true, oneLiner: "Mobile-first financial platform", founders: [
    { name: "Uzoma Dozie", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Uzoma Dozie is the founder of Sparkle, a mobile-first financial platform in Nigeria.", xHandle: "uzomadozie", linkedinUrl: "https://www.linkedin.com/in/uzoma-dozie", foundedYear: 2018, isHiring: true, teamSize: 100 },
  ]},
  { name: "BuyCoins", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 50, isHiring: true, oneLiner: "Cryptocurrency exchange for Africa", founders: [
    { name: "Timi Ajiboye", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Timi Ajiboye is the CEO of BuyCoins, a cryptocurrency exchange.", xHandle: "timiajiboye", linkedinUrl: "https://www.linkedin.com/in/timi-ajiboye", foundedYear: 2017, isHiring: true, teamSize: 50 },
    { name: "Ton Ogundipe", role: "Co-founder", location: "Lagos", industry: "Fintech", bio: "Ton Ogundipe co-founded BuyCoins.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 50 },
  ]},
  { name: "Yellow Card", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 100, isHiring: true, oneLiner: "Pan-African cryptocurrency exchange", founders: [
    { name: "Chris Maurice", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Chris Maurice is the CEO of Yellow Card, a pan-African cryptocurrency exchange.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 100 },
    { name: "Justin Poiroux", role: "Co-founder & CTO", location: "Lagos", industry: "Fintech", bio: "Justin Poiroux is the CTO and co-founder of Yellow Card.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 100 },
  ]},
  { name: "Risevest", industry: "Fintech", location: "Lagos", foundedYear: 2020, teamSize: 50, isHiring: true, oneLiner: "Investment platform for global assets", founders: [
    { name: "Eke Urum", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Eke Urum founded Risevest to enable Africans invest in global assets.", xHandle: "ekeurum", linkedinUrl: "https://www.linkedin.com/in/eke-urum", foundedYear: 2020, isHiring: true, teamSize: 50 },
  ]},
  { name: "Trove", industry: "Fintech", location: "Lagos", foundedYear: 2018, teamSize: 30, isHiring: false, oneLiner: "Investment app for global stocks", founders: [
    { name: "Oluwatobi Abiodun-Wisen", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Oluwatobi Abiodun-Wisen is the founder of Trove, an investment platform.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: false, teamSize: 30 },
  ]},
  { name: "Chaka", industry: "Fintech", location: "Lagos", foundedYear: 2019, teamSize: 40, isHiring: false, oneLiner: "Global stock trading platform", founders: [
    { name: "Carter Efamije", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Carter Efamije is the founder of Chaka, a global stock trading platform.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: false, teamSize: 40 },
  ]},
  { name: "Termii", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 60, isHiring: true, oneLiner: "Digital identity and authentication platform", founders: [
    { name: "Gbolade Adefila", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Gbolade Adefila leads Termii, providing digital identity solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 60 },
  ]},
  { name: "Youverify", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "Identity verification and compliance platform", founders: [
    { name: "Opeyemi Akinyemi", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Opeyemi Akinyemi founded Youverify to provide identity verification solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},
  { name: "Aella", industry: "Fintech", location: "Lagos", foundedYear: 2015, teamSize: 100, isHiring: true, oneLiner: "Lending and financial services platform", founders: [
    { name: "Akin Jones", role: "CEO", location: "Lagos", industry: "Fintech", bio: "Akin Jones leads Aella, a lending and financial services platform.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 100 },
  ]},
  { name: "Zedvance", industry: "Fintech", location: "Lagos", foundedYear: 2014, teamSize: 80, isHiring: false, oneLiner: "Consumer lending platform", founders: [
    { name: "Uzoma Iheme", role: "Founder", location: "Lagos", industry: "Fintech", bio: "Uzoma Iheme founded Zedvance, a consumer lending platform.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: false, teamSize: 80 },
  ]},
  { name: "eTranzact", industry: "Fintech", location: "Lagos", foundedYear: 2003, teamSize: 300, isHiring: true, oneLiner: "Electronic payment solutions provider", founders: [
    { name: "Valentine Obi", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Valentine Obi founded eTranzact, a leading electronic payment company.", xHandle: "", linkedinUrl: "", foundedYear: 2003, isHiring: true, teamSize: 300 },
  ]},
  { name: "Remita", industry: "Fintech", location: "Lagos", foundedYear: 2005, teamSize: 200, isHiring: true, oneLiner: "Payment processing and collection platform", founders: [
    { name: "Deji Opeyemi", role: "CEO", location: "Lagos", industry: "Fintech", bio: "Deji Opeyemi leads Remita, a payment processing platform.", xHandle: "", linkedinUrl: "", foundedYear: 2005, isHiring: true, teamSize: 200 },
  ]},

  // HEALTHTECH
  { name: "54gene", industry: "Healthtech", location: "Lagos", foundedYear: 2018, teamSize: 200, isHiring: true, oneLiner: "African genomics company", founders: [
    { name: "Abasi Ene-Obong", role: "Founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Abasi Ene-Obong founded 54gene to unlock the power of African genomics data.", xHandle: "abasienobong", linkedinUrl: "https://www.linkedin.com/in/abasi-ene-obong", foundedYear: 2018, isHiring: true, teamSize: 200 },
  ]},
  { name: "Reliance HMO", industry: "Healthtech", location: "Lagos", foundedYear: 2016, teamSize: 150, isHiring: true, oneLiner: "Health insurance platform for Africa", founders: [
    { name: "Femi Kuti", role: "Co-founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Femi Kuti co-founded Reliance HMO to make health insurance accessible.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 150 },
    { name: "Odunayo Eweniyi", role: "Co-founder", location: "Lagos", industry: "Healthtech", bio: "Odunayo Eweniyi is also a co-founder of Reliance HMO.", xHandle: "odunayoe", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 150 },
  ]},
  { name: "MDaaS Global", industry: "Healthtech", location: "Lagos", foundedYear: 2016, teamSize: 100, isHiring: true, oneLiner: "Medical diagnostics network across Africa", founders: [
    { name: "Oluwaseun Adebayo", role: "Co-founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Oluwaseun Adebayo leads MDaaS Global, building a network of diagnostic labs.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 100 },
  ]},
  { name: "Wellahealth", industry: "Healthtech", location: "Lagos", foundedYear: 2018, teamSize: 50, isHiring: true, oneLiner: "Affordable healthcare for the underserved", founders: [
    { name: "Ikpeme Neto", role: "Founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Ikpeme Neto founded Wellahealth to provide affordable healthcare.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 50 },
  ]},
  { name: "LifeBank", industry: "Healthtech", location: "Lagos", foundedYear: 2015, teamSize: 100, isHiring: true, oneLiner: "Blood and oxygen supply chain platform", founders: [
    { name: "Temie Giwa-Tubosun", role: "Founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Temie Giwa-Tubosun founded LifeBank to eliminate blood shortages in Nigeria.", xHandle: "temiegt", linkedinUrl: "https://www.linkedin.com/in/temie-giwa-tubosun", foundedYear: 2015, isHiring: true, teamSize: 100 },
  ]},
  { name: "Kangpe", industry: "Healthtech", location: "Lagos", foundedYear: 2016, teamSize: 50, isHiring: false, oneLiner: "Telehealth platform for Africa", founders: [
    { name: "Peju Akindele", role: "Founder", location: "Lagos", industry: "Healthtech", bio: "Peju Akindele founded Kangpe, a telehealth platform.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: false, teamSize: 50 },
  ]},
  { name: "MobiHealth", industry: "Healthtech", location: "Lagos", foundedYear: 2019, teamSize: 30, isHiring: true, oneLiner: "Mobile health platform", founders: [
    { name: "Adegoke Adeboye", role: "Founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Adegoke Adeboye founded MobiHealth to provide mobile health solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 30 },
  ]},
  { name: "Medicheck", industry: "Healthtech", location: "Lagos", foundedYear: 2020, teamSize: 20, isHiring: true, oneLiner: "Health screening platform", founders: [
    { name: "Tunde Oyeyemi", role: "Founder & CEO", location: "Lagos", industry: "Healthtech", bio: "Tunde Oyeyemi founded Medicheck for accessible health screening.", xHandle: "", linkedinUrl: "", foundedYear: 2020, isHiring: true, teamSize: 20 },
  ]},

  // EDTECH
  { name: "uLesson", industry: "Edtech", location: "Lagos", foundedYear: 2019, teamSize: 200, isHiring: true, oneLiner: "K-12 learning platform for Africa", founders: [
    { name: "Sim Shagaya", role: "Founder & CEO", location: "Lagos", industry: "Edtech", bio: "Sim Shagaya founded uLesson to provide quality education through technology.", xHandle: "simsagaya", linkedinUrl: "https://www.linkedin.com/in/sim-shagaya", foundedYear: 2019, isHiring: true, teamSize: 200 },
  ]},
  { name: "AltSchool Africa", industry: "Edtech", location: "Lagos", foundedYear: 2018, teamSize: 100, isHiring: true, oneLiner: "Technology education platform", founders: [
    { name: "Adewale Yusuf", role: "Co-founder & CEO", location: "Lagos", industry: "Edtech", bio: "Adewale Yusuf co-founded AltSchool Africa to train the next generation of tech talent.", xHandle: "adewaleyusuf", linkedinUrl: "https://www.linkedin.com/in/adewale-yusuf", foundedYear: 2018, isHiring: true, teamSize: 100 },
    { name: "Akintunde Sultan", role: "Co-founder", location: "Lagos", industry: "Edtech", bio: "Akintunde Sultan is the co-founder of AltSchool Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 100 },
    { name: "Opeyemi Awoyemi", role: "Co-founder", location: "Lagos", industry: "Edtech", bio: "Opeyemi Awoyemi co-founded AltSchool Africa.", xHandle: "opeyemiawoyemi", linkedinUrl: "https://www.linkedin.com/in/opeyemi-awoyemi", foundedYear: 2018, isHiring: true, teamSize: 100 },
  ]},
  { name: "Tuteria", industry: "Edtech", location: "Lagos", foundedYear: 2015, teamSize: 50, isHiring: true, oneLiner: "Online tutoring marketplace", founders: [
    { name: "Godwin Benson", role: "Founder & CEO", location: "Lagos", industry: "Edtech", bio: "Godwin Benson founded Tuteria to connect students with quality tutors.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 50 },
  ]},
  { name: "ScholarX", industry: "Edtech", location: "Lagos", foundedYear: 2016, teamSize: 30, isHiring: true, oneLiner: "Scholarship and study abroad platform", founders: [
    { name: "Mark Essien", role: "Founder & CEO", location: "Lagos", industry: "Edtech", bio: "Mark Essien founded ScholarX to help Africans access global education.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 30 },
  ]},
  { name: "Gradely", industry: "Edtech", location: "Lagos", foundedYear: 2019, teamSize: 40, isHiring: true, oneLiner: "Adaptive learning platform for schools", founders: [
    { name: "Toyosi Akerele-Ogunsiji", role: "Founder & CEO", location: "Lagos", industry: "Edtech", bio: "Toyosi Akerele-Ogunsiji founded Gradely to personalize learning for African students.", xHandle: "toyosiakerele", linkedinUrl: "https://www.linkedin.com/in/toyosi-akerele-ogunsiji", foundedYear: 2019, isHiring: true, teamSize: 40 },
  ]},

  // LOGISTICS
  { name: "Kobo360", industry: "Logistics", location: "Lagos", foundedYear: 2018, teamSize: 200, isHiring: true, oneLiner: "Digital logistics platform for Africa", founders: [
    { name: "Obi Ozor", role: "Co-founder & CEO", location: "Lagos", industry: "Logistics", bio: "Obi Ozor co-founded Kobo360 to digitize Africa's supply chain.", xHandle: "obiozor", linkedinUrl: "https://www.linkedin.com/in/obi-ozor", foundedYear: 2018, isHiring: true, teamSize: 200 },
    { name: "Ife Oyedele II", role: "Co-founder & CTO", location: "Lagos", industry: "Logistics", bio: "Ife Oyedele II is the co-founder and CTO of Kobo360.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 200 },
  ]},
  { name: "Moove", industry: "Logistics", location: "Lagos", foundedYear: 2019, teamSize: 500, isHiring: true, oneLiner: "Vehicle financing for mobility entrepreneurs", founders: [
    { name: "Ladi Delano", role: "Co-founder & CEO", location: "Lagos", industry: "Logistics", bio: "Ladi Delano co-founded Moove to provide vehicle financing for mobility entrepreneurs.", xHandle: "ladidelano", linkedinUrl: "https://www.linkedin.com/in/ladi-delano", foundedYear: 2019, isHiring: true, teamSize: 500 },
    { name: "Jide Odunsi", role: "Co-founder", location: "Lagos", industry: "Logistics", bio: "Jide Odunsi is the co-founder of Moove.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 500 },
  ]},
  { name: "MAX Nigeria", industry: "Logistics", location: "Lagos", foundedYear: 2015, teamSize: 150, isHiring: true, oneLiner: "Last-mile delivery platform", founders: [
    { name: "Chinedu Azodoh", role: "Co-founder & CEO", location: "Lagos", industry: "Logistics", bio: "Chinedu Azodoh co-founded MAX to provide last-mile delivery solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 150 },
    { name: "Adetayo Bamiduro", role: "Co-founder", location: "Lagos", industry: "Logistics", bio: "Adetayo Bamiduro is the co-founder of MAX.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 150 },
  ]},
  { name: "Gokada", industry: "Logistics", location: "Lagos", foundedYear: 2018, teamSize: 100, isHiring: false, oneLiner: "On-demand motorcycle ride service", founders: [
    { name: "Fahim Saleh", role: "Founder & CEO", location: "Lagos", industry: "Logistics", bio: "Fahim Saleh founded Gokada to provide motorcycle ride-hailing in Lagos.", xHandle: "fahimsaleh", linkedinUrl: "https://www.linkedin.com/in/fahim-saleh", foundedYear: 2018, isHiring: false, teamSize: 100 },
    { name: "Deji Oduntan", role: "Co-founder & COO", location: "Lagos", industry: "Logistics", bio: "Deji Oduntan co-founded Gokada.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: false, teamSize: 100 },
  ]},
  { name: "Shuttlers", industry: "Logistics", location: "Lagos", foundedYear: 2016, teamSize: 50, isHiring: true, oneLiner: "Shared bus commuting platform", founders: [
    { name: "Damilola Olokesusi", role: "Co-founder & CEO", location: "Lagos", industry: "Logistics", bio: "Damilola Olokesusi co-founded Shuttlers to provide shared commuting in Lagos.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 50 },
  ]},
  { name: "TradeDepot", industry: "Logistics", location: "Lagos", foundedYear: 2016, teamSize: 200, isHiring: true, oneLiner: "B2B e-commerce and distribution platform", founders: [
    { name: "Onyekachi Izukanne", role: "Co-founder & CEO", location: "Lagos", industry: "Logistics", bio: "Onyekachi Izukanne co-founded TradeDepot to digitize retail distribution.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 200 },
  ]},
  { name: "Alerzo", industry: "Logistics", location: "Lagos", foundedYear: 2018, teamSize: 100, isHiring: true, oneLiner: "B2B marketplace for retail shops", founders: [
    { name: "Adewale Opaleye", role: "Founder & CEO", location: "Lagos", industry: "Logistics", bio: "Adewale Opaleye founded Alerzo to digitize retail supply chains.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 100 },
  ]},

  // AGRITECH
  { name: "ThriveAgric", industry: "Agritech", location: "Lagos", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "Agricultural technology company", founders: [
    { name: "Ayo Arikawe", role: "Co-founder & CTO", location: "Lagos", industry: "Agritech", bio: "Ayo Arikawe co-founded ThriveAgric to use technology to improve farming in Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
    { name: "Uka Eje", role: "Co-founder & CEO", location: "Lagos", industry: "Agritech", bio: "Uka Eje co-founded ThriveAgric, connecting farmers to financing and markets.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},
  { name: "Farmcrowdy", industry: "Agritech", location: "Lagos", foundedYear: 2016, teamSize: 80, isHiring: true, oneLiner: "Nigeria's first digital agriculture platform", founders: [
    { name: "Akindele Phillips", role: "Co-founder & CEO", location: "Lagos", industry: "Agritech", bio: "Akindele Phillips co-founded Farmcrowdy, Nigeria's first digital agriculture platform.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 80 },
    { name: "Gbemisola Oladokun", role: "Co-founder", location: "Lagos", industry: "Agritech", bio: "Gbemisola Oladokun co-founded Farmcrowdy.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 80 },
  ]},
  { name: "HelloTractor", industry: "Agritech", location: "Lagos", foundedYear: 2014, teamSize: 50, isHiring: true, oneLiner: "Uber for tractors in Africa", founders: [
    { name: "Jehu Olamigoke", role: "Co-founder & CEO", location: "Lagos", industry: "Agritech", bio: "Jehu Olamigoke co-founded HelloTractor to connect smallholder farmers to equipment.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 50 },
  ]},
  { name: "Releaf", industry: "Agritech", location: "Lagos", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "Industrial technology for African agriculture", founders: [
    { name: "Ikenna Nwoga", role: "Co-founder & CTO", location: "Lagos", industry: "Agritech", bio: "Ikenna Nwoga co-founded Releaf to build industrial technology for African agriculture.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
    { name: "Uzochukwu Okafor", role: "Co-founder & CEO", location: "Lagos", industry: "Agritech", bio: "Uzochukwu Okafor co-founded Releaf.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},
  { name: "Zowasel", industry: "Agritech", location: "Lagos", foundedYear: 2018, teamSize: 50, isHiring: true, oneLiner: "Commodity trading platform", founders: [
    { name: "Jerry Ilori", role: "Founder & CEO", location: "Lagos", industry: "Agritech", bio: "Jerry Ilori founded Zowasel to connect commodity traders across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 50 },
  ]},
  { name: "Agrorite", industry: "Agritech", location: "Lagos", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "Agricultural marketplace", founders: [
    { name: "Oluwatosin Oyeleke", role: "Founder & CEO", location: "Lagos", industry: "Agritech", bio: "Oluwatosin Oyeleke founded Agrorite to digitize agricultural trading.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},

  // E-COMMERCE
  { name: "Jumia Nigeria", industry: "E-commerce", location: "Lagos", foundedYear: 2012, teamSize: 2000, isHiring: true, oneLiner: "Africa's leading online marketplace", founders: [
    { name: "Jeremy Hodara", role: "Co-founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Jeremy Hodara co-founded Jumia, Africa's leading online marketplace.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: true, teamSize: 2000 },
    { name: "Sacha Poignonnec", role: "Co-founder", location: "Lagos", industry: "E-commerce", bio: "Sacha Poignonnec is the co-founder of Jumia.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: true, teamSize: 2000 },
  ]},
  { name: "Konga", industry: "E-commerce", location: "Lagos", foundedYear: 2012, teamSize: 500, isHiring: true, oneLiner: "Nigerian e-commerce platform", founders: [
    { name: "Shola Adekunle", role: "Founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Shola Adekunle founded Konga, one of Africa's largest e-commerce platforms.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: true, teamSize: 500 },
  ]},
  { name: "PricePally", industry: "E-commerce", location: "Lagos", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "Group buying platform for food and groceries", founders: [
    { name: "Luther Lawoyin", role: "Founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Luther Lawoyin founded PricePally to make food affordable through group buying.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},
  { name: "BuyAm", industry: "E-commerce", location: "Lagos", foundedYear: 2017, teamSize: 20, isHiring: true, oneLiner: "Nigerian online marketplace", founders: [
    { name: "Oluwaseun Adeyemi", role: "Founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Oluwaseun Adeyemi founded BuyAm to make online shopping accessible.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 20 },
  ]},
  { name: "MallForAfrica", industry: "E-commerce", location: "Lagos", foundedYear: 2014, teamSize: 50, isHiring: false, oneLiner: "Cross-border e-commerce platform", founders: [
    { name: "Chris Ukpe", role: "Founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Chris Ukpe founded MallForAfrica to enable cross-border shopping.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: false, teamSize: 50 },
  ]},

  // PROPTech
  { name: "Spleet", industry: "Proptech", location: "Lagos", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "Short-term rental management platform", founders: [
    { name: "Adetayo Bamiduro", role: "Co-founder & CEO", location: "Lagos", industry: "Proptech", bio: "Adetayo Bamiduro co-founded Spleet to simplify short-term rentals.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},
  { name: "Fibre", industry: "Proptech", location: "Lagos", foundedYear: 2016, teamSize: 20, isHiring: false, oneLiner: "Co-living platform", founders: [
    { name: "Innocent Oboh", role: "Co-founder & CEO", location: "Lagos", industry: "Proptech", bio: "Innocent Oboh co-founded Fibre to provide co-living solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: false, teamSize: 20 },
  ]},

  // SAAS
  { name: "Termii", industry: "SaaS", location: "Lagos", foundedYear: 2017, teamSize: 60, isHiring: true, oneLiner: "Communication API for Africa", founders: [
    { name: "Gbolade Adefila", role: "Co-founder & CEO", location: "Lagos", industry: "SaaS", bio: "Gbolade Adefila leads Termii, a communication API platform.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 60 },
  ]},
  { name: "Stears", industry: "SaaS", location: "Lagos", foundedYear: 2017, teamSize: 30, isHiring: true, oneLiner: "Data intelligence platform for Africa", founders: [
    { name: "Oluseun Onigbinde", role: "Co-founder & CEO", location: "Lagos", industry: "SaaS", bio: "Oluseun Onigbinde co-founded Stears to provide data intelligence for Africa.", xHandle: "seunonigbinde", linkedinUrl: "https://www.linkedin.com/in/oluseun-onigbinde", foundedYear: 2017, isHiring: true, teamSize: 30 },
  ]},
  { name: "Crenovator", industry: "SaaS", location: "Lagos", foundedYear: 2018, teamSize: 20, isHiring: true, oneLiner: "Construction technology platform", founders: [
    { name: "Oluwaseun Adeyemi", role: "Founder & CEO", location: "Lagos", industry: "SaaS", bio: "Oluwaseun Adeyemi founded Crenovator to digitize construction.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 20 },
  ]},
  { name: "VConnect", industry: "SaaS", location: "Lagos", foundedYear: 2012, teamSize: 50, isHiring: false, oneLiner: "Business directory and marketplace", founders: [
    { name: "Deepankar Rustagi", role: "Founder & CEO", location: "Lagos", industry: "SaaS", bio: "Deepankar Rustagi founded VConnect as a business directory for Nigeria.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: false, teamSize: 50 },
  ]},

  // CLIMATE
  { name: "Rensource", industry: "Climate", location: "Lagos", foundedYear: 2016, teamSize: 100, isHiring: true, oneLiner: "Distributed solar energy for markets", founders: [
    { name: "Ademola Adesina", role: "Co-founder & CEO", location: "Lagos", industry: "Climate", bio: "Ademola Adesina co-founded Rensource to provide solar energy for markets.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 100 },
  ]},
  { name: "Arnergy", industry: "Climate", location: "Lagos", foundedYear: 2018, teamSize: 80, isHiring: true, oneLiner: "Solar energy solutions for homes and businesses", founders: [
    { name: "Folarin Onifade", role: "Co-founder & CEO", location: "Lagos", industry: "Climate", bio: "Folarin Onifade co-founded Arnergy to provide reliable solar energy.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 80 },
    { name: "Kunle Odebunmi", role: "Co-founder", location: "Lagos", industry: "Climate", bio: "Kunle Odebunmi co-founded Arnergy.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 80 },
  ]},
  { name: "Lumos Global", industry: "Climate", location: "Lagos", foundedYear: 2012, teamSize: 200, isHiring: true, oneLiner: "Solar energy for off-grid homes", founders: [
    { name: "Peiter Zuithoff", role: "CEO", location: "Lagos", industry: "Climate", bio: "Peiter Zuithoff leads Lumos Global, providing solar energy to off-grid homes.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: true, teamSize: 200 },
  ]},
  { name: "Daystar Power", industry: "Climate", location: "Lagos", foundedYear: 2017, teamSize: 200, isHiring: true, oneLiner: "Solar power solutions for businesses", founders: [
    { name: "Alexander von Hausen", role: "Co-founder & CEO", location: "Lagos", industry: "Climate", bio: "Alexander von Hausen co-founded Daystar Power to provide solar solutions for businesses.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 200 },
  ]},

  // MEDIA
  { name: "TechCabal", industry: "Media", location: "Lagos", foundedYear: 2013, teamSize: 30, isHiring: true, oneLiner: "Africa's leading tech news publication", founders: [
    { name: "Bankole Oluwole", role: "Founder & Editor-in-Chief", location: "Lagos", industry: "Media", bio: "Bankole Oluwole founded TechCabal to cover Africa's tech ecosystem.", xHandle: "bankole", linkedinUrl: "https://www.linkedin.com/in/bankole-oluwole", foundedYear: 2013, isHiring: true, teamSize: 30 },
  ]},
  { name: "Techpoint Africa", industry: "Media", location: "Lagos", foundedYear: 2015, teamSize: 20, isHiring: true, oneLiner: "Africa's leading tech publication", founders: [
    { name: "Adewale Yusuf", role: "Founder & CEO", location: "Lagos", industry: "Media", bio: "Adewale Yusuf founded Techpoint Africa to cover Africa's tech ecosystem.", xHandle: "adewaleyusuf", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 20 },
  ]},
  { name: "Nairametrics", industry: "Media", location: "Lagos", foundedYear: 2014, teamSize: 15, isHiring: true, oneLiner: "Nigeria's leading financial news platform", founders: [
    { name: "Ugo Obi-Chukwu", role: "Founder & CEO", location: "Lagos", industry: "Media", bio: "Ugo Obi-Chukwu founded Nairametrics to provide financial intelligence.", xHandle: "ugochukwu", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 15 },
  ]},

  // INSURTECH
  { name: "CrowdForce", industry: "Insurtech", location: "Lagos", foundedYear: 2016, teamSize: 50, isHiring: true, oneLiner: "Data analytics and market research platform", founders: [
    { name: "Oluwatomi Ayodele", role: "Co-founder & CEO", location: "Lagos", industry: "Insurtech", bio: "Oluwatomi Ayodele co-founded CrowdForce to leverage data for market research.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 50 },
  ]},

  // CYBERSECURITY
  { name: "IEMR", industry: "Cybersecurity", location: "Lagos", foundedYear: 2019, teamSize: 30, isHiring: true, oneLiner: "Cybersecurity solutions for Africa", founders: [
    { name: "Favour Femi-Oyewole", role: "Founder & CEO", location: "Lagos", industry: "Cybersecurity", bio: "Favour Femi-Oyewole founded IEMR to provide cybersecurity solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 30 },
  ]},

  // BLOCKCHAIN
  { name: "Quidax", industry: "Blockchain", location: "Lagos", foundedYear: 2018, teamSize: 50, isHiring: true, oneLiner: "African cryptocurrency exchange", founders: [
    { name: "Buchi Okoro", role: "Co-founder & CEO", location: "Lagos", industry: "Blockchain", bio: "Buchi Okoro co-founded Quidax, an African cryptocurrency exchange.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 50 },
  ]},

  // GAMING
  { name: "Bamboo", industry: "Fintech", location: "Lagos", foundedYear: 2019, teamSize: 50, isHiring: true, oneLiner: "Stock trading platform for Africans", founders: [
    { name: "Yomi Okusanya", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Yomi Okusanya co-founded Bamboo to enable Africans invest in global stocks.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 50 },
  ]},
  { name: "Patricia", industry: "Fintech", location: "Lagos", foundedYear: 2017, teamSize: 50, isHiring: true, oneLiner: "Gift cards and cryptocurrency platform", founders: [
    { name: "Hanu Agbodje", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Hanu Agbodje founded Patricia, a gift cards and cryptocurrency platform.", xHandle: "hanuagbodje", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 50 },
  ]},

  // MORE FINTECH
  { name: "Spectranet", industry: "Fintech", location: "Lagos", foundedYear: 2011, teamSize: 100, isHiring: false, oneLiner: "Broadband internet provider", founders: [
    { name: "Gregory Adjebeng", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Gregory Adjebeng founded Spectranet to provide broadband internet.", xHandle: "", linkedinUrl: "", foundedYear: 2011, isHiring: false, teamSize: 100 },
  ]},
  { name: "Tizeti", industry: "Fintech", location: "Lagos", foundedYear: 2012, teamSize: 100, isHiring: true, oneLiner: "Wireless internet service provider", founders: [
    { name: "Kendall Ananyi", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Kendall Ananyi co-founded Tizeti to provide affordable wireless internet.", xHandle: "", linkedinUrl: "", foundedYear: 2012, isHiring: true, teamSize: 100 },
  ]},
  { name: "Systemspecs", industry: "Fintech", location: "Lagos", foundedYear: 1991, teamSize: 300, isHiring: true, oneLiner: "Software solutions company", founders: [
    { name: "John Obaro", role: "Founder & Managing Director", location: "Lagos", industry: "Fintech", bio: "John Obaro founded Systemspecs, maker of Remita payment platform.", xHandle: "", linkedinUrl: "", foundedYear: 1991, isHiring: true, teamSize: 300 },
  ]},

  // MORE HEALTHTECH
  { name: "Hygeia HMO", industry: "Healthtech", location: "Lagos", foundedYear: 1986, teamSize: 200, isHiring: true, oneLiner: "Health maintenance organization", founders: [
    { name: "Obinna Ekezie", role: "Founder", location: "Lagos", industry: "Healthtech", bio: "Obinna Ekezie founded Hygeia HMO, one of Nigeria's largest health insurance providers.", xHandle: "", linkedinUrl: "", foundedYear: 1986, isHiring: true, teamSize: 200 },
  ]},

  // MORE EDTECH
  { name: "Crenovator", industry: "Edtech", location: "Lagos", foundedYear: 2018, teamSize: 20, isHiring: true, oneLiner: "Tech skills training", founders: [
    { name: "Chukwuemeka Fred Agbaji", role: "Founder & CEO", location: "Lagos", industry: "Edtech", bio: "Chukwuemeka Fred Agbaji founded Crenovator to train tech talent.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 20 },
  ]},

  // MORE LOGISTICS
  { name: "MetroAfrica", industry: "Logistics", location: "Lagos", foundedYear: 2017, teamSize: 30, isHiring: false, oneLiner: "Delivery and logistics platform", founders: [
    { name: "Femi Ayanbije", role: "Founder & CEO", location: "Lagos", industry: "Logistics", bio: "Femi Ayanbije founded MetroAfrica for logistics solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: false, teamSize: 30 },
  ]},
  { name: "Sendy", industry: "Logistics", location: "Lagos", foundedYear: 2014, teamSize: 100, isHiring: true, oneLiner: "On-demand delivery platform for Africa", founders: [
    { name: "Meshack Alloys", role: "Founder & CEO", location: "Lagos", industry: "Logistics", bio: "Meshack Alloys founded Sendy to provide on-demand delivery in Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 100 },
  ]},

  // MORE AGRITECH
  { name: "Farmfundit", industry: "Agritech", location: "Lagos", foundedYear: 2016, teamSize: 20, isHiring: true, oneLiner: "Agricultural crowdfunding platform", founders: [
    { name: "Oye Akindele", role: "Founder & CEO", location: "Lagos", industry: "Agritech", bio: "Oye Akindele founded Farmfundit to finance agriculture through crowdfunding.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 20 },
  ]},

  // MORE SAAS
  { name: "Notch", industry: "SaaS", location: "Lagos", foundedYear: 2020, teamSize: 20, isHiring: true, oneLiner: "Employee management platform", founders: [
    { name: "Tunde Akinniranye", role: "Founder & CEO", location: "Lagos", industry: "SaaS", bio: "Tunde Akinniranye founded Notch to simplify employee management.", xHandle: "", linkedinUrl: "", foundedYear: 2020, isHiring: true, teamSize: 20 },
  ]},
  { name: "Smartpro", industry: "SaaS", location: "Lagos", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "HR management platform", founders: [
    { name: "Oluwaseun Aina", role: "Founder & CEO", location: "Lagos", industry: "SaaS", bio: "Oluwaseun Aina founded Smartpro for HR management.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},

  // MORE ENTREPRENEURS
  { name: "Andela", industry: "SaaS", location: "Lagos", foundedYear: 2014, teamSize: 1000, isHiring: true, oneLiner: "Global talent network", founders: [
    { name: "Iyinoluwa Aboyeji", role: "Co-founder", location: "Lagos", industry: "SaaS", bio: "Iyinoluwa Aboyeji co-founded Andela, the global talent network.", xHandle: "iaboyeji", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 1000 },
    { name: "Jeremy Johnson", role: "Co-founder & CEO", location: "Lagos", industry: "SaaS", bio: "Jeremy Johnson is the co-founder and CEO of Andela.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 1000 },
  ]},

  // More from various industries - these are additional Nigerian startups
  { name: "Risevest", industry: "Fintech", location: "Lagos", foundedYear: 2020, teamSize: 50, isHiring: true, oneLiner: "Global investment platform", founders: [
    { name: "Eke Urum", role: "Founder & CEO", location: "Lagos", industry: "Fintech", bio: "Eke Urum founded Risevest to democratize investment for Africans.", xHandle: "ekeurum", linkedinUrl: "", foundedYear: 2020, isHiring: true, teamSize: 50 },
  ]},
  { name: "Nairabox", industry: "Media", location: "Lagos", foundedYear: 2014, teamSize: 20, isHiring: false, oneLiner: "Online ticketing platform", founders: [
    { name: "Jay Shittu", role: "Founder & CEO", location: "Lagos", industry: "Media", bio: "Jay Shittu founded Nairabox, Nigeria's leading online ticketing platform.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: false, teamSize: 20 },
  ]},
  { name: "Filmhouse Cinema", industry: "Media", location: "Lagos", foundedYear: 2010, teamSize: 200, isHiring: true, oneLiner: "Cinema chain in Nigeria", founders: [
    { name: "Kene Mkparu", role: "Founder & MD", location: "Lagos", industry: "Media", bio: "Kene Mkparu founded Filmhouse Cinema, one of Nigeria's largest cinema chains.", xHandle: "", linkedinUrl: "", foundedYear: 2010, isHiring: true, teamSize: 200 },
  ]},
  { name: "RapidBox", industry: "E-commerce", location: "Lagos", foundedYear: 2019, teamSize: 20, isHiring: true, oneLiner: "Open-box electronics marketplace", founders: [
    { name: "Oluwatosin Ajibade", role: "Founder & CEO", location: "Lagos", industry: "E-commerce", bio: "Oluwatosin Ajibade founded RapidBox for open-box electronics.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 20 },
  ]},
  { name: "Bamboo Investments", industry: "Fintech", location: "Lagos", foundedYear: 2019, teamSize: 50, isHiring: true, oneLiner: "Investment platform for Africans", founders: [
    { name: "Yomi Okusanya", role: "Co-founder & CEO", location: "Lagos", industry: "Fintech", bio: "Yomi Okusanya leads Bamboo Investments.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 50 },
  ]},

  // KENYA
  { name: "M-KOPA", industry: "Climate", location: "Nairobi", foundedYear: 2011, teamSize: 1500, isHiring: true, oneLiner: "Pay-as-you-go solar energy for Africa", country: "Kenya", founders: [
    { name: "Jesse Moore", role: "Co-founder & CEO", location: "Nairobi", industry: "Climate", bio: "Jesse Moore co-founded M-KOPA to provide pay-as-you-go solar energy to off-grid homes across Africa.", xHandle: "", linkedinUrl: "https://www.linkedin.com/in/jesse-moore", foundedYear: 2011, isHiring: true, teamSize: 1500 },
    { name: "Nick Kinoti", role: "Co-founder", location: "Nairobi", industry: "Climate", bio: "Nick Kinoti co-founded M-KOPA.", xHandle: "", linkedinUrl: "", foundedYear: 2011, isHiring: true, teamSize: 1500 },
  ]},
  { name: "Twiga Foods", industry: "Agritech", location: "Nairobi", foundedYear: 2014, teamSize: 500, isHiring: true, oneLiner: "B2B food distribution platform", country: "Kenya", founders: [
    { name: "Grant Brooke", role: "Co-founder & CEO", location: "Nairobi", industry: "Agritech", bio: "Grant Brooke co-founded Twiga Foods to revolutionize food distribution in Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 500 },
  ]},
  { name: "Sendy", industry: "Logistics", location: "Nairobi", foundedYear: 2014, teamSize: 400, isHiring: true, oneLiner: "On-demand delivery platform for Africa", country: "Kenya", founders: [
    { name: "Meshack Alloys", role: "Founder & CEO", location: "Nairobi", industry: "Logistics", bio: "Meshack Alloys founded Sendy to provide on-demand delivery across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 400 },
  ]},
  { name: "Cellulant", industry: "Fintech", location: "Nairobi", foundedYear: 2003, teamSize: 400, isHiring: true, oneLiner: "Pan-African payments platform", country: "Kenya", founders: [
    { name: "Akshay Grover", role: "CEO", location: "Nairobi", industry: "Fintech", bio: "Akshay Grover leads Cellulant, a leading pan-African payments company.", xHandle: "", linkedinUrl: "", foundedYear: 2003, isHiring: true, teamSize: 400 },
  ]},
  { name: "Wasoko", industry: "E-commerce", location: "Nairobi", foundedYear: 2014, teamSize: 1000, isHiring: true, oneLiner: "B2B e-commerce platform for Africa", country: "Kenya", founders: [
    { name: "Daniel Yu", role: "Founder & CEO", location: "Nairobi", industry: "E-commerce", bio: "Daniel Yu founded Wasoko to digitize retail supply chains across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 1000 },
  ]},
  { name: "Tanda", industry: "Fintech", location: "Nairobi", foundedYear: 2019, teamSize: 100, isHiring: true, oneLiner: "Mobile money and agent network", country: "Kenya", founders: [
    { name: "Geoffrey Mulei", role: "Co-founder & CEO", location: "Nairobi", industry: "Fintech", bio: "Geoffrey Mulei co-founded Tanda to build Africa's largest agent network.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 100 },
  ]},

  // SOUTH AFRICA
  { name: "Flutterwave", industry: "Fintech", location: "Cape Town", foundedYear: 2016, teamSize: 500, isHiring: true, oneLiner: "Africa's leading payments technology company", country: "South Africa", founders: [
    { name: "Olugbenga Agboola", role: "Co-founder & CEO", location: "Cape Town", industry: "Fintech", bio: "Olugbenga Agboola is the CEO and co-founder of Flutterwave.", xHandle: "gbengagboola", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 500 },
  ]},
  { name: "Luno", industry: "Fintech", location: "Cape Town", foundedYear: 2013, teamSize: 500, isHiring: true, oneLiner: "Cryptocurrency platform for Africa", country: "South Africa", founders: [
    { name: "Marcus Swanepoel", role: "Co-founder & CEO", location: "Cape Town", industry: "Fintech", bio: "Marcus Swanepoel co-founded Luno to make cryptocurrency accessible across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2013, isHiring: true, teamSize: 500 },
  ]},
  { name: "JUMO", industry: "Fintech", location: "Cape Town", foundedYear: 2015, teamSize: 500, isHiring: true, oneLiner: "AI-powered financial services platform", country: "South Africa", founders: [
    { name: "Andrew Watkins-Ball", role: "Founder & CEO", location: "Cape Town", industry: "Fintech", bio: "Andrew Watkins-Ball founded JUMO to provide AI-powered financial services.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 500 },
  ]},
  { name: "Planet42", industry: "Fintech", location: "Johannesburg", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "Car financing platform for Africa", country: "South Africa", founders: [
    { name: "Eerik Oja", role: "Co-founder & CEO", location: "Johannesburg", industry: "Fintech", bio: "Eerik Oja co-founded Planet42 to provide car financing across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},
  { name: "SweepSouth", industry: "Proptech", location: "Cape Town", foundedYear: 2014, teamSize: 100, isHiring: true, oneLiner: "Home services platform for Africa", country: "South Africa", founders: [
    { name: "Aisha Pandor", role: "Co-founder & CEO", location: "Cape Town", industry: "Proptech", bio: "Aisha Pandor co-founded SweepSouth to connect homeowners with domestic workers.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 100 },
    { name: "Alen Ribic", role: "Co-founder & CTO", location: "Cape Town", industry: "Proptech", bio: "Alen Ribic co-founded SweepSouth.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 100 },
  ]},
  { name: "Naspers Fintech", industry: "Fintech", location: "Cape Town", foundedYear: 2019, teamSize: 200, isHiring: true, oneLiner: "Fintech investment company", country: "South Africa", founders: [
    { name: "Jacobus Eksteen", role: "CEO", location: "Cape Town", industry: "Fintech", bio: "Jacobus Eksteen leads Naspers Fintech.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 200 },
  ]},
  { name: "Yoco", industry: "Fintech", location: "Cape Town", foundedYear: 2015, teamSize: 300, isHiring: true, oneLiner: "Payment solutions for small businesses in Africa", country: "South Africa", founders: [
    { name: "Katlego Maphai", role: "Co-founder & CEO", location: "Cape Town", industry: "Fintech", bio: "Katlego Maphai co-founded Yoco to empower small businesses with payment solutions.", xHandle: "", linkedinUrl: "", foundedYear: 2015, isHiring: true, teamSize: 300 },
  ]},

  // GHANA
  { name: "mPharma", industry: "Healthtech", location: "Accra", foundedYear: 2013, teamSize: 500, isHiring: true, oneLiner: "Healthcare technology company", country: "Ghana", founders: [
    { name: "Gregory Rockson", role: "Co-founder & CEO", location: "Accra", industry: "Healthtech", bio: "Gregory Rockson co-founded mPharma to make healthcare accessible and affordable across Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2013, isHiring: true, teamSize: 500 },
  ]},
  { name: "Zeepay", industry: "Fintech", location: "Accra", foundedYear: 2016, teamSize: 100, isHiring: true, oneLiner: "Mobile financial services company", country: "Ghana", founders: [
    { name: "Andrew Takyi-Appiah", role: "Co-founder & CEO", location: "Accra", industry: "Fintech", bio: "Andrew Takyi-Appiah co-founded Zeepay to provide mobile financial services.", xHandle: "", linkedinUrl: "", foundedYear: 2016, isHiring: true, teamSize: 100 },
  ]},
  { name: "Hubtel", industry: "Fintech", location: "Accra", foundedYear: 2005, teamSize: 200, isHiring: true, oneLiner: "Mobile commerce platform", country: "Ghana", founders: [
    { name: "Alex Bram", role: "CEO", location: "Accra", industry: "Fintech", bio: "Alex Bram leads Hubtel, Ghana's leading mobile commerce platform.", xHandle: "", linkedinUrl: "", foundedYear: 2005, isHiring: true, teamSize: 200 },
  ]},

  // EGYPT
  { name: "Swvl", industry: "Logistics", location: "Cairo", foundedYear: 2017, teamSize: 1000, isHiring: true, oneLiner: "Mass transportation platform for emerging markets", country: "Egypt", founders: [
    { name: "Mostafa Kandil", role: "Co-founder & CEO", location: "Cairo", industry: "Logistics", bio: "Mostafa Kandil co-founded Swvl to revolutionize mass transportation.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 1000 },
  ]},
  { name: "Fawry", industry: "Fintech", location: "Cairo", foundedYear: 2008, teamSize: 500, isHiring: true, oneLiner: "Electronic payment platform in Egypt", country: "Egypt", founders: [
    { name: "Ashraf Sabry", role: "Co-founder & CEO", location: "Cairo", industry: "Fintech", bio: "Ashraf Sabry co-founded Fawry, Egypt's largest electronic payment platform.", xHandle: "", linkedinUrl: "", foundedYear: 2008, isHiring: true, teamSize: 500 },
  ]},
  { name: "MNT-Halan", industry: "Fintech", location: "Cairo", foundedYear: 2017, teamSize: 1000, isHiring: true, oneLiner: "Digital bank and payment platform", country: "Egypt", founders: [
    { name: "Mounir Nakhla", role: "Co-founder & CEO", location: "Cairo", industry: "Fintech", bio: "Mounir Nakhla co-founded MNT-Halan to build the leading digital bank in Egypt.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 1000 },
  ]},
  { name: "Capiter", industry: "E-commerce", location: "Cairo", foundedYear: 2020, teamSize: 200, isHiring: true, oneLiner: "B2B marketplace for retailers", country: "Egypt", founders: [
    { name: "Mahmoud Nouh", role: "Co-founder & CEO", location: "Cairo", industry: "E-commerce", bio: "Mahmoud Nouh co-founded Capiter to digitize B2B commerce.", xHandle: "", linkedinUrl: "", foundedYear: 2020, isHiring: true, teamSize: 200 },
    { name: "Mahmoud Abouelnasr", role: "Co-founder", location: "Cairo", industry: "E-commerce", bio: "Mahmoud Abouelnasr co-founded Capiter.", xHandle: "", linkedinUrl: "", foundedYear: 2020, isHiring: true, teamSize: 200 },
  ]},

  // RWANDA
  { name: "Carnegie Technologies Africa", industry: "SaaS", location: "Kigali", foundedYear: 2019, teamSize: 50, isHiring: true, oneLiner: "Technology solutions for Africa", country: "Rwanda", founders: [
    { name: "Clarisse Iribagiza", role: "CEO", location: "Kigali", industry: "SaaS", bio: "Clarisse Iribagiza leads Carnegie Technologies Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 50 },
  ]},
  { name: "Ampersand", industry: "Climate", location: "Kigali", foundedYear: 2014, teamSize: 200, isHiring: true, oneLiner: "Electric motorcycle company", country: "Rwanda", founders: [
    { name: "Josh Whittle", role: "Co-founder & CEO", location: "Kigali", industry: "Climate", bio: "Josh Whittle co-founded Ampersand to electrify motorcycle transport in Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 200 },
  ]},

  // ETHIOPIA
  { name: "Ride", industry: "Logistics", location: "Addis Ababa", foundedYear: 2018, teamSize: 500, isHiring: true, oneLiner: "Ride-hailing platform", country: "Ethiopia", founders: [
    { name: "Samuel Merahi", role: "Co-founder & CEO", location: "Addis Ababa", industry: "Logistics", bio: "Samuel Merahi co-founded Ride to provide ride-hailing in Ethiopia.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 500 },
  ]},
  { name: "Deliver Addis", industry: "Logistics", location: "Addis Ababa", foundedYear: 2019, teamSize: 100, isHiring: true, oneLiner: "Food and grocery delivery", country: "Ethiopia", founders: [
    { name: "Robel Alemu", role: "Co-founder & CEO", location: "Addis Ababa", industry: "Logistics", bio: "Robel Alemu co-founded Deliver Addis.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 100 },
  ]},

  // TANZANIA
  { name: "Nala", industry: "Fintech", location: "Dar es Salaam", foundedYear: 2018, teamSize: 100, isHiring: true, oneLiner: "Mobile money payments platform", country: "Tanzania", founders: [
    { name: "Benjamin Fernandes", role: "Founder & CEO", location: "Dar es Salaam", industry: "Fintech", bio: "Benjamin Fernandes founded Nala to build a mobile money payments platform for Africa.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 100 },
  ]},

  // UGANDA
  { name: "SafeBoda", industry: "Logistics", location: "Kampala", foundedYear: 2017, teamSize: 200, isHiring: true, oneLiner: "Motorcycle ride-hailing and delivery", country: "Uganda", founders: [
    { name: "Rapa Thompson", role: "Co-founder", location: "Kampala", industry: "Logistics", bio: "Rapa Thompson co-founded SafeBoda to revolutionize motorcycle transport in Uganda.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 200 },
    { name: "Alastair Sussock", role: "Co-founder & CEO", location: "Kampala", industry: "Logistics", bio: "Alastair Sussock co-founded SafeBoda.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 200 },
  ]},

  // SENEGAL
  { name: "Tontines Connect", industry: "Fintech", location: "Dakar", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "Digital tontine platform", country: "Senegal", founders: [
    { name: "Babacar Sy", role: "Co-founder & CEO", location: "Dakar", industry: "Fintech", bio: "Babacar Sy co-founded Tontines Connect to digitize traditional savings groups.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},

  // MOROCCO
  { name: "Moro Hub", industry: "SaaS", location: "Casablanca", foundedYear: 2019, teamSize: 50, isHiring: true, oneLiner: "Technology hub for startups", country: "Morocco", founders: [
    { name: "Mohammed El Mejdoubi", role: "CEO", location: "Casablanca", industry: "SaaS", bio: "Mohammed El Mejdoubi leads Moro Hub.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 50 },
  ]},

  // CAMEROON
  { name: "Kamalee", industry: "Agritech", location: "Douala", foundedYear: 2018, teamSize: 30, isHiring: true, oneLiner: "Agricultural supply chain platform", country: "Cameroon", founders: [
    { name: "Boris Zala", role: "Co-founder & CEO", location: "Douala", industry: "Agritech", bio: "Boris Zala co-founded Kamalee to improve agricultural supply chains in Cameroon.", xHandle: "", linkedinUrl: "", foundedYear: 2018, isHiring: true, teamSize: 30 },
  ]},

  // ZAMBIA
  { name: "The Good Africa Company", industry: "E-commerce", location: "Lusaka", foundedYear: 2019, teamSize: 20, isHiring: true, oneLiner: "African products marketplace", country: "Zambia", founders: [
    { name: "Noeline Raibeksa", role: "Founder & CEO", location: "Lusaka", industry: "E-commerce", bio: "Noeline Raibeksa founded The Good Africa Company to promote African products globally.", xHandle: "", linkedinUrl: "", foundedYear: 2019, isHiring: true, teamSize: 20 },
  ]},

  // ZIMBABWE
  { name: "ZimSwitch", industry: "Fintech", location: "Harare", foundedYear: 2014, teamSize: 50, isHiring: true, oneLiner: "Payment processing platform", country: "Zimbabwe", founders: [
    { name: "Never Ncube", role: "CEO", location: "Harare", industry: "Fintech", bio: "Never Ncube leads ZimSwitch, Zimbabwe's leading payment processing platform.", xHandle: "", linkedinUrl: "", foundedYear: 2014, isHiring: true, teamSize: 50 },
  ]},

  // TUNISIA
  { name: "InstaDeep", industry: "AI", location: "Tunis", foundedYear: 2017, teamSize: 100, isHiring: true, oneLiner: "AI-powered decision-making platform", country: "Tunisia", founders: [
    { name: "Karim Beguir", role: "Co-founder & CEO", location: "Tunis", industry: "AI", bio: "Karim Beguir co-founded InstaDeep to build AI-powered decision-making systems.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
    { name: "Zohra Slim", role: "Co-founder & CTO", location: "Tunis", industry: "AI", bio: "Zohra Slim co-founded InstaDeep.", xHandle: "", linkedinUrl: "", foundedYear: 2017, isHiring: true, teamSize: 100 },
  ]},

  // IVORY COAST
  { name: "Africa's Talking", industry: "SaaS", location: "Abidjan", foundedYear: 2010, teamSize: 100, isHiring: true, oneLiner: "Communication API for Africa", country: "Ivory Coast", founders: [
    { name: "Samuel Gikandi", role: "CEO", location: "Abidjan", industry: "SaaS", bio: "Samuel Gikandi leads Africa's Talking.", xHandle: "", linkedinUrl: "", foundedYear: 2010, isHiring: true, teamSize: 100 },
  ]},
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function seedFounders() {
  await connectDB();

  console.log("=== SEEDING FOUNDERS & COMPANIES ===\n");

  let foundersCreated = 0;
  let companiesCreated = 0;
  let skipped = 0;

  for (const companyData of COMPANIES) {
    const companyNorm = normalizeName(companyData.name);
    const companySlug = slugify(companyData.name);
    let company = await Company.findOne({ $or: [{ normalizedName: companyNorm }, { slug: companySlug }] });

    if (!company) {
      company = await Company.create({
        name: companyData.name,
        normalizedName: companyNorm,
        slug: slugify(companyData.name),
        industry: companyData.industry,
        location: companyData.location,
        country: companyData.country || "Nigeria",
        foundedYear: companyData.foundedYear,
        teamSize: companyData.teamSize,
        isHiring: companyData.isHiring,
        oneLiner: companyData.oneLiner,
        founders: [],
        tags: [],
        workMode: "",
        productForm: "",
        isAiNative: false,
        hiresBeyondFounders: false,
        description: companyData.oneLiner,
      });
      companiesCreated++;
    }

    for (const founderData of companyData.founders) {
      const founderNorm = normalizeName(founderData.name);
      const slugVal = slugify(founderData.name);
      const existingFounder = await Founder.findOne({
        $or: [
          { normalizedName: founderNorm },
          { slug: slugVal },
          ...(founderData.linkedinUrl ? [{ linkedinUrl: founderData.linkedinUrl }] : []),
        ],
      });

      if (existingFounder) {
        skipped++;
        continue;
      }

      const founder = await Founder.create({
        name: founderData.name,
        normalizedName: founderNorm,
        slug: slugify(founderData.name),
        role: founderData.role,
        bio: founderData.bio,
        location: founderData.location,
        country: companyData.country || "Nigeria",
        industry: founderData.industry,
        profileImageUrl: "",
        avatarUrl: "",
        xUrl: founderData.xHandle ? `https://x.com/${founderData.xHandle}` : "",
        xHandle: founderData.xHandle,
        linkedinUrl: founderData.linkedinUrl,
        personalWebsiteUrl: "",
        companies: [company._id],
        companySlug: company.slug,
        companyLogoUrl: "",
        teamSize: companyData.teamSize,
        isHiring: companyData.isHiring,
        foundedYear: companyData.foundedYear,
        oneLiner: companyData.oneLiner,
        batch: "",
        isVerified: true,
        discoveredAt: new Date(),
        lastVerifiedAt: new Date(),
      });

      if (!company.founders.includes(founder._id as mongoose.Types.ObjectId)) {
        company.founders.push(founder._id as mongoose.Types.ObjectId);
        await company.save();
      }

      foundersCreated++;
    }
  }

  console.log(`Companies created: ${companiesCreated}`);
  console.log(`Founders created: ${foundersCreated}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`\n=== SEED COMPLETE ===`);
}
