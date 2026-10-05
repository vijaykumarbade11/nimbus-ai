const express = require('express');
const router = express.Router();

const schemes = [
  {
    _id: '1',
    name: 'PM-KISAN',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Income Support',
    state: 'All India',
    eligibility: 'Eligible farmer families as defined by the Government of India for direct benefit transfer.',
    benefits: 'Financial assistance to eligible farmers for income support and agricultural sustainability.',
    documents: ['Aadhaar card', 'Bank account details', 'Land records', 'Farmer identity proof'],
    applicationProcess: 'Apply on the PM-KISAN portal or through the local agriculture office for verification.',
    officialUrl: 'https://pmkisan.gov.in/'
  },
  {
    _id: '2',
    name: 'Soil Health Card Scheme',
    department: 'Department of Agriculture & Farmers Welfare',
    category: 'Soil Testing',
    state: 'Maharashtra',
    eligibility: 'All registered farmers can apply for soil and nutrient testing support.',
    benefits: 'Soil health analysis and nutrient recommendations for better crop productivity and balanced fertiliser use.',
    documents: ['Farmer identity proof', 'Land records', 'Farm location details'],
    applicationProcess: 'Submit an application through the Krishi Seva Kendra or the official soil health portal.',
    officialUrl: 'https://soilhealth.dac.gov.in/'
  },
  {
    _id: '3',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    department: 'Department of Agriculture & Farmers Welfare',
    category: 'Crop Insurance',
    state: 'All India',
    eligibility: 'Loanee and non-loanee insured farmers enrolled in seasonal crop coverage as per rules.',
    benefits: 'Crop loss protection against natural risks such as drought, flood, diseases, and extreme weather.',
    documents: ['Land records', 'Crop details', 'Bank account', 'Farmer identity proof'],
    applicationProcess: 'Apply through the official crop insurance portal or local bank and agriculture office.',
    officialUrl: 'https://pmfby.gov.in/'
  },
  {
    _id: '4',
    name: 'Kisan Credit Card',
    department: 'National Bank for Agriculture and Rural Development',
    category: 'Credit Support',
    state: 'All India',
    eligibility: 'Farmers, tenant farmers, and agricultural borrowers meeting bank criteria.',
    benefits: 'Working capital and crop finance support for purchase of inputs, seeds, fertilisers, and farm operations.',
    documents: ['Identity proof', 'Land records or lease proof', 'Bank account', 'Farmer profile'],
    applicationProcess: 'Apply through participating banks or local cooperative banks with the required documentation.',
    officialUrl: 'https://www.nabard.org/'
  },
  {
    _id: '5',
    name: 'PM-KUSUM',
    department: 'Ministry of New & Renewable Energy',
    category: 'Irrigation & Energy',
    state: 'All India',
    eligibility: 'Farmers with eligible land and solar irrigation system installation capacity as per scheme norms.',
    benefits: 'Support for solar pumps, grid-connected solar power, and irrigation efficiency improvement.',
    documents: ['Farmer identity', 'Land details', 'Bank details', 'Application form'],
    applicationProcess: 'Apply via state nodal agencies or designated implementation channels.',
    officialUrl: 'https://pmkusum.mnre.gov.in/'
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
