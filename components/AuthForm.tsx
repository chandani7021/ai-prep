"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase/client";
import { signin, signup } from "@/lib/actions/auth.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const authFormSchema = (type: FormType) => {
	return z.object({
		name:
			type === "sign-up"
				? z
						.string()
						.min(5, "name must be at least 5 characters.")
						.max(32, "name must be at most 32 characters.")
				: z.string().optional(),
		email: z.email("Please enter a valid email address."),
		password: z.string().min(8, "Password must be at least 8 characters."),
	});
};

export const AuthForm = ({ type }: { type: FormType }) => {
	const formSchema = authFormSchema(type);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			if (type === "sign-up") {
          const { name, email, password } = data;
          // Call your sign-up API with name, email, and password
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const res = await signup({
            uid: userCredential.user.uid,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            name: name!,
            email,
            password,
          })

          if (!res?.success) {
            toast.error(res?.message);
            return;
          }
				toast.success("Account created successfully! Please sign in.");
				router.push("/sign-in");
			} else {

        const { email, password } = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Failed to retrieve ID token. Please try again.");
          return;
        }
        await signin({ email, idToken });

				toast.success("Signed in successfully!");
				router.push("/");
			}
		} catch (error) {
			console.log(error);
			toast.error(`An error occurred: ${error}`);
		}
	}

	const isSignIn = type === "sign-in";

	return (
		<div className="card-border lg:min-w-141.5">
			<Card className="w-full  ">
				<div className="flex flex-col items-center justify-center p-4 gap-6">
					<div className="flex flex-row gap-2 justify-center">
						<Image src="/logo.svg" alt="Logo" height={32} width={32} />
						<h2 className="text-2xl font-bold">Interview Prep</h2>
					</div>
					<h3 className="text-2xl font-bold">Prep for your job Interview</h3>
				</div>
				<CardHeader>
					<CardTitle>{isSignIn ? "Sign In" : "Sign Up"}</CardTitle>
					<CardDescription>
						{isSignIn ? "Sign in to your account." : "Create a new account."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							{!isSignIn && (
								<Controller
									name="name"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="form-rhf-demo-Name">Name</FieldLabel>
											<Input
												{...field}
												id="form-rhf-demo-Name"
												aria-invalid={fieldState.invalid}
												placeholder="Enter your Name"
												autoComplete="off"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							)}
							<Controller
								name="email"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-rhf-demo-email">Email</FieldLabel>
										<Input
											{...field}
											id="form-rhf-demo-email"
											aria-invalid={fieldState.invalid}
											placeholder="Enter your Email"
											autoComplete="off"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-rhf-demo-password">
											Password
										</FieldLabel>
										<Input
											{...field}
											id="form-rhf-demo-password"
											aria-invalid={fieldState.invalid}
											placeholder="Enter Password"
											autoComplete="off"
											type="password"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter>
					<Field orientation="vertical">
						<Button type="submit" form="form-rhf-demo" className="btn">
							{isSignIn ? "Sign In" : "Sign Up"}
						</Button>
						<p className="text-center">
							{isSignIn
								? "Don't have an account?"
								: "Already have an account? "}{" "}
							<Link
								href={!isSignIn ? "/sign-in" : "/sign-up"}
								className="font-bold text-user-primary ml-1"
							>
								{!isSignIn ? "Sign In" : "Sign Up"}
							</Link>
						</p>
					</Field>
				</CardFooter>
			</Card>
		</div>
	);
};
