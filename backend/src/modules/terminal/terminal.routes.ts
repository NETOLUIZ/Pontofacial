import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { PontoService } from '../ponto/ponto.service';
import { StatusFuncionario, TipoRegistro } from '@prisma/client';

const router = Router();
const pontoService = new PontoService();

// GET /api/terminal/funcionarios?terminal=term-portaria-01
router.get('/funcionarios', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const terminalUuid = (req.query.terminal as string) || '';

    let empresaId: string | null = null;
    let dispositivo: any = null;

    if (terminalUuid) {
      dispositivo = await prisma.dispositivo.findFirst({
        where: { identificadorUuid: terminalUuid },
      });
      if (dispositivo) {
        empresaId = dispositivo.empresaId;
        // Atualiza heartbeat do totem/terminal
        await prisma.dispositivo.update({
          where: { id: dispositivo.id },
          data: { ultimoSync: new Date() },
        });
      }
    }

    // Fallback: se não encontrou pelo UUID, busca a primeira empresa ativa
    if (!empresaId) {
      const empresa = await prisma.empresa.findFirst({
        where: { ativo: true },
        orderBy: { createdAt: 'asc' },
      });
      if (empresa) {
        empresaId = empresa.id;
      }
    }

    if (!empresaId) {
      res.json({ success: true, data: { dispositivo: null, funcionarios: [] } });
      return;
    }

    const funcionarios = await prisma.funcionario.findMany({
      where: {
        empresaId,
        status: StatusFuncionario.ATIVO,
      },
      select: {
        id: true,
        empresaId: true,
        nome: true,
        matricula: true,
        cargo: true,
        departamento: true,
        biometriaCadastrada: true,
        biometria: true,
        fotoUrl: true,
        status: true,
        cpf: true,
      },
      orderBy: { nome: 'asc' },
    });

    res.json({
      success: true,
      data: {
        dispositivo: dispositivo ? { id: dispositivo.id, nome: dispositivo.nome, localizacao: dispositivo.localizacao } : null,
        funcionarios,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/terminal/ponto
router.post('/ponto', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { funcionarioId, tipo, dataHora, origem, status, idempotencyKey, fotoRegistroUrl, terminalUuid } = req.body;

    if (!funcionarioId || !tipo) {
      res.status(400).json({ success: false, message: 'ID do funcionário e tipo de registro são obrigatórios' });
      return;
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      res.status(404).json({ success: false, message: 'Funcionário não encontrado no sistema' });
      return;
    }

    let dispositivoId: string | undefined = undefined;
    if (terminalUuid) {
      const disp = await prisma.dispositivo.findFirst({
        where: { identificadorUuid: terminalUuid, empresaId: funcionario.empresaId },
      });
      if (disp) {
        dispositivoId = disp.id;
      }
    }

    const resultado = await pontoService.registrar(funcionario.empresaId, {
      funcionarioId,
      dispositivoId,
      tipo: tipo as TipoRegistro,
      dataHora: dataHora || new Date(),
      origem: origem || 'ONLINE',
      status: status || 'VALIDO',
      idempotencyKey,
      fotoRegistroUrl,
    });

    res.status(201).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
});

export const terminalRoutes = router;
