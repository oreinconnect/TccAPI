import multer from "multer";
import sharp from "sharp";
import fetch from "node-fetch";

const storage = multer.memoryStorage(); // guarda só em RAM
const upload = multer({ storage });
const uploadMiddleware = upload.single("foto");

// Promisify middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: { bodyParser: false }, // necessário pro multer
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    await runMiddleware(req, res, uploadMiddleware);

    // A imagem está em req.file.buffer
    const bufferReduzido = await sharp(req.file.buffer)
      .resize({ width: 320 }) // reduz resolução
      .jpeg({ quality: 70 })
      .toBuffer();

    // Converte para base64
    const base64 = bufferReduzido.toString("base64");

    // Chama a API de IA (exemplo genérico)
    /*const resp = await fetch("https://sua-api-ia.com/analyze", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.IA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64}`,
        prompt: "Classifique o material: plástico, vidro, metal, papel ou orgânico",
      }),
    });*/

    const result = await resp.json();

    // Retorna só a resposta da IA pro ESP32
    res.status(200).json({
      status: "ok",
      classificacao: result.classificacao || "desconhecido",
      confianca: result.confianca || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no processamento" });
  }
}

