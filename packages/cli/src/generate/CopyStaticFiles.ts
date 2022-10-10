import fs from 'fs-extra'
import path from 'node:path'
import {writeFileIfContentsDiffer} from '../util/FS'
import {GenerateContext} from './GenerateContext'

function configType(location: string) {
  const file = location.endsWith('.tsx') ? location.slice(0, -4) : location
  return `export * from ${JSON.stringify(file)}`
}

export async function copyStaticFiles({
  configLocation,
  staticDir,
  outDir
}: GenerateContext) {
  await fs.mkdirp(outDir).catch(console.log)
  function copy(...files: Array<string>) {
    return Promise.all(
      files.map(file =>
        fs.copyFile(path.join(staticDir, file), path.join(outDir, file))
      )
    )
  }
  await copy(
    'package.json',
    'index.js',
    'index.d.ts',
    'drafts.js',
    'backend.cjs',
    'backend.js',
    'backend.d.ts',
    'store.cjs',
    'store.d.ts',
    'pages.d.ts',
    'pages.js',
    'pages.cjs',
    'schema.js'
  )

  /*await writeFileIfContentsDiffer(
    path.join(outDir, 'config.d.ts'),
    configType(path.resolve(configLocation))
  )*/

  await writeFileIfContentsDiffer(path.join(outDir, '.gitignore'), `*\n!.keep`)
  await writeFileIfContentsDiffer(
    path.join(outDir, '.keep'),
    '# Contents of this folder are autogenerated by alinea'
  )
}
