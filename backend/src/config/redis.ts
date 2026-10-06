import Redis from 'ioredis';
import { env } from './env';

export let redis: Redis | null = null;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis não disponível no momento. Operando com cache em memória/direto.');
        return null; // parar de tentar reconectar agressivamente em dev
      }
      return Math.min(times * 100, 2000);
    },
  });

  redis.on('connect', () => {
    console.log('✅ Conectado ao Redis com sucesso');
  });

  redis.on('error', (err) => {
    // Não crashar a aplicação se o redis não estiver rodando no host de dev local
    console.warn('⚠️ Aviso Redis:', err.message);
  });
} catch (error) {
  console.warn('⚠️ Redis não inicializado:', error);
}
