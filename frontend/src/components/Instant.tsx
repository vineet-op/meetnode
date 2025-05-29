import { useState } from 'react'
import { Button } from './ui/button'
import axios from "axios";
import { Skeleton } from './ui/skeleton';

const Instant = () => {
    const [meetingLink, setMeetingLink] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const GenerateLink = async () => {
        try {
            setLoading(true)
            const response = await axios.post('http://localhost:5000/api/instant-meet')
            console.log(response.data)
            setMeetingLink(response.data.meetUrl)
        } catch (error) {
            console.error('Error generating meeting link:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-screen h-screen flex flex-col justify-center items-center space-y-6'>
            <Button
                onClick={GenerateLink}
                disabled={loading}
                className='font-sans text-md px-6 py-4 bg-blue-500 hover:bg-blue-600 transition-colors duration-300 cursor-pointer'>
                {loading ? 'Generating...' : 'Generate Instant Meet'}
            </Button>

            {loading && (
                <div className='bg-gray-100 p-6 rounded-lg shadow-md max-w-md w-full'>
                    <Skeleton className='h-6 w-3/4 mb-4' />
                    <Skeleton className='h-12 w-full' />
                </div>
            )}

            {meetingLink && !loading && (
                <div className='bg-gray-100 p-6 rounded-lg shadow-md max-w-md w-full'>
                    <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                        Your Meeting Link
                    </h2>
                    <div className='bg-white p-3 rounded border border-gray-200 break-words'>
                        <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='text-blue-600 hover:underline'
                        >
                            {meetingLink}
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Instant