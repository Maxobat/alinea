import {Config} from './Config.js'
import {Connection} from './Connection.js'
import {PageSeed} from './Page.js'
import {Root} from './Root.js'
import {Schema} from './Schema.js'
import {Type} from './Type.js'
import {Workspace} from './Workspace.js'
import {Cursor} from './pages/Cursor.js'
import {Projection} from './pages/Projection.js'
import {Selection} from './pages/Selection.js'
import {seralizeLocation, serializeSelection} from './pages/Serialize.js'

export type Location = Root | Workspace | PageSeed

export interface GraphApi {
  maybeGet<S extends Projection>(
    select: S
  ): Promise<Projection.InferOne<S> | null>
  maybeGet<S extends Projection>(
    location: Location,
    select: S
  ): Promise<Projection.InferOne<S> | null>
  get<S extends Projection>(select: S): Promise<Projection.InferOne<S>>
  get<S extends Projection>(
    location: Location,
    select: S
  ): Promise<Projection.InferOne<S>>
  find<S>(select: S): Promise<Selection.Infer<S>>
  find<S>(location: Location, select: S): Promise<Selection.Infer<S>>
  count(cursor: Cursor.Find<any>): Promise<number>
  count(location: Location, cursor: Cursor.Find<any>): Promise<number>
}

export class Graph implements GraphApi {
  targets: Schema.Targets

  constructor(
    public config: Config,
    public resolve: (params: Connection.ResolveParams) => Promise<unknown>
  ) {
    this.targets = Schema.targets(config.schema)
  }

  maybeGet<S extends Projection>(
    select: S
  ): Promise<Projection.InferOne<S> | null>
  maybeGet<S extends Projection>(
    location: Location,
    select: S
  ): Promise<Projection.InferOne<S> | null>
  async maybeGet(...args: Array<any>): Promise<any> {
    let [providedLocation, select] =
      args[1] === undefined ? [undefined, args[0]] : args
    if (select instanceof Cursor.Find) select = select.first()
    if (Type.isType(select)) select = select().first()
    const selection = Selection.create(select)
    serializeSelection(this.targets, selection)
    return this.resolve({
      selection,
      location: seralizeLocation(this.config, providedLocation)
    })
  }

  get<S extends Projection>(select: S): Promise<Projection.InferOne<S>>
  get<S extends Projection>(
    location: Location,
    select: S
  ): Promise<Projection.InferOne<S>>
  async get(...args: Array<any>): Promise<any> {
    const result = this.maybeGet(args[0], args[1])
    if (result === null) throw new Error('Not found')
    return result
  }

  find<S>(select: S): Promise<Selection.Infer<S>>
  find<S>(location: Location, select: S): Promise<Selection.Infer<S>>
  async find(...args: Array<any>): Promise<any> {
    const [providedLocation, select] =
      args[1] === undefined ? [undefined, args[0]] : args
    const selection = Selection.create(select)
    serializeSelection(this.targets, selection)
    return this.resolve({
      selection,
      location: seralizeLocation(this.config, providedLocation)
    })
  }

  count(cursor: Cursor.Find<any>): Promise<number>
  count(location: Location, cursor: Cursor.Find<any>): Promise<number>
  async count(...args: Array<any>): Promise<any> {
    let [providedLocation, cursor] =
      args.length === 1 ? [undefined, args[0]] : args
    const selection = Selection.create(cursor.count())
    serializeSelection(this.targets, selection)
    return this.resolve({
      selection,
      location: seralizeLocation(this.config, providedLocation)
    })
  }
}
