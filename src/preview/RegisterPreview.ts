import {PreviewUpdate} from 'alinea/backend/Resolver'
import {PreviewAction, PreviewMessage} from 'alinea/preview/PreviewMessage'

export interface PreviewApi {
  preview(update: PreviewUpdate): Promise<void>
  setIsPreviewing(isPreviewing: boolean): void
}

export function registerPreview(api: PreviewApi) {
  if (typeof window === 'undefined') return
  function handleMessage(event: MessageEvent<PreviewMessage>) {
    if (!event.data || typeof event.data !== 'object') return
    const message = event.data as PreviewMessage
    switch (message.action) {
      case PreviewAction.Preview:
        console.log('[Alinea preview received]')
        api.preview(message)
        return
      case PreviewAction.Reload:
        console.log('[Alinea preview reload received]')
        return location.reload()
      case PreviewAction.Previous:
        console.log('[Alinea preview previous received]')
        return history.back()
      case PreviewAction.Next:
        console.log('[Alinea preview next received]')
        return history.forward()
      case PreviewAction.Ping:
        console.log('[Alinea preview ping received]')
        api.setIsPreviewing(true)
        return window.parent.postMessage(
          {action: PreviewAction.Pong},
          event.origin
        )
    }
  }
  if (window.location != window.parent.location) {
    // On first load send a pong because we might have missed ping,
    // this can warn in the console but it seems we cannot catch it
    window.parent.postMessage({action: PreviewAction.Pong}, document.referrer)
    addEventListener('message', handleMessage)
    console.log('[Alinea preview listener attached]')
  }
  return () => {
    removeEventListener('message', handleMessage)
  }
}
