export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/appointments/:path*", "/notices/:path*"],
};
