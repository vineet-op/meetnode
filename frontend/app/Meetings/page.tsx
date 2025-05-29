"use client"

import { useState } from "react"
import { Clock, Video, CalendarDays, Copy, ExternalLink, Check, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import axios from "axios"


interface GeneratedLinks {
    meetUrl: string
    calendarEvent?: string
    eventId: string
    startTime?: string
    endTime?: string
}

interface MeetingInfo {
    startTime: string
    endTime: string
    meetUrl: string
    calendarEvent: string
}

export default function Meetings() {


    const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinks | null>(null)
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
    const [isLoading, setIsLoading] = useState(false)



    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [attendees, setAttendees] = useState('');
    const [sendInvites, setSendInvites] = useState(true);
    const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');



    const handleInstantMeeting = async () => {
        try {
            setIsLoading(true)
            const response = await axios.post('http://localhost:5000/api/instant-meet')
            setGeneratedLinks({
                meetUrl: response.data.meetUrl,
                eventId: response.data.eventId || Math.random().toString(36).substring(2, 15)
            })
            setIsLinksDialogOpen(true)
        } catch (error) {
            console.error('Error creating instant meeting:', error)
            alert('Failed to create meeting. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: any) => {
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
        } catch (err: any) {
            setError(err.message);
            console.error('Scheduling error:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedStates((prev) => ({ ...prev, [key]: true }))
            setTimeout(() => {
                setCopiedStates((prev) => ({ ...prev, [key]: false }))
            }, 2000)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 pt-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Schedule Your Meeting</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Start an instant meeting or schedule one for later. Connect with your team seamlessly.
                    </p>
                </div>

                {/* Meeting Options */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Instant Meeting Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                            <Video className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Instant Meeting</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Start a meeting right now with a single click. Perfect for quick discussions and urgent matters.
                        </p>
                        <Button
                            onClick={handleInstantMeeting}
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                        >
                            {isLoading ? "Creating Meeting..." : "Start Instant Meeting"}
                        </Button>
                    </div>


                    {/* //Scheduling */}
                    <div className="max-w-6xl mx-auto p-6 rounded-xl">
                        <h1 className="text-3xl font-bold mb-8 text-center">Schedule Google Meet</h1>

                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md lg:w-xl">
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
                                                onSelect={(selectedDate) => setDate(selectedDate || new Date())}
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


                            {error && (
                                <div className="text-red-500 p-3 bg-red-50 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Scheduling...' : 'Schedule Meeting'}
                            </Button>
                        </form>

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

                </div>

                {/* Generated Links Dialog */}
                <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Video className="w-6 h-6 text-green-600" />
                                Meeting Created Successfully!
                            </DialogTitle>
                            <DialogDescription>
                                Your meeting links have been generated. Share these with your attendees.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Meeting Link */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Video className="w-5 h-5 text-blue-600" />
                                        Google Meet Link
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <code className="flex-1 text-sm font-mono break-all">{generatedLinks?.meetUrl}</code>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(generatedLinks?.meetUrl || "", "meeting")}
                                            className="shrink-0"
                                        >
                                            {copiedStates.meeting ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => window.open(generatedLinks?.meetUrl, "_blank")}
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Join Meeting
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(generatedLinks?.meetUrl || "", "meeting")}
                                        >
                                            {copiedStates.meeting ? "Copied!" : "Copy Link"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Calendar Link (only for scheduled meetings) */}
                            {generatedLinks?.calendarEvent && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CalendarDays className="w-5 h-5 text-purple-600" />
                                            Add to Calendar
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <code className="flex-1 text-sm font-mono break-all">{generatedLinks.calendarEvent}</code>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(generatedLinks?.calendarEvent || "", "calendar")}
                                                className="shrink-0"
                                            >
                                                {copiedStates.calendar ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => window.open(generatedLinks?.calendarEvent, "_blank")}
                                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                                            >
                                                <CalendarDays className="w-4 h-4" />
                                                Add to Google Calendar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(generatedLinks?.calendarEvent || "", "calendar")}
                                            >
                                                {copiedStates.calendar ? "Copied!" : "Copy Link"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Meeting ID */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Meeting ID</p>
                                        <p className="font-mono text-lg font-semibold">{generatedLinks?.eventId}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsLinksDialogOpen(false)}>Done</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
