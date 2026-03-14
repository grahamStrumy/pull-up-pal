import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const rootDir = process.cwd()
const sourcePath = path.join(rootDir, 'src', 'assets', 'icon-master.png')
const outputDir = path.join(rootDir, 'public', 'icons')
const sizes = [192, 256, 384, 512, 1024]

await mkdir(outputDir, { recursive: true })

await Promise.all(
  sizes.map(async (size) => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)

    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'cover',
      })
      .png()
      .toFile(outputPath)

    console.log(`generated ${path.relative(rootDir, outputPath)}`)
  }),
)
