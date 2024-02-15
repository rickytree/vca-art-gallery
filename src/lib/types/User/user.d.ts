type User = {
  id: string
  name: string
  avatar?: string
  bio?: string
  website?: string
  ethereum?: string
  tezos?: string
  role: ('artist' | 'curator' | 'sponsor')[]
}
