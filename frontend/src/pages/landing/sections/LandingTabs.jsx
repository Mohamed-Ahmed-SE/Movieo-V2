import React, { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LandingTabs = ({ activeTab, setActiveTab }) => {
    const tabsRef = useRef(null)
    const underlineRef = useRef(null)
    const tabs = ['All', 'Latest', 'Coming Soon', 'Top Rated']

    useEffect(() => {
        // Simple fade in
        if (tabsRef.current) {
            gsap.fromTo(tabsRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.5 }
            )
        }
    }, [])

    useEffect(() => {
        // Simple underline animation
        const activeButton = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`)
        if (activeButton && underlineRef.current) {
            const { left, width } = activeButton.getBoundingClientRect()
            const containerLeft = tabsRef.current?.getBoundingClientRect().left || 0

            gsap.to(underlineRef.current, {
                left: left - containerLeft,
                width: width,
                duration: 0.3,
                ease: 'power2.out'
            })
        }
    }, [activeTab])

    return (
        <div ref={tabsRef} className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">

            {/* Scrollable Tabs Container */}
            <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-6 md:gap-10 orders-2 md:order-1 relative whitespace-nowrap px-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            data-tab={tab}
                            onClick={() => setActiveTab && setActiveTab(tab)}
                            className={`text-sm md:text-base font-semibold transition-colors duration-200 relative z-10 py-2 ${activeTab === tab ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div
                        ref={underlineRef}
                        className="absolute bottom-0 h-0.5 bg-red-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: 0, left: 0 }}
                    />
                </div>
            </div>

            <div className="relative w-full md:w-96 order-1 md:order-2">
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-transparent text-white px-4 py-2.5 md:py-3 pl-10 text-sm focus:outline-none placeholder:text-zinc-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                </div>
            </div>
        </div>
    )
}

export default LandingTabs
