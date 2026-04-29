import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewByUserId, getLatestInterviews } from "@/lib/actions/general.action";
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
			<section className="card-cta relative overflow-hidden group">
				<div className="flex flex-col gap-8 max-w-2xl z-10">
					<h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
						Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-primary-100">Interview Performance</span> with AI
					</h1>
					<p className="text-xl text-light-100 max-w-md leading-relaxed">
						Master your next interview with real-time AI feedback, personalized practice, and deep performance insights.
					</p>
					<div className="flex gap-4">
						<Button asChild className="btn-primary !min-h-14 !px-10 !text-lg">
							<Link href="/interview">Start Practice</Link>
						</Button>
						<Button asChild className="btn-secondary !min-h-14 !px-10 !text-lg">
							<Link href="/interviews">View History</Link>
						</Button>
					</div>
				</div>

				<div className="relative max-sm:hidden">
					<div className="absolute inset-0 bg-primary-200/20 blur-[100px] rounded-full animate-pulse" />
					<Image
						src="/robot.png"
						alt="AI Assistant"
						width={450}
						height={450}
						className="relative z-10 transition-transform duration-700 group-hover:scale-105"
					/>
				</div>
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
