import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPES ---
interface Persona {
  faculty: 'science' | 'arts';
  cohort: 'undergrad' | 'postgrad';
  citizenship: 'domestic' | 'international';
  status: 'commencing' | 'returning';
}

interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: NavItem[];
  condition?: (p: Persona) => boolean;
}

// --- MOCK DATA ---
const DEFAULT_USER = {
  id: "s1234567",
  name: "Alex Student",
  email: "alex.student@uni.edu.au",
  avatar: "AS",
  lastLogin: "Today, 9:41 AM"
};

const NAV_STRUCTURE: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'Grid'
  },
  {
    id: 'inbox',
    label: 'Inbox & Notices',
    path: '/inbox',
    icon: 'Bell'
  },
  {
    id: 'calendar',
    label: 'Calendar & Planner',
    path: '/calendar',
    icon: 'Calendar'
  },
  {
    id: 'my-study',
    label: 'My Study',
    children: [
      { id: 'progress', label: 'Progress & Results', path: '/progress' },
      { id: 'timetable', label: 'My Timetable', path: '/timetable' },
      { id: 'enrollment', label: 'Enrolment', path: '/topic/enrollment' }
    ]
  },
  {
    id: 'admin',
    label: 'Admin & Finance',
    path: '/admin',
    icon: 'File'
  },
  {
    id: 'services',
    label: 'Services & Life',
    children: [
      { id: 'housing', label: 'Accommodation', path: '/housing' },
      { id: 'life', label: 'Student Life', path: '/life' },
      { id: 'it', label: 'IT Services', path: '/it' },
      { id: 'visa', label: 'Visa Compliance', path: '/visa', condition: (p: Persona) => p.citizenship === 'international' }
    ]
  },
  {
    id: 'support',
    label: 'Help & Support',
    path: '/help',
    icon: 'LifeBuoy'
  },
  {
    id: 'map',
    label: 'Campus Map',
    path: '/map',
    icon: 'Map'
  },
  {
    id: 'documents',
    label: 'My Documents',
    path: '/documents',
    icon: 'File'
  }
];

const SEARCH_RESULTS_MOCK = [
  { id: 1, title: 'Exam Timetable Sem 1', category: 'Admin', type: 'link', url: '/topic/timetable' },
  { id: 2, title: 'Library Opening Hours', category: 'Library', type: 'link', url: '/topic/library' },
  { id: 3, title: 'How to apply for extension', category: 'Support', type: 'article', url: '/topic/support' },
  { id: 4, title: 'Campus Map PDF', category: 'Campus', type: 'file', url: '/topic/map' },
];

const ONBOARDING_TASKS = [
  { id: 1, label: 'Accept Terms & Conditions', completed: true, auto: true },
  { id: 2, label: 'Upload Student ID Photo', completed: false, auto: false },
  { id: 3, label: 'Complete Academic Integrity Module', completed: false, auto: true },
  { id: 4, label: 'Register for Orientation', completed: false, auto: false },
];

const INTEREST_TAGS = ['Sports', 'Music', 'Coding', 'Volunteering', 'Research', 'Art', 'Debating'];

// Calendar & Academic Data
const CALENDAR_EVENTS = [
  { id: 'c1', type: 'class', title: 'COMP101 Lecture', date: 'Today', time: '10:00 AM', location: 'Building 10, Room 301', url: '/timetable' },
  { id: 'c2', type: 'class', title: 'ENG202 Tutorial', date: 'Today', time: '2:00 PM', location: 'Engineering Block B', url: '/timetable' },
  { id: 'a1', type: 'assignment', title: 'Essay Submission', date: 'Tomorrow', time: '11:59 PM', location: 'Canvas', url: '#' },
  { id: 'k1', type: 'date', title: 'Census Date', date: 'Next Week', time: 'All Day', location: 'Admin', url: '#' },
  { id: 'e1', type: 'exam', title: 'COMP101 Final Exam', date: '12 Nov 2025', time: '9:00 AM', location: 'Examination Hall A', url: '#' },
];

const ACADEMIC_PROGRESS = {
  creditsCompleted: 144,
  creditsTotal: 288,
  expectedCompletion: 'Nov 2026',
  status: 'Good Standing'
};

const GRADES = [
  { 
    code: 'COMP101', name: 'Intro to Programming', mark: 82, grade: 'H1', 
    assessments: [
      { name: 'Assignment 1', mark: '90/100', status: 'Graded' },
      { name: 'Mid-Sem Test', mark: '74/100', status: 'Graded' }
    ] 
  },
  { 
    code: 'ENG202', name: 'Engineering Mechanics', mark: 65, grade: 'H3', 
    assessments: [
      { name: 'Lab Report', mark: 'Pending', status: 'Submitted' }
    ] 
  }
];

// Communications & Support Data
const MESSAGES = [
  { id: 'm1', title: 'URGENT: Campus Power Outage', category: 'Emergency', date: 'Today, 8:00 AM', read: false, body: 'Main campus is currently experiencing a power outage. Classes in Building A are cancelled.' },
  { id: 'm2', title: 'Assignment 1 Graded', category: 'Academic', date: 'Yesterday', read: true, body: 'Your results for Intro to Programming are now available.' },
  { id: 'm3', title: 'Library Fines Outstanding', category: 'Admin', date: '2 days ago', read: false, body: 'Please pay your outstanding fine of $5.00.' },
  { id: 'm4', title: 'Club Sign-up Day', category: 'Community', date: 'Last Week', read: true, body: 'Join us on the lawn for club sign-ups.' },
];

const STUDENT_TASKS = [
  { id: 't1', title: 'Submit Census Form', due: 'Tomorrow', completed: false },
  { id: 't2', title: 'Register for Semester 2 Classes', due: '15 Nov', completed: false },
  { id: 't3', title: 'Update Emergency Contact', due: 'ASAP', completed: true },
];

const ENQUIRIES = [
  { id: 'e1', title: 'Subject Amendment Request', status: 'In Progress', updated: 'Today', lastResponse: 'We are reviewing your request.' },
  { id: 'e2', title: 'Lost ID Card', status: 'Action Required', updated: 'Yesterday', lastResponse: 'Please upload a new photo.' },
  { id: 'e3', title: 'Timetable Clash', status: 'Closed', updated: 'Last Month', lastResponse: 'Resolved.' },
];

// Service Catalogue Mock Data
const INVOICES = [
  { id: 'i1', desc: 'Semester 2 Tuition Fees', amount: '$4,200.00', status: 'Overdue', due: '15 Aug' },
  { id: 'i2', desc: 'Student Services Amenities Fee', amount: '$163.00', status: 'Due Soon', due: '30 Sep' },
  { id: 'i3', desc: 'Library Fine', amount: '$5.00', status: 'Paid', due: 'N/A' },
];

const AVAILABLE_DOCS = [
  { id: 'd1', name: 'Academic Transcript (Official)', price: '$20.00' },
  { id: 'd2', name: 'Proof of Enrolment Letter', price: 'Free' },
  { id: 'd3', name: 'Completion Letter', price: 'Free' },
];

const IT_SYSTEMS = [
  { name: 'Canvas LMS', status: 'Operational' },
  { name: 'Student Email', status: 'Operational' },
  { name: 'Eduroam WiFi', status: 'Degraded Performance' },
];

const HOUSING_LIST = [
  { id: 'h1', name: 'University Square', type: 'Uni Accommodation', price: '$350/wk', status: 'Open' },
  { id: 'h2', name: 'International House', type: 'College', price: '$500/wk', status: 'Waitlist' },
];

