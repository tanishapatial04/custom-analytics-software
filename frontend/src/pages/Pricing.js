import React from 'react';
import { Button } from '../components/ui/button';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Pricing</h1>
        <p className="text-lg text-slate-600 mb-10">Simple pricing for demo purposes — pick a plan and get started.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl border bg-white">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="text-slate-600 mb-4">For personal projects and testing — limited features.</p>
            <div className="text-3xl font-bold text-slate-900 mb-4">$0<span className="text-base font-medium"> / month</span></div>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> Basic analytics</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> NLQ demo (limited)</li>
            </ul>
            <Button className="w-full bg-[#b4e717] text-[#1C4B42]">Start Free</Button>
          </div>

          <div className="p-8 rounded-2xl border bg-white shadow-md">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-slate-600 mb-4">Most popular — for small teams and projects.</p>
            <div className="text-3xl font-bold text-slate-900 mb-4">$29<span className="text-base font-medium"> / month</span></div>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> All Free features</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> Full NLQ access</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> Priority support</li>
            </ul>
            <Button className="w-full bg-[#1C4B42] text-white">Start Pro</Button>
          </div>

          <div className="p-8 rounded-2xl border bg-white">
            <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
            <p className="text-slate-600 mb-4">Custom plans for large teams and compliance needs.</p>
            <div className="text-3xl font-bold text-slate-900 mb-4">Contact Us</div>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> SSO & SAML</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> Dedicated support</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1C4B42]"/> SLA & on-prem options</li>
            </ul>
            <Button className="w-full border border-[#1C4B42] text-[#1C4B42] bg-white">Contact Sales</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
