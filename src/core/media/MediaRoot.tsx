import IcRoundPermMedia from 'alinea/ui/icons/IcRoundPermMedia'
import {Meta} from '../Meta.js'
import {PageSeed, page} from '../Page.js'
import {Root, root} from '../Root.js'
import {MediaLibrary} from './MediaSchema.js'

export type MediaRoot<Children extends Record<string, PageSeed>> =
  Root<Children>

export const mediaRootId = Symbol.for('@alinea/mediaRoot')

export function isMediaRoot(
  root: any
): root is MediaRoot<Record<string, PageSeed>> {
  return Boolean(root[mediaRootId])
}

export function defaultLibrary(): Record<string, PageSeed> {
  return {
    media: page(
      MediaLibrary({
        title: 'Media library'
      })
    )
  }
}

export function createMediaRoot<Children extends Record<string, PageSeed>>(
  children: Children = defaultLibrary() as Children
) {
  return root('Media', {
    ...children,
    [Meta]: {
      icon: IcRoundPermMedia,
      contains: ['MediaLibrary']
    },
    [mediaRootId]: true
  }) as any as MediaRoot<Children>
}
