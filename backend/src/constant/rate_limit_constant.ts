import { minutes } from "@nestjs/throttler";
export const LLIMIT = 3
export const LTTL = 60000
export const SLIMIT = 3
export const STTL = minutes(5)
