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
		<div className="card-border w-90 max-sm:w-full min-h-96">
			<div className="card-interview">
				<div>
					<div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
						<p className="badge-text">{normalizedType}</p>
					</div>

					<Image
						src={getRandomInterviewCover()}
						alt="cover image"
						width={90}
						height={90}
						className="rounded-full object-fit size=[90px]"
					/>

					<h3 className="mt-5 capitalize">{role} Interview</h3>

					<div className="flex flex-row gap-5 mt-3">
						<div className="flex flex-row gap-2">
							<Image
								src="/calendar.svg"
								alt="Calendar Icon"
								width={22}
								height={22}
							/>
							<p className="text-sm">{formattedDate}</p>
						</div>

						<div className="flex flex-row gap-2">
							<Image src="/star.svg" alt="star" width={22} height={22} />
							<p className="text-sm">{feedback?.totalScore || "---"}</p>
						</div>
					</div>

					<p className="line-clamp-2 mt-5">
						{feedback?.finalAssessment ||
							"No feedback available yet. Please complete the interview to receive feedback."}
					</p>
				</div>

				<div className="flex flex-row justify-between">
					<DisplayTechStack techStack={techstack} />
					<Button className="btn-primary">
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
