// middleware.ts (Root directory)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Define which routes are PROTECTED (require login)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/solve(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user hits a protected route, trigger Clerk's protection logic
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}