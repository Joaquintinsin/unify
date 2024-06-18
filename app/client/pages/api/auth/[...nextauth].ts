import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    session: {
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account }: any) {
            if (account.provider === "google") {
                const { name, email, image } = user;
                try {
                    const res = await fetch(`${process.env.BACKEND_URL}/api/users`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: name,
                            email: email,
                            profilePicture: image,
                        }),
                    });

                    console.log("res", res);

                    if (res.status === 409) {
                        return true;
                    }

                    if (!res.ok) {
                        throw new Error("Failed to create user");
                    }

                    return true;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                    return false;
                }
            }

            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + "/chat";
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
});
