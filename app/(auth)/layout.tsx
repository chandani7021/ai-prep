import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
		console.log("isUserAuthenticated auth", isUserAuthenticated);
		if (isUserAuthenticated) redirect("/");

	return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
