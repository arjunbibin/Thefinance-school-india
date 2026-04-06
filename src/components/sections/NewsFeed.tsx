"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Newspaper, ArrowUpRight, Globe, BarChart3, Clock, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const newsItems = [
  {
    id: 1,
    title: "Global Markets Rally as Tech Giants Beat Expectations",
    summary: "NVIDIA and Microsoft lead the charge as AI innovation continues to drive record-breaking quarterly growth across NASDAQ components.",
    source: "Bloomberg",
    time: "2h ago",
    category: "Markets",
    icon: BarChart3,
    hot: true
  },
  {
    id: 2,
    title: "The Rise of Regenerative Finance: A New Era for Investors",
    summary: "Institutional capital shifts towards ReFi protocols that integrate environmental impact directly into smart contract yield models.",
    source: "Financial Times",
    time: "4h ago",
    category: "ESG",
    icon: Globe,
    hot: false
  },
  {
    id: 3,
    title: "Central Banks Signal Potential Rate Shifts for Q3",
    summary: "Jerome Powell indicates a data-driven approach as inflation figures stabilize, sparking speculation about a potential autumn pivot.",
    source: "Reuters",
    time: "6h ago",
    category: "Economy",
    icon: Newspaper,
    hot: true
  }
];

export default function NewsFeed() {
  return (
    <section id="news" className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Dynamic News Ticker */}
      <div className="mb-16 bg-primary/5 py-3 rounded-full border border-primary/10 flex items-center gap-4 px-6 overflow-hidden">
        <div className="flex items-center gap-2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold shrink-0 animate-pulse">
          <Zap className="w-3 h-3 fill-accent" /> LIVE PULSE
        </div>
        <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm font-medium text-primary/80 italic">
          <span>BTC Surpasses $75,000 Milestone</span>
          <span>Federal Reserve Keeps Rates Steady</span>
          <span>Apple Announces New AI Integration for Vision Pro</span>
          <span>Gold Prices Reach All-Time Nominal High</span>
          <span>Global EV Adoption Increases 24% Year-over-Year</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl animate-in fade-in slide-in-from-left-10 duration-1000">
          <Badge variant="secondary" className="mb-4 bg-accent/20 text-primary border-none font-bold">Market Intelligence</Badge>
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">Financial <span className="text-primary underline decoration-accent underline-offset-8">Pulse</span></h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Real-time insights synthesized from global streams. 
            Stay ahead of volatility with our high-fidelity news engine.
          </p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all finance-3d-shadow group">
          Browse Research Terminal
          <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Button>
      </div>

      <div className="grid gap-10">
        {newsItems.map((news, index) => (
          <Card key={news.id} 
            className="group finance-3d-card border-none bg-white finance-3d-shadow p-8 flex flex-col lg:flex-row items-start lg:items-center gap-8 animate-in slide-in-from-bottom-20 duration-1000"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="p-6 rounded-[2rem] bg-slate-50 finance-3d-shadow-inner text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
              <news.icon className="w-12 h-12" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="text-xs font-bold text-primary uppercase border-primary/20 bg-primary/5 px-3 py-1">
                  {news.category}
                </Badge>
                {news.hot && (
                  <Badge className="text-xs font-bold bg-destructive text-white border-none px-3 py-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" /> Trending
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /> {news.time}</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-headline font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
                  {news.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-2">
                  {news.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Source: {news.source}</span>
              </div>
            </div>

            <Button size="icon" variant="ghost" className="h-16 w-16 rounded-2xl hover:bg-accent/20 hover:text-primary transition-all self-end lg:self-center">
              <ExternalLink className="w-6 h-6" />
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
