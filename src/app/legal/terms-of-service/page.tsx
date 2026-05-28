'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Divider } from '@/components/ui/Divider';
import { fadeUp } from '@/lib/animations';
import { Scale, Zap, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[800px] mx-auto space-y-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center space-y-4">
          <SectionLabel className="justify-center">Legal Document</SectionLabel>
          <h1 className="display-xl text-white uppercase tracking-tight">Terms of Service</h1>
          <p className="text-gold font-mono text-[0.7rem] uppercase tracking-[0.3em]">Last Updated: October 24, 2023</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <Card className="p-8 md:p-12 bg-[#111118]/60 backdrop-blur-xl border-white/5 space-y-10" noHover>
            <section className="space-y-4">
              <h2 className="display-sm text-white uppercase flex items-center gap-3">
                <Scale size={24} className="text-gold" /> Acceptance of Terms
              </h2>
              <p className="body-md text-muted leading-relaxed">
                By accessing or using the AstroWave platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the platform.
              </p>
            </section>

            <Divider className="opacity-10" />

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">1. Eligibility</h3>
              <p className="body-md text-muted leading-relaxed">
                You must be at least 18 years of age to use this platform. By using AstroWave, you represent and warrant that you have the legal capacity to enter into a binding agreement under the laws of the Republic of Ghana.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">2. Account Responsibilities</h3>
              <p className="body-md text-muted leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the onboarding process.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">3. Organizer & Talent Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-lg bg-white/5 space-y-3">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest">For Organizers</p>
                  <p className="text-xs text-muted leading-relaxed">Organizers are responsible for the accuracy of event briefs, venue safety, and timely payment for booked services.</p>
                </div>
                <div className="p-5 rounded-lg bg-white/5 space-y-3">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest">For Talent</p>
                  <p className="text-xs text-muted leading-relaxed">Talent must maintain an accurate profile, respond to inquiries promptly, and fulfill all confirmed booking obligations professionally.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider flex items-center gap-3">
                <Zap size={20} className="text-gold" /> The Wave Score Algorithm
              </h3>
              <div className="p-6 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <p className="body-md text-white/80 leading-relaxed italic">
                  "The Wave Score is a community-driven metric derived from event volume, recency, and verified organizer ratings."
                </p>
                <p className="text-[0.65rem] text-muted leading-relaxed">
                  AstroWave does not manually manipulate these scores. We provide the algorithm as a tool for discovery, but we do not guarantee its accuracy as an absolute measure of talent quality.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">4. Cancellations & Disputes</h3>
              <p className="body-md text-muted leading-relaxed">
                Confirmed bookings are subject to the specific cancellation policy agreed upon during the proposal stage. AstroWave acts as a facilitator and matching engine; however, we are not a party to the independent contracts between Organizers and Talent.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider flex items-center gap-3">
                <AlertTriangle size={20} className="text-gold" /> Governing Law
              </h3>
              <p className="body-md text-muted leading-relaxed">
                These terms are governed by and construed in accordance with the laws of <strong className="text-white">Ghana</strong>. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of Ghana.
              </p>
            </section>

            <Divider className="opacity-10" />

            <div className="text-center">
              <p className="text-xs text-muted uppercase tracking-[0.2em]">Contact legal team at</p>
              <p className="text-white font-bold mt-1">info@astrowave.com</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
