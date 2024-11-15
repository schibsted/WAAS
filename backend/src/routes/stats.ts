import type { FastifyInstance } from 'fastify';

const stats = async (fastify: FastifyInstance) => {
  fastify.get('/stats', async (_req, _reply) => {
    return { hoursSaved: 42, queueSize: 3 };
  });
};

export default stats;
