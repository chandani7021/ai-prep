"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { useRouter } from 'next/navigation';


enum CallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'agent' | 'assistant';
  content: string;
}

const Agent = ({userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => { 
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessssage = (message: Message) => {
      if( message.type === "transcript" && message.transcriptType === "final") {
        // Map Vapi role enum to SavedMessage role
        const roleMap: Record<string, SavedMessage['role']> = {
          'user': 'user',
          'assistant': 'assistant',
          'system': 'system',
          'agent': 'agent',
        };
        const role = roleMap[message.role] || 'agent';
        const newMessage = { role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    }

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.error("Error in call:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessssage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessssage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    }
  }, [])

  useEffect(() => {
    if(callStatus === CallStatus.FINISHED) {
      router.push('/');
    }
  }, [callStatus, router])

const handleCall = async () => {
  setCallStatus(CallStatus.CONNECTING);

  try {
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
    if (!workflowId) throw new Error('Workflow ID not configured');

    await (vapi as any).start(null, null, null, workflowId, {
      variableValues: {
        username: userName,
        userid: userId, 
      }
    });
  } catch (error) {
    console.error('Error:', error);
    setCallStatus(CallStatus.INACTIVE);
  }
}

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    await vapi.stop();
  }

  const lastMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <div className='flex flex-col gap-8'>
    <div className='call-view'>
      <div className='card-interviewer'>
        <div className='avatar'>
          <Image src="/ai-avatar.png" alt="Vapi" className='object-cover' width={64} height={56} />
          { isSpeaking && <span className='animate-speak' /> }
        </div>
        <h3> AI Interviewer</h3>
      </div>

      <div className='card-border'>
        <div className='card-content'>
          <Image src="/user-avatar.png" alt="User Avatar" className='object-cover rounded-full size-30' width={540} height={540} />
          {/* { isSpeaking && <span className='animate-speak' /> } */}
          <h3>{userName}</h3>
        </div>
      </div>
      
    </div>

    {
      messages.length > 0 && (
        <div className='transcript-border'>
          <div className='transcript'>
            <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
              {lastMessage}
            </p>
          </div>
        </div>
      )
    }

    <div className='w-full flex justify-center'>
      {callStatus !== CallStatus.ACTIVE ? (
       
<button type='submit' className='relative btn-call' onClick={handleCall}> <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus!== CallStatus.CONNECTING && 'hidden')} />
        <span>{ isCallInactiveOrFinished ? "Call" : "..."}</span>
</button>
      ): (
        <button type='submit' className='btn-disconnect' onClick={handleDisconnect}>
          End
        </button>
      )}
    </div>
    </div>
  )
}

export default Agent
