# Calendly-Zoom Integration Guide - RepMotivatedSeller

## Overview
Complete guide for integrating Calendly with Zoom to provide seamless consultation booking for RepMotivatedSeller clients.

## Table of Contents
1. [Calendly Setup](#calendly-setup)
2. [Zoom Integration](#zoom-integration)
3. [Event Types Configuration](#event-types-configuration)
4. [Embedding Calendly](#embedding-calendly)
5. [Webhooks & Notifications](#webhooks--notifications)
6. [Best Practices](#best-practices)

---

## 1. Calendly Setup

### Create Calendly Account
1. Go to [https://calendly.com](https://calendly.com)
2. Sign up for Business account (recommended features):
   - Team scheduling
   - Custom branding
   - Payment integration
   - Advanced analytics

### Account Configuration

**Basic Settings:**
1. Settings → My Calendly Page
   - Username: `repmotivatedseller` or `your-name`
   - Profile Photo: Upload professional headshot
   - Welcome Message: 
     ```
     Welcome to RepMotivatedSeller! 
     Book your consultation to discuss foreclosure prevention, 
     credit repair, or real estate investment opportunities.
     ```

**Connected Calendars:**
1. Settings → Calendar Connections
2. Connect your primary calendar:
   - Google Calendar (recommended)
   - Microsoft Outlook
   - Apple iCloud
3. Set calendar sync:
   - Check for conflicts: Every 15 minutes
   - Add events to: [Your primary calendar]

**Availability:**
1. Settings → Availability
2. Set your working hours:
   ```
   Monday - Friday: 9:00 AM - 6:00 PM (EST)
   Saturday: 10:00 AM - 2:00 PM (EST)
   Sunday: Closed
   ```
3. Date range: Rolling 60 days
4. Buffer time:
   - Before events: 15 minutes
   - After events: 15 minutes

---

## 2. Zoom Integration

### ✅ Connect Zoom to Calendly

1. **In Calendly:**
   - Settings → Integrations
   - Find "Zoom"
   - Click "Connect"

2. **Authorize Access:**
   - Login to your Zoom account
   - Click "Authorize" to allow Calendly access
   - Permissions needed:
     - Create meetings
     - View meetings
     - Update meetings
     - Delete meetings

3. **Configure Zoom Settings:**
   - Default meeting settings:
     - ✅ Enable waiting room
     - ✅ Require meeting password
     - ✅ Enable join before host
     - ✅ Mute participants on entry
     - ✅ Record meetings automatically (cloud)

4. **Zoom Account Settings:**
   - Go to [https://zoom.us/profile/setting](https://zoom.us/profile/setting)
   - Enable:
     - ✅ Personal Meeting ID (PMI)
     - ✅ Waiting Room
     - ✅ Cloud Recording
     - ✅ Automatic transcripts
     - ✅ Meeting reactions

### Verify Integration

Test the connection:
1. Create a test event type
2. Book a test meeting
3. Check that Zoom meeting link is generated
4. Verify meeting appears in Zoom dashboard

---

## 3. Event Types Configuration

### Create Event Types for RepMotivatedSeller

#### 1. Free Consultation (15 min)
```
Name: Free Foreclosure Assessment
Duration: 15 minutes
Location: Zoom (automatically generated)
Description:
  Quick 15-minute call to discuss your situation and how we can help.
  Perfect for first-time visitors who want to learn more.

Questions to ask:
  - What's your primary concern? (Foreclosure, Credit Repair, Investment)
  - How soon do you need assistance?
  - Phone number
  - Best time to reach you
```

#### 2. Basic Consultation (30 min)
```
Name: Foreclosure Prevention Strategy Session
Duration: 30 minutes
Location: Zoom
Price: $0 (for Basic members) or $49 (non-members)
Description:
  Comprehensive 30-minute consultation to develop a personalized 
  strategy for your foreclosure prevention or credit repair needs.

Questions to ask:
  - Current mortgage status
  - Property address (optional)
  - Credit score range
  - Monthly income
  - Specific challenges
```

#### 3. Premium Deep Dive (60 min)
```
Name: VIP Strategy & Action Plan Session
Duration: 60 minutes
Location: Zoom
Price: $0 (for Premium/VIP members) or $97 (non-members)
Description:
  In-depth consultation with personalized action plan, 
  document review, and direct lender connections.

Pre-meeting instructions:
  - Please have recent mortgage statements ready
  - Credit report (if available)
  - List of questions/concerns
```

### Configure Event Settings

For each event type:

**Scheduling:**
- Minimum notice: 2 hours
- Date range: 60 days into the future
- Secret event: No (make public)

**Notifications & Cancellation:**
- Email reminders:
  - 24 hours before
  - 1 hour before
- Cancellation policy: 2 hours notice required
- Rescheduling: Allowed up to 2 hours before

**Additional Options:**
- Collect payment (if applicable): via Stripe
- Require confirmation: No (instant booking)
- Pass Zoom details in confirmation email: Yes

---

## 4. Embedding Calendly

### Method 1: Direct Link

Simple link for emails, social media:
```
https://calendly.com/repmotivatedseller/consultation
```

### Method 2: Inline Embed (Recommended)

Add to your consultation page:

```tsx
// src/pages/ConsultationPage.tsx
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

export const ConsultationPage: React.FC = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Book a Consultation - RepMotivatedSeller</title>
        <meta name="description" content="Schedule your free consultation with RepMotivatedSeller foreclosure prevention experts." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book Your Consultation
            </h1>
            <p className="text-xl text-gray-600">
              Choose a time that works best for you
            </p>
          </div>

          {/* Calendly Inline Widget */}
          <div 
            className="calendly-inline-widget" 
            data-url="https://calendly.com/repmotivatedseller/consultation?hide_gdpr_banner=1&primary_color=2563eb"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    </>
  )
}

export default ConsultationPage
```

### Method 3: Popup Widget

For triggering from buttons:

```tsx
// src/components/CalendlyPopup.tsx
import React from 'react'
import { PopupButton } from 'react-calendly'

interface CalendlyPopupProps {
  buttonText?: string
  eventUrl: string
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
}

export const CalendlyPopup: React.FC<CalendlyPopupProps> = ({
  buttonText = 'Schedule Time',
  eventUrl,
  prefill
}) => {
  return (
    <PopupButton
      url={eventUrl}
      rootElement={document.getElementById('root')!}
      text={buttonText}
      prefill={prefill}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    />
  )
}

// Usage:
<CalendlyPopup
  eventUrl="https://calendly.com/repmotivatedseller/consultation"
  prefill={{
    name: user?.name,
    email: user?.email,
    customAnswers: {
      a1: 'Foreclosure Prevention' // Answer to first question
    }
  }}
/>
```

### Method 4: Custom Booking Flow

For members with different consultation types:

```tsx
// src/components/MembershipConsultations.tsx
import React from 'react'
import { PopupButton } from 'react-calendly'
import { useAuth } from '../hooks/useAuth'

export const MembershipConsultations: React.FC = () => {
  const { user } = useAuth()

  const consultationTypes = {
    free: {
      title: 'Free Assessment',
      duration: '15 min',
      url: 'https://calendly.com/repmotivatedseller/free-assessment',
      available: true
    },
    basic: {
      title: 'Strategy Session',
      duration: '30 min',
      url: 'https://calendly.com/repmotivatedseller/strategy-session',
      available: user?.membershipTier && ['basic', 'premium', 'vip'].includes(user.membershipTier)
    },
    vip: {
      title: 'VIP Deep Dive',
      duration: '60 min',
      url: 'https://calendly.com/repmotivatedseller/vip-session',
      available: user?.membershipTier && ['premium', 'vip'].includes(user.membershipTier)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(consultationTypes).map(([key, consultation]) => (
        <div key={key} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-2">{consultation.title}</h3>
          <p className="text-gray-600 mb-4">{consultation.duration}</p>
          
          {consultation.available ? (
            <PopupButton
              url={consultation.url}
              rootElement={document.getElementById('root')!}
              text="Book Now"
              prefill={{
                name: user?.name,
                email: user?.email
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            />
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg cursor-not-allowed"
            >
              Upgrade to Access
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 5. Webhooks & Notifications

### Setup Calendly Webhooks

1. **In Calendly:**
   - Settings → Integrations → Webhooks
   - Create webhook subscription
   - URL: `https://repmotivatedseller.org/api/webhooks/calendly`
   - Events:
     - `invitee.created` (new booking)
     - `invitee.canceled` (cancellation)
     - `invitee.rescheduled` (rescheduled)

2. **Get Webhook Signing Key:**
   - Copy the signing key
   - Add to `.env` as `CALENDLY_WEBHOOK_SECRET`

### Webhook Handler

Create `supabase/functions/calendly-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const payload = await req.json()
    const event = payload.event
    
    console.log(`📅 Calendly event: ${event}`)

    switch (event) {
      case 'invitee.created':
        await handleBookingCreated(payload.payload)
        break
        
      case 'invitee.canceled':
        await handleBookingCanceled(payload.payload)
        break
        
      case 'invitee.rescheduled':
        await handleBookingRescheduled(payload.payload)
        break
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Calendly webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})

async function handleBookingCreated(payload: any) {
  const { invitee, event } = payload
  
  // Log booking in database
  await supabase.from('consultations').insert({
    calendly_event_id: event.uri,
    invitee_email: invitee.email,
    invitee_name: invitee.name,
    scheduled_at: event.start_time,
    event_type: event.name,
    zoom_meeting_url: event.location,
    status: 'scheduled',
    created_at: new Date().toISOString()
  })

  // Send confirmation email
  await sendConfirmationEmail(invitee.email, invitee.name, event)
  
  // Update user's consultation count if member
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', invitee.email)
    .single()

  if (user) {
    await supabase
      .from('profiles')
      .update({
        consultations_used: (user.consultations_used || 0) + 1,
        last_consultation_at: new Date().toISOString()
      })
      .eq('id', user.id)
  }
}

async function handleBookingCanceled(payload: any) {
  const { event } = payload
  
  await supabase
    .from('consultations')
    .update({ status: 'canceled' })
    .eq('calendly_event_id', event.uri)
}

async function handleBookingRescheduled(payload: any) {
  const { event } = payload
  
  await supabase
    .from('consultations')
    .update({
      scheduled_at: event.start_time,
      status: 'rescheduled'
    })
    .eq('calendly_event_id', event.uri)
}

async function sendConfirmationEmail(email: string, name: string, event: any) {
  // TODO: Integrate with email service (SendGrid, etc.)
  console.log(`Sending confirmation to ${email}`)
}
```

---

## 6. Best Practices

### Consultation Preparation

**Automated Email Sequence:**

1. **Immediately after booking:**
   ```
   Subject: Your RepMotivatedSeller Consultation is Confirmed! 🎉
   
   Hi [Name],
   
   Your consultation is confirmed for [Date/Time].
   
   📹 Zoom Link: [Auto-generated]
   📧 Add to Calendar: [iCal link]
   
   To make the most of our time together, please:
   - Review your recent mortgage statements
   - Prepare your questions
   - Have pen and paper ready
   
   See you soon!
   RepMotivatedSeller Team
   ```

2. **24 hours before:**
   ```
   Subject: Tomorrow: Your Consultation with RepMotivatedSeller
   
   Friendly reminder about tomorrow's consultation at [Time].
   
   📹 Join via Zoom: [Link]
   
   Quick checklist:
   ✅ Test your mic and camera
   ✅ Find a quiet space
   ✅ Have documents ready
   
   Can't make it? Reschedule here: [Link]
   ```

3. **1 hour before:**
   ```
   Subject: Starting Soon: Your RepMotivatedSeller Consultation
   
   Your consultation starts in 1 hour!
   
   Join here: [Zoom Link]
   
   We look forward to helping you!
   ```

### Integration with Member Dashboard

```tsx
// src/components/dashboard/UpcomingConsultations.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

export const UpcomingConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState([])

  useEffect(() => {
    fetchConsultations()
  }, [])

  async function fetchConsultations() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('invitee_email', user?.email)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })

    setConsultations(data || [])
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming Consultations</h3>
      
      {consultations.length === 0 ? (
        <p className="text-gray-500">No upcoming consultations</p>
      ) : (
        <div className="space-y-3">
          {consultations.map((consult: any) => (
            <div key={consult.id} className="border-l-4 border-blue-600 pl-4">
              <div className="font-semibold">{consult.event_type}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(consult.scheduled_at), 'PPpp')}
              </div>
              <a
                href={consult.zoom_meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Join Zoom Meeting →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Environment Variables

```bash
# Calendly Configuration
CALENDLY_API_KEY=your_calendly_api_key
CALENDLY_WEBHOOK_SECRET=your_webhook_secret
CALENDLY_USERNAME=repmotivatedseller

# Zoom Configuration  
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
ZOOM_WEBHOOK_SECRET_TOKEN=your_zoom_webhook_token
```

---

## Summary

✅ **Completed:**
- Calendly account setup
- Zoom integration connected
- Event types configured
- Embed code ready

🚀 **Next Steps:**
1. Test booking flow
2. Set up automated emails
3. Train team on consultation best practices
4. Monitor analytics

📊 **Track Success:**
- Booking conversion rate
- Show-up rate
- Client satisfaction scores
- Consultation-to-sale conversion

---

## Support Resources

- [Calendly Help Center](https://help.calendly.com)
- [Zoom Support](https://support.zoom.us)
- [Calendly API Docs](https://developer.calendly.com)
- [React Calendly](https://github.com/tcampb/react-calendly)

Congratulations on setting up your Calendly-Zoom integration! 🎉
