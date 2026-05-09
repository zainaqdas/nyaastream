const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const apiRoutes = require('./routes/api');
const { connectDB, connectRedis } = require('./config/db');
const { startScraper } = require('./services/scraper');
const jwt = require('jsonwebtoken');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 1. Basic Middlewares (Non-body consuming)
app.use(cors());

// 2. Apollo Server Setup
let server = null;
async function getApolloServer() {
  if (server) return server;

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      let user = null;
      if (token) {
        try {
          user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          console.error('Invalid token');
        }
      }
      return { user };
    }
  });

  await server.start();
  return server;
}

// 3. Initialization Logic
let initialized = false;
const init = async () => {
  if (initialized) return;
  await connectDB();
  await connectRedis();
  const apollo = await getApolloServer();
  // Apply Apollo to the app - only once
  apollo.applyMiddleware({ app, path: '/graphql' });
  initialized = true;
};

// 4. Vercel Handler / Middleware
// We use a wrapper to ensure init is called before any route handling
app.use(async (req, res, next) => {
  try {
    await init();
    next();
  } catch (err) {
    next(err);
  }
});

// 5. API Routes (Body parser applied ONLY here to avoid conflict with Apollo)
app.use('/api', express.json(), apiRoutes);

// 6. Local Development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  init().then(() => {
    startScraper();
    app.listen(PORT, () => {
      console.log(`NyaaStream server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Initialization failed:', err);
  });
}

module.exports = app;
