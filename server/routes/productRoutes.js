const express = require('express');
const router = express.Router();

const products = [
  { _id: 'p1', name: 'Soybean seed', category: 'Seeds', unit: 'packet' },
  { _id: 'p2', name: 'Maize seed', category: 'Seeds', unit: 'packet' },
  { _id: 'p3', name: 'Paddy seed', category: 'Seeds', unit: 'packet' },
  { _id: 'p4', name: 'Organic compost', category: 'Fertilizer', unit: 'bag' },
  { _id: 'p5', name: 'Drip irrigation kit', category: 'Irrigation', unit: 'kit' },
  { _id: 'p6', name: 'Neem-based plant protection product', category: 'Plant Protection', unit: 'bottle' },
  { _id: 'p7', name: 'Urea fertilizer', category: 'Fertilizer', unit: 'bag' },
  { _id: 'p8', name: 'DAP fertilizer', category: 'Fertilizer', unit: 'bag' },
  { _id: 'p9', name: 'Water-soluble NPK', category: 'Fertilizer', unit: 'kg' },
  { _id: 'p10', name: 'Knapsack sprayer', category: 'Farm Equipment', unit: 'piece' },
  { _id: 'p11', name: 'Farmer protective equipment', category: 'Safety Equipment', unit: 'kit' },
  { _id: 'p12', name: 'Seed-treatment bio-inoculant', category: 'Seed Treatment', unit: 'packet' },
  { _id: 'p13', name: 'Mulch and crop cover', category: 'Farm Supplies', unit: 'roll' }
];

const asReferenceListing = (product) => ({
  ...product,
  price: null,
  marketPrice: null,
  stock: null,
  availability: 'Confirm with a local seller',
  quality: 'Check brand, label, expiry, and batch with the seller',
  minOrder: 'Confirm with seller',
  description: `${product.name} is a reference product category. Brands, specifications, local availability, and suitability vary; confirm these directly with an authorised seller.`,
  usage: 'Follow the product label and locally approved crop recommendations. Confirm suitability with an authorised agriculture professional.',
  image: null,
  specs: [],
  seller: null,
  sellerPhone: null,
  location: 'Ahmedpur taluka',
  source: 'Reference product category; live price, seller, and stock are not verified'
});

router.get('/', (req, res) => res.json(products.map(asReferenceListing)));
router.get('/:id', (req, res) => {
  const item = products.find((product) => product._id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Product not found.' });
  return res.json(asReferenceListing(item));
});

router.post('/', (req, res) => res.status(405).json({ message: 'The product catalogue is read-only. Contact the site owner to submit a seller listing.' }));
router.put('/:id', (req, res) => res.status(405).json({ message: 'The product catalogue is read-only. Product updates are not supported.' }));
router.delete('/:id', (req, res) => res.status(405).json({ message: 'The product catalogue is read-only. Product deletion is not supported.' }));

module.exports = router;
