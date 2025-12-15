# User Story to URL Mapping

This document maps the Product Requirement User Stories to the specific application routes where they are implemented.

## 0.0 Onboarding & Dashboard
- **0.01.a** (Dashboard current state): `/`
- **0.01.c** (Dashboard staff-curated): `/` (DynamicWidgetGrid)
- **0.02.a** (Personalised onboarding experience): `/` (OnboardingChecklist)
- **0.04.c** (Introductory portal guidance): `/` (TutorialOverlay)
- **0.04.d** (Introductory portal guidance - Basic): `/` (TutorialOverlay)

## 1.0 Login, Auth & Profile
- **1.10.1.a** (Okta FastPass Button): `/login`
- **1.10.1.b** (Passkey Button): `/login`
- **1.10.1.c** (Persist login state): `/` (UserContext)
- **1.10.1.d** (Reasonable token life time): Global
- **1.10.1.e** (Remember me): `/login`
- **1.10.1.f** (Single sign-on): `/` (UserContext)
- **1.05.d** (Manage email subscription): `/profile`
- **1.09.a** (Landing page for unauthenticated users): `/` (when logged out)
- **1.04.a** (Access via mobile web): Global
- **1.02.b** (Access to special consideration): `/progress`

## 2.0 Academic Management
- **2.06.1.a** (Canvas deadline integration): `/calendar` (UnifiedCalendar)
- **2.06.1.b** (Integrated academic calendar): `/calendar`
- **2.06.1.c** (Integrated calendar filters): `/calendar`
- **2.06.1.d** (Map integration and related links): `/calendar`
- **2.06.1.e** (Daily calendar summary): `/` (DailyScheduleWidget)
- **2.06.1.f** (Personalised key date calendar): `/calendar`
- **2.06.1.g** (Unified view to subscribe to my calendars): `/calendar`
- **2.11.a** (See my subject final results): `/progress`
- **2.11.b** (Stay updated with real-time assessment grades): `/progress`
- **2.11.c** (Tracking my course progress): `/progress`
- **2.11.d** (Upcoming assessments, assignments and exams): `/` (DeadlinesWidget)

## 2.09 Communications
- **2.09.a** (Announcements UX): `/inbox` (InboxPage)
- **2.09.c** (Announcements): `/inbox`
- **2.09.d** (Notices UX): `/inbox`
- **2.09.e** (Notice overview): `/` (NoticesWidget)
- **2.09.f** (Notices): `/inbox`
- **2.09.g** (Urgent announcement alert): `/inbox` (UrgentAlertModal)
- **2.09.h** (Priority unified messages): `/inbox`

## 3.0 Search & Maps
- **3.02.1.a** (Integrated global search - Unauth): `/` (Header)
- **3.02.1.b** (Search results prioritised - Auth): `/dashboard` (Header)
- **3.03.1.a** (Access campus map via student portal): `/map`
- **3.03.1.e** (Show my current location): `/map`

## 4.0 Enrolment & Timetable
- **4.05.a** (View my enrolment subjects): `/progress`
- **4.05.b** (View my enrolment status): `/progress`
- **4.08.a** (Explore my future study options): `/progress`
- **4.09.a** (MyTimetable Overview): `/timetable`

## 5.0 Personalisation & Service Discovery
- **5.02.b** (Personalise by student segment - Link recs): `/` (LinkRecommendations)
- **5.02.c** (Personalise by student segment - Content): `/` (DynamicWidgetGrid)
- **5.02.d** (Personalise by student segment - Page layouts): `/` (AuthenticatedDashboard)
- **5.02.e** (Personalise by student segment and profile - Content): `/` (DynamicWidgetGrid)
- **5.02.f** (Personalise by student segment and profile - Page layouts): `/` (AuthenticatedDashboard)
- **5.02.g** (Personalise by student segment - Link recs): `/` (LinkRecommendations)
- **5.02.h** (Explicitly capture student preferences): `/profile`
- **5.02.i** (Visibility of information publish dates): Global (Widgets)
- **5.05.a** (Ecosystem navigation): `/dashboard`
- **5.05.c** (Primary navigation - Sidebar): Global Sidebar
- **5.05.d** (Profile navigation): Global Header
- **5.05.e** (Quick links navigation - Custom): `/dashboard`
- **5.05.f** (Quick links navigation - Static): `/dashboard`
- **5.07.a** (Next step recommendations): `/admin` (ServiceSuccessCard)
- **5.07.b** (Timely link suggestions): Global
- **5.07.c** (Transparent reasoning): Global
- **5.07.d** (Exploring student services): Global Navigation
- **5.08.a** (Submit service requests): `/admin`, `/housing`
- **5.09.a** (Digital system status and outages): `/it` (ITServicesPage)
- **5.09.b** (Progress chasing): `/housing`
- **5.10.a** (Conclusion & Transition): `/admin` (ServiceSuccessCard)

## 6.0 Support & Enquiries
- **6.02.1.a** (Enquiry management): `/tasks` (TasksEnquiriesPage)
- **6.02.1.b** (Student Task List): `/tasks`
- **6.02.1.c** (View enquiry details external): `/tasks`
- **6.02.1.d** (View unified enquiries): `/tasks`
- **6.03.a** (AI Search Triage): `/help` (HelpSupportPage)
- **6.03.b** (AI Chat Agent): Global (AIFloatingActionButton)
- **6.03.c** (AI integrated enquiry submission): Global (AIFloatingActionButton)
- **6.04.a** (Guided Stop 1 support): `/help`
- **6.04.c** (Stop 1 contact details): `/help` (ContactOptions)
- **6.05.b** (Personalised Help Centre): `/help`
- **6.05.c** (Stop 1 Digital Centre): `/help`

## 7.0 Admin & Finance
- **7.01.a** (Store and reuse personal documentation): `/documents`
- **7.02.b** (Hide and show sensitive personal details): `/profile` (PersonalDetailsCard)
- **7.02.c** (Unified view of personal details): `/profile`
- **7.03.a** (Unified access to documents): `/admin`
- **7.04.a** (Fees and scholarships): `/admin`
- **7.05.a** (Manage my account password): `/profile`
- **7.05.b** (Manage security and privacy preferences): `/profile`

## 8.0 Student Life & Services (New)
- **8.01.b** (Events and opportunities): `/life` (EventDiscovery)
- **8.02.a** (Peer Mentoring): `/life` (MentoringConnect)
- **8.02.b** (Academic mentoring): `/life` (MentoringConnect)
- **8.03.a** (Accommodation): `/housing`
- **8.03.b** (Financial Support): `/housing`
- **8.04.a** (Student IT): `/it`
- **8.05.a** (Student Visa): `/visa`
- **8.06.a** (Student admin): `/admin`
