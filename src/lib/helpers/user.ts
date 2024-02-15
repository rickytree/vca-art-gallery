export const user_object_mapper = (userArray: any[]) => {
  let mappedUsers: User[] = userArray.map((user: any) => {
    return {
      id: user.id.toString(),
      name: user.name,
      avatar: user.cover ?? null,
      bio: user.description ?? null,
      website: user.website ?? null,
      ethereum: user.ethereum ?? null,
      tezos: user.tezos ?? null,
      role: user.role ? [user.role] : ['artist'],
    }
  })

  return mappedUsers
}

// transform the results returned from GET_ROLE_BY_ETH_ADDRESS
// and returns an array of roles user is assigned to in our db
export const get_user_role_array = (result: any) => {
  let user_roles: string[] = []

  result.forEach((roleItem: any) => {
    let role = roleItem.role

    if (role) {
      user_roles = [...user_roles, role]
    }
  })

  return user_roles
}
