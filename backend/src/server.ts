import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap() {
  try {
    // Testa conexão com banco de dados
    try {
      await prisma.$connect();
      console.log('✅ Banco de dados PostgreSQL conectado com sucesso');
    } catch (dbError: any) {
      console.warn('⚠️ Aviso: Banco de dados PostgreSQL não está acessível no momento (' + env.DATABASE_URL + ').');
      console.warn('👉 Para persistência completa de dados, inicie o PostgreSQL ou execute os containers.');
      if (env.NODE_ENV === 'production') {
        throw dbError;
      }
    }

    app.listen(env.PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 Healthcheck disponível em: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Falha crítica ao inicializar servidor:', error);
    process.exit(1);
  }
}

bootstrap();
