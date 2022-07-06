import {fromModule, HStack, px, VStack} from '@alinea/ui'
import {IcRoundLanguage} from '@alinea/ui/icons/IcRoundLanguage'
import {IcRoundOpenInNew} from '@alinea/ui/icons/IcRoundOpenInNew'
import {IcRoundSearch} from '@alinea/ui/icons/IcRoundSearch'
import {MdiSourceBranch} from '@alinea/ui/icons/MdiSourceBranch'
import {IcRoundFastForward} from '../icons/IcRoundFastForward'
import {IcRoundPeopleOutline} from '../icons/IcRoundPeopleOutline'
import {MdiLanguageTypescript} from '../icons/MdiLanguageTypescript'
import {Blocks} from './blocks/Blocks'
import css from './HomePage.module.scss'
import {HomePageSchema} from './HomePage.schema'
import {Feature, Features} from './layout/Features'
import {Hero} from './layout/Hero'
import {Layout} from './layout/Layout'
import {WebTypo} from './layout/WebTypo'

const styles = fromModule(css)

export function HomePage(props: HomePageSchema) {
  return (
    <div className={styles.root()}>
      <HomePageHero {...props} />

      <section className={styles.root.features()}>
        <Layout.Container>
          <Features>
            <Feature icon={MdiSourceBranch}>
              <WebTypo>
                <WebTypo.H2>Git-based</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  Content is version controlled in git, without editors needing
                  any git knowledge
                </WebTypo.P>
              </WebTypo>
            </Feature>
            <Feature icon={MdiLanguageTypescript}>
              <WebTypo>
                <WebTypo.H2>Fully typed</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  Typescript users get a type-safe experience working with data
                </WebTypo.P>
              </WebTypo>
            </Feature>
            <Feature icon={IcRoundFastForward}>
              <WebTypo>
                <WebTypo.H2>Zero network overhead</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  Content is easily queryable through an in-memory SQLite
                  database
                </WebTypo.P>
              </WebTypo>
            </Feature>
            <Feature icon={IcRoundPeopleOutline}>
              <WebTypo>
                <WebTypo.H2>Collaborative</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  The editing experience is built on Y.js primitives, allowing
                  multiple editors to collaborate without merge conflicts
                </WebTypo.P>
              </WebTypo>
            </Feature>
            <Feature icon={IcRoundLanguage}>
              <WebTypo>
                <WebTypo.H2>Internationalization</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  Publish content in multiple languages and regions
                </WebTypo.P>
              </WebTypo>
            </Feature>
            <Feature icon={IcRoundSearch}>
              <WebTypo>
                <WebTypo.H2>Full text search</WebTypo.H2>
                <WebTypo.P className={styles.root.features.desc()}>
                  Search through content using SQlite's FTS5
                </WebTypo.P>
              </WebTypo>
            </Feature>
          </Features>
        </Layout.Container>
      </section>

      {/*

        I think below we should highlight in separate (interactive) sections:
        - config as code => preview how to build a schema
        - live previews
        - query engine
        - custom fields
        - the editing/dashboard experience
        - deploy "anywhere": node or edge deploys

       */}

      <Blocks blocks={props.blocks} container={Layout.Container} />
    </div>
  )
}

function HomePageHero({headline, byline, action, screenshot}: HomePageSchema) {
  return (
    <div className={styles.hero()}>
      <Hero>
        <Layout.Container>
          <VStack center>
            <Hero.Title>{headline}</Hero.Title>
            <Hero.ByLine>{byline}</Hero.ByLine>
            <HStack
              wrap
              center
              gap={24}
              justify="center"
              style={{paddingTop: px(20)}}
            >
              {action?.url && (
                <Hero.Action href={action.url}>{action.label}</Hero.Action>
              )}
              <WebTypo.Link
                className={styles.hero.demo()}
                href="/demo"
                target="_blank"
              >
                <HStack center gap={8}>
                  <span>Try the demo</span>
                  <IcRoundOpenInNew />
                </HStack>
              </WebTypo.Link>
            </HStack>
          </VStack>
        </Layout.Container>
      </Hero>

      {/*screenshot && (
        <div className={styles.hero.screenshot()}>
          <Image
            src={screenshot.src}
            width={screenshot.width}
            height={screenshot.height}
            sizes="700px"
            className={styles.hero.screenshot.inner()}
          />
        </div>
      )*/}
    </div>
  )
}
