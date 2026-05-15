import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" } // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;
        const action = credentials.action;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Get users from localStorage (simulated database)
        const usersDB = JSON.parse(localStorage.getItem('gym_ai_users') || '{}');
        
        if (action === 'register') {
          // Check if user exists
          if (usersDB[email]) {
            throw new Error('Email already registered');
          }
          
          // Create new user
          usersDB[email] = {
            email,
            password, // In production, hash this!
            createdAt: new Date().toISOString(),
            profile: null, // Will store goal, daysPerWeek, etc.
            workoutPlans: []
          };
          
          localStorage.setItem('gym_ai_users', JSON.stringify(usersDB));
          
          return {
            id: email,
            email,
            name: email.split('@')[0],
            isNewUser: true
          };
        } else {
          // Login
          const user = usersDB[email];
          if (!user) {
            throw new Error('User not found');
          }
          
          if (user.password !== password) {
            throw new Error('Incorrect password');
          }
          
          return {
            id: email,
            email,
            name: user.name || email.split('@')[0],
            profile: user.profile,
            workoutPlans: user.workoutPlans
          };
        }
      }
    }),
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.profile = (user as any).profile;
        token.workoutPlans = (user as any).workoutPlans;
        token.isNewUser = (user as any).isNewUser;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).profile = token.profile;
      (session as any).workoutPlans = token.workoutPlans;
      (session as any).isNewUser = token.isNewUser;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };