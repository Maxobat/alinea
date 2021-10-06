import {Content, createId, Draft, Entry, Outcome} from '@alinea/core'
import convertHrtime from 'convert-hrtime'
import {promises} from 'fs'
import {
  Collection,
  Expression,
  Functions,
  SqliteStore,
  Store
} from 'helder.store'
import {BetterSqlite3} from 'helder.store/drivers/BetterSqlite3.js'
import pLimit from 'p-limit'
import prettyMilliseconds from 'pretty-ms'

function join(...parts: Array<string>) {
  return parts.join('/')
}

const Entry = new Collection<Entry & {id: string}>('Entry')
const Draft = new Collection<Draft & {id: string}>('Draft')

type Progress<T> = Promise<T> & {progress(): number}

async function index(path: string, store: Store) {
  let total = 0
  const openfile = pLimit(4)
  async function process(target: string, parentId?: string) {
    const files = await promises.readdir(join(path, target))
    const tasks = files.map(file => async () => {
      const stat = await promises.stat(join(path, target, file))
      const localPath = join(target, file)
      const isContainer = stat.isDirectory()
      if (isContainer) {
        const parent = store.insert(Entry, {
          $id: createId(),
          $parent: parentId,
          //path: localPath,
          $isContainer: true,
          $channel: '',
          title: file
        })
        await process(localPath, parent.$id)
      } else {
        total++
        try {
          const parsed = JSON.parse(
            await openfile(() =>
              promises.readFile(join(path, localPath), 'utf-8')
            )
          )
          store.insert(Entry, {
            $id: parsed.$id || createId(),
            $parent: parentId,
            $channel: parsed.channel,
            ...parsed
          })
        } catch (e) {
          console.log(`Could not parse ${localPath} because:\n  ${e}`)
        }
      }
    })
    await Promise.all(tasks.map(t => t()))
  }
  await process('')
  return total
}

function init(path: string): Progress<Content> {
  // Check if the index exists, if not build it
  let progress = 0
  async function build(): Promise<Content> {
    const startTime = process.hrtime.bigint()
    const store = new SqliteStore(new BetterSqlite3())
    console.log('Start indexing...')
    const total = await index(path, store)
    store.createIndex(Entry, '$id', [Entry.$id])
    store.createIndex(Entry, '$parent', [Entry.$parent])
    store.createIndex(Draft, 'entry', [Draft.entry])
    const diff = process.hrtime.bigint() - startTime
    console.log(
      `Done indexing ${total} entries in ${prettyMilliseconds(
        convertHrtime(diff).milliseconds
      )}`
    )
    return new Indexed(store)
  }
  return Object.assign(build(), {progress: () => progress})
}

class Indexed implements Content {
  constructor(protected store: Store) {}

  async get(id: string): Promise<Entry | null> {
    return this.store.first(Entry.where(Entry.$id.is(id)))
  }

  async entryWithDraft(id: string): Promise<Entry.WithDraft | null> {
    const entry = this.store.first(Entry.where(Entry.$id.is(id)))
    const draft = this.store.first(Draft.where(Draft.entry.is(id)))
    return entry && {entry, draft}
  }

  async put(id: string, entry: Entry): Promise<Outcome<void>> {
    // Todo: only update keys that changed?
    return Outcome.attempt(() => {
      this.store.update(Entry.where(Entry.$id.is(id)), entry as any)
    })
  }

  async putDraft(id: string, doc: string): Promise<Outcome<void>> {
    return Outcome.attempt(() => {
      const existing = this.store.first(Draft.where(Draft.entry.is(id)))
      if (existing) this.store.update(Draft, {doc: Expression.value(doc)})
      else this.store.insert(Draft, {entry: id, doc})
    })
  }

  async list(parentId?: string): Promise<Array<Entry.WithChildrenCount>> {
    const Parent = Entry.as('Parent')
    return this.store.all(
      Entry.where(
        parentId ? Entry.$parent.is(parentId) : Entry.$parent.isNull()
      ).select({
        $id: Entry.$id,
        $channel: Entry.$channel,
        $parent: Entry.$parent,
        $isContainer: Entry.$isContainer,
        title: Entry.title,
        childrenCount: Parent.where(Parent.$parent.is(Entry.$id))
          .select(Functions.count())
          .first()
      })
    )
  }
}

export class ContentIndex implements Content {
  index: Progress<Content>

  constructor(protected id: string) {
    this.index = init(this.id)
  }

  get(id: string): Promise<Entry.WithParents | null> {
    return this.index.then(index => index.get(id))
  }

  entryWithDraft(id: string): Promise<Entry.WithDraft | null> {
    return this.index.then(index => index.entryWithDraft(id))
  }

  put(id: string, entry: Entry): Promise<Outcome<void>> {
    return this.index.then(index => index.put(id, entry))
  }

  putDraft(id: string, doc: string): Promise<Outcome<void>> {
    return this.index.then(index => index.putDraft(id, doc))
  }

  list(parentId?: string): Promise<Array<Entry.WithChildrenCount>> {
    return this.index.then(index => index.list(parentId))
  }
}