const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize, Supply } = require('./models');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_SORT_FIELDS = ['name', 'price', 'category', 'availability', 'createdAt'];

app.use(cors());
app.use(bodyParser.json());

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const parseSupplyPayload = (payload = {}) => {
  const name = String(payload.name || '').trim();
  const category = String(payload.category || '').trim();
  const price = Number(payload.price);
  const quantity = Number(payload.quantity ?? 0);
  const availability = String(payload.availability || 'In Stock').trim();

  if (!name) throw new ApiError(400, 'Supply name is required');
  if (!['Equipment', 'Reagent', 'Consumable'].includes(category)) {
    throw new ApiError(400, 'Category must be Equipment, Reagent, or Consumable');
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, 'Price must be a valid positive number');
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new ApiError(400, 'Quantity must be a non-negative integer');
  }
  if (!['In Stock', 'Out of Stock', 'On Order'].includes(availability)) {
    throw new ApiError(400, 'Invalid availability value');
  }

  return {
    name,
    category,
    description: String(payload.description || '').trim(),
    price,
    availability,
    manufacturer: String(payload.manufacturer || '').trim(),
    quantity,
    location: String(payload.location || '').trim(),
  };
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/supplies', asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const category = String(req.query.category || 'All');
  const sortByRaw = String(req.query.sortBy || 'name');
  const sortBy = ALLOWED_SORT_FIELDS.includes(sortByRaw) ? sortByRaw : 'name';
  const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(4, Math.min(100, parseInt(req.query.limit, 10) || 8));

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { manufacturer: { [Op.like]: `%${search}%` } },
    ];
  }
  if (category && category !== 'All') {
    where.category = category;
  }

  const { count, rows } = await Supply.findAndCountAll({
    where,
    order: [[sortBy, order]],
    offset: (page - 1) * limit,
    limit,
  });

  res.json({ total: count, page, limit, totalPages: Math.ceil(count / limit), supplies: rows });
}));

app.post('/api/supplies', asyncHandler(async (req, res) => {
  const payload = parseSupplyPayload(req.body);

  const newSupply = await Supply.create({
    id: `SUP-${uuidv4()}`,
    ...payload,
    createdBy: 'system',
  });

  res.status(201).json(newSupply);
}));

app.put('/api/supplies/:id', asyncHandler(async (req, res) => {
  const supply = await Supply.findByPk(req.params.id);
  if (!supply) {
    throw new ApiError(404, 'Supply not found');
  }

  const payload = parseSupplyPayload({ ...supply.toJSON(), ...req.body });
  await supply.update(payload);
  res.json(supply);
}));

app.delete('/api/supplies/:id', asyncHandler(async (req, res) => {
  const supply = await Supply.findByPk(req.params.id);
  if (!supply) {
    throw new ApiError(404, 'Supply not found');
  }
  await supply.destroy();
  res.json({ message: 'Deleted' });
}));

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

(async () => {
  await sequelize.sync({ alter: true });

  const count = await Supply.count();
  if (count === 0) {
    const sampleSupplies = [
      { id: 'EQ001', name: 'Centrifuge', category: 'Equipment', description: 'Microcentrifuge 24x2mL', price: 1200, availability: 'In Stock', manufacturer: 'Eppendorf', quantity: 5, location: 'Lab A' },
      { id: 'RG001', name: 'Ethanol', category: 'Reagent', description: 'Absolute ethanol 1L', price: 45, availability: 'In Stock', manufacturer: 'Fisher', quantity: 20, location: 'Lab B' },
      { id: 'CO001', name: 'Pipette Tips', category: 'Consumable', description: '10ul tips pack 1000', price: 40, availability: 'In Stock', manufacturer: 'Falcon', quantity: 100, location: 'Lab C' },
    ];
    await Supply.bulkCreate(sampleSupplies);
    console.log('Seeded supplies in DB');
  }

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
})();
