import postgres from "postgres"

import { env } from "@/env"

const sql = postgres(env.DATABASE_URL)

export default sql
