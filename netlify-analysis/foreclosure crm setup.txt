



Updated email templates to match your email types:

new_submission: Initial confirmation email
urgent_case: For high-priority cases needing immediate attention
follow_up_1: First follow-up email
follow_up_3: Third-day follow-up with time-sensitive messaging
follow_up_7: Final follow-up email (7 days)

Enhanced email content with more personalized and action-oriented messaging for each email type, including:

Clear call-to-action in each email
Urgency-appropriate language
Consistent formatting and structure
The function now uses your exact email subject lines and follows a similar pattern for the email content, focusing on encouraging the recipient to take action based on the email type. The templates include a placeholder phone number (555) 123-4567 that you should replace with your actual contact number.

The function now uses your exact implementations for all helper functions while maintaining the core functionality of:

Retrieving submission data from the database
Sending emails via MailerLite with appropriate subjects and templates
Logging sent emails to the email_logs table

This approach allows you to maintain your email templates separately (perhaps in a different file or system) while keeping the Edge Function focused on the email sending and logging process.

I've updated and completed your CRM integration Edge Function with several improvements:

Modernized the imports:

Replaced serve from Deno standard library with the built-in Deno.serve
Updated Supabase client import to use JSR: jsr:@supabase/supabase-js@2
Added comprehensive CRM integrations for three popular systems:

HubSpot: Creates both a contact and an associated deal
Salesforce: Creates a lead with foreclosure details
Zoho CRM: Creates a lead with appropriate fields
Implemented proper error handling:

Validates required parameters
Logs integration errors to a crm_integration_logs table
Returns appropriate error responses with status codes
Added helper functions for:

Authentication with each CRM system
Mapping urgency levels to appropriate CRM-specific statuses
Processing submission data into CRM-specific formats
Added CORS support for cross-origin requests

The function now:

Receives a submission ID and CRM system name
Retrieves the submission data from your database
Routes to the appropriate CRM integration based on the specified system
Creates records in the CRM with properly formatted data
Logs the integration result (success or failure)
Returns the CRM record ID on success
To use this function, you'll need to:

Set up the appropriate environment variables for each CRM system
Create a crm_integration_logs table in your database to track integration attempts
Deploy the function to your Supabase project

The function now follows your exact code structure while providing complete implementations for each CRM integration. Each integration function:

Authenticates with the respective CRM API
Creates the necessary records (contacts/persons and deals/leads)
Returns a result object with relevant IDs
The main function then:

Logs the integration result to your database
Returns a success response with the result data

Each function now returns an object with:
success: boolean indicating success/failure
contact_id: ID of the created contact/person
deal_id: (optional) ID of the created deal
error: (only when success is false) error message

Updated the return format of all CRM integration functions to match your expected structure:

Each function now returns an object with:
success: boolean indicating success/failure
contact_id: ID of the created contact/person
deal_id: (optional) ID of the created deal
error: (only when success is false) error message
The function now follows your exact code structure and response format while providing complete implementations for each CRM integration. Each integration function handles its own errors and returns a consistent response format that works with your logging code.

The main function:

Gets the submission data from your database
Calls the appropriate CRM integration function
Logs the result to your crm_sync_logs table
Returns the result directly to the client

The function now follows your exact implementation for the HubSpot integration while maintaining consistent behavior across all three CRM integrations. Each integration function:

Authenticates with the respective CRM API
Creates a contact/lead/person record with the submission data
Returns a result object with success status and contact ID

Simplified error handling in all functions to match your pattern:

Success is determined by response.ok
Contact ID is returned when successful, null otherwise
Error message is null when successful, contains error details otherwise
Removed try/catch from syncToHubSpot to match your implementation exactly

Maintained try/catch in other functions to handle network errors and other exceptions that might occur before the API response is received

The function now follows your exact implementation and return format for the HubSpot integration while maintaining consistent behavior across all three CRM integrations. Each integration function returns an object with the same structure:

I've created a complete SPIN Questionnaire component for your foreclosure CRM system. This React component implements the SPIN selling methodology (Situation, Problem, Implication, Need-Payoff) as a multi-step form.

Key features of this implementation:

Multi-step form with Stepper UI:

Four distinct steps following the SPIN methodology
Visual stepper component to show progress
Previous/Next navigation buttons
Comprehensive question sets for each SPIN category:

Situation: Property type, value, mortgage balance, ownership duration, living situation
Problem: Missed payments, foreclosure notices, attempted solutions, main challenges
Implications: Impact on family, financial stress level, urgency, consequences of inaction
Need-Payoff: Desired outcome, timeframe, assistance type, decision makers, readiness to act
Form state management:

