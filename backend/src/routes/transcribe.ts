import type { FastifyInstance } from 'fastify';

const transcribe = async (fastify: FastifyInstance) => {
  fastify.post('/transcribe', async (_req, _reply) => {
    return { hello: 'transcribe!' };
  });

  fastify.get<{
    Params: { id: string };
  }>('/transcribe/:id', async (req, _reply) => {
    const { id } = req.params;

    return { hello: `transcribe ${id}` };
  });

  fastify.get<{
    Params: { id: string };
  }>('/transcribe/:id/download', async (req, _reply) => {
    const { id } = req.params;

    return { hello: `transcribe download ${id}` };
  });
};

export default transcribe;
