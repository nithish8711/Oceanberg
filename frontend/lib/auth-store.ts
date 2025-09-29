export type Role = "user" | "admin" | "analytics"

export type UserRecord = {
  id: string
  name: string
  state: string
  district: string
  email: string
  password: string
  role: Role
}

// Seed demo users for testing and role-based redirects
const users: UserRecord[] = [
  {
    id: "1",
    name: "Standard User",
    state: "KA",
    district: "Bengaluru",
    email: "user@example.com",
    password: "user123",
    role: "user",
  },
  {
    id: "2",
    name: "Admin User",
    state: "KA",
    district: "Mysuru",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "3",
    name: "Analytics User",
    state: "KL",
    district: "Kochi",
    email: "analytics@example.com",
    password: "analytics123",
    role: "analytics",
  },
]

export function getUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function verifyUser(email: string, password: string) {
  const u = getUserByEmail(email)
  if (!u) return null
  return u.password === password ? u : null
}

export function addUser(input: Omit<UserRecord, "id" | "role"> & { role?: Role }) {
  if (getUserByEmail(input.email)) {
    throw new Error("User already exists")
  }
  const newUser: UserRecord = {
    id: String(Date.now()),
    role: input.role ?? "user",
    name: input.name,
    state: input.state,
    district: input.district,
    email: input.email,
    password: input.password,
  }
  users.push(newUser)
  return newUser
}
