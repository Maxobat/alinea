import {docFromEntry, Entry, slugify} from '@alinea/core'
import {EntryDraft, Fields, InputPath} from '@alinea/editor'
import {select} from '@alinea/input.select'
import {SelectInput} from '@alinea/input.select/view'
import {text} from '@alinea/input.text'
import {TextInput} from '@alinea/input.text/view'
import {fromModule, HStack, Loader, useObservable} from '@alinea/ui'
import {Modal} from '@alinea/ui/Modal'
import {ComponentType, FormEvent, Suspense, useState} from 'react'
import {useQuery, useQueryClient} from 'react-query'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import * as Y from 'yjs'
import {useDashboard} from '../hook/UseDashboard'
import {useSession} from '../hook/UseSession'
import {EntryHeader} from './entry/EntryHeader'
import {EntryTitle} from './entry/EntryTitle'
import css from './EntryEdit.module.scss'

const styles = fromModule(css)

type EntryPreviewProps = {
  draft: EntryDraft
  preview: ComponentType<Entry>
}

function EntryPreview({draft, preview: Preview}: EntryPreviewProps) {
  const entry = useObservable(draft.entry)
  return <Preview {...entry} />
}

type EntryEditDraftProps = {draft: EntryDraft}

function EntryEditDraft({draft}: EntryEditDraftProps) {
  const session = useSession()
  const type = session.hub.schema.type(draft.type)
  const {preview} = useDashboard()
  return (
    <HStack style={{height: '100%'}}>
      <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <EntryHeader />
        <div className={styles.draft()}>
          <EntryTitle />

          <Suspense fallback={null}>
            {type ? <Fields type={type} /> : 'Channel not found'}
          </Suspense>
        </div>
      </div>
      {preview && <EntryPreview preview={preview} draft={draft} />}
    </HStack>
  )
}

export type NewEntryProps = {parentId?: string}

export function NewEntry({parentId}: NewEntryProps) {
  const queryClient = useQueryClient()
  const history = useHistory()
  const {hub} = useSession()
  const {data: parentEntry} = useQuery(
    ['parent', parentId],
    () => {
      return parentId ? hub.entry(parentId) : undefined
    },
    {
      suspense: true,
      refetchOnWindowFocus: false
    }
  )
  const parent = parentEntry?.isSuccess() ? parentEntry.value?.entry : undefined
  const type = parent && hub.schema.type(parent.type)
  const types = type?.options.contains || hub.schema.keys
  const [selectedType, setSelectedType] = useState(types[0])
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!selectedType) return
    setIsCreating(true)
    const type = hub.schema.type(selectedType)!
    const path = slugify(title)
    const entry = {
      ...type.create(selectedType),
      path,
      $parent: parent?.id,
      url: (parent?.url || '') + (parent?.url.endsWith('/') ? '' : '/') + path,
      title
    }
    const doc = docFromEntry(type, entry)
    hub
      .updateDraft(entry.id, Y.encodeStateAsUpdate(doc))
      .then(result => {
        if (result.isSuccess()) {
          queryClient.invalidateQueries(['children', entry.$parent])
          history.push(`/${entry.id}`)
        }
      })
      .finally(() => {
        setIsCreating(false)
      })
  }
  function handleClose() {
    history.push(`/${parent?.id}`)
  }
  return (
    <Modal open onClose={handleClose}>
      <form onSubmit={handleCreate}>
        {isCreating ? (
          <Loader absolute />
        ) : (
          <>
            <TextInput
              path={new InputPath.StatePair(title, setTitle)}
              field={text('Title')}
            />
            <SelectInput
              path={new InputPath.StatePair(selectedType, setSelectedType)}
              field={select(
                'Select type',
                Object.fromEntries(
                  types.map(typeKey => {
                    const type = hub.schema.type(typeKey)
                    return [typeKey, type?.label || typeKey]
                  })
                )
              )}
            />
            <Link to={`/${parent?.id}`}>Cancel</Link>
            <button>Create</button>
          </>
        )}
      </form>
    </Modal>
  )
}

export type EntryEditProps = {draft: EntryDraft}

export function EntryEdit({draft}: EntryEditProps) {
  return <EntryEditDraft key={draft.doc.guid} draft={draft} />
}
