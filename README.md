# Parley - Parent Teacher Chat Application

A modern web application built with Next.js that enables seamless communication between parents and teachers through chat, appointments, and notices.

## Features

### Core Features
- **Real-time Chat**: Socket.io powered instant messaging between parents and teachers
- **Appointment Scheduling**: Parents can request appointments, teachers can confirm or cancel
- **Notices & Complaints**: Teachers can send notices or complaints to parents about specific children
- **Invite Code System**: Teachers generate secure invite codes for parents to connect

### Authentication
- Email/password authentication using NextAuth.js
- Role-based access control (Parent/Teacher)
- Protected routes with middleware

### User Experience
- Role-specific dashboards for Parents and Teachers
- Responsive design that works on mobile and desktop
- Clean, modern UI built with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd PTCA
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a \`.env\` file in the root directory:
\`\`\`
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

4. Initialize the database:
\`\`\`bash
npx prisma migrate dev
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Teachers
1. Sign up with your email and select "Teacher" as your role
2. Generate invite codes from the "Invite Codes" page
3. Share the codes with parents
4. Once connected, you can:
   - Chat with parents in real-time
   - Manage appointment requests
   - Send notices or complaints

### For Parents
1. Sign up with your email and select "Parent" as your role
2. Get an invite code from your child's teacher
3. Enter the code and your child's name on the "Connect" page
4. Once connected, you can:
   - Chat with teachers
   - Request appointments
   - View notices and complaints

## Project Structure

\`\`\`
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── api/                 # API routes
│   ├── appointments/        # Appointment scheduling
│   ├── chat/                # Real-time chat
│   ├── connect/             # Parent connection page
│   ├── dashboard/           # Main dashboard
│   ├── invite-codes/        # Teacher invite codes
│   └── notices/             # Notices & complaints
├── components/              # React components
│   ├── dashboard/           # Dashboard layouts
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── socket.ts           # Socket.io client hook
│   └── types.ts            # Type definitions
├── pages/api/socket/       # Socket.io server
├── prisma/                 # Database schema
└── types/                  # TypeScript type definitions
\`\`\`

## Database Schema

The application uses the following main models:
- **User**: Stores user accounts (parents and teachers)
- **Connection**: Links parents and teachers for a specific child
- **InviteCode**: Temporary codes for establishing connections
- **Message**: Chat messages between connected users
- **Appointment**: Scheduled meetings
- **Notice**: Notices and complaints from teachers to parents

## Development

### Build for production:
\`\`\`bash
npm run build
\`\`\`

### Start production server:
\`\`\`bash
npm start
\`\`\`

### Prisma commands:
\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio
\`\`\`

## Security Features

- Passwords are hashed using bcryptjs
- JWT-based session management
- Protected API routes
- Input validation using Zod
- Role-based access control

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
