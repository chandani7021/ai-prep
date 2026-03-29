"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7; // 7 days in milliseconds

export async function signup(params: SignUpParams) {
	const { uid, name, email } = params;

	try {
		// const userRecord = await db.collection('users').doc(uid).get()
		const userRecord = await db.collection("users").doc(uid).get();
		if (userRecord.exists) {
			return {
				success: false,
				message: "Email already in use. Please sign in instead.",
			};
		}
		await db.collection("users").doc(uid).set({
			name,
			email,
			createdAt: new Date(),
		});
		return {
			success: true,
			message: "User signed up successfully, Please sign in.",
		};
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
		maxAge: ONE_WEEK,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		path: "/",
		sameSite: "lax",
	})
}


export async function getCurrentUser():Promise<User | null> {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("session")?.value;

	if (!sessionCookie) {
		return null;
	}

	try {
		const decodedClaims = await auth.verifySessionCookie(sessionCookie , true);
		const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

		if (!userRecord.exists) {
			return null;
		}
		return {
			...userRecord.data(),
			id: userRecord.id,
		} as User;

	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}


export async function isAuthenticated() {
	const user = await getCurrentUser();
	return !!user;
}

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
	const interview = await db.collection("interviews")
	.where("userId", "==", userId)
	.orderBy("createdAt", "desc")
	.get();

	return interview.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Interview[];

}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
	const { userId, limit = 20 } = params;
	const interview = await db.collection("interviews")
	.orderBy("createdAt", "desc")
	.where("finalized", "==", true)
	.where("userId", "!=", userId)
	.limit(limit)
	.get();

	return interview.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Interview[];

}