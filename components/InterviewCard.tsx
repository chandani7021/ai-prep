import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DisplayTechStack from "./DisplayTechStack";
import { Button } from "./ui/button";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
	id,
	userId,
	role,
	type,
	techstack,
	createdAt,
}: InterviewCardProps) => {
	const feedback =  userId && id ? await getFeedbackByInterviewId({ interviewId: id, userId }) : null;
	const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
	const formattedDate = dayjs(
		feedback?.createdAt || createdAt || new Date(),
	).format("MMM D, YYYY");
	return (
		<div className="card-border w-90 max-sm:w-full min-h-96 group transition-all duration-300 hover:shadow-2xl hover:shadow-primary-200/10">
			<div className="card-interview">
				<div className="relative">
					<div className="absolute -top-2 -right-2 w-fit px-3 py-1 rounded-full bg-primary-200 shadow-lg shadow-primary-200/20 z-20">
						<p className="badge-text !text-white text-[10px]">{normalizedType}</p>
					</div>

					<div className="relative size-[100px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary-200/50 transition-colors duration-300">
						<Image
							src={getRandomInterviewCover()}
							alt="cover image"
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					</div>

					<h3 className="mt-6 capitalize text-xl group-hover:text-primary-100 transition-colors duration-300">{role} Interview</h3>

					<div className="flex flex-row gap-5 mt-4">
						<div className="flex flex-row gap-2 items-center text-light-400">
							<Image
								src="/calendar.svg"
								alt="Calendar Icon"
								width={18}
								height={18}
								className="opacity-70"
							/>
							<p className="text-xs font-medium">{formattedDate}</p>
						</div>

						<div className="flex flex-row gap-2 items-center text-light-400">
							<Image src="/star.svg" alt="star" width={18} height={18} className="opacity-70" />
							<p className="text-xs font-medium">{feedback?.totalScore || "---"}</p>
						</div>
					</div>

					<p className="line-clamp-2 mt-6 text-sm text-light-400 leading-relaxed">
						{feedback?.finalAssessment ||
							"No feedback available yet. Please complete the interview to receive feedback."}
					</p>
				</div>

				<div className="flex flex-row justify-between items-center mt-auto pt-6 border-t border-white/5">
					<DisplayTechStack techStack={techstack} />
					<Button className="btn-primary scale-90 origin-right">
						<Link
							href={
								feedback
									? `/interviews/${id}/feedback`
									: `/interviews/${id}`
							}
						>
							{feedback ? "View Feedback" : "Take Interview"}
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default InterviewCard;
