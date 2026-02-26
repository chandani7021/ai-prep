import { auth, db } from "@/firebase/admin";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7 ; // 7 days in milliseconds

export async function signup(params: SignUpParams) {
	const { uid, name, email } = params;

	try {
		// const userRecord = await db.collection('users').doc(uid).get()
		const userRecord = await getDoc(doc(db, "users", uid));
		if (userRecord.exists()) {
			return {
				success: false,
				message: "Email already in use. Please sign in instead.",
			};
		}
		await setDoc(doc(db, "users", uid), {
			name,
			email,
			createdAt: new Date(),
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Error signing up user:", error);
		if (error.code === "auth/email-already-exists") {
			return {
				success: false,
				message: "Email already in use. Please sign in instead.",
			};
		}
		return {
			success: false,
			message: "An error occurred during sign up. Please try again.",
		};
	}
}


export async function signin(params: SignInParams) {
    const { email, idToken } = params;  

    try {
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            return {
                success: false,
                message: "No user found with this email. Please sign up first.",
            };
        }

        await setSessionCookie(idToken);
    }
    catch (error) {
        console.error("Error signing in user:", error);
        return {
            success: false,
            message: "An error occurred during sign in. Please try again.",
        };
    }
}


export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 7 * 1000 }); // 7 days

    cookieStore.set("session", sessionCookie, {
        maxAge : ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    })
}