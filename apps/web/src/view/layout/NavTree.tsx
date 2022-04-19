import {fromModule, HStack, px} from '@alinea/ui'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {Fragment, useMemo, useState} from 'react'
import {MdKeyboardArrowDown, MdKeyboardArrowRight} from 'react-icons/md'
import css from './NavTree.module.scss'

const styles = fromModule(css)

function nestNav<T extends {id: string; parent: string | undefined}>(
  pages: Array<T>
) {
  type Page = T & {children: Array<Page>}
  const res: Array<Page> = []
  const root = new Map<string, Page>(
    pages.map(page => [page.id, {...page, children: []}])
  )
  for (const page of pages) {
    if (!root.has(page.parent!)) {
      res.push(root.get(page.id)!)
    } else {
      root.get(page.parent!)!.children.push(root.get(page.id)!)
    }
  }
  return res
}

export function useNavTree(
  nav: Array<Omit<NavItem, 'children'> & {parent: string | undefined}>
) {
  return useMemo(() => nestNav(nav), [nav])
}

type NavItem = {
  id: string
  url: string
  type: string
  title: string
  children: Array<NavItem>
}

export type NavTreeProps = {
  nav: Array<NavItem>
  level?: number
  open?: boolean
}

export function NavTree({nav, level = 0, open = true}: NavTreeProps) {
  const router = useRouter()
  const [showChildren, setShowChildren] = useState(level < 1)
  return (
    <div className={styles.root({open})}>
      {nav.map(page => {
        const isContainer = page.children.length > 0
        return (
          <Fragment key={page.id}>
            {isContainer ? (
              <div className={styles.root.sub()}>
                {level === 0 ? (
                  <h2 className={styles.root.sub.header()}>{page.title}</h2>
                ) : (
                  <HStack
                    center
                    gap={8}
                    className={styles.root.link({category: true})}
                    onClick={e => {
                      e.preventDefault()
                      setShowChildren(!showChildren)
                    }}
                  >
                    <span>{page.title}</span>
                    {showChildren ? (
                      <MdKeyboardArrowDown />
                    ) : (
                      <MdKeyboardArrowRight />
                    )}
                  </HStack>
                )}
                <div style={{paddingLeft: px(level * 10)}}>
                  <NavTree
                    nav={page.children}
                    level={level + 1}
                    open={showChildren}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Link href={page.url}>
                  <a
                    className={styles.root.link({
                      active: router.asPath === page.url
                    })}
                  >
                    {page.title}
                  </a>
                </Link>
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}