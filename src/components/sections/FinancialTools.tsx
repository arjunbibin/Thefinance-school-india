"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Target, Info, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const generateData = (amount: number, years: number, rate: number) => {
  const data = [];
  let total = amount;
  for (let i = 0; i <= years; i++) {
    data.push({
      year: i,
      value: Math.round(total)
    });
    total = total * (1 + rate / 100);
  }
  return data;
};

export default function FinancialTools() {
  const [amount, setAmount] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(7);

  const data = generateData(amount, years, rate);
  const finalValue = data[data.length - 1].value;
  const earnings = finalValue - amount;

  return (
    <section id="tools" className="py-24 px-6 bg-slate-50/50 border-y border-slate-200 overflow-hidden relative">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#2E3192 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8 animate-in slide-in-from-left-10 duration-1000">
             <div className="space-y-4">
               <Badge variant="outline" className="text-primary border-primary/20 px-6 py-1.5 finance-3d-shadow-inner bg-white/50">3D Simulation</Badge>
               <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">Project Your <span className="text-primary">Wealth Creation</span></h2>
               <p className="text-muted-foreground text-xl leading-relaxed">
                 Interact with our data engine to visualize how compound interest architects your future. 
                 Adjust real-world variables and see immediate 3D growth projections.
               </p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white finance-3d-shadow flex items-center gap-5 group hover:-translate-y-1 transition-transform">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Calculator className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="block font-headline font-bold text-lg">Financial Core</span>
                    <span className="text-sm text-muted-foreground">High-precision math</span>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white finance-3d-shadow flex items-center gap-5 group hover:-translate-y-1 transition-transform">
                  <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent group-hover:text-primary transition-colors">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="block font-headline font-bold text-lg">Goal Engine</span>
                    <span className="text-sm text-muted-foreground">Milestone tracking</span>
                  </div>
                </div>
             </div>

             <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-32 h-32" />
               </div>
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2 text-accent">
                   <Sparkles className="w-5 h-5" />
                   <span className="text-sm font-bold uppercase tracking-widest">Projection Highlight</span>
                 </div>
                 <div className="text-5xl font-headline font-bold">${finalValue.toLocaleString()}</div>
                 <p className="text-primary-foreground/80">Estimated value in {years} years with {rate}% growth. You'll earn <span className="text-accent font-bold">${earnings.toLocaleString()}</span> in pure interest.</p>
               </div>
             </div>
          </div>

          <div className="flex-1 w-full animate-in slide-in-from-right-10 duration-1000">
            <Card className="finance-3d-shadow border-none bg-white p-8 rounded-[2rem] relative">
              <div className="absolute top-4 right-8">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" />
              </div>
              <CardHeader className="px-0 pb-8">
                <CardTitle className="text-3xl font-headline font-bold">Strategy Input</CardTitle>
                <CardDescription className="text-lg">Configure your investment parameters below</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold text-slate-700">Initial Capital</Label>
                    <span className="px-4 py-2 bg-slate-50 rounded-xl font-bold text-2xl text-primary finance-3d-shadow-inner">${amount.toLocaleString()}</span>
                  </div>
                  <Slider value={[amount]} onValueChange={(val) => setAmount(val[0])} max={500000} step={5000} className="py-4" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold text-slate-700">Time Horizon</Label>
                    <span className="px-4 py-2 bg-slate-50 rounded-xl font-bold text-2xl text-primary finance-3d-shadow-inner">{years} Years</span>
                  </div>
                  <Slider value={[years]} onValueChange={(val) => setYears(val[0])} max={50} step={1} className="py-4" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold text-slate-700">Expected Yield (%)</Label>
                    <span className="px-4 py-2 bg-accent/10 rounded-xl font-bold text-2xl text-primary finance-3d-shadow-inner">{rate}%</span>
                  </div>
                  <Slider value={[rate]} onValueChange={(val) => setRate(val[0])} max={25} step={0.5} className="py-4" />
                </div>

                <div className="h-[320px] w-full mt-10 rounded-2xl bg-slate-50/50 p-4 border border-slate-100 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '1rem', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          padding: '1rem'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--accent))" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        strokeWidth={4} 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
