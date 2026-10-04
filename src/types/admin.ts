import type { Department } from './queue'

export interface AdminProfile {
  id: string
  email: string
  username: string
  display_name: string
  role: string
  department: Department
  is_active: boolean
}
