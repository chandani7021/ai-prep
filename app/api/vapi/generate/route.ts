import { db } from '@/firebase/admin';
import { getRandomInterviewCover } from '@/lib/utils';
import { google } from '@ai-sdk/google'
import { generateText } from "ai"

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!'}, { status: 200 });
}


export async function POST(request: Request) {
    const { type, role, level, techstack, amount, userid} = await request.json();

    try {

        const { text: questions } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `Prepare questions for a jon interview.
            The job role is ${role}.
            The experience level is ${level}.
            The tech stack is ${techstack}.
            The focus between behavioural and technical questions should lean towards: ${type}.
            The number of questions should be around ${amount}.
            Please return only the questions, without any additional text.
            the questions are going to be read by a voice assistent so do not use "/" or any other special characters.
            Return the questions formatted like this:
            ["Question 1",
            "Question 2",
            "Question 3",
            ]
            Thank you! <3
            `
        })

        const interview = { 
            role, type , level, 
            techstack: techstack.split(','),
            questions: JSON.parse(questions),
            userid: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        }

        await db.collection('interviews').add(interview)

        return Response.json({ success: true, data: interview }, { status: 200 });
    } catch (error) {
        console.error(error)

        return Response.json({ success: false, message: 'An error occurred while processing your request.' }, { status: 500 }); 
    }

}