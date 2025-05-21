// server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ejs from 'ejs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Definisikan __filename dan __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware untuk parsing JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Atur folder public untuk file statis (CSS, JS, gambar)
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Konfigurasi view engine (EJS)
// Folder 'views' digunakan untuk rendering tampilan
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware untuk mengekstrak API key dari berbagai sumber
const getApiKey = (req) => {
  // Cek header Authorization (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Cek custom header X-API-Key
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return apiKeyHeader;
  }
  
  // Cek body request
  if (req.body && req.body.apiKey) {
    return req.body.apiKey;
  }
  
  // Jika tidak ada, gunakan environment variable
  return process.env.GEMINI_API_KEY || process.env.GENERATIVE_API_KEY;
};

/* ---------------------------------------------
   Endpoint: Generate Prompt Text-to-Image
--------------------------------------------- */
app.post('/generate-prompt', async (req, res) => {
  const { keywords, count = 1, apiKey: bodyApiKey, style = '', complexity = 'medium', ratio = '16:9', mood = '', seed = null } = req.body;
  const apiKey = bodyApiKey || getApiKey(req);

  if (!keywords) {
    return res.status(400).json({ error: 'Keywords tidak boleh kosong.' });
  }
  if (!apiKey) {
    return res.status(400).json({ 
      error: 'API key tidak tersedia. Silakan masukkan API key Anda.',
      needApiKey: true 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Gunakan seed khusus atau buat yang baru untuk hasil yang berbeda setiap kali
    const usedSeed = seed || Math.floor(Math.random() * 1000000).toString();
    
    // Daftar elemen unik acak yang diperluas
    const randomPhrases = [
      "with an unexpected twist",
      "featuring a surreal element",
      "in a vibrant, dreamlike setting",
      "with a mysterious aura",
      "bursting with creative energy",
      "4k photo",
      "Realistic",
      "with dramatic lighting",
      "with cinematic composition",
      "featuring hyper-detailed textures",
      "with volumetric fog effects",
      "with intricate details",
      "with breathtaking clarity",
      "featuring unique perspective",
      "with masterful use of contrast",
      "with ethereal atmosphere",
      "with minimalist elegance",
      "combining opposing elements",
      "with symmetrical composition",
      "with dynamic movement",
      "featuring reflective surfaces",
      "with subtle color transitions",
      "with powerful symbolism",
      "with extraordinary detail",
      "featuring hidden elements",
      "with whimsical accents",
      "featuring multiple focal points",
      "with nostalgic overtones",
      "with futuristic elements",
      "creating visual harmony"
    ];

    // Pilih frasa acak berdasarkan seed
    const randomSeedForPhrase1 = parseInt(usedSeed) % randomPhrases.length;
    const randomSeedForPhrase2 = (parseInt(usedSeed) + 7) % randomPhrases.length;
    const randomDetail1 = randomPhrases[randomSeedForPhrase1];
    const randomDetail2 = randomPhrases[randomSeedForPhrase2];

    // Basis data gaya seni yang diperluas
    const artStyles = {
      "photorealistic": ["8k photography", "hyperrealistic detail", "photographic", "DSLR photo", "professional photography", "full frame camera", "high resolution", "HDR"],
      "illustration": ["digital illustration", "concept art", "digital painting", "fantasy illustration", "stylized illustration", "editorial illustration", "character design", "whimsical illustration"],
      "painting": ["oil painting", "watercolor", "acrylic", "gouache", "impressionist", "expressionist", "classical painting", "fine art", "textured painting"],
      "3d": ["3D render", "octane render", "blender", "cinema 4D", "3D modeling", "raytracing", "volumetric lighting", "procedural texturing", "physically based rendering"],
      "anime": ["anime style", "manga illustration", "Japanese animation", "studio ghibli inspired", "cell shaded", "anime character design", "shoujo style", "shonen style"],
      "abstract": ["abstract art", "non-representational", "geometric abstraction", "expressionist abstraction", "minimalist", "surrealist", "cubist", "contemporary abstract"],
      "vintage": ["vintage photograph", "retro style", "80s aesthetics", "film grain", "nostalgic", "polaroid", "35mm film", "kodachrome"],
      "fantasy": ["fantasy art", "mythical creatures", "magical environments", "high fantasy", "sword and sorcery", "fairytale aesthetics", "enchanted scene", "epic fantasy"],
      "sci-fi": ["science fiction", "cyberpunk", "futuristic technology", "space scene", "alien world", "tech noir", "dystopian", "retrofuturism"],
      "pop-art": ["pop art style", "comic book art", "bold colors", "halftone pattern", "andy warhol inspired", "high contrast", "retro pop", "vibrant graphics"]
    };

    // Pilih kata kunci gaya berdasarkan input pengguna atau secara acak dengan seed
    let selectedStyleTerms;
    if (style && artStyles[style]) {
      selectedStyleTerms = artStyles[style];
    } else {
      const styleKeys = Object.keys(artStyles);
      const randomStyleIndex = parseInt(usedSeed) % styleKeys.length;
      selectedStyleTerms = artStyles[styleKeys[randomStyleIndex]];
    }
    
    // Pilih subset dari kata kunci gaya untuk variasi lebih besar
    const numStyleKeywords = 2 + (parseInt(usedSeed) % 3); // 2-4 kata kunci
    const shuffledStyleTerms = [...selectedStyleTerms].sort(() => 0.5 - Math.random());
    const selectedStyleKeywords = shuffledStyleTerms.slice(0, numStyleKeywords);
    const styleKeywords = selectedStyleKeywords.join(", ");

    // Tingkat kompleksitas yang mempengaruhi prompt
    const complexitySettings = {
      "simple": "Focus on clarity and simplicity. Use minimal elements and straightforward descriptions.",
      "medium": "Balance detail and simplicity. Include moderate artistic elements and technical specifications.",
      "complex": "Maximize detail and creative elements. Include intricate descriptions, advanced techniques, and layered artistic concepts."
    };

    const complexityInstruction = complexitySettings[complexity] || complexitySettings.medium;

    // Tambahkan instruksi aspect ratio jika disediakan
    const ratioInstruction = ratio ? `Optimize for ${ratio} aspect ratio.` : "";

    // Tambahkan mood jika disediakan
    const moodInstruction = mood ? `Emphasize a ${mood} mood throughout the scene.` : "";

    // Tambahkan variasi tekstur dan elemen acak
    const textureOptions = [
      "smooth", "rough", "metallic", "glossy", "matte", "textured", "grainy", "polished", 
      "weathered", "organic", "crystalline", "fabric", "wood", "stone", "liquid", "glass"
    ];
    
    const randomTextureIndex = parseInt(usedSeed) % textureOptions.length;
    const textureSuggestion = textureOptions[randomTextureIndex];

    // Tambahkan variasi waktu (waktu hari)
    const timeOptions = [
      "dawn", "morning", "noon", "afternoon", "dusk", "sunset", "twilight", 
      "evening", "night", "midnight", "golden hour", "blue hour"
    ];
    
    const randomTimeIndex = (parseInt(usedSeed) + 3) % timeOptions.length;
    const timeSuggestion = timeOptions[randomTimeIndex];

    // Tambahkan timestamp dengan seed untuk mencegah respons cache
    const timestamp = new Date().toISOString();

    const prompt = `Generate ${count} completely unique and varied text-to-image prompt(s) based on the keywords: "${keywords}".
Ensure each prompt is a pure description without extra commentary.
Make each prompt completely different from any previous ones you've generated for these keywords.
${complexityInstruction}
${ratioInstruction}
${moodInstruction}

Each prompt must include:
- Main Subject and Scene: Clearly describe the subject and its environment.
- Lighting: Detail the light source, intensity, and color temperature.
- Mood and Atmosphere: Specify the emotional tone or ambiance.
- Color Palette: List 3-5 dominant colors.
- Camera Details: Include perspective, angle, distance, and focal length.
- Technical Specifications: Mention resolution, art style, and rendering quality.
- Artistic Elements: Highlight special effects, textures, and unique visuals.

Include these specific elements for variation:
- Consider texture suggestions like "${textureSuggestion}" if appropriate.
- Consider time of day suggestions like "${timeSuggestion}" if it fits.
- Incorporate these unique details: "${randomDetail1}" and "${randomDetail2}".
- Include appropriate art style terms from: ${styleKeywords}.

Format each prompt as a single, coherent text block in English. Separate multiple prompts with a line containing only '---'.

Use this unique seed for variation: ${usedSeed}
(Timestamp: ${timestamp})`;

    const result = await model.generateContent(prompt);
    const generatedText = await result.response.text();

    let prompts = generatedText
      .split('---')
      .map(p => p.trim())
      .filter(p => p && !p.toLowerCase().includes('example'))
      .map(p =>
        p
          .replace(/^\d+\.\s*/, '')
          .replace(/^["']|["']$/g, '')
          .replace(/^prompt:?\s*/i, '')
          .trim()
      );

    // Jika tidak ada cukup prompt, buat lebih banyak dengan modifikasi seed
    if (prompts.length < count) {
      // Coba lagi dengan seed berbeda
      const newSeed = (parseInt(usedSeed) + 12345) % 1000000;
      const additionalResult = await model.generateContent(
        prompt.replace(`Use this unique seed for variation: ${usedSeed}`, 
                      `Use this unique seed for variation: ${newSeed}`)
      );
      const additionalText = await additionalResult.response.text();
      
      const additionalPrompts = additionalText
        .split('---')
        .map(p => p.trim())
        .filter(p => p && !p.toLowerCase().includes('example'))
        .map(p =>
          p
            .replace(/^\d+\.\s*/, '')
            .replace(/^["']|["']$/g, '')
            .replace(/^prompt:?\s*/i, '')
            .trim()
        );
      
      prompts = [...prompts, ...additionalPrompts];
    }

    const finalPrompts = prompts.slice(0, count);

    if (finalPrompts.length === 0) {
      throw new Error('Gagal menghasilkan prompt. Silakan coba lagi.');
    }

    // Tambahkan informasi meta untuk analitik dan debug
    const metaInfo = {
      generatedAt: new Date().toISOString(),
      usedStyle: style || 'random',
      usedComplexity: complexity,
      uniqueElements: [randomDetail1, randomDetail2],
      seed: usedSeed
    };

    console.log('Generated prompts:', finalPrompts);
    res.json({ 
      prompts: finalPrompts,
      meta: metaInfo,
      seed: usedSeed  // Return seed for regeneration or saving
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    // Cek apakah error terkait API key
    if (error.message && (
        error.message.includes('API key') || 
        error.message.includes('authentication') || 
        error.message.includes('credentials') ||
        error.message.includes('unauthorized')
      )) {
      return res.status(401).json({
        error: 'API key tidak valid. Silakan periksa kembali.',
        needApiKey: true
      });
    }
    
    // Tambahkan informasi diagnostik yang lebih detail
    const errorDetails = {
      message: error.message,
      time: new Date().toISOString(),
      requestData: {
        keywords: req.body.keywords,
        count: req.body.count,
        hasApiKey: !!apiKey
      }
    };
    
    res.status(500).json({
      error: 'Terjadi kesalahan saat generate prompt.',
      detail: error.message,
      errorInfo: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

/* ---------------------------------------------
   Routes untuk Rendering Halaman (EJS)
--------------------------------------------- */
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/prompt', (req, res) => {
  res.render('prompt');
});

/* ---------------------------------------------
   Jalankan Server
--------------------------------------------- */
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});