import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import admin from "@/lib/data/admin.json";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (
          credentials?.email === admin.email &&
          credentials?.password === admin.password
        ) {
          return {
            id: "admin-1",
            email: admin.email,
            name: admin.name,
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
});
