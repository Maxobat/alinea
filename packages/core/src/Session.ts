import {Hub} from './Hub'
import {User} from './User'

export interface Session {
  hub: Hub
  user: User
  logout?: () => Promise<void>
}