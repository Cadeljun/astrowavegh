'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Divider } from '@/components/ui/Divider';
import { fadeUp } from '@/lib/animations';
import { Mail, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-[800px] mx-auto space-y-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center space-y-4">
          <SectionLabel className="justify-center">Legal Document</SectionLabel>
          <h1 className="display-xl text-white uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-gold font-mono text-[0.7rem] uppercase tracking-[0.3em]">Last Updated: October 24, 2023</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <Card className="p-8 md:p-12 bg-[#111118]/60 backdrop-blur-xl border-white/5 space-y-10" noHover>
            <section className="space-y-4">
              <h2 className="display-sm text-white uppercase flex items-center gap-3">
                <Shield size={24} className="text-gold" /> Introduction
              </h2>
              <p className="body-md text-muted">
                At AstroWave, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information when you use our platform to discover events or manage your creative career.
              </p>
            </section>

            <Divider className="opacity-10" />

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">Information We Collect</h3>
              <p className="body-md text-muted leading-relaxed">
                To provide our intelligent matching services, we collect several types of information:
              </p>
              <ul className="list-disc pl-6 body-md text-muted space-y-2">
                <li><strong className="text-white">Identity Data:</strong> Full name, stage name, and display name.</li>
                <li><strong className="text-white">Contact Data:</strong> Email address and phone number (if provided).</li>
                <li><strong className="text-white">Profile Data:</strong> Category (DJ, MC, etc.), city, bio, and social media links.</li>
                <li><strong className="text-white">Professional Data:</strong> Event history, booking records, and community ratings.</li>
                <li><strong className="text-white">Technical Data:</strong> IP address, browser type, and usage patterns.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">How We Use Your Information</h3>
              <p className="body-md text-muted leading-relaxed">
                Your data is used to optimize your platform experience:
              </p>
              <ul className="list-disc pl-6 body-md text-muted space-y-2">
                <li>To power our <strong className="text-gold">Vibe Sync</strong> matching algorithm.</li>
                <li>To calculate and update your <strong className="text-gold">Wave Score</strong>.</li>
                <li>To facilitate secure professional engagements and bookings.</li>
                <li>To communicate platform updates and relevant opportunities.</li>
                <li>To improve platform performance through anonymized analytics.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">Data Sharing & Security</h3>
              <p className="body-md text-muted leading-relaxed">
                AstroWave does not sell your personal data to third parties. We only share information when necessary to fulfill a booking request (e.g., sharing a talent's profile with an organizer) or when required by law. All data is stored securely using Firebase's encrypted infrastructure.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">Your Rights</h3>
              <p className="body-md text-muted leading-relaxed">
                You have the right to access, correct, or delete your personal data at any time through your profile settings. For a full account deletion or to request a data export, please contact our support team.
              </p>
            </section>

            <Divider className="opacity-10" />

            <div className="p-6 rounded-xl bg-gold/5 border border-gold/10 text-center">
              <p className="text-[0.65rem] font-bold text-muted uppercase tracking-widest mb-2">Questions regarding privacy?</p>
              <a href="mailto:info@astrowave.com" className="flex items-center justify-center gap-2 text-gold font-bold hover:underline">
                <Mail size={16} /> info@astrowave.com
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
