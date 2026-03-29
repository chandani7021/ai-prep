import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getInterviewByUserId, getLatestInterviews } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";

const page = async () => {
	const user = await getCurrentUser();
	const [userInterviews, latestInterviews] = await Promise.all([
		await getInterviewByUserId(user?.id || ""),
		await getLatestInterviews({ userId: user?.id || "" }),
	]);
	const hasPastInterviews = userInterviews && userInterviews.length > 0;
	const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;

	return (
		<>
			<section className="card-cta">
				<div className="flex flex-col gap-6 max-w-lg">
					<h2>Get Interview Ready with AI powered practice and feedback</h2>
					<p className="text-lg">
						Practice on real interview and get instant feedback
					</p>
					<Button asChild className="btn-primary">
						<Link href="/sign-up">Start an Interview</Link>
					</Button>
				</div>

				<Image
					src="/robot.png"
					alt="Robot Image"
					width={400}
					height={400}
					className="max-sm:hidden"
				/>
			</section>

			<section className="flex flex-col gap-6 mt-6">
				<h2>Your Interviews</h2>

				<div className="interviews-section">
					{ hasPastInterviews ? (
						userInterviews.map((interview) => (
							<InterviewCard key={interview.id} {...interview} />
						))
					) : (
						<p>You haven&apos;t taken any interviews yet.</p>
					)}
				</div>
			</section>

			<section className="flex flex-col gap-6 mt-8">
				<h2>Take an Interview</h2>

				<div className="interviews-section">
					{hasUpcomingInterviews ? (
						latestInterviews.map((interview) => (
							<InterviewCard key={interview.id} {...interview} />
						))
					) : (
						<p>There are no upcoming interviews available.</p>
					)}
				</div>
			</section>
		</>
	);
};

export default page;
