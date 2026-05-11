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

  // Mode (8 bytes) - 0644 en octal
  header.write('000644 ', 100, 8, 'ascii')

  // UID (8 bytes)
  header.write('000000 ', 108, 8, 'ascii')

  // GID (8 bytes)
  header.write('000000 ', 116, 8, 'ascii')

  // Taille du fichier (12 bytes, octal)
  header.write(contentSize.toString(8).padStart(11, '0') + ' ', 124, 12, 'ascii')

  // MTime (12 bytes, octal)
  const now = Math.floor(Date.now() / 1000)
  header.write(now.toString(8).padStart(11, '0') + ' ', 136, 12, 'ascii')

  // Checksum (8 bytes) - on calcule après avoir rempli
  const typeflag = '0' // fichier normal
  header[156] = typeflag.charCodeAt(0)

  // Magic "ustar"
  header.write('ustar', 257, 5, 'ascii')
  header[262] = 0 // null terminator

  // Version "00"
  header.write('00', 263, 2, 'ascii')

  // Calcul du checksum
  let checksum = 0
  for (let i = 0; i < headerSize; i++) {
    checksum += header[i]
  }
  // Les 8 bytes de checksum sont traités comme des espaces pour le calcul
  checksum += 32 * 8 // 8 bytes d'espaces

  header.write(checksum.toString(8).padStart(6, '0') + ' \0', 148, 8, 'ascii')

  // Assemblage : header + contenu (pad à 512) + 2 blocs nuls de fin
  const padding = Buffer.alloc(paddedContentSize - contentSize, 0)
  const endBlocks = Buffer.alloc(1024, 0)

  const tarBuffer = Buffer.concat([header, content, padding, endBlocks])

  return zlib.gzipSync(tarBuffer)
}

function uploadPost(url, buffer, contentType) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2)
    const fileName = 'archive.tar.gz'

    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`
    const footer = `\r\n--${boundary}--\r\n`

    const bodyBuffer = Buffer.concat([
      Buffer.from(header, 'utf8'),
      buffer,
      Buffer.from(footer, 'utf8')
    ])

    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    }

    const req = httpsRequest(options, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const result = Buffer.concat(chunks)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(result)
        } else {
          reject(new Error(`LaTeX.Online a répondu ${res.statusCode}: ${result.toString('utf8').substring(0, 200)}`))
        }
      })
    })

    req.on('error', (err) => reject(new Error(`Erreur réseau: ${err.message}`)))
    req.write(bodyBuffer)
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

    console.log('🚀 Envoi vers LaTeX.Online API...')
    const url = 'https://latexonline.cc/data?target=rapport.tex&command=pdflatex'
    const pdfBuffer = await uploadPost(url, tarGzBuffer, 'application/gzip')

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
