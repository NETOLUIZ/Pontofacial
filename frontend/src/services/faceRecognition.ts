import * as faceapi from '@vladmandic/face-api';

export interface FaceDescriptorData {
  descriptor: number[]; // 128-dimension vector
  fotoBase64?: string;
  dataCaptura: string;
}

export interface ReconhecimentoResultado {
  sucesso: boolean;
  funcionarioId?: string;
  nome?: string;
  distancia?: number;
  similaridade?: number;
  mensagem: string;
}

let modelsLoaded = false;
let loadingPromise: Promise<boolean> | null = null;

/**
 * Carrega os modelos neurais de detecção, marcos faciais e reconhecimento
 * diretamente da pasta local /models (100% offline).
 */
export async function carregarModelosFaciais(): Promise<boolean> {
  if (modelsLoaded) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const MODEL_URL = '/models';

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      console.log('✓ Modelos biométricos face-api carregados com sucesso');
      return true;
    } catch (error) {
      console.warn('Erro ao carregar modelos neurais de /models:', error);
      modelsLoaded = false;
      return false;
    }
  })();

  return loadingPromise;
}

/**
 * Detecta o rosto no elemento (vídeo, imagem ou canvas) e extrai o descritor vetorial de 128 dimensões.
 */
export async function extrairDescritorFacial(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<{ descriptor: Float32Array; box: faceapi.Box; score: number } | null> {
  try {
    const pronto = await carregarModelosFaciais();
    if (!pronto) return null;

    // Utiliza TinyFaceDetector com alta sensibilidade para resposta em tempo real
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    
    const detection = await faceapi
      .detectSingleFace(input, options)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection) return null;

    return {
      descriptor: detection.descriptor,
      box: detection.detection.box,
      score: detection.detection.score,
    };
  } catch (error) {
    console.warn('Erro na extração biométrica facial:', error);
    return null;
  }
}

/**
 * Compara um descritor facial capturado na câmera contra a lista de colaboradores cadastrados
 * utilizando distância euclidiana precisa.
 */
export function compararRostoComCadastrados(
  descriptorCapturado: Float32Array,
  colaboradores: Array<{ id: string; nome: string; biometria?: FaceDescriptorData }>
): ReconhecimentoResultado {
  const DISTANCIA_LIMIAR_MAXIMA = 0.50; // Limiar rigoroso para evitar falsos positivos

  let melhorColaborador: { id: string; nome: string } | null = null;
  let menorDistancia = Infinity;

  for (const c of colaboradores) {
    if (!c.biometria || !c.biometria.descriptor || c.biometria.descriptor.length !== 128) {
      continue;
    }

    const descritorSalvo = new Float32Array(c.biometria.descriptor);
    const distancia = faceapi.euclideanDistance(descriptorCapturado, descritorSalvo);

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      melhorColaborador = { id: c.id, nome: c.nome };
    }
  }

  if (melhorColaborador && menorDistancia <= DISTANCIA_LIMIAR_MAXIMA) {
    // Transforma a distância em porcentagem de confiança/similaridade
    const similaridade = Math.round(Math.max(0, Math.min(100, (1 - menorDistancia) * 100)));

    return {
      sucesso: true,
      funcionarioId: melhorColaborador.id,
      nome: melhorColaborador.nome,
      distancia: menorDistancia,
      similaridade,
      mensagem: `Colaborador identificado com ${similaridade}% de similaridade biométrica.`,
    };
  }

  return {
    sucesso: false,
    distancia: menorDistancia !== Infinity ? menorDistancia : undefined,
    mensagem: 'Face não reconhecida ou índice de similaridade insuficiente.',
  };
}

/**
 * Desenha a caixa delimitadora do rosto no Canvas sobreposto ao vídeo
 */
export function desenharDeteccaoNoCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  box: faceapi.Box,
  nomeIdentificado?: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = video.videoWidth || video.clientWidth;
  canvas.height = video.videoHeight || video.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Caixa com cantos arredondados
  ctx.strokeStyle = nomeIdentificado ? '#00D084' : '#1746B8';
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Tag com identificação
  if (nomeIdentificado) {
    ctx.fillStyle = '#00D084';
    ctx.fillRect(box.x, box.y - 28, box.width, 28);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`✓ ${nomeIdentificado}`, box.x + 8, box.y - 9);
  }
}
