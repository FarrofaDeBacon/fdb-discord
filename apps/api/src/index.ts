import Fastify from "fastify";
export const api = Fastify({ logger: true });

api.get("/health", async () => ({ status: "ok", guild_isolation: true }));

const start = async () => {
  try {
    await api.listen({ port: 3001, host: "0.0.0.0" });
  } catch (err) {
    api.log.error(err);
    process.exit(1);
  }
};
start();
