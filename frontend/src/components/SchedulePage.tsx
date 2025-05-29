import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from "axios"


interface MeetingInfo {
    startTime: string;
    endTime: string;
    meetUrl: string;
    calendarEvent: string;
}

function SchedulePage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [attendees, setAttendees] = useState('');
    const [sendInvites, setSendInvites] = useState(true);
    const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Combine date and time
            const startDateTime = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                parseInt(startTime.split(':')[0]),
                parseInt(startTime.split(':')[1])
            );

            const endDateTime = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                parseInt(endTime.split(':')[0]),
                parseInt(endTime.split(':')[1])
            );

            // Validate time
            if (startDateTime >= endDateTime) {
                throw new Error('End time must be after start time');
            }

            const response = await axios.post('http://localhost:5000/api/schedule-meeting', {
                title,
                description,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                timezone,
                attendees: attendees.split(',').map(e => e.trim()).filter(e => e),
                sendInvites
            });

            const data = response.data;
            setMeetingInfo(data);
            // Clear all input states after successful meeting scheduling
            setTitle('');
            setDescription('');
            setDate(new Date());
            setStartTime('09:00');
            setEndTime('10:00');
            setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
            setAttendees('');
            setSendInvites(true);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error('Scheduling error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">Schedule Google Meet</h1>

            {loading ? (
                <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                    <div>
                        <Label htmlFor="title">Meeting Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Team meeting"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Meeting agenda..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(day) => day && setDate(day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label>Start Time *</Label>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label>End Time *</Label>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                            id="timezone"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="attendees">Attendees (comma separated emails)</Label>
                        <Input
                            id="attendees"
                            value={attendees}
                            onChange={(e) => setAttendees(e.target.value)}
                            placeholder="user1@example.com, user2@example.com"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="sendInvites"
                            checked={sendInvites}
                            onChange={(e) => setSendInvites(e.target.checked)}
                            className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor="sendInvites">Send calendar invites to attendees</Label>
                    </div>

                    {error && (
                        <div className="text-red-500 p-3 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-6 text-sm cursor-pointer font-sans"
                        disabled={loading}
                    >
                        {loading ? 'Scheduling...' : 'Schedule Meeting'}
                    </Button>
                </form>
            )}

            {meetingInfo && (
                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">Meeting Scheduled!</h2>

                    <div className="space-y-3">
                        <p>
                            <span className="font-medium">Title:</span> {title}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span> {format(new Date(meetingInfo.startTime), 'PPP')}
                        </p>
                        <p>
                            <span className="font-medium">Time:</span> {format(new Date(meetingInfo.startTime), 'p')} - {format(new Date(meetingInfo.endTime), 'p')}
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <a
                            href={meetingInfo.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            <span className="font-medium">Google Meet Link:</span> {meetingInfo.meetUrl}
                        </a>

                        <a
                            href={meetingInfo.calendarEvent}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            <span className="font-medium">Calendar Event:</span> View in Google Calendar
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchedulePage;