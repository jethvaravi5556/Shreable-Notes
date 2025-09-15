# Shareable Notes - React + Vite

A modern note-taking application with AI-powered features, built with React and Vite.

## Features

- 📝 Rich text editor with formatting options
- 🔒 Note encryption with password protection
- 🤖 AI-powered content analysis and suggestions
- 🌍 Multi-language translation support
- 📱 Responsive design for mobile, tablet, and desktop
- 🎨 Glassmorphism UI with dark theme
- 💾 Local storage for notes persistence

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context
- **Encryption**: Web Crypto API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Gemini API key:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the root directory
   - Add your API key: `VITE_GEMINI_API_KEY=your_actual_api_key_here`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── sidebar.jsx     # Notes sidebar
│   ├── editor.jsx      # Rich text editor
│   ├── ai-panel.jsx    # AI assistant panel
│   └── ...
├── contexts/           # React contexts
│   └── notes-context.jsx
├── lib/                # Utility libraries
│   ├── utils.js        # Utility functions
│   ├── encryption.js   # Encryption service
│   └── api.js          # API service
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Migration from Next.js

This project was migrated from Next.js to React + Vite. Key changes include:

- ✅ Converted TypeScript to JavaScript (.tsx → .jsx, .ts → .js)
- ✅ Replaced Next.js App Router with React Context for state management
- ✅ Converted API routes to client-side API service
- ✅ Updated build system from Next.js to Vite
- ✅ Maintained all original functionality and styling
- ✅ Preserved Tailwind CSS configuration and custom styles

## Features Overview

### Note Management
- Create, edit, and delete notes
- Pin important notes
- Search through notes
- Auto-save functionality

### Rich Text Editor
- Bold, italic, underline formatting
- Text alignment options
- Font size adjustment
- Lists and quotes
- Link and image insertion
- Undo/redo functionality

### AI Assistant
- Content summarization
- Tag suggestions
- Grammar checking
- Glossary term definitions
- Writing style insights
- Multi-language translation

### Security
- Password-based note encryption
- Secure password generation
- Local storage encryption

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
