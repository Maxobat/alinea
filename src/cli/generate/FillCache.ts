import {Database} from 'alinea/backend/Database'
import {Store} from 'alinea/backend/Store'
import {FileData} from 'alinea/backend/data/FileData'
import {Emitter, createEmitter} from 'alinea/cli/util/Emitter'
import {Config} from 'alinea/core'
import fs from 'node:fs'
import pLimit from 'p-limit'
import {createWatcher} from '../util/Watcher.js'
import {GenerateContext} from './GenerateContext.js'

export async function* fillCache(
  {watch, configDir}: GenerateContext,
  store: Store,
  config: Config,
  until: Promise<any>
) {
  const db = new Database(store, config)
  const fileData = new FileData({
    config,
    fs: fs.promises,
    rootDir: configDir
  })
  const limit = pLimit(1)
  const cache = () => db.fill(fileData, fileData)
  const result = await limit(cache)
  yield result

  if (!watch || !fileData.watchFiles) return

  const results = createEmitter<void>()
  const stopWatching = await createWatcher({
    watchFiles: fileData.watchFiles.bind(fileData),
    async onChange() {
      results.emit(await limit(cache))
    }
  })
  until.then(() => {
    results.cancel()
  })

  try {
    yield* results
  } catch (e) {
    if (e === Emitter.CANCELLED) return
    throw e
  } finally {
    stopWatching()
  }
}
