"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Zap, ArrowRight, Play } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"

export default function Home() {


    const router = useRouter()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    }

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
            },
        },
    }

    return (
        <section className="relative min-h-screen font-sans flex items-center justify-center overflow-hidden bg-gradient-to-r from-emerald-400 via-white to-emerald-500
        ">
            {/* Floating Elements */}
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-20 left-10 w-20 h-20 bg-emerald-100 rounded-full opacity-60 blur-xl"
            />
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-40 right-20 w-32 h-32 bg-purple-100 rounded-full opacity-40 blur-xl"
                style={{ animationDelay: "2s" }}
            />
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-20 left-1/4 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-xl"
                style={{ animationDelay: "4s" }}
            />

            <div className="container px-4 md:px-6 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants}>
                        <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Powered by Google Calendar API
                        </Badge>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Schedule{" "}
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Google Meets
                            </span>{" "}
                            <br />
                            in Seconds
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl lg:text-2xl leading-relaxed">
                            Streamline your meeting workflow with intelligent scheduling. Create, manage, and join Google Meet
                            sessions effortlessly.
                        </p>
                    </motion.div>

                    {/* Feature Icons */}
                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8 py-4">
                        <div className="flex items-center space-x-2 text-slate-600">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium">Smart Scheduling</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                            <Clock className="w-5 h-5 text-teal-600" />
                            <span className="text-sm font-medium">Time Zone Sync</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                            <Users className="w-5 h-5 text-cyan-600" />
                            <span className="text-sm font-medium">Team Collaboration</span>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={() => router.push("/Meetings")}
                            size="lg"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group
                            cursor-pointer
                            "
                        >
                            Start Scheduling Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>
    )
}
