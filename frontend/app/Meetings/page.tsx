"use client"

import { useState } from "react"
import { Calendar, Clock, Users, Video, CalendarDays, Copy, ExternalLink, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface GeneratedLinks {
    meetingLink: string
    calendarLink?: string
    meetingId: string
}

export default function Meetings() {
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
    const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date>()
    const [selectedTime, setSelectedTime] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [attendeeInput, setAttendeeInput] = useState("")
    const [attendees, setAttendees] = useState<string[]>([])
    const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinks | null>(null)
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

    // Generate a mock Google Meet link
    const generateMeetLink = () => {
        const meetingId = Math.random().toString(36).substring(2, 15)
        return {
            meetingLink: `https://meet.google.com/${meetingId}`,
            meetingId: meetingId,
        }
    }

    // Generate Google Calendar link
    const generateCalendarLink = (title: string, description: string, date: Date, time: string, attendees: string[]) => {
        const startDateTime = new Date(date)
        const [hours, minutes] = time.split(":")
        startDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))

        const endDateTime = new Date(startDateTime)
        endDateTime.setHours(startDateTime.getHours() + 1) // 1 hour meeting by default

        const formatDateTime = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        }

        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: title,
            dates: `${formatDateTime(startDateTime)}/${formatDateTime(endDateTime)}`,
            details: description + (generatedLinks?.meetingLink ? `\n\nJoin meeting: ${generatedLinks.meetingLink}` : ""),
            guests: attendees.join(","),
            trp: "false",
        })

        return `https://calendar.google.com/calendar/render?${params.toString()}`
    }

    const handleInstantMeeting = () => {
        const links = generateMeetLink()
        setGeneratedLinks({
            ...links,
            calendarLink: undefined,
        })
        setIsLinksDialogOpen(true)
    }

    const handleAddAttendee = () => {
        if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
            setAttendees([...attendees, attendeeInput.trim()])
            setAttendeeInput("")
        }
    }

    const handleRemoveAttendee = (attendee: string) => {
        setAttendees(attendees.filter((a) => a !== attendee))
    }

    const handleScheduleMeeting = () => {
        if (!title || !selectedDate || !selectedTime) {
            alert("Please fill in all required fields")
            return
        }

        const meetingLinks = generateMeetLink()
        const calendarLink = generateCalendarLink(title, description, selectedDate, selectedTime, attendees)

        setGeneratedLinks({
            ...meetingLinks,
            calendarLink,
        })

        // Reset form
        setTitle("")
        setDescription("")
        setSelectedDate(undefined)
        setSelectedTime("")
        setAttendees([])
        setIsScheduleDialogOpen(false)
        setIsLinksDialogOpen(true)
    }

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

    const timeSlots = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                        >
                            Start Instant Meeting
                        </Button>
                    </div>

                    {/* Scheduled Meeting Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                            <CalendarDays className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Schedule Meeting</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Plan ahead and schedule a meeting for a specific date and time. Send invites to attendees.
                        </p>
                        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                                    Schedule Meeting
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">Schedule New Meeting</DialogTitle>
                                    <DialogDescription>Fill in the details below to schedule your meeting.</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">
                                            Meeting Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter meeting title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter meeting description (optional)"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[80px]"
                                        />
                                    </div>

                                    {/* Date and Time */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date Picker */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Date *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={setSelectedDate}
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Time Picker */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Time *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        {selectedTime || "Select time"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <div className="grid grid-cols-3 gap-2 p-4 max-h-48 overflow-y-auto">
                                                        {timeSlots.map((time) => (
                                                            <Button
                                                                key={time}
                                                                variant={selectedTime === time ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setSelectedTime(time)}
                                                                className="text-xs"
                                                            >
                                                                {time}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Attendees */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Attendees</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter email address"
                                                value={attendeeInput}
                                                onChange={(e) => setAttendeeInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleAddAttendee()}
                                                className="flex-1"
                                            />
                                            <Button type="button" onClick={handleAddAttendee} variant="outline" size="sm">
                                                Add
                                            </Button>
                                        </div>

                                        {/* Attendees List */}
                                        {attendees.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {attendees.map((attendee, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                                        <Users className="w-3 h-3" />
                                                        {attendee}
                                                        <button
                                                            onClick={() => handleRemoveAttendee(attendee)}
                                                            className="ml-1 text-gray-500 hover:text-gray-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleScheduleMeeting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            Schedule Meeting
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
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
                                        <code className="flex-1 text-sm font-mono break-all">{generatedLinks?.meetingLink}</code>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(generatedLinks?.meetingLink || "", "meeting")}
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
                                            onClick={() => window.open(generatedLinks?.meetingLink, "_blank")}
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Join Meeting
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(generatedLinks?.meetingLink || "", "meeting")}
                                        >
                                            {copiedStates.meeting ? "Copied!" : "Copy Link"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Calendar Link (only for scheduled meetings) */}
                            {generatedLinks?.calendarLink && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CalendarDays className="w-5 h-5 text-purple-600" />
                                            Add to Calendar
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <code className="flex-1 text-sm font-mono break-all">{generatedLinks.calendarLink}</code>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(generatedLinks?.calendarLink || "", "calendar")}
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
                                                onClick={() => window.open(generatedLinks?.calendarLink, "_blank")}
                                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                                            >
                                                <CalendarDays className="w-4 h-4" />
                                                Add to Google Calendar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyToClipboard(generatedLinks?.calendarLink || "", "calendar")}
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
                                        <p className="font-mono text-lg font-semibold">{generatedLinks?.meetingId}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsLinksDialogOpen(false)}>Done</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Features */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Meeting Features</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4 mx-auto">
                                <Video className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">HD Video Quality</h4>
                            <p className="text-sm text-gray-600">Crystal clear video calls with up to 1080p resolution</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4 mx-auto">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Multiple Participants</h4>
                            <p className="text-sm text-gray-600">Host meetings with up to 100 participants</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4 mx-auto">
                                <Calendar className="w-6 h-6 text-teal-600" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Smart Scheduling</h4>
                            <p className="text-sm text-gray-600">Automatic calendar integration and reminders</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