const EVENTS_LIST = [
  { id: 'ev1', name: 'O-Week Party', date: 'Mon 24 Feb', attending: 142 },
  { id: 'ev2', name: 'Career Fair', date: 'Wed 12 Mar', attending: 56 },
];

// --- ICONS (Inline SVG) ---
const Icons = {
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  File: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Map: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  MapPin: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  Share: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>,
  Bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  CheckSquare: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
  LifeBuoy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>,
  MessageCircle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  Send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  AlertTriangle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Server: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
};

// --- ROUTER (Custom Hash Router) ---
const RouterContext = createContext({ path: '/', push: (p: string) => {} });

const RouterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const push = (newPath: string) => {
    window.location.hash = newPath;
  };

  return (
    <RouterContext.Provider value={{ path, push }}>
      {children}
    </RouterContext.Provider>
  );
};

const useRouter = () => useContext(RouterContext);

// --- PERSONALISATION & AUTH CONTEXT ---

interface UserContextState {
  isAuthenticated: boolean;
  user: typeof DEFAULT_USER | null;
  persona: Persona;
  login: (method: 'standard' | 'fastpass' | 'passkey') => void;
  logout: () => void;
  updatePersona: (updates: Partial<Persona>) => void;
  tutorialSeen: boolean;
  markTutorialSeen: () => void;
}

const UserContext = createContext<UserContextState>({} as UserContextState);

const UserProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<typeof DEFAULT_USER | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const router = useRouter();

  // Personalisation State (Data Story 5.02.c, 5.02.d, 5.02.e)
  const [persona, setPersona] = useState<Persona>({
    faculty: 'science',
    cohort: 'undergrad',
    citizenship: 'domestic',
    status: 'commencing' // Default to commencing to show onboarding
  });

  // Load session from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('portal_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser(DEFAULT_USER);
    }
  }, []);

  const login = (method: string) => {
    localStorage.setItem('portal_auth', 'true');
    setIsAuthenticated(true);
    setUser(DEFAULT_USER);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('portal_auth');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  const updatePersona = (updates: Partial<Persona>) => {
    setPersona(prev => ({ ...prev, ...updates }));
  };

  const markTutorialSeen = () => setTutorialSeen(true);

  return (
    <UserContext.Provider value={{ isAuthenticated, user, persona, updatePersona, login, logout, tutorialSeen, markTutorialSeen }}>
      {children}
    </UserContext.Provider>
  );
};

