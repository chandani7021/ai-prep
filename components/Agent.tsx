import Image from 'next/image'
import { cn } from '@/lib/utils';


enum CallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  CONNECTED = 'CONNECTED',
  FINISHED = 'FINISHED',
}

const Agent = ({userName}: AgentProps) => {
  const callStatus = CallStatus.FINISHED
  const isSpeaking = true; // This should be dynamic based on the agent's state
  const messages = [
    'What is your name?',
    'My name is Vapi, your virtual interviewer.',
  ]
  const lastMessage = messages[messages.length - 1];
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
      {callStatus !== 'ACTIVE' ? (
       
<button type='submit' className='relative btn-call'> <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus!== 'CONNECTING' && 'hidden')} />
        <span>{callStatus === 'INACTIVE' || callStatus === 'FINISHED'? "Call" : "..."}</span>
</button>
      ): (
        <button type='submit' className='btn-disconnect'>
          End
        </button>
      )}
    </div>
    </div>
  )
}

export default Agent
