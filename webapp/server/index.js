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

// Connect to Databases
connectDB();
connectRedis();

// Start Background Services
startScraper();

async function startServer() {
  const server = new ApolloServer({
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
  server.applyMiddleware({ app });

  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  app.listen(PORT, () => {
    console.log(`NyaaStream server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
