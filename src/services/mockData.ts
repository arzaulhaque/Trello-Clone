// Mock data for initial board state
import type { Board, List, Card, Member } from '../types';

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'Alice Johnson', initials: 'AJ', color: '#0079bf' },
  { id: 'm2', name: 'Bob Smith', initials: 'BS', color: '#d29034' },
  { id: 'm3', name: 'Carol White', initials: 'CW', color: '#519839' },
  { id: 'm4', name: 'David Brown', initials: 'DB', color: '#b04632' },
];

export const MOCK_BOARD: Board = {
  id: 'board1',
  title: 'My Project Board',
  background: 'from-blue-600 to-blue-800',
};

export const MOCK_LISTS: List[] = [
  { id: 'list1', boardId: 'board1', title: 'To Do', order: 0 },
  { id: 'list2', boardId: 'board1', title: 'In Progress', order: 1 },
  { id: 'list3', boardId: 'board1', title: 'Done', order: 2 },
];

export const MOCK_CARDS: Card[] = [
  {
    id: 'card1',
    listId: 'list1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new landing page redesign.',
    labels: [{ id: 'lbl1', name: 'Design', color: 'purple' }],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    checklist: [
      { id: 'ci1', text: 'Create wireframes', completed: true },
      { id: 'ci2', text: 'Design mockups', completed: false },
      { id: 'ci3', text: 'Get stakeholder approval', completed: false },
    ],
    members: [MOCK_MEMBERS[0]],
    archived: false,
    order: 0,
  },
  {
    id: 'card2',
    listId: 'list1',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    labels: [{ id: 'lbl2', name: 'DevOps', color: 'blue' }],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    checklist: [
      { id: 'ci4', text: 'Set up GitHub Actions', completed: false },
      { id: 'ci5', text: 'Configure staging env', completed: false },
    ],
    members: [MOCK_MEMBERS[1]],
    archived: false,
    order: 1,
  },
  {
    id: 'card3',
    listId: 'list1',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for core business logic.',
    labels: [{ id: 'lbl3', name: 'Testing', color: 'green' }],
    checklist: [],
    members: [],
    archived: false,
    order: 2,
  },
  {
    id: 'card4',
    listId: 'list2',
    title: 'Implement authentication',
    description: 'Build login/signup with JWT tokens and refresh token rotation.',
    labels: [
      { id: 'lbl4', name: 'Backend', color: 'orange' },
      { id: 'lbl5', name: 'Security', color: 'red' },
    ],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // overdue
    checklist: [
      { id: 'ci6', text: 'JWT implementation', completed: true },
      { id: 'ci7', text: 'Refresh token logic', completed: true },
      { id: 'ci8', text: 'OAuth integration', completed: false },
    ],
    members: [MOCK_MEMBERS[0], MOCK_MEMBERS[2]],
    archived: false,
    order: 0,
  },
  {
    id: 'card5',
    listId: 'list2',
    title: 'API endpoint documentation',
    description: 'Document all REST API endpoints using OpenAPI/Swagger spec.',
    labels: [{ id: 'lbl6', name: 'Docs', color: 'sky' }],
    checklist: [
      { id: 'ci9', text: 'Auth endpoints', completed: true },
      { id: 'ci10', text: 'User endpoints', completed: false },
    ],
    members: [MOCK_MEMBERS[3]],
    archived: false,
    order: 1,
  },
  {
    id: 'card6',
    listId: 'list3',
    title: 'Database schema design',
    description: 'Design and finalize the PostgreSQL database schema.',
    labels: [{ id: 'lbl7', name: 'Database', color: 'lime' }],
    checklist: [
      { id: 'ci11', text: 'Entity relationship diagram', completed: true },
      { id: 'ci12', text: 'Migration scripts', completed: true },
    ],
    members: [MOCK_MEMBERS[1]],
    archived: false,
    order: 0,
  },
  {
    id: 'card7',
    listId: 'list3',
    title: 'Project kickoff meeting',
    description: 'Initial meeting to align on goals, timeline, and responsibilities.',
    labels: [{ id: 'lbl8', name: 'Meeting', color: 'yellow' }],
    checklist: [],
    members: [MOCK_MEMBERS[0], MOCK_MEMBERS[1], MOCK_MEMBERS[2], MOCK_MEMBERS[3]],
    archived: false,
    order: 1,
  },
];
