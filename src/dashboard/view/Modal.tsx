import {Dialog} from '@headlessui/react'
import {IconButton} from 'alinea/dashboard/view/IconButton'
import {IcRoundClose} from 'alinea/ui/icons/IcRoundClose'
import {fromModule} from 'alinea/ui/util/Styler'
import {ComponentPropsWithoutRef, PropsWithChildren, useRef} from 'react'
import css from './Modal.module.scss'

const styles = fromModule(css)

export type ModalProps = PropsWithChildren<
  {
    open?: boolean
    onClose: () => void
    className?: string
  } & ComponentPropsWithoutRef<typeof Dialog>
>
export function Modal({children, ...props}: ModalProps) {
  const modalRef = useRef(null)

  return (
    <Dialog
      {...props}
      open={Boolean(props.open)}
      ref={modalRef}
      initialFocus={modalRef}
      className={styles.root({open: props.open})}
    >
      <div className={styles.root.background()} onClick={props.onClose}></div>
      <Dialog.Panel className={styles.root.inner.mergeProps(props)()}>
        {children}
        <IconButton
          className={styles.root.inner.close()}
          size={18}
          icon={IcRoundClose}
          onClick={props.onClose}
        />
      </Dialog.Panel>
    </Dialog>
  )
}
