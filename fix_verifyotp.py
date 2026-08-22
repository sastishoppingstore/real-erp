#!/usr/bin/env python3
"""VerifyOtp: create a session (set erp_sid cookie) so the user is NOT stranded
on /select-plan unauthenticated. This was the real cause of 'signup ko complete nahi hota / no response'."""
out = []
P = "/opt/erp/api/registrationRouter.ts"
s = open(P, encoding="utf-8").read()

# 1) add imports
anchor_imp = "import { templateEngine } from \"./lib/notifications/templates\";\n"
if anchor_imp in s and "import * as cookie" not in s:
    s = s.replace(anchor_imp, anchor_imp +
        "import * as cookie from \"cookie\";\n"
        "import { Session } from \"@contracts/constants\";\n"
        "import { getSessionCookieOptions } from \"./lib/cookies\";\n"
        "import { signSessionToken } from \"./lib/session\";\n"
        "import { env } from \"./lib/env\";\n", 1)
    out.append("OK   imports")
else:
    out.append("SKIP imports")

# 2) verifyOtp signature -> include ctx
sig = ".input(z.object({ email: z.string().email(), otp: z.string().regex(/^\\d{6}$/), purpose: z.string() }))\n    .mutation(async ({ input }) => {"
if "async ({ input, ctx }) => {\n      const email = normalizeEmail(input.email);" in s:
    out.append("SKIP signature")
elif sig in s:
    s = s.replace(sig, sig.replace("({ input }) =>", "({ input, ctx }) =>"), 1)
    out.append("OK   signature ctx")
else:
    out.append("FAIL signature anchor")

# 3) set session in verifyOtp before return
old = ("      const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });\n"
       "      return { success: true, message: \"Email verified successfully.\", tenantId: user?.tenantId ?? null };")
new = ("      const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });\n"
       "      if (user?.unionId) {\n"
       "        try {\n"
       "          const token = await signSessionToken({ unionId: user.unionId, clientId: env.appId || \"yasco-web\" });\n"
       "          const opts = getSessionCookieOptions(ctx.req.headers);\n"
       "          ctx.resHeaders.append(\n"
       "            \"set-cookie\",\n"
       "            cookie.serialize(Session.cookieName, token, {\n"
       "              httpOnly: opts.httpOnly,\n"
       "              path: opts.path,\n"
       "              sameSite: (opts.sameSite?.toLowerCase() as \"lax\" | \"none\") || \"lax\",\n"
       "              secure: opts.secure,\n"
       "              maxAge: Session.maxAgeMs / 1000,\n"
       "            }),\n"
       "          );\n"
       "        } catch (e) { console.warn(\"[verifyOtp] session issue:\", String(e)); }\n"
       "      }\n"
       "      return { success: true, message: \"Email verified successfully.\", tenantId: user?.tenantId ?? null };")
if new.split("\n")[0] in s:
    out.append("SKIP session-block")
elif old in s:
    s = s.replace(old, new, 1)
    out.append("OK   session-block")
else:
    out.append("FAIL session-block anchor\n----OLD----\n" + old[:400])

open(P, "w", encoding="utf-8").write(s)
print("\n".join(out))
