const express = require('express');
const router = express.Router();

const schemes = [
  {
    _id: 'pm-kisan',
    name: 'PM-KISAN',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Income Support',
    state: 'India-wide',
    eligibility: 'Eligible landholding farmer families under current central scheme rules; exclusions and verification requirements apply.',
    benefits: 'Direct income-support instalments to eligible registered farmer families.',
    documents: ['Aadhaar and e-KYC', 'Bank account linked for DBT', 'Land record details'],
    applicationProcess: 'Check beneficiary status and current registration instructions on the official portal or through the local agriculture office.',
    officialUrl: 'https://pmkisan.gov.in/'
  },
  {
    _id: 'namo-shetkari',
    name: 'Namo Shetkari Maha Samman Nidhi',
    department: 'Government of Maharashtra',
    category: 'Income Support',
    state: 'Maharashtra',
    eligibility: 'Maharashtra farmers meeting the state programme rules; PM-KISAN eligibility and beneficiary verification may be relevant.',
    benefits: 'State income-support assistance for eligible farmer beneficiaries.',
    documents: ['Aadhaar and e-KYC', 'Bank account details', 'PM-KISAN/beneficiary status', 'Land record details'],
    applicationProcess: 'Check current beneficiary and payment status using the official Maharashtra programme portal or local agriculture office.',
    officialUrl: 'https://nsmny.mahait.org/'
  },
  {
    _id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    department: 'Department of Agriculture & Farmers Welfare',
    category: 'Crop Insurance',
    state: 'India-wide',
    eligibility: 'Farmers with an eligible notified crop and area for the current season, subject to enrolment rules and deadlines.',
    benefits: 'Crop insurance cover for notified risks under the rules applicable to the enrolled crop and season.',
    documents: ['Land/tenancy and crop-sowing details', 'Bank account', 'Identity details', 'Application and premium receipt'],
    applicationProcess: 'Check whether the crop and area are notified for the current season and apply before the published deadline through an authorised channel.',
    officialUrl: 'https://pmfby.gov.in/'
  },
  {
    _id: 'kisan-credit-card',
    name: 'Kisan Credit Card (KCC)',
    department: 'Participating banks and Government of India',
    category: 'Farm Credit',
    state: 'India-wide',
    eligibility: 'Farmers and other eligible agricultural borrowers who meet the lending bank’s current criteria.',
    benefits: 'Access to eligible short-term crop and allied-activity credit through a participating bank.',
    documents: ['Identity and address proof', 'Land/tenancy or activity details', 'Bank-required application documents'],
    applicationProcess: 'Ask a participating bank, cooperative bank, or local branch about KCC eligibility, interest terms, and documents.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    _id: 'mahadbt-farmer',
    name: 'MahaDBT Farmer Schemes and Subsidies',
    department: 'Agriculture Department, Government of Maharashtra',
    category: 'Farm Inputs and Equipment',
    state: 'Maharashtra',
    eligibility: 'Varies by component, farmer category, land, crop, budget, and current application window.',
    benefits: 'The portal publishes applications for eligible agricultural components such as mechanisation, irrigation, horticulture, and other notified support.',
    documents: ['Aadhaar and registered mobile', 'Farmer/land records', 'Bank details', 'Component-specific quotations or certificates'],
    applicationProcess: 'Review currently open components, eligibility, selection process, and required documents on MahaDBT before applying.',
    officialUrl: 'https://mahadbt.maharashtra.gov.in/Farmer'
  },
  {
    _id: 'pm-kusum',
    name: 'PM-KUSUM',
    department: 'Ministry of New & Renewable Energy',
    category: 'Solar Energy',
    state: 'India-wide',
    eligibility: 'Depends on the component, state allocation, applicant type, site, and application window.',
    benefits: 'Support may be available for eligible decentralised renewable energy and solar pump components.',
    documents: ['Identity and land/site details', 'Bank details', 'Technical documents required by the state component'],
    applicationProcess: 'Check current Maharashtra implementation, open applications, and authorised vendors through the official portal and state agency.',
    officialUrl: 'https://pmkusum.mnre.gov.in/'
  },
  {
    _id: 'pmksy-micro-irrigation',
    name: 'PM Krishi Sinchayee Yojana — Per Drop More Crop',
    department: 'Department of Agriculture & Farmers Welfare',
    category: 'Micro-irrigation',
    state: 'India-wide',
    eligibility: 'Support depends on state implementation, eligible crop/land, system specifications, and current budget/window.',
    benefits: 'Assistance may be available for eligible micro-irrigation systems such as drip or sprinkler.',
    documents: ['Land and farmer records', 'Water-source details', 'Approved system quotation and installation documents'],
    applicationProcess: 'Confirm current Maharashtra guidelines, subsidy rates, and approved suppliers through MahaDBT or the district agriculture office.',
    officialUrl: 'https://pmksy.gov.in/'
  },
  {
    _id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    department: 'Department of Agriculture & Farmers Welfare',
    category: 'Soil Testing',
    state: 'India-wide',
    eligibility: 'Sampling and card services are delivered through government programme channels; local availability and process should be confirmed.',
    benefits: 'Soil testing information and nutrient-management recommendations based on the sampled soil.',
    documents: ['Farmer and field details', 'Sample/collection information requested by the local service centre'],
    applicationProcess: 'Contact the local agriculture office or soil-testing laboratory to confirm sampling and Soil Health Card service.',
    officialUrl: 'https://soilhealth.dac.gov.in/'
  },
  {
    _id: 'dr-babasaheb-ambedkar-krushi-swavalamban',
    name: 'Dr. Babasaheb Ambedkar Krushi Swavalamban Yojana',
    department: 'Agriculture Department, Government of Maharashtra',
    category: 'Irrigation and Farm Development',
    state: 'Maharashtra',
    eligibility: 'Targeted-category and other conditions apply; confirm current eligibility and component rules with the official state portal.',
    benefits: 'Eligible components may support irrigation and farm improvements for qualifying applicants.',
    documents: ['Caste/category certificate where required', 'Land and farmer records', 'Bank details', 'Component-specific documents'],
    applicationProcess: 'Check whether the scheme and component are currently open for your category and area on MahaDBT or with the district agriculture office.',
    officialUrl: 'https://mahadbt.maharashtra.gov.in/Farmer'
  },
  {
    _id: 'birsa-munda-krishi-kranti',
    name: 'Birsa Munda Krishi Kranti Yojana',
    department: 'Agriculture Department, Government of Maharashtra',
    category: 'Irrigation and Farm Development',
    state: 'Maharashtra',
    eligibility: 'Targeted-category and other conditions apply; current criteria, eligible components, and selection are set by the state.',
    benefits: 'Eligible components may support irrigation and farm improvements for qualifying applicants.',
    documents: ['Caste/category certificate where required', 'Land and farmer records', 'Bank details', 'Component-specific documents'],
    applicationProcess: 'Confirm current scheme availability and eligibility on MahaDBT or with the district agriculture office before applying.',
    officialUrl: 'https://mahadbt.maharashtra.gov.in/Farmer'
  },
  {
    _id: 'bhausaheb-fundkar-orchard',
    name: 'Bhausaheb Fundkar Falbag Lagwad Yojana',
    department: 'Agriculture Department, Government of Maharashtra',
    category: 'Horticulture',
    state: 'Maharashtra',
    eligibility: 'Orchard crop, land, applicant, and assistance conditions apply; confirm the current season’s rules.',
    benefits: 'Eligible applicants may receive assistance for approved fruit-orchard establishment components.',
    documents: ['Land and farmer records', 'Plantation plan and crop details', 'Bank details', 'Inspection/geo-tagging records if required'],
    applicationProcess: 'Check current application windows, approved crops, and component terms through MahaDBT or the district agriculture office.',
    officialUrl: 'https://mahadbt.maharashtra.gov.in/Farmer'
  },
  {
    _id: 'gopinath-munde-farmer-accident',
    name: 'Gopinath Munde Shetkari Apghat Suraksha Sanugrah Anudan Yojana',
    department: 'Government of Maharashtra',
    category: 'Farmer Accident Assistance',
    state: 'Maharashtra',
    eligibility: 'Eligibility depends on the current government order, claimant relationship, incident, and required verification.',
    benefits: 'Financial assistance may be available for qualifying farmer accident cases under the applicable rules.',
    documents: ['Farmer identity/land records', 'Incident and medical/police records as applicable', 'Claimant relationship and bank details'],
    applicationProcess: 'Contact the taluka or district agriculture office promptly for current claim rules, forms, and timelines.',
    officialUrl: 'https://agri.maharashtra.gov.in/'
  }
];

router.get('/', (req, res) => {
  res.json(schemes);
});

router.get('/:id', (req, res) => {
  const scheme = schemes.find((item) => item._id === req.params.id);
  if (!scheme) return res.status(404).json({ message: 'Scheme not found.' });
  return res.json(scheme);
});

module.exports = router;
