import {schema} from '.alinea'
import {PasswordLessLogin} from '@alinea/auth.passwordless/PasswordLessLogin'
import {Entry, EntryOf} from '@alinea/core'
import Dashboard, {BrowserPreview} from '@alinea/dashboard'

/*
const Dashboard: typeof import('@alinea/dashboard')['default'] = dynamic(
  () => import('@alinea/dashboard'),
  {
    ssr: false
  }
) as any*/

function Preview(entry: Entry) {
  return <BrowserPreview url={`/api/preview?${entry.url}`} />
}

export default function Admin() {
  return (
    <div suppressHydrationWarning>
      {process.browser && (
        <Dashboard<EntryOf<typeof schema>>
          name="web"
          schema={schema}
          apiUrl="/api/cms"
          auth={PasswordLessLogin}
          preview={Preview}
        />
      )}
    </div>
  )
}
