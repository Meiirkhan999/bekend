const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize, Supply } = require('./models');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/supplies', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || 'All');
    const sortBy = String(req.query.sortBy || 'name');
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

    res.json({ total: count, page, limit, supplies: rows });
  } catch (error) {
    console.error('GET /api/supplies error', error);
    res.status(500).json({ message: 'Server error fetching supplies' });
  }
});

app.post('/api/supplies', async (req, res) => {
  try {
    const { name, category, description, price, availability, manufacturer, quantity, location } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Supply name is required' });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Category is required' });
    }

    const newSupply = await Supply.create({
      id: `SUP-${uuidv4()}`,
      name: name.trim(),
      category,
      description: description || '',
      price: Number(price) || 0,
      availability: availability || 'In Stock',
      manufacturer: manufacturer || '',
      quantity: Number(quantity) || 0,
      location: location || '',
      createdBy: 'system',
    });

    res.status(201).json(newSupply);
  } catch (error) {
    console.error('POST /api/supplies error', error);
    res.status(500).json({ message: 'Server error creating supply' });
  }
});

app.put('/api/supplies/:id', async (req, res) => {
  try {
    const supply = await Supply.findByPk(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    await supply.update(req.body);
    res.json(supply);
  } catch (error) {
    console.error('PUT /api/supplies error', error);
    res.status(500).json({ message: 'Server error updating supply' });
  }
});

app.delete('/api/supplies/:id', async (req, res) => {
  try {
    const supply = await Supply.findByPk(req.params.id);
    if (!supply) {
      return res.status(404).json({ message: 'Supply not found' });
    }

    await supply.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/supplies error', error);
    res.status(500).json({ message: 'Server error deleting supply' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
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
