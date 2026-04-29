import { db } from '@/firebase/admin';
import { getRandomInterviewCover } from '@/lib/utils';
import { google } from '@ai-sdk/google'
import { generateText } from "ai"

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!'}, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Received generation request:", JSON.stringify(body, null, 2));

        // Handle both flat JSON and Vapi tool call structure
        let data = body;
        if (body.message?.toolCalls?.[0]?.function?.arguments) {
            data = body.message.toolCalls[0].function.arguments;
        } else if (body.toolCall?.function?.arguments) {
             data = body.toolCall.function.arguments;
        }

        const { type, role, level, techstack, amount, userid } = data;

        if (!role || !techstack || !userid) {
            return Response.json({ success: false, message: 'Missing required fields: role, techstack, or userid' }, { status: 400 });
        }

        const { text: questionsRaw } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `Prepare questions for a job interview.
            The job role is ${role}.
            The experience level is ${level}.
            The tech stack is ${techstack}.
            The focus between behavioural and technical questions should lean towards: ${type}.
            The number of questions should be around ${amount}.
            Please return only a JSON array of strings. Do not include any markdown formatting, backticks, or additional text.
            Example: ["Question 1", "Question 2"]
            The questions are going to be read by a voice assistant so do not use "/" or any other special characters.
            `
        });

        // Clean Gemini response in case it still includes markdown or backticks
        const cleanedQuestions = questionsRaw.replace(/```json/g, '').replace(/```/g, '').trim();
        let questionsArray;
        try {
            questionsArray = JSON.parse(cleanedQuestions);
        } catch (e) {
            console.error("Failed to parse questions JSON:", cleanedQuestions);
            // Fallback: split by lines if it's not JSON
            questionsArray = cleanedQuestions.split('\n').filter(q => q.trim().length > 0);
        }

        const interview = { 
            role, 
            type: type || 'Technical', 
            level: level || 'Junior', 
            techstack: Array.isArray(techstack) ? techstack : techstack.split(',').map((s: string) => s.trim()),
            questions: questionsArray,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('interviews').add(interview);
        console.log("Interview generated successfully with ID:", docRef.id);

        return Response.json({ 
            success: true, 
            data: { id: docRef.id, ...interview },
            // Vapi expects a specific response structure for tool calls
            results: [{ toolCallId: body.message?.toolCalls?.[0]?.id, result: "Interview generated successfully" }]
        }, { status: 200 });

    } catch (error) {
        console.error("Error generating interview:", error);
        return Response.json({ success: false, message: 'An error occurred while processing your request.' }, { status: 500 }); 
    }
}