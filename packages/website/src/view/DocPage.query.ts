import {Collection, Store} from '@alinea/store'
import {Doc, Page} from '../../.alinea/web'

function menuQuery() {
  return Page.where(Page.type.is('Doc').or(Page.type.is('Docs')))
    .select({
      type: Page.type,
      url: Page.url,
      title: Page.title
    })
    .orderBy(Page.index.asc())
}

export function docPageQuery(doc: Collection<Doc>) {
  const siblings = Doc.where(Doc.parent.is(doc.parent)).select({
    url: Doc.url,
    title: Doc.title
  })
  const prev = siblings
    .orderBy(Doc.index.desc())
    .where(Doc.index.less(doc.index))
    .first()
  const next = siblings
    .orderBy(Doc.index.asc())
    .where(Doc.index.greater(doc.index))
    .first()
  return doc.fields.with({
    menu: menuQuery(),
    prev,
    next
  })
}

export type DocPageProps = Store.TypeOf<ReturnType<typeof docPageQuery>>
