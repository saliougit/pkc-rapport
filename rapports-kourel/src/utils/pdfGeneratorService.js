import fs from 'fs'
import path from 'path'
import os from 'os'
import zlib from 'zlib'
import { request as httpsRequest } from 'https'
import { genererLatex } from './latexGenerator.js'

function createTarGz(filePath) {
  const content = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)
  const nameBuf = Buffer.from(fileName, 'utf8')

  const headerSize = 512
  const contentSize = content.length
  const paddedContentSize = Math.ceil(contentSize / 512) * 512

  const header = Buffer.alloc(headerSize, 0)

  // Nom du fichier (100 bytes)
  nameBuf.copy(header, 0, 0, Math.min(nameBuf.length, 100))

  // Mode (8 bytes) — "0000644\0"
  header.write('0000644\0', 100, 8, 'ascii')

  // UID / GID (8 bytes chacun)
  header.write('0000000\0', 108, 8, 'ascii')
  header.write('0000000\0', 116, 8, 'ascii')

  // Taille du fichier (12 bytes, octal + espace)
  header.write(contentSize.toString(8).padStart(11, '0') + ' ', 124, 12, 'ascii')

  // MTime (12 bytes, octal + espace)
  const now = Math.floor(Date.now() / 1000)
  header.write(now.toString(8).padStart(11, '0') + ' ', 136, 12, 'ascii')

  // Type : fichier normal
  header[156] = '0'.charCodeAt(0)

  // Magic ustar
  header.write('ustar  \0', 257, 8, 'ascii')

  // Checksum : somme de tous les bytes du header en traitant les 8 bytes checksum (148-155) comme des espaces (32)
  // Le buffer est initialisé à 0, donc on ajoute 32*8 pour compenser
  let checksum = 0
  for (let i = 0; i < headerSize; i++) checksum += header[i]
  checksum += 32 * 8  // les 8 bytes checksum comptent comme des espaces
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii')

  const padding = Buffer.alloc(paddedContentSize - contentSize, 0)
  const endBlocks = Buffer.alloc(1024, 0)

  const tarBuffer = Buffer.concat([header, content, padding, endBlocks])
  return zlib.gzipSync(tarBuffer)
}

function uploadRawBinary(url, buffer) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-gzip',
        'Content-Length': buffer.length
      }
    }

    const req = httpsRequest(options, (res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const result = Buffer.concat(chunks)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(result)
        } else {
          const msg = result.toString('utf8').substring(0, 300)
          reject(new Error(`LaTeX.Online a répondu ${res.statusCode}: ${msg}`))
        }
      })
    })

    req.on('error', err => reject(new Error(`Erreur réseau: ${err.message}`)))
    req.write(buffer)
    req.end()
  })
}

export async function genererPDFDirectement(rapport, kourel, programmeAnnuel = []) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latex-'))
  const texFile = path.join(tempDir, 'rapport.tex')

  try {
    console.log('📄 Génération du template LaTeX...')
    const texContent = genererLatex(rapport, kourel, programmeAnnuel)
    fs.writeFileSync(texFile, texContent, 'utf8')

    console.log('📦 Création de l\'archive tar.gz...')
    const tarGzBuffer = createTarGz(texFile)

    // Endpoint correct : /compile/tgz (pas /data), envoi binaire brut (pas multipart)
    console.log('🚀 Envoi vers LaTeX.Online API...')
    const url = 'https://latexonline.cc/compile/tgz?target=rapport.tex&command=pdflatex'
    const pdfBuffer = await uploadRawBinary(url, tarGzBuffer)

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF vide reçu de LaTeX.Online')
    }

    console.log(`✅ PDF généré avec succès (${Math.round(pdfBuffer.length / 1024)} KB)`)
    return pdfBuffer

  } catch (error) {
    console.error('❌ Erreur détaillée:', error.message)
    throw error
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (e) {}
  }
}