// --- SHARED COMPONENTS ---

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  lastUpdated?: string;
  className?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, lastUpdated, className = '', action }) => (
  <div className={`card ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: title ? '16px' : 0 }}>
      {title && <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px' }}>{title}</h3>}
      {action}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
    {/* Data Story 5.02.i - Last Updated Metadata */}
    {lastUpdated && (
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-tertiary-text)' }} data-story-code="5.02.i">
        Last updated: {lastUpdated}
      </div>
    )}
  </div>
);

const ServiceSuccessCard = ({ title, message, onDismiss }: { title: string, message: string, onDismiss: () => void }) => (
  <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-msg)' }} data-story-code="5.10.a">
    <div style={{ color: 'var(--color-success-msg)', marginBottom: '16px' }}><Icons.Check /></div>
    <h3 style={{ margin: '0 0 8px', color: 'var(--color-success-msg)' }}>{title}</h3>
    <p style={{ marginBottom: '16px' }}>{message}</p>
    <button onClick={onDismiss} className="btn btn-outline" style={{ borderColor: 'var(--color-success-msg)', color: 'var(--color-success-msg)' }}>Close</button>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '24px', zIndex: 2001, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icons.X /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const SensitiveDataField = ({ label, value, type = "text" }: { label: string, value: string, type?: string }) => {
  const [revealed, setRevealed] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleReveal = () => {
    if (revealed) {
      setRevealed(false);
    } else {
      setShowPinModal(true);
      setPin('');
      setError('');
    }
  };

  const submitPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0000') {
      setRevealed(true);
      setShowPinModal(false);
    } else {
      setError('Incorrect PIN. Try 0000.');
    }
  };

  return (
    <div style={{ marginBottom: '16px' }} data-story-code="7.02.b, 7.02.c">
      <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--color-secondary-surface)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600 }}>
          {revealed ? value : '••••••••'}
        </div>
        <button 
          onClick={handleReveal} 
          style={{ background: 'none', border: 'none', color: 'var(--color-links)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          aria-label={revealed ? "Hide value" : "Reveal value"}
        >
          {revealed ? 'Hide' : <><Icons.Eye /> Reveal</>}
        </button>
      </div>

      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Security Check">
        <form onSubmit={submitPin}>
          <p style={{ marginBottom: '16px', fontSize: '14px' }}>Enter your 4-digit PIN to reveal sensitive information.</p>
          <input 
            type="password" 
            maxLength={4} 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN (0000)"
            autoFocus
            style={{ width: '100%', padding: '12px', fontSize: '18px', letterSpacing: '4px', textAlign: 'center', marginBottom: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
          />
          {error && <div style={{ color: 'var(--color-error)', fontSize: '12px', marginBottom: '8px' }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" onClick={() => setShowPinModal(false)} className="btn">Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm</button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-links)', fontSize: '12px', textDecoration: 'underline' }}>Forgot PIN?</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- FEATURE COMPONENTS ---

const PersonalisationControls = () => {
  const { persona, updatePersona } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);

  // Dev-tool style floating panel to demonstrate personalisation engine
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 5000 }}>
      {isOpen ? (
        <div className="card" style={{ width: '300px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--color-brand-root)' }}>Personalisation Engine</h4>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none' }}><Icons.X /></button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Cohort</label>
              <select value={persona.cohort} onChange={e => updatePersona({ cohort: e.target.value as any })} style={{ width: '100%', padding: '4px' }}>
                <option value="undergrad">Undergraduate</option>
                <option value="postgrad">Postgraduate</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Faculty</label>
              <select value={persona.faculty} onChange={e => updatePersona({ faculty: e.target.value as any })} style={{ width: '100%', padding: '4px' }}>
                <option value="science">Science</option>
                <option value="arts">Arts</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Status</label>
              <select value={persona.status} onChange={e => updatePersona({ status: e.target.value as any })} style={{ width: '100%', padding: '4px' }}>
                <option value="commencing">Commencing (New)</option>
                <option value="returning">Returning</option>
              </select>
            </div>
             <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Citizenship</label>
              <select value={persona.citizenship} onChange={e => updatePersona({ citizenship: e.target.value as any })} style={{ width: '100%', padding: '4px' }}>
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          title="Toggle Student Persona"
        >
          <Icons.Settings />
        </button>
      )}
    </div>
  );
};

const AIFloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Hi Alex! I am your AI Assistant. How can I help you today?' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChatHistory([...chatHistory, { role: 'user', text: message }]);
    setMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'This is a simulated AI response. I can help with finding library books, checking your timetable, or contacting Stop 1.' }]);
    }, 1000);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '24px', right: '80px', zIndex: 5000 }} data-story-code="6.03.b, 6.03.c">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="btn"
          style={{ 
            borderRadius: '50%', width: '48px', height: '48px', padding: 0, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: 'var(--color-primary-cta)', color: 'black'
          }}
          title="AI Assistant"
        >
          {isOpen ? <Icons.X /> : <Icons.MessageCircle />}
        </button>
      </div>

      {isOpen && (
        <div className="card" style={{ position: 'fixed', bottom: '80px', right: '24px', width: '320px', height: '450px', zIndex: 5000, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>AI Assistant</h4>
            <span style={{ fontSize: '10px', background: 'var(--color-brand-light)', padding: '2px 6px', borderRadius: '4px' }}>Beta</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '10px', borderRadius: '12px', background: msg.role === 'user' ? 'var(--color-primary-cta)' : 'var(--color-secondary-surface)', fontSize: '14px' }}>
                {msg.text}
                {msg.role === 'bot' && <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>Generated by AI</div>}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px' }}><Icons.Send /></button>
          </form>
        </div>
      )}
    </>
  );
};

const UrgentAlertModal = ({ onClose }: { onClose: () => void }) => {
  const urgentMessage = MESSAGES.find(m => m.category === 'Emergency' && !m.read);
  if (!urgentMessage) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }} data-story-code="2.09.g">
      <div className="card" style={{ maxWidth: '500px', width: '100%', borderLeft: '8px solid var(--color-error)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--color-error)' }}><Icons.AlertTriangle /></div>
          <div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--color-error)' }}>{urgentMessage.title}</h2>
            <p style={{ marginBottom: '16px' }}>{urgentMessage.body}</p>
            <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)', marginBottom: '24px' }}>{urgentMessage.date}</div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>I Acknowledge</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingChecklist = () => {
  const { persona } = useContext(UserContext);
  const [tasks, setTasks] = useState(ONBOARDING_TASKS);
  const [isVisible, setIsVisible] = useState(true);

  // Data Story 0.02.a: Visible only for Commencing students
  if (persona.status !== 'commencing' || !isVisible) return null;

  const toggleTask = (id: number, auto: boolean) => {
    if (auto) return; // Cannot manually toggle auto tasks
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="card" style={{ background: 'var(--color-brand-light)', border: 'none', marginBottom: '24px' }} data-story-code="0.02.a">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--color-brand-root)' }}>Welcome to University!</h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Complete your onboarding tasks to get started.</p>
        </div>
        <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--color-tertiary-text)' }}><Icons.X /></button>
      </div>

      <div style={{ marginBottom: '16px', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, background: 'var(--color-success-msg)', height: '100%', transition: 'width 0.5s ease' }} />
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', opacity: task.completed ? 0.6 : 1 }}>
            <button 
              onClick={() => toggleTask(task.id, task.auto)}
              disabled={task.auto}
              style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                border: task.completed ? 'none' : '2px solid var(--color-brand-root)',
                background: task.completed ? 'var(--color-success-msg)' : 'white',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px',
                cursor: task.auto ? 'default' : 'pointer'
              }}
            >
              {task.completed && <Icons.Check />}
            </button>
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.label}</span>
            {task.auto && <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>System</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const LinkRecommendations = () => {
  const { persona } = useContext(UserContext);
  // Data Story 5.02.b, 5.02.g
  
  const recommendations = [
    // Global
    { label: 'Campus Map', url: '/map' },
    // Faculty specific
    ...(persona.faculty === 'science' ? [{ label: 'Lab Safety Guide', url: '#' }, { label: 'Science Society', url: '#' }] : []),
    ...(persona.faculty === 'arts' ? [{ label: 'Essay Writing Guide', url: '#' }, { label: 'Arts Hub', url: '#' }] : []),
    // Cohort specific
    ...(persona.cohort === 'postgrad' ? [{ label: 'Thesis Submission', url: '#' }] : []),
  ];

  return (
    <Card title="Recommended for you" lastUpdated="Weekly">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {recommendations.map((link, i) => (
          <li key={i} style={{ marginBottom: '12px' }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-links)', fontWeight: 600 }}>
              <Icons.ArrowRight /> {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const TutorialOverlay = () => {
  const { tutorialSeen, markTutorialSeen } = useContext(UserContext);
  const [step, setStep] = useState(0);

  // Data Story 0.04.c, 0.04.d
  if (tutorialSeen) return null;

  const steps = [
    { title: "Welcome to your new Portal", desc: "This is your unified dashboard for everything university related." },
    { title: "Navigation", desc: "Use the sidebar to access your Study, Finances, and Support services." },
    { title: "Global Search", desc: "Find anything instantly using the search bar above." },
    { title: "Personalised for you", desc: "Your widgets update automatically based on your enrolment." }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else markTutorialSeen();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }}>
        <div style={{ marginBottom: '16px', fontSize: '48px' }}>✨</div>
        <h2 style={{ marginBottom: '12px' }}>{steps[step].title}</h2>
        <p style={{ marginBottom: '24px', color: 'var(--color-tertiary-text)' }}>{steps[step].desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={markTutorialSeen} style={{ background: 'none', border: 'none', color: 'var(--color-tertiary-text)' }}>Skip</button>
          <div style={{ display: 'flex', gap: '4px' }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === step ? 'var(--color-primary-cta)' : 'var(--color-border)' }} />
            ))}
          </div>
          <button onClick={handleNext} className="btn btn-primary">{step === steps.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
};

// --- WIDGETS ---

const QuickLinksWidget = () => {
  const router = useRouter();
  const [links, setLinks] = useState([
    { id: 'l1', label: 'Library', url: '/topic/library' },
    { id: 'l2', label: 'Canvas', url: '/topic/canvas' },
    { id: 'l3', label: 'Email', url: '/topic/email' },
    { id: 'l6', label: 'Handbook', url: '/topic/handbook' }
  ]);

  return (
    <Card title="Quick Links" lastUpdated="Always live" className="widget-quick-links" data-story-code="5.05.e">
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
         {links.map(link => (
            <button
              key={link.id}
              onClick={() => router.push(link.url)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-secondary-surface)',
                color: 'var(--color-primary-text)',
                fontWeight: 600,
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              {link.label}
            </button>
          ))}
          <button style={{ padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-border)', background: 'transparent', color: 'var(--color-tertiary-text)' }}>
             <Icons.Plus />
          </button>
       </div>
    </Card>
  );
};

const DailyScheduleWidget = () => {
  const router = useRouter();
  // Filter for 'Today'
  const todaysEvents = CALENDAR_EVENTS.filter(e => e.date === 'Today').slice(0, 3);

  return (
    <Card title="Daily Schedule" lastUpdated="Live" data-story-code="2.06.1.e">
      {todaysEvents.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {todaysEvents.map(event => (
            <li key={event.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{event.time.split(' ')[0]}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-tertiary-text)' }}>{event.time.split(' ')[1]}</span>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'var(--color-secondary-surface)', borderRadius: '4px', borderLeft: '4px solid var(--color-primary-cta)' }}>
                <div style={{ fontWeight: 600 }}>{event.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{event.location}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : <p>No events today.</p>}
      <button onClick={() => router.push('/calendar')} className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }}>View Full Calendar</button>
    </Card>
  );
};

const DeadlinesWidget = () => {
  const deadlines = CALENDAR_EVENTS.filter(e => e.type === 'assignment' || e.type === 'exam');

  return (
    <Card title="Upcoming Deadlines" lastUpdated="Canvas Synced" data-story-code="2.11.d">
       <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {deadlines.map(item => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: item.type === 'exam' ? 'var(--color-error)' : 'var(--color-primary-text)' }}>
                   {item.type === 'exam' && '❗'} {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Due {item.date}</div>
              </div>
              <a href={item.url} style={{ fontSize: '12px', color: 'var(--color-links)' }}>View</a>
            </li>
          ))}
       </ul>
    </Card>
  );
};

const NotificationsWidget = () => {
  const router = useRouter();
  const unreadCount = MESSAGES.filter(m => !m.read).length;
  // Data Story 2.09.e: Notices overview (Top 3 unread)
  const topNotices = MESSAGES.filter(m => !m.read).slice(0, 3);

  return (
    <Card title="Notices" lastUpdated="Live" data-story-code="2.09.e">
      {topNotices.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {topNotices.map(notice => (
            <li key={notice.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: notice.category === 'Emergency' ? 'var(--color-error)' : 'var(--color-primary-text)' }}>
                {notice.category === 'Emergency' && <Icons.AlertTriangle />} {notice.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{notice.category} • {notice.date}</div>
            </li>
          ))}
        </ul>
      ) : <p style={{ color: 'var(--color-tertiary-text)' }}>No new notices.</p>}
      <button onClick={() => router.push('/inbox')} className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }}>View Inbox ({unreadCount})</button>
    </Card>
  );
};

const FacultyNewsWidget = () => {
  const { persona } = useContext(UserContext);
  // Data Story 5.02.c: Personalised content
  const news = persona.faculty === 'science' 
    ? { title: "Science Faculty News", items: ["New Lab Equipment Arriving", "Guest Lecture: Quantum Physics"] }
    : { title: "Arts Faculty News", items: ["Gallery Opening Night", "Essay Writing Workshop"] };

  return (
    <Card title={news.title} lastUpdated="Today, 9:00 AM">
      <ul style={{ paddingLeft: '20px', margin: 0 }}>
        {news.items.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
      </ul>
    </Card>
  );
};

const VisaWidget = () => {
  const { persona } = useContext(UserContext);
  const router = useRouter();
  // Conditional widget
  if (persona.citizenship !== 'international') return null;
  
  return (
    <Card title="Visa Status" lastUpdated="Daily" className="visa-widget">
      <div 
        onClick={() => router.push('/visa')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-success-bg)', borderRadius: '4px', border: '1px solid var(--color-success-msg)', cursor: 'pointer' }}
      >
        <Icons.Check />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-success-msg)' }}>Active (Subclass 500)</div>
          <div style={{ fontSize: '12px' }}>Expires: 12 Dec 2026</div>
        </div>
      </div>
    </Card>
  );
};

// --- PAGES ---

const AdminFinancePage = () => {
  const [successMsg, setSuccessMsg] = useState('');

  if (successMsg) {
    return <div style={{ maxWidth: '800px', margin: '0 auto' }}><ServiceSuccessCard title="Request Submitted" message={successMsg} onDismiss={() => setSuccessMsg('')} /></div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>Student Admin & Finance</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Invoices & Fees</h2>
          <Card data-story-code="7.04.a">
            {INVOICES.map(inv => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inv.desc}</div>
                  <div style={{ fontSize: '12px', color: inv.status === 'Overdue' ? 'var(--color-error)' : 'var(--color-tertiary-text)' }}>
                    Due: {inv.due} • {inv.status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{inv.amount}</div>
                  {inv.status !== 'Paid' && <button onClick={() => setSuccessMsg('Payment processed successfully.')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Pay Now</button>}
                </div>
              </div>
            ))}
          </Card>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Official Documents</h2>
          <Card data-story-code="7.03.a">
            {AVAILABLE_DOCS.map(doc => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.File />
                  <span>{doc.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{doc.price}</span>
                  <button onClick={() => setSuccessMsg(`Your request for ${doc.name} has been received. You will be notified when it is ready.`)} className="btn btn-outline" style={{ padding: '4px 8px' }}><Icons.Download /></button>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
};

const VisaPage = () => {
  const { persona } = useContext(UserContext);
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (persona.citizenship !== 'international') router.push('/');
  }, [persona, router]);

  if (successMsg) {
    return <div style={{ maxWidth: '800px', margin: '0 auto' }}><ServiceSuccessCard title="Extension Requested" message={successMsg} onDismiss={() => setSuccessMsg('')} /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>Student Visa Compliance</h1>
      
      <Card title="Compliance Status" data-story-code="8.05.a">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-msg)', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-success-msg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Icons.Check /></div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-success-msg)' }}>Compliant</h3>
            <p style={{ margin: 0 }}>Your Confirmation of Enrolment (CoE) and Visa status are valid.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--color-secondary-surface)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Visa Expiry</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>12 Dec 2026</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-secondary-surface)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>CoE End Date</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>30 Nov 2026</div>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={() => setSuccessMsg('We have logged your request for a CoE extension. An officer will contact you shortly.')} className="btn btn-outline">Request CoE Extension</button>
        </div>
      </Card>
    </div>
  );
};

const AccommodationWellbeingPage = () => {
  const [successMsg, setSuccessMsg] = useState('');

  if (successMsg) return <div style={{ maxWidth: '800px', margin: '0 auto' }}><ServiceSuccessCard title="Application Submitted" message={successMsg} onDismiss={() => setSuccessMsg('')} /></div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>Accommodation & Wellbeing</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Housing Directory</h2>
          <Card data-story-code="8.03.a">
            {HOUSING_LIST.map(h => (
              <div key={h.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>{h.name}</div>
                  <div style={{ fontSize: '12px', background: 'var(--color-brand-light)', padding: '2px 6px', borderRadius: '4px' }}>{h.status}</div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-tertiary-text)', marginBottom: '12px' }}>{h.type} • {h.price}</div>
                <button onClick={() => setSuccessMsg(`Application for ${h.name} started.`)} className="btn btn-primary" style={{ width: '100%', fontSize: '14px' }}>Apply Now</button>
              </div>
            ))}
          </Card>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Scholarships & Grants</h2>
          <Card data-story-code="8.03.b">
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-info-bg)', color: 'var(--color-info)', borderRadius: '4px', fontSize: '14px' }}>
              Based on your profile, you are eligible for:
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 'bold' }}>Academic Excellence Grant</div>
                <p style={{ fontSize: '12px', margin: '4px 0 8px' }}>For students with H1 average.</p>
                <button onClick={() => setSuccessMsg('Grant application submitted.')} className="btn btn-outline" style={{ fontSize: '12px' }}>Apply</button>
              </li>
              <li>
                <div style={{ fontWeight: 'bold' }}>Housing Support Bursary</div>
                <p style={{ fontSize: '12px', margin: '4px 0 8px' }}>Financial aid for accommodation costs.</p>
                <button onClick={() => setSuccessMsg('Bursary application submitted.')} className="btn btn-outline" style={{ fontSize: '12px' }}>Apply</button>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
};

const ITServicesPage = () => {
  const [mockOutage, setMockOutage] = useState(false);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>IT Services</h1>
        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={mockOutage} onChange={() => setMockOutage(!mockOutage)} /> Simulate Outage
        </label>
      </div>

      {mockOutage && (
        <div style={{ padding: '16px', background: 'var(--color-error)', color: 'white', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }} data-story-code="5.09.a">
          <Icons.AlertTriangle />
          <div>
            <strong>Major System Outage</strong>
            <div>LMS and Email services are currently unavailable. Technicians are investigating.</div>
          </div>
        </div>
      )}

      <Card title="System Status" data-story-code="5.09.a">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {IT_SYSTEMS.map((sys, i) => (
            <div key={i} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: (mockOutage && i < 2) ? 'var(--color-error)' : (sys.status === 'Operational' ? 'var(--color-success-msg)' : 'var(--color-warning)'), margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{sys.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{(mockOutage && i < 2) ? 'Outage' : sys.status}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Software Catalogue</h2>
        <Card data-story-code="8.04.a">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <strong>Microsoft Office 365</strong>
                <div style={{ fontSize: '12px' }}>Essential productivity suite.</div>
              </div>
              <button className="btn btn-outline" style={{ fontSize: '12px' }}>Download</button>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <strong>MATLAB</strong>
                <div style={{ fontSize: '12px' }}>For Science & Engineering students.</div>
              </div>
              <button className="btn btn-outline" style={{ fontSize: '12px' }}>Download</button>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

const StudentLifePage = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>Student Life</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Events</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} data-story-code="8.01.b">
            {EVENTS_LIST.map(ev => (
              <Card key={ev.id}>
                <div style={{ height: '100px', background: 'var(--color-brand-light)', marginBottom: '12px', borderRadius: '4px' }}></div>
                <div style={{ fontWeight: 'bold' }}>{ev.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)', marginBottom: '8px' }}>{ev.date}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <Icons.Users /> {ev.attending} attending
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>Register</button>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Mentoring</h2>
          <Card title="Connect" data-story-code="8.02.a, 8.02.b">
            <p style={{ fontSize: '14px' }}>Find a mentor to help navigate university life.</p>
            <div style={{ padding: '12px', background: 'var(--color-secondary-surface)', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Peer Mentoring</div>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>Connect with senior students.</p>
              <button className="btn btn-outline" style={{ width: '100%', fontSize: '12px' }}>Join Program</button>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-secondary-surface)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Career Mentoring</div>
              <p style={{ fontSize: '12px', margin: '4px 0' }}>Industry professional connections.</p>
              <button className="btn btn-outline" style={{ width: '100%', fontSize: '12px' }}>Join Program</button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

const InboxPage = () => {
  const [filter, setFilter] = useState('All');
  const [messages, setMessages] = useState(MESSAGES);
  const [showAlert, setShowAlert] = useState(true);

  const toggleRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  const filteredMessages = filter === 'All' ? messages : messages.filter(m => m.category === filter);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Inbox & Notices</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Academic', 'Admin', 'Emergency'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className="btn"
              style={{ 
                padding: '4px 12px', fontSize: '12px', borderRadius: '16px',
                background: filter === cat ? 'var(--color-brand-root)' : 'transparent',
                color: filter === cat ? 'white' : 'var(--color-primary-text)',
                border: '1px solid var(--color-border)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showAlert && <UrgentAlertModal onClose={() => setShowAlert(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-story-code="2.09.h, 2.09.a">
        {filteredMessages.map(msg => (
          <div key={msg.id} className="card" style={{ padding: '20px', borderLeft: msg.read ? '1px solid var(--color-border)' : '4px solid var(--color-primary-cta)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {msg.category === 'Emergency' && <span style={{ color: 'var(--color-error)' }}><Icons.AlertTriangle /></span>}
                <h3 style={{ margin: 0, fontSize: '16px' }}>{msg.title}</h3>
                {!msg.read && <span style={{ fontSize: '10px', background: 'var(--color-brand-light)', padding: '2px 6px', borderRadius: '4px' }}>New</span>}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{msg.date}</span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--color-secondary-text)' }}>{msg.body}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-secondary-surface)' }}>{msg.category}</span>
              <button onClick={() => toggleRead(msg.id)} style={{ background: 'none', border: 'none', color: 'var(--color-links)', fontSize: '12px', cursor: 'pointer' }}>
                {msg.read ? 'Mark Unread' : 'Mark Read'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TasksEnquiriesPage = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'enquiries'>('tasks');
  const [tasks, setTasks] = useState(STUDENT_TASKS);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>My Tasks & Enquiries</h1>
      
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'tasks' ? '2px solid var(--color-primary-cta)' : 'none', fontWeight: 600, color: activeTab === 'tasks' ? 'var(--color-primary-text)' : 'var(--color-tertiary-text)' }}
        >
          My Tasks
        </button>
        <button 
          onClick={() => setActiveTab('enquiries')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'enquiries' ? '2px solid var(--color-primary-cta)' : 'none', fontWeight: 600, color: activeTab === 'enquiries' ? 'var(--color-primary-text)' : 'var(--color-tertiary-text)' }}
        >
          Enquiries (Stop 1)
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div data-story-code="6.02.1.b">
          {tasks.map(task => (
            <div key={task.id} className="card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', opacity: task.completed ? 0.6 : 1 }}>
              <button 
                onClick={() => toggleTask(task.id)}
                style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', marginRight: '16px',
                  border: task.completed ? 'none' : '2px solid var(--color-brand-root)',
                  background: task.completed ? 'var(--color-success-msg)' : 'white',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {task.completed && <Icons.Check />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Due: {task.due}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div data-story-code="6.02.1.a, 6.02.1.d">
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <button className="btn btn-primary">New Enquiry</button>
          </div>
          {ENQUIRIES.map(enq => (
            <div key={enq.id} className="card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{enq.title}</h3>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: enq.status === 'Closed' ? 'var(--color-secondary-surface)' : 'var(--color-info-bg)', color: enq.status === 'Closed' ? 'var(--color-tertiary-text)' : 'var(--color-info)' }}>{enq.status}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '12px' }}>Latest: "{enq.lastResponse}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-tertiary-text)' }}>
                <span>Updated: {enq.updated}</span>
                <a href="#" style={{ color: 'var(--color-links)' }}>View Details</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HelpSupportPage = () => {
  const { persona } = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [showContact, setShowContact] = useState(false);

  // Data Story 6.03.a: Triage Search with mocked AI
  const isAIQuery = query.toLowerCase().includes('exam') || query.toLowerCase().includes('visa');
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '40px 0', background: 'var(--color-brand-root)', color: 'white', borderRadius: '8px' }}>
        <h1 style={{ marginBottom: '16px' }}>How can we help?</h1>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question (e.g. 'Exams', 'Visa')..." 
          style={{ width: '80%', padding: '16px', borderRadius: '30px', border: 'none', fontSize: '16px' }}
          data-story-code="6.04.a"
        />
      </div>

      {query ? (
        <div style={{ marginBottom: '32px' }}>
          {isAIQuery ? (
            <Card title="AI Answer" className="ai-result">
              <div style={{ background: 'var(--color-brand-light)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0 }}>
                  {query.toLowerCase().includes('visa') 
                    ? "As an international student, you must maintain a valid CoE. Contact Stop 1 immediately if you underload."
                    : "Exam timetables are released 6 weeks before the assessment period. Check your 'My Study' tab."}
                </p>
                <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.6 }}>Generated by AI</div>
              </div>
              <p>Was this helpful? <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>👍</button> <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>👎</button></p>
            </Card>
          ) : (
            <Card title="Search Results">
              <ul style={{ paddingLeft: '20px' }}>
                <li><a href="#">General FAQ about "{query}"</a></li>
                <li><a href="#">Student Handbook Entry</a></li>
              </ul>
            </Card>
          )}
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p>Still need help?</p>
            <button onClick={() => setShowContact(true)} className="btn btn-outline">Contact Stop 1</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <Card title="Popular Topics">
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><a href="#">Enrolment Help</a></li>
              <li><a href="#">Fees & Payments</a></li>
              <li><a href="#">Exams & Results</a></li>
            </ul>
          </Card>
          {/* Data Story 6.05.b: Personalised Help */}
          <Card title="Recommended for You">
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              {persona.citizenship === 'international' && <li><a href="#">Visa Renewal Guide</a></li>}
              {persona.faculty === 'science' && <li><a href="#">Lab Safety Protocols</a></li>}
              <li><a href="#">Academic Adjustment Plan</a></li>
            </ul>
          </Card>
        </div>
      )}

      {showContact && (
        <Card title="Contact Stop 1" className="contact-options" data-story-code="6.04.c">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <Icons.Phone />
              <div style={{ fontWeight: 600, marginTop: '8px' }}>Call Us</div>
              <a href="tel:1300123456">13 00 12 34 56</a>
              <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>9am - 5pm Mon-Fri</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <Icons.MapPin />
              <div style={{ fontWeight: 600, marginTop: '8px' }}>Visit Us</div>
              <div>757 Swanston St</div>
              <a href="#" style={{ fontSize: '12px' }}>View on Map</a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const UnifiedCalendarPage = () => {
  const [view, setView] = useState<'planner' | 'month'>('planner');
  const [filters, setFilters] = useState({ class: true, assignment: true, exam: true, date: true });
  const [showSubscription, setShowSubscription] = useState(false);

  const toggleFilter = (type: keyof typeof filters) => setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const filteredEvents = CALENDAR_EVENTS.filter(e => filters[e.type as keyof typeof filters]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
         <h1 style={{ margin: 0 }}>My Calendar</h1>
         <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowSubscription(true)} className="btn btn-outline" style={{ display: 'flex', gap: '8px', padding: '8px 12px' }} data-story-code="2.06.1.g">
               <Icons.Share /> Subscribe
            </button>
            <div style={{ display: 'flex', background: 'var(--color-primary-surface)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setView('planner')} style={{ padding: '8px 16px', border: 'none', background: view === 'planner' ? 'var(--color-brand-light)' : 'transparent', fontWeight: 600 }}>Planner</button>
              <button onClick={() => setView('month')} style={{ padding: '8px 16px', border: 'none', background: view === 'month' ? 'var(--color-brand-light)' : 'transparent', fontWeight: 600 }}>Month</button>
            </div>
         </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
          {/* Filters Panel */}
          <div className="card" style={{ height: 'fit-content', padding: '16px' }} data-story-code="2.06.1.c">
             <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Filter /> Filters</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {Object.keys(filters).map(key => (
                 <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textTransform: 'capitalize' }}>
                   <input type="checkbox" checked={filters[key as keyof typeof filters]} onChange={() => toggleFilter(key as keyof typeof filters)} />
                   {key}s
                 </label>
               ))}
             </div>
          </div>

          {/* Calendar View */}
          <div className="card" style={{ padding: '0' }} data-story-code="2.06.1.b, 2.06.1.a, 2.06.1.d">
             {view === 'planner' ? (
               <div style={{ padding: '24px' }}>
                 {filteredEvents.map(event => (
                   <div key={event.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ width: '60px', textAlign: 'center' }}>
                         <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-tertiary-text)' }}>{event.date === 'Today' || event.date === 'Tomorrow' ? 'NOW' : event.date.split(' ')[1]}</div>
                         <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.date === 'Today' || event.date === 'Tomorrow' ? event.date : event.date.split(' ')[0]}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>{event.title}</div>
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-brand-light)', textTransform: 'uppercase', height: 'fit-content' }}>{event.type}</span>
                         </div>
                         <div style={{ fontSize: '14px', margin: '4px 0' }}>{event.time} • {event.location}</div>
                         <a href={event.url} style={{ fontSize: '12px', color: 'var(--color-links)' }}>View Details &rarr;</a>
                      </div>
                   </div>
                 ))}
                 {filteredEvents.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-tertiary-text)' }}>No events match your filters.</div>}
               </div>
             ) : (
               <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-tertiary-text)' }}>
                  {/* Simplified Month View Placeholder */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>
                     {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                       <div key={i} style={{ background: 'var(--color-secondary-surface)', padding: '8px', fontWeight: 'bold' }}>{d}</div>
                     ))}
                     {Array.from({ length: 30 }).map((_, i) => (
                       <div key={i} style={{ background: 'white', height: '80px', padding: '4px', fontSize: '12px', position: 'relative' }}>
                         {i + 1}
                         {i === 11 && <div style={{ fontSize: '10px', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '2px' }}>Exam</div>}
                       </div>
                     ))}
                  </div>
               </div>
             )}
             <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)', fontSize: '12px', textAlign: 'center', color: 'var(--color-tertiary-text)' }}>Last updated: Just now</div>
          </div>
       </div>

       <Modal isOpen={showSubscription} onClose={() => setShowSubscription(false)} title="Subscribe to Calendar">
          <p style={{ fontSize: '14px', marginBottom: '16px' }}>Add these feeds to your phone or Outlook calendar.</p>
          <div style={{ marginBottom: '12px' }}>
             <div style={{ fontWeight: 600, fontSize: '14px' }}>Class Timetable</div>
             <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="text" readOnly value="https://uni.edu.au/ical/u12345/timetable.ics" style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'var(--color-secondary-surface)', border: '1px solid var(--color-border)' }} />
                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Copy</button>
             </div>
          </div>
          <div>
             <div style={{ fontWeight: 600, fontSize: '14px' }}>Assignments & Deadlines</div>
             <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="text" readOnly value="https://uni.edu.au/ical/u12345/canvas.ics" style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'var(--color-secondary-surface)', border: '1px solid var(--color-border)' }} />
                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>Copy</button>
             </div>
          </div>
       </Modal>
    </div>
  );
};

const ProgressResultsPage = () => {
  const { persona } = useContext(UserContext);
  // Derived state (Data Story 4.08.a: Show for postgrad/final year)
  const isFinalYear = ACADEMIC_PROGRESS.creditsCompleted > 200;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Course Progress & Results</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
         {/* Progress Tracker (Data Story 2.11.c) */}
         <Card title="Course Progress" lastUpdated="Results Release" data-story-code="2.11.c">
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
               <span>{ACADEMIC_PROGRESS.creditsCompleted} Credits</span>
               <span style={{ color: 'var(--color-tertiary-text)' }}>{ACADEMIC_PROGRESS.creditsTotal} Total</span>
            </div>
            <div style={{ height: '12px', background: 'var(--color-secondary-surface)', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
               <div style={{ width: `${(ACADEMIC_PROGRESS.creditsCompleted / ACADEMIC_PROGRESS.creditsTotal) * 100}%`, background: 'var(--color-primary-cta)', height: '100%' }} />
            </div>
            <p style={{ fontSize: '14px', margin: 0 }}>Expected Completion: <strong>{ACADEMIC_PROGRESS.expectedCompletion}</strong></p>
            <p style={{ fontSize: '14px', margin: '4px 0 0', color: 'var(--color-success-msg)' }}>Status: {ACADEMIC_PROGRESS.status}</p>
         </Card>

         {/* Enrolment Snapshot (Data Story 4.05.a, 4.05.b) */}
         <Card title="Current Enrolment" lastUpdated="Census Date" data-story-code="4.05.a, 4.05.b">
             <div style={{ marginBottom: '12px', padding: '8px', background: 'var(--color-info-bg)', color: 'var(--color-info)', borderRadius: '4px', fontSize: '12px' }}>
                Study plan valid. You are enrolled in 50 credits.
             </div>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
               {GRADES.map(subject => (
                 <li key={subject.code} style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                   <span>{subject.code}</span>
                   <span style={{ color: 'var(--color-tertiary-text)' }}>Enrolled</span>
                 </li>
               ))}
             </ul>
         </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
         {/* Results List (Data Story 2.11.a, 2.11.b) */}
         <Card title="Results & Grades" lastUpdated="Live from Canvas">
            {GRADES.map(subject => (
               <div key={subject.code} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                     <div>
                        <div style={{ fontWeight: 600 }}>{subject.code}: {subject.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Final Grade: <strong>{subject.grade}</strong> ({subject.mark})</div>
                     </div>
                     <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }}>Details</button>
                  </div>
                  <div style={{ background: 'var(--color-secondary-surface)', padding: '12px', borderRadius: '4px' }}>
                     <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-tertiary-text)', margin: '0 0 8px' }}>Internal Assessments</h4>
                     {subject.assessments.map((a, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                           <span>{a.name}</span>
                           <span style={{ fontWeight: 600 }}>{a.mark}</span>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </Card>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Future Study (Data Story 4.08.a) */}
            {isFinalYear || true ? ( // Forced true for prototype visibility
               <Card title="Future Study" className="future-study" data-story-code="4.08.a">
                  <p style={{ fontSize: '14px' }}>Based on your results in Engineering, you might like:</p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                     <li style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px', marginBottom: '8px', fontSize: '14px' }}>
                        <strong>Master of Robotics</strong>
                        <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)', marginTop: '4px' }}>2 Years • Full Time</div>
                     </li>
                  </ul>
                  <button className="btn btn-primary" style={{ width: '100%', fontSize: '14px' }}>Explore Options</button>
               </Card>
            ) : null}

            {/* Special Consideration (Data Story 1.02.b) */}
            <Card title="Need Help?" data-story-code="1.02.b">
               <p style={{ fontSize: '14px', marginBottom: '12px' }}>Impacted by illness or personal circumstances?</p>
               <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  Apply for Special Consideration <Icons.ArrowRight />
               </a>
            </Card>
         </div>
      </div>
    </div>
  );
};

const CampusMapPage = () => {
  const [location, setLocation] = useState<string | null>(null);

  // Data Story 3.03.1.e
  const findMe = () => {
    if (navigator.geolocation) {
       setLocation('Locating...');
       navigator.geolocation.getCurrentPosition(
         () => setLocation('Within 10m of Library'),
         () => setLocation('Location access denied')
       );
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }} data-story-code="3.03.1.a">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
         <h1 style={{ margin: 0 }}>Campus Map</h1>
         <button onClick={findMe} className="btn btn-primary"><Icons.MapPin /> {location || 'Find Me'}</button>
      </div>
      <div className="card" style={{ flex: 1, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
         <div style={{ textAlign: 'center', color: 'var(--color-tertiary-text)' }}>
            <Icons.Map />
            <p>Interactive Map Placeholder</p>
            <p style={{ fontSize: '12px' }}>Pinch to zoom</p>
         </div>
         {/* Simulated Map Markers */}
         <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40px', height: '40px', background: 'var(--color-brand-root)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Lib</div>
         <div style={{ position: 'absolute', top: '60%', left: '70%', width: '40px', height: '40px', background: 'var(--color-primary-cta)', color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>Gym</div>
      </div>
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
         <a href="https://maps.google.com" target="_blank" rel="noreferrer">Open in Google Maps</a>
      </div>
    </div>
  );
};

const TimetablePage = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
       <h1 style={{ marginBottom: '24px' }}>My Timetable</h1>
       
       <Card title="Allocation Status" lastUpdated="Today" data-story-code="4.09.a">
          <div style={{ padding: '16px', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Icons.Calendar />
             <div>
                <strong>Preference Entry Open</strong>
                <div style={{ fontSize: '14px' }}>Enter your class preferences by Friday 5pm.</div>
             </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '4px', marginBottom: '12px' }}>
             <div>
               <div style={{ fontWeight: 600 }}>COMP101</div>
               <div style={{ fontSize: '12px' }}>Lecture: Allocated • Tutorial: Pending</div>
             </div>
             <button className="btn btn-primary">Edit Preferences</button>
          </div>
          
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
             <div>
               <div style={{ fontWeight: 600 }}>ENG202</div>
               <div style={{ fontSize: '12px' }}>Lecture: Allocated • Lab: Allocated</div>
             </div>
             <button className="btn btn-outline">View</button>
          </div>
       </Card>
    </div>
  );
};

const PublicLandingPage = () => {
  const router = useRouter();
  
  return (
    <div data-story-code="1.09.a">
      <header style={{ 
        padding: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--color-primary-surface)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 'bold', color: 'var(--color-brand-root)' }}>UniPortal</div>
        <button onClick={() => router.push('/login')} className="btn btn-primary">Log In</button>
      </header>
      {/* ... (Existing Hero/Features code remains same conceptually, abbreviating for space in this update block, assume previous content) ... */}
       <main>
        <section style={{ padding: '60px 24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--color-brand-root) 0%, #0f1d51 100%)', color: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px' }}>Your Student Journey, Unified.</h1>
            <button onClick={() => router.push('/login')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>Access Student Portal</button>
          </div>
        </section>
      </main>
      <footer style={{ background: 'var(--color-primary-text)', color: 'white', padding: '40px 24px', textAlign: 'center' }}>
        <p>&copy; 2025 University Portal Prototype</p>
      </footer>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useContext(UserContext);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-secondary-surface)', padding: '24px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--color-brand-root)', textAlign: 'center', marginBottom: '32px' }}>UniPortal</h1>
        <button onClick={() => login('standard')} className="btn btn-primary" style={{ width: '100%' }}>Sign In (Simulated)</button>
      </div>
    </div>
  );
};

const AuthenticatedDashboard = () => {
  const { persona } = useContext(UserContext);

  // Data Story 5.02.f: Layout changes based on profile (Grid vs Stacking handled by CSS, content by React)
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }} data-story-code="0.01.a, 5.02.f">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '8px' }}>Welcome back, Alex.</h1>
        <p style={{ color: 'var(--color-tertiary-text)' }}>
          {persona.status === 'commencing' ? "Let's get you settled in." : "Here is your daily overview."}
        </p>
      </div>

      <OnboardingChecklist />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Priority / Fixed Widgets */}
        <NotificationsWidget />
        <DailyScheduleWidget /> {/* Data Story 2.06.1.e */}
        <DeadlinesWidget /> {/* Data Story 2.11.d */}
        <QuickLinksWidget />
        
        {/* Personalised Widgets */}
        <FacultyNewsWidget />
        <VisaWidget />
        <LinkRecommendations />
      </div>
      
      <TutorialOverlay />
    </div>
  );
};

const ProfileSettingsPage = () => {
  const { user } = useContext(UserContext);
  const [interests, setInterests] = useState(['Coding']);

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) setInterests(interests.filter(i => i !== tag));
    else setInterests([...interests, tag]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>Profile & Settings</h1>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Personal Details</h2>
        <Card lastUpdated="1 Jan 2025" data-story-code="7.02.c">
           <SensitiveDataField label="Legal Name" value="Alexander James Student" />
           <SensitiveDataField label="USI (Unique Student Identifier)" value="3000 123 456" />
           {/* Data Story 7.02.b - Hidden Sensitive Data */}
           <SensitiveDataField label="WAM (Weighted Average Mark)" value="78.5 (Distinction)" type="sensitive" />
           <div style={{ textAlign: 'right', marginTop: '16px' }}>
             <button className="btn btn-outline" style={{ fontSize: '14px', padding: '8px 16px' }}>Update Details at StudentOne</button>
           </div>
        </Card>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Account Security</h2>
        <Card data-story-code="7.05.a, 7.05.b">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
             <div>
               <div style={{ fontWeight: 600 }}>Password</div>
               <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Last changed 3 months ago</div>
             </div>
             <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>Reset</button>
          </div>
          <div style={{ marginBottom: '16px' }}>
             <div style={{ fontWeight: 600, marginBottom: '8px' }}>Login History</div>
             <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)', background: 'var(--color-secondary-surface)', padding: '8px', borderRadius: '4px' }}>
               MacBook Pro • Chrome • Today, 9:41 AM (Current)
             </div>
          </div>
        </Card>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Communication Preferences</h2>
        <Card data-story-code="1.05.d">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span>Official University Notices</span>
             <span style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>Required</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span>Faculty Newsletter</span>
             <input type="checkbox" defaultChecked />
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>Clubs & Events</span>
             <input type="checkbox" />
           </div>
        </Card>
      </section>

       <section>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Interests</h2>
        <Card data-story-code="5.02.h">
           <p style={{ fontSize: '14px', color: 'var(--color-tertiary-text)', marginBottom: '16px' }}>Select topics to refine your recommendations.</p>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             {INTEREST_TAGS.map(tag => (
               <button 
                 key={tag} 
                 onClick={() => toggleInterest(tag)}
                 style={{ 
                   padding: '8px 16px', borderRadius: '20px', fontSize: '14px',
                   border: interests.includes(tag) ? 'none' : '1px solid var(--color-border)',
                   background: interests.includes(tag) ? 'var(--color-brand-root)' : 'white',
                   color: interests.includes(tag) ? 'white' : 'var(--color-primary-text)',
                   cursor: 'pointer'
                 }}
               >
                 {tag}
               </button>
             ))}
           </div>
        </Card>
      </section>
    </div>
  );
};

const MyDocumentsPage = () => {
  // Data Story 7.01.a
  const documents = [
    { id: 1, name: 'Passport.pdf', date: '12 Jan 2024', inUse: true },
    { id: 2, name: 'Transcript_2023.pdf', date: '20 Nov 2023', inUse: false },
    { id: 3, name: 'Medical_Cert.png', date: '05 Mar 2024', inUse: true }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>My Documents</h1>
        <button className="btn btn-primary"><Icons.Plus /> Upload New</button>
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Date Added</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.File /> {doc.name}
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--color-tertiary-text)' }}>{doc.date}</td>
                <td style={{ padding: '16px 12px' }}>
                  {doc.inUse && <span style={{ fontSize: '10px', background: 'var(--color-info-bg)', color: 'var(--color-info)', padding: '4px 8px', borderRadius: '12px' }}>In Use</span>}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// --- LAYOUTS & NAVIGATION ---

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useContext(UserContext);
  const router = useRouter();

  const results = query 
    ? SEARCH_RESULTS_MOCK.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <form onSubmit={e => e.preventDefault()} role="search">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '12px', color: 'var(--color-tertiary-text)' }}><Icons.Search /></span>
          <input
            type="text"
            placeholder={isAuthenticated ? "Search resources..." : "Search public resources..."}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '24px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-ui)' }}
          />
        </div>
      </form>
      {isOpen && query && (
        <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 100 }}>
          {results.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {results.map(res => (
                <li key={res.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); router.push(res.url); }} style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary-text)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{res.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{res.category}</div>
                  </a>
                </li>
              ))}
            </ul>
          ) : <div style={{ padding: '16px', textAlign: 'center' }}>No results found.</div>}
        </div>
      )}
    </div>
  );
};

const NavigationSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const router = useRouter();
  const { persona } = useContext(UserContext); // Access context to check conditions
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  const navigate = (path: string) => { router.push(path); onClose(); };

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
        backgroundColor: 'var(--color-brand-root)', color: '#fff', zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease',
        display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
      }}
      className={!isOpen ? "hidden-mobile-nav" : ""}
    >
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)' }}>UniPortal</h2>
        <button onClick={onClose} className="hidden-desktop" style={{ background: 'none', border: 'none', color: '#fff' }}><Icons.X /></button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '16px 0' }}>
        {NAV_STRUCTURE.map(item => {
          // Check top-level condition
          if (item.condition && !item.condition(persona)) return null;

          return (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button onClick={() => toggle(item.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: 'none', border: 'none', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.label}
                    </div>
                    {expanded === item.id ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                  </button>
                  {expanded === item.id && (
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      {item.children.map(child => {
                        // Check child condition
                        if (child.condition && !child.condition(persona)) return null;
                        return (
                          <a key={child.id} href="#" onClick={(e) => { e.preventDefault(); navigate(child.path!); }} style={{ display: 'block', padding: '12px 24px 12px 48px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                            {child.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => navigate(item.path!)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: 'none', border: 'none', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.label}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

const AuthenticatedLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = window.innerWidth < 1024;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <NavigationSidebar isOpen={sidebarOpen || !isMobile} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '280px', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s' }}>
        <header style={{ background: 'var(--color-primary-surface)', padding: '16px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button className="hidden-desktop" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', padding: 0 }}><Icons.Menu /></button>
            <div style={{ maxWidth: '500px', width: '100%' }}><GlobalSearch /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', color: 'var(--color-primary-text)', display: 'flex', gap: '8px', alignItems: 'center' }}>
               <div style={{ textAlign: 'right', display: 'none', minWidth: '100px', md: { display: 'block'} }} className="hidden-mobile">
                  <div style={{ fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-tertiary-text)' }}>{user?.id}</div>
                </div>
                <div style={{ width: '40px', height: '40px', background: 'var(--color-brand-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-brand-root)' }}>{user?.avatar}</div>
             </button>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--color-error)' }}><Icons.LogOut /></button>
          </div>
        </header>
        <main style={{ padding: '32px', flex: 1, backgroundColor: 'var(--color-secondary-surface)' }}>{children}</main>
        <PersonalisationControls />
        <AIFloatingActionButton />
      </div>
      {sidebarOpen && isMobile && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useContext(UserContext);
  const router = useRouter();
  
  if (!isAuthenticated) {
    if (router.path === '/login') return <LoginPage />;
    return <PublicLandingPage />;
  }

  // Authenticated Routes
  const renderContent = () => {
    switch (router.path) {
      case '/': return <AuthenticatedDashboard />;
      case '/profile': return <ProfileSettingsPage />;
      case '/documents': return <MyDocumentsPage />;
      case '/calendar': return <UnifiedCalendarPage />;
      case '/progress': return <ProgressResultsPage />;
      case '/map': return <CampusMapPage />;
      case '/timetable': return <TimetablePage />;
      case '/inbox': return <InboxPage />;
      case '/tasks': return <TasksEnquiriesPage />;
      case '/help': return <HelpSupportPage />;
      case '/admin': return <AdminFinancePage />;
      case '/housing': return <AccommodationWellbeingPage />;
      case '/life': return <StudentLifePage />;
      case '/it': return <ITServicesPage />;
      case '/visa': return <VisaPage />;
      default: return <div style={{ padding: '40px', textAlign: 'center' }}>Page not found</div>;
    }
  };

  return <AuthenticatedLayout>{renderContent()}</AuthenticatedLayout>;
};

const App = () => {
  return (
    <RouterProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </RouterProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);