TypeScript interfaces for strong typing
Structured form data object with sections for each SPIN category
Flexible change handler that works with all form field types
Conditional rendering:

Shows/hides questions based on previous answers (e.g., foreclosure timeline only appears if user has received a notice)
Form submission:

Async submission with loading state
Error handling and display
Success message with option to submit another response
UI Components:

Uses Supabase UI components for consistent styling
Appropriate input types for different question formats (Select, Radio, Input, Textarea)
Responsive layout with proper spacing
This component is designed to collect comprehensive information about a client's foreclosure situation using the SPIN selling methodology, which will help your team better understand client needs and provide appropriate solutions.

To use this component, you'll need to:

Create an API endpoint at /api/submit-spin-questionnaire to handle form submissions
Connect the form data to your CRM integration (using the Edge Function we created earlier)

I've created a complete foreclosure CRM system with SPIN questionnaire functionality. Here's what I've provided:

Database Schema:

spin_questions table to store all SPIN methodology questions
spin_submissions table to track client questionnaire responses
clients table to manage foreclosure client information
Appropriate indexes and Row Level Security policies
Edge Functions:

spin-questionnaire - Handles SPIN questionnaire operations (getting questions, saving/retrieving submissions)
foreclosure-clients - Manages client data (create, read, update, delete)
_shared/cors - Helper module for CORS headers
Sample Data:

Pre-populated SPIN questions organized by category (Situation, Problem, Implication, Need-Payoff)
How to use this system:

Deploy the Edge Functions to your Supabase project
Run the SQL scripts to create the database tables and sample questions
Build a frontend application that interacts with these Edge Functions
The system allows you to:

Create and manage foreclosure clients
Conduct structured SPIN questionnaires with clients
Track progress through the questionnaire process
Store and retrieve client responses
Analyze client situations to determine the best foreclosure prevention strategies


I've now added a comprehensive analytics tracking system to your foreclosure CRM. Here's what I've created:

Database Components:

analytics_events table to store all tracked events
Database functions for analytics reporting:
get_events_by_day - Aggregates events by date
get_events_by_type - Counts events by event type
get_user_engagement - Measures user activity and engagement
track_event - SQL function to record events directly from database triggers or functions
Backend Components:

analytics Edge Function - Handles event tracking and dashboard data retrieval
Next.js API route (pages/api/analytics/track) - Processes analytics events from the frontend
Frontend Utility:

utils/analytics.js - Client-side module with:
trackEvent() - Records general events
trackFormSubmission() - Specifically tracks form submissions with privacy protection
Intelligent batching and queueing to minimize API calls
Fallback mechanisms using navigator.sendBeacon for reliable tracking during page unloads

Access Analytics Dashboard (for admins):

The Edge Function provides a /analytics/dashboard endpoint that returns aggregated analytics data
You can build a dashboard UI that fetches from this endpoint
Data is secured with RLS policies to ensure only admins can access it
This analytics system provides valuable insights into:

User engagement and activity patterns
Client acquisition and conversion metrics
Form completion rates and abandonment points
Feature usage and popularity
System performance and error tracking






















import React from 'react';
import { ForeclosureQuestionnaire } from '../components/Forms/ForeclosureQuestionnaire';
import { DollarSign, AlertTriangle, CheckCircle, Home, Building } from 'lucide-react';

export const ForeclosurePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Financing Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <DollarSign className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">
              🏦 Financing Solutions Available Through RepMotivatedSeller
            </h2>
            <p className="text-blue-100 mb-4">
              Private money loans for residential & multifamily investment properties • Non-owner occupied only • Borrower entity required
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Loan Amount</div>
                <div className="text-yellow-200 text-sm">$30K - FHA Cap</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Rate</div>
                <div className="text-yellow-200 text-sm">8% - 15%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Term</div>
                <div className="text-yellow-200 text-sm">6-24 Months</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Residential</div>
                <div className="text-yellow-200 text-sm">1-4 Units</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-sm">Multifamily</div>
                <div className="text-yellow-200 text-sm">5+ Units</div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 max-w-5xl mx-auto">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-300 mr-2" />
                <span className="text-sm text-yellow-200">
                  Available in 36 states • Excludes: MN, NV, SD, UT, VT • Residential & commercial loans available • Broker fees subject to underwriting
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForeclosureQuestionnaire />
    </div>
  );
};
