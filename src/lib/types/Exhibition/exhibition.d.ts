type Exhibition = {
  id: number
  v2_id?: string
  cover_image?: string
  title: string
  curator?: User[]
  description: string
  start_date: string
  end_date?: string
  location?: string
  slug: string
  sponsors?: User[]
  sub_event: boolean
  event_url: string
}
