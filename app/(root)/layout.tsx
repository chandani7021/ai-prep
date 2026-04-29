import { isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const RootLayout = async({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
	console.log("isUserAuthenticated", isUserAuthenticated);
	if (!isUserAuthenticated) redirect("/sign-in");

	return (
		<div className="root-layout">
			<nav className="flex items-center justify-between pb-8 border-b border-white/5">
				<Link href="/" className="flex items-center gap-3 group">
					<div className="p-2 rounded-xl bg-primary-200/10 border border-primary-200/20 group-hover:bg-primary-200/20 transition-colors">
						<Image src="/logo.svg" alt="Logo" height={28} width={28} />
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-primary-100 transition-colors">Interview <span className="text-primary-200">Prep</span></h2>
				</Link>
			</nav>
			{children}
		</div>
	);
};

export default RootLayout;
