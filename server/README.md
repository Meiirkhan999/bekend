# Backend (ORM models)

This folder contains Sequelize ORM models for the project database.

Files:
- `src/models/index.js` — Sequelize initialization and associations
- `src/models/user.js` — `User` model
- `src/models/supply.js` — `Supply` model

To create the SQLite DB and sync models (locally):

```bash
cd server
npm install
node -e "require('./src/models').sequelize.sync({ alter: true }).then(()=>console.log('synced'))"
```

This will create `database.sqlite` in the repo root and create the `Users` and `Supplies` tables.
