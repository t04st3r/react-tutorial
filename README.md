# React + TypeScript Tutorial: Passing Data Deeply with Context

**For Python Backend Developers stepping into frontend development**

This tutorial teaches you **React's Context API** — the built-in mechanism for passing data through the component tree without manually threading props at every level. You'll learn every concept from the official React docs chapter *"Passing Data Deeply with Context"* by building a **Themed Greeting App** step by step.

## Why This Tutorial?

As a Python backend developer, you're familiar with:
- Global configuration objects (Django `settings`)
- Dependency injection patterns
- Thread-local storage for request context

React's Context API solves the same problem: making shared data available to deeply nested components without explicitly passing it through every intermediate layer — similar to how Django's `request` object is available in any view, template tag, or middleware without being manually threaded through each function call.

---

## Table of Contents

1. [What You'll Build](#what-youll-build)
2. [Prerequisites](#prerequisites)
3. [Core React Concepts Covered](#core-react-concepts-covered)
4. [Setup](#setup)
5. [Tutorial Steps](#tutorial-steps)
   - [Step 1: Understanding the Starter Code](#step-1-understanding-the-starter-code)
   - [Step 2: The Problem — Prop Drilling](#step-2-the-problem--prop-drilling)
   - [Step 3: Creating a Context](#step-3-creating-a-context)
   - [Step 4: Providing Context from a Parent](#step-4-providing-context-from-a-parent)
   - [Step 5: Consuming Context with useContext](#step-5-consuming-context-with-usecontext)
   - [Step 6: Making Context Dynamic with State](#step-6-making-context-dynamic-with-state)
   - [Step 7: Adding a Second Context — Language](#step-7-adding-a-second-context--language)
   - [Step 8: Encapsulating Providers into a Custom Provider Component](#step-8-encapsulating-providers-into-a-custom-provider-component)
   - [Step 9: Writing Custom Hooks for Context](#step-9-writing-custom-hooks-for-context)
   - [Step 10: Context Reads from the Nearest Provider](#step-10-context-reads-from-the-nearest-provider)
6. [Final Project Structure](#final-project-structure)
7. [Key Takeaways](#key-takeaways)

---

## What You'll Build

A **Themed Multi-language Greeting App** with:
- A greeting card that adapts to a **theme** (light/dark)
- A **language switcher** (English, Italian, Spanish) that changes greetings across the whole app
- A **toolbar** with toggle buttons — all powered by Context, no prop drilling
- A nested section that demonstrates how a **local provider override** works

**Final result**: A small but complete app that demonstrates every key aspect of React's Context API.

---

## Prerequisites

Before starting this tutorial, you should be comfortable with:
- React components, JSX, and props (covered in the previous tutorial)
- The `useState` hook
- Basic TypeScript (interfaces, generics)
- SCSS basics (nesting)

You should have already completed the previous tutorial or at minimum understand how props flow from parent to child in React.

---

## Core React Concepts Covered

### 1. **The Prop Drilling Problem**
When you need to pass data through many intermediate components that don't use it themselves, the code becomes brittle and hard to maintain.

### 2. **`createContext`**
Creates a Context object with a default value. This is the "channel" through which data flows.

### 3. **Context Provider (`<MyContext value={...}>`)**
A component that wraps a subtree and makes a value available to every component inside it — no matter how deeply nested.

### 4. **`useContext` Hook**
The hook that lets any component read the nearest provider's value for a given context.

### 5. **Context with State**
Combining `useState` with Context to make context values dynamic and reactive.

### 6. **Multiple Independent Contexts**
Using more than one context in the same app — they don't interfere with each other.

### 7. **Custom Provider Components**
Encapsulating provider logic (state + context) into a reusable wrapper component.

### 8. **Custom Hooks for Context**
Wrapping `useContext` in a named hook (e.g., `useTheme()`) for cleaner consumer code and better error messages.

### 9. **Nearest Provider Rule**
A consumer reads the value from the closest matching provider above it in the tree — enabling local overrides.

---

## Setup

This project uses **Vite + React + TypeScript**. To start:

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:5173`

You should see the **Hello, world!** page rendered by the existing starter code.

---

## Tutorial Steps

### Step 1: Understanding the Starter Code

Open the three files that make up the starter app:

**`src/main.tsx`** — The entry point, renders `<App />` inside `<StrictMode>`:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`src/App.tsx`** — The root component, renders `<HelloWorld />`:
```typescript
import HelloWorld from './components/HelloWorld';

function App() {
  return <HelloWorld />;
}

export default App;
```

**`src/components/HelloWorld.tsx`** — A simple presentational component:
```typescript
import './HelloWorld.scss';

function HelloWorld() {
  return (
    <div className="hello-world">
      <h1>Hello, world!</h1>
    </div>
  );
}

export default HelloWorld;
```

**Key observation:** Right now, data flows from `App` → `HelloWorld` with no props at all. There's nothing to configure. Let's change that.

**Python parallel:**
Think of this as a Django project with a single view returning a static template — no configuration, no request context needed yet.

---

### Step 2: The Problem — Prop Drilling

Before learning Context, we need to **feel the pain** it solves. Let's build a small component tree where a deeply nested component needs a `theme` value owned by a top-level parent — and see how ugly prop drilling gets.

**2.1 — Create the component tree**

Create four new files. Notice how `theme` is passed through `Page` and `GreetingCard` even though they don't use it themselves — they just forward it along.

**Create `src/components/Toolbar.tsx`:**

```typescript
interface ToolbarProps {
  theme: 'light' | 'dark';
}

function Toolbar({ theme }: ToolbarProps) {
  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#e8e8e8',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      textAlign: 'right',
      fontSize: '14px',
    }}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

export default Toolbar;
```

**Create `src/components/Greeting.tsx`:**

```typescript
interface GreetingProps {
  theme: 'light' | 'dark';
}

function Greeting({ theme }: GreetingProps) {
  return (
    <h1 style={{
      color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
      fontSize: '2.5rem',
      margin: '0 0 8px 0',
    }}>
      Hello, world!
    </h1>
  );
}

export default Greeting;
```

**Create `src/components/GreetingCard.tsx`:**

```typescript
import Greeting from './Greeting';

interface GreetingCardProps {
  theme: 'light' | 'dark';
}

function GreetingCard({ theme }: GreetingCardProps) {
  return (
    <div style={{
      padding: '40px',
      borderRadius: '12px',
      backgroundColor: theme === 'dark' ? '#16213e' : '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      textAlign: 'center',
    }}>
      {/* GreetingCard doesn't USE theme — it just forwards it */}
      <Greeting theme={theme} />
      <p style={{ color: theme === 'dark' ? '#a0a0a0' : '#666', margin: 0 }}>
        Welcome to the Context API tutorial
      </p>
    </div>
  );
}

export default GreetingCard;
```

**Create `src/components/Page.tsx`:**

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';

interface PageProps {
  theme: 'light' | 'dark';
}

function Page({ theme }: PageProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      {/* Page doesn't USE theme either — just forwards it to children */}
      <Toolbar theme={theme} />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard theme={theme} />
      </div>
    </div>
  );
}

export default Page;
```

**2.2 — Update `src/App.tsx`:**

```typescript
import Page from './components/Page';

function App() {
  return <Page theme="dark" />;
}

export default App;
```

**2.3 — Run the app and observe**

```bash
npm run dev
```

You should see a dark-themed page with a greeting card. It works! But look at the data flow:

```
App  (owns theme="dark")
 └── Page  (receives theme, forwards it — doesn't use it)
      ├── Toolbar  (receives theme, uses it)
      └── GreetingCard  (receives theme, forwards it — doesn't use it)
           └── Greeting  (receives theme, uses it)
```

**The problem is clear:**
- `Page` and `GreetingCard` receive `theme` **only to pass it along**. They are "middleman" components.
- If you add more layers between `App` and `Greeting`, every single intermediate component must accept and forward the prop.
- If you rename the prop or change its type, you must update **every component in the chain**.

This is **prop drilling** — and it doesn't scale.

**Python parallel:**
Imagine a Django view that receives a `db_connection` and must pass it through 5 helper functions that don't use it, just so the innermost function can run a query. You'd use Django's `django.db.connection` instead — imported wherever needed, no manual threading. That's exactly what Context solves in React.

---

### Step 3: Creating a Context

Now let's solve the prop drilling problem. The first step is to **create a Context** — a dedicated channel for the theme value.

**3.1 — Create the contexts directory and file**

Create a new directory `src/contexts/` and add the following file:

**Create `src/contexts/ThemeContext.ts`:**

```typescript
import { createContext } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme>('light');

export default ThemeContext;
```

**What just happened:**
- `createContext<Theme>('light')` creates a Context object.
- The argument `'light'` is the **default value** — it's used when a component reads this context but there's **no matching Provider above it** in the tree. Think of it as a fallback.
- The generic `<Theme>` gives us type safety.

**Key concept — `createContext`:**
```typescript
const MyContext = createContext<Type>(defaultValue);
```
- Creates a "channel" that components can publish to (via a Provider) and subscribe to (via `useContext`).
- The default value is typically a sensible fallback or `null`.
- The context object itself holds no data — it's just an identifier.

**Python parallel:**
This is like creating a `ContextVar` in Python:
```python
from contextvars import ContextVar
theme_var: ContextVar[str] = ContextVar('theme', default='light')
```

---

### Step 4: Providing Context from a Parent

A Context is useless until you **provide a value** to a subtree. You do this by wrapping components with the context's Provider.

**4.1 — Update `src/App.tsx`:**

```typescript
import Page from './components/Page';
import ThemeContext from './contexts/ThemeContext';

function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}

export default App;
```

> **Note:** In React 19 (which this project uses), you pass the value directly as `<ThemeContext value="dark">`. In older React versions (before 19), the syntax was `<ThemeContext.Provider value="dark">`. Both work, but the shorter form is the modern approach.

**What just happened:**
- We wrapped `<Page />` inside `<ThemeContext value="dark">`.
- Every component inside this subtree can now **read** the value `"dark"` — without receiving it as a prop.
- Notice we removed `theme="dark"` from `<Page />` — we no longer pass it as a prop!

**But wait — the app is broken now!** `Page` still expects a `theme` prop, and so do all its children. That's expected. We'll fix that in the next step.

**Key concept — Provider:**
```typescript
<MyContext value={someValue}>
  {children}  {/* Every descendant can read someValue */}
</MyContext>
```
- The Provider "broadcasts" a value to all descendants.
- You can nest providers — inner ones override outer ones (we'll explore this later).

**Python parallel:**
This is like setting a context variable in Python:
```python
theme_var.set('dark')
# All code running in this context can read theme_var.get()
```

---

### Step 5: Consuming Context with useContext

Now the exciting part — let's make components **read** from the context instead of receiving props.

**5.1 — Update `src/components/Greeting.tsx`:**

Remove the props interface and read theme from context instead:

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Greeting() {
  const theme = useContext(ThemeContext);

  return (
    <h1 style={{
      color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
      fontSize: '2.5rem',
      margin: '0 0 8px 0',
    }}>
      Hello, world!
    </h1>
  );
}

export default Greeting;
```

**5.2 — Update `src/components/Toolbar.tsx`:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Toolbar() {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#e8e8e8',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      textAlign: 'right',
      fontSize: '14px',
    }}>
      Current theme: <strong>{theme}</strong>
    </div>
  );
}

export default Toolbar;
```

**5.3 — Update `src/components/GreetingCard.tsx`:**

This is the most satisfying change — `GreetingCard` **no longer needs theme at all**. It was only a middleman.

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import Greeting from './Greeting';

function GreetingCard() {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      padding: '40px',
      borderRadius: '12px',
      backgroundColor: theme === 'dark' ? '#16213e' : '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      textAlign: 'center',
    }}>
      <Greeting />
      <p style={{ color: theme === 'dark' ? '#a0a0a0' : '#666', margin: 0 }}>
        Welcome to the Context API tutorial
      </p>
    </div>
  );
}

export default GreetingCard;
```

**5.4 — Update `src/components/Page.tsx`:**

Page becomes a simple layout — **no props, no forwarding**:

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Page() {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      <Toolbar />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;
```

**5.5 — Run the app and verify**

```bash
npm run dev
```

The app looks **exactly the same** as before — but the architecture is fundamentally different. Compare the data flow:

**Before (prop drilling):**
```
App  →  Page  →  GreetingCard  →  Greeting
       theme↓       theme↓         theme↓
       (forwards)   (forwards)     (uses)
```

**After (context):**
```
App  [provides theme="dark" via ThemeContext]
 └── Page           → reads ThemeContext ✓
      ├── Toolbar    → reads ThemeContext ✓
      └── GreetingCard → reads ThemeContext ✓
           └── Greeting → reads ThemeContext ✓
```

No more middleman forwarding. Every component that **needs** the theme simply reads it.

**Key concept — `useContext`:**
```typescript
const value = useContext(MyContext);
```
- Returns the current value from the **nearest** matching Provider above in the tree.
- If no Provider exists, returns the **default value** from `createContext`.
- The component **re-renders** whenever the provided value changes.

**Python parallel:**
This is like reading a context variable:
```python
current_theme = theme_var.get()  # Reads from the nearest set() call
```

---

### Step 6: Making Context Dynamic with State

Right now, the theme is hardcoded to `"dark"`. A real app needs to let users **toggle** it. We achieve this by combining Context with `useState`.

**6.1 — Update `src/App.tsx`:**

```typescript
import { useState } from 'react';
import Page from './components/Page';
import ThemeContext from './contexts/ThemeContext';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext value={theme}>
      <Page onToggleTheme={toggleTheme} />
    </ThemeContext>
  );
}

export default App;
```

**6.2 — Update `src/components/Toolbar.tsx` to include a toggle button:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

interface ToolbarProps {
  onToggleTheme: () => void;
}

function Toolbar({ onToggleTheme }: ToolbarProps) {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#e8e8e8',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
    }}>
      <span>Current theme: <strong>{theme}</strong></span>
      <button
        onClick={onToggleTheme}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: theme === 'dark' ? '#e0e0e0' : '#333',
          color: theme === 'dark' ? '#333' : '#e0e0e0',
        }}
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}

export default Toolbar;
```

**6.3 — Update `src/components/Page.tsx` to forward the toggle handler:**

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

interface PageProps {
  onToggleTheme: () => void;
}

function Page({ onToggleTheme }: PageProps) {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      <Toolbar onToggleTheme={onToggleTheme} />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;
```

**6.4 — Run the app and click the toggle button**

```bash
npm run dev
```

Click "Switch to light" and watch **every component** update simultaneously. The background, card, text, and toolbar all react to the theme change — because they all read from the same context.

**Key concept — Context + State:**
When the provided value is a state variable, every consumer re-renders when that state changes:
```typescript
const [value, setValue] = useState(initial);
// ...
<MyContext value={value}>   {/* all consumers re-render when value changes */}
```

> **Did you notice?** We're still passing `onToggleTheme` as a prop through `Page` → `Toolbar`. This is a **deliberate choice** — not every callback needs to be in context. We'll address this pattern in Step 8, but it's important to know that Context and props coexist. Use context for **widely shared data**, and props for **direct parent-child communication**.

**Python parallel:**
This is like updating a global config and having all dependent modules react:
```python
theme_var.set('light')  # All readers of theme_var now get 'light'
```

---

### Step 7: Adding a Second Context — Language

A real app often needs multiple contexts. Let's add a **language context** so the greeting changes based on the selected language. This demonstrates that **separate contexts are independent** — they don't interfere with each other.

**7.1 — Create `src/contexts/LanguageContext.ts`:**

```typescript
import { createContext } from 'react';

type Language = 'en' | 'it' | 'es';

const LanguageContext = createContext<Language>('en');

export default LanguageContext;
export type { Language };
```

**7.2 — Create a translations map**

Create `src/translations.ts`:

```typescript
const translations = {
  en: {
    greeting: 'Hello, world!',
    subtitle: 'Welcome to the Context API tutorial',
    language: 'English',
  },
  it: {
    greeting: 'Ciao, mondo!',
    subtitle: 'Benvenuto nel tutorial delle Context API',
    language: 'Italiano',
  },
  es: {
    greeting: 'Hola, mundo!',
    subtitle: 'Bienvenido al tutorial de la API de Contexto',
    language: 'Español',
  },
} as const;

export default translations;
```

**7.3 — Update `src/components/Greeting.tsx` to use both contexts:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

function Greeting() {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);

  return (
    <h1 style={{
      color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
      fontSize: '2.5rem',
      margin: '0 0 8px 0',
    }}>
      {translations[language].greeting}
    </h1>
  );
}

export default Greeting;
```

**7.4 — Update `src/components/GreetingCard.tsx`:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import Greeting from './Greeting';
import translations from '../translations';

function GreetingCard() {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);

  return (
    <div style={{
      padding: '40px',
      borderRadius: '12px',
      backgroundColor: theme === 'dark' ? '#16213e' : '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      textAlign: 'center',
    }}>
      <Greeting />
      <p style={{ color: theme === 'dark' ? '#a0a0a0' : '#666', margin: 0 }}>
        {translations[language].subtitle}
      </p>
    </div>
  );
}

export default GreetingCard;
```

**7.5 — Update `src/components/Toolbar.tsx` to add a language selector:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';
import translations from '../translations';

interface ToolbarProps {
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
}

function Toolbar({ onToggleTheme, onChangeLanguage }: ToolbarProps) {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);

  const languages: Language[] = ['en', 'it', 'es'];

  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#e8e8e8',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => onChangeLanguage(lang)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: lang === language ? '2px solid #007acc' : '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: lang === language
                ? (theme === 'dark' ? '#007acc' : '#007acc')
                : (theme === 'dark' ? '#2a2a4a' : '#ddd'),
              color: lang === language ? '#fff' : (theme === 'dark' ? '#ccc' : '#333'),
              fontWeight: lang === language ? 'bold' : 'normal',
            }}
          >
            {translations[lang].language}
          </button>
        ))}
      </div>
      <button
        onClick={onToggleTheme}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: theme === 'dark' ? '#e0e0e0' : '#333',
          color: theme === 'dark' ? '#333' : '#e0e0e0',
        }}
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}

export default Toolbar;
```

**7.6 — Update `src/components/Page.tsx`:**

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import type { Language } from '../contexts/LanguageContext';

interface PageProps {
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
}

function Page({ onToggleTheme, onChangeLanguage }: PageProps) {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      <Toolbar onToggleTheme={onToggleTheme} onChangeLanguage={onChangeLanguage} />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;
```

**7.7 — Update `src/App.tsx` to provide both contexts:**

```typescript
import { useState } from 'react';
import Page from './components/Page';
import ThemeContext from './contexts/ThemeContext';
import LanguageContext from './contexts/LanguageContext';
import type { Language } from './contexts/LanguageContext';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('en');

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext value={theme}>
      <LanguageContext value={language}>
        <Page onToggleTheme={toggleTheme} onChangeLanguage={setLanguage} />
      </LanguageContext>
    </ThemeContext>
  );
}

export default App;
```

**7.8 — Run the app and test**

```bash
npm run dev
```

Click the language buttons and watch the greeting and subtitle change across the whole app. Toggle the theme and watch the colors switch. Both contexts work **independently** — changing language doesn't affect theme, and vice versa.

**Key concepts introduced:**

1. **Multiple Contexts**: You can create and use as many contexts as you need. Each is independent.
2. **Nesting Providers**: Providers nest inside each other — the order doesn't matter for independent contexts.
3. **Multiple `useContext` calls**: A single component can read from multiple contexts.

**Python parallel:**
This is like having multiple `ContextVar` objects:
```python
theme_var: ContextVar[str] = ContextVar('theme', default='light')
language_var: ContextVar[str] = ContextVar('language', default='en')
# Each is completely independent
```

---

### Step 8: Encapsulating Providers into a Custom Provider Component

You may have noticed that `App.tsx` is accumulating state logic and nested providers. As the app grows, this becomes messy. The solution is to **encapsulate provider logic** into a dedicated component.

Also notice that `onToggleTheme` and `onChangeLanguage` are still passed as props through `Page` to `Toolbar`. Let's fix both problems at once.

**8.1 — Create `src/contexts/AppProviders.tsx`:**

```typescript
import { useState } from 'react';
import ThemeContext from './ThemeContext';
import LanguageContext from './LanguageContext';
import type { Language } from './LanguageContext';
import { createContext } from 'react';

// A new context for the actions (toggle theme, change language)
interface AppActions {
  toggleTheme: () => void;
  changeLanguage: (lang: Language) => void;
}

const AppActionsContext = createContext<AppActions>({
  toggleTheme: () => {},
  changeLanguage: () => {},
});

interface AppProvidersProps {
  children: React.ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('en');

  const actions: AppActions = {
    toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
    changeLanguage: (lang: Language) => setLanguage(lang),
  };

  return (
    <ThemeContext value={theme}>
      <LanguageContext value={language}>
        <AppActionsContext value={actions}>
          {children}
        </AppActionsContext>
      </LanguageContext>
    </ThemeContext>
  );
}

export default AppProviders;
export { AppActionsContext };
```

**What just happened:**
- We created a **third context** (`AppActionsContext`) that provides the action functions.
- All state and provider nesting is encapsulated inside `AppProviders`.
- The `children` prop pattern lets this component wrap any subtree.

**8.2 — Simplify `src/App.tsx`:**

```typescript
import AppProviders from './contexts/AppProviders';
import Page from './components/Page';

function App() {
  return (
    <AppProviders>
      <Page />
    </AppProviders>
  );
}

export default App;
```

Look how clean that is — `App` has **zero state** and **zero props to pass**.

**8.3 — Update `src/components/Toolbar.tsx` — no more prop drilling:**

```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import LanguageContext from '../contexts/LanguageContext';
import { AppActionsContext } from '../contexts/AppProviders';
import type { Language } from '../contexts/LanguageContext';
import translations from '../translations';

function Toolbar() {
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  const { toggleTheme, changeLanguage } = useContext(AppActionsContext);

  const languages: Language[] = ['en', 'it', 'es'];

  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#e8e8e8',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: lang === language ? '2px solid #007acc' : '1px solid transparent',
              cursor: 'pointer',
              backgroundColor: lang === language
                ? '#007acc'
                : (theme === 'dark' ? '#2a2a4a' : '#ddd'),
              color: lang === language ? '#fff' : (theme === 'dark' ? '#ccc' : '#333'),
              fontWeight: lang === language ? 'bold' : 'normal',
            }}
          >
            {translations[lang].language}
          </button>
        ))}
      </div>
      <button
        onClick={toggleTheme}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: theme === 'dark' ? '#e0e0e0' : '#333',
          color: theme === 'dark' ? '#333' : '#e0e0e0',
        }}
      >
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}

export default Toolbar;
```

**8.4 — Simplify `src/components/Page.tsx` — no more forwarding props:**

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Page() {
  const theme = useContext(ThemeContext);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      <Toolbar />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard />
      </div>
    </div>
  );
}

export default Page;
```

**8.5 — Run and verify everything still works**

```bash
npm run dev
```

Same behavior, but now **zero prop drilling** anywhere. Every component reads exactly what it needs from context.

**Key concepts introduced:**

1. **Custom Provider Component**: Encapsulates state + multiple providers into a single reusable wrapper.
2. **`children` Pattern**: `AppProviders` receives `children` and wraps them — this is the idiomatic React pattern for providers.
3. **Separating State (read) from Actions (write)**: Using one context for the data and another for the functions that modify it. This is a common production pattern.

**Python parallel:**
This is like creating a middleware class in Django that sets up `request.theme`, `request.language`, and `request.actions` — all available in any view without explicit passing.

---

### Step 9: Writing Custom Hooks for Context

Calling `useContext(ThemeContext)` everywhere works, but it has two drawbacks:
1. You must remember to import both `useContext` and the specific context.
2. If someone uses `useContext(ThemeContext)` **outside** a provider, they get the default value silently — no error, just a subtle bug.

**Custom hooks** solve both problems.

**9.1 — Create `src/contexts/useTheme.ts`:**

```typescript
import { useContext } from 'react';
import ThemeContext from './ThemeContext';

function useTheme() {
  const theme = useContext(ThemeContext);
  return theme;
}

export default useTheme;
```

**9.2 — Create `src/contexts/useLanguage.ts`:**

```typescript
import { useContext } from 'react';
import LanguageContext from './LanguageContext';

function useLanguage() {
  const language = useContext(LanguageContext);
  return language;
}

export default useLanguage;
```

**9.3 — Create `src/contexts/useAppActions.ts`:**

```typescript
import { useContext } from 'react';
import { AppActionsContext } from './AppProviders';

function useAppActions() {
  const actions = useContext(AppActionsContext);
  return actions;
}

export default useAppActions;
```

**9.4 — Refactor components to use custom hooks**

Now update each component to use the cleaner hook API. Here's how each import changes:

**Before:**
```typescript
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const theme = useContext(ThemeContext);
```

**After:**
```typescript
import useTheme from '../contexts/useTheme';

const theme = useTheme();
```

Go ahead and update all four components (`Greeting.tsx`, `GreetingCard.tsx`, `Page.tsx`, `Toolbar.tsx`) to use `useTheme()`, `useLanguage()`, and `useAppActions()` instead of calling `useContext()` directly.

For example, here's what `Greeting.tsx` looks like after the refactor:

```typescript
import useTheme from '../contexts/useTheme';
import useLanguage from '../contexts/useLanguage';
import translations from '../translations';

function Greeting() {
  const theme = useTheme();
  const language = useLanguage();

  return (
    <h1 style={{
      color: theme === 'dark' ? '#ffffff' : '#1a1a2e',
      fontSize: '2.5rem',
      margin: '0 0 8px 0',
    }}>
      {translations[language].greeting}
    </h1>
  );
}

export default Greeting;
```

And `Toolbar.tsx` becomes:

```typescript
import useTheme from '../contexts/useTheme';
import useLanguage from '../contexts/useLanguage';
import useAppActions from '../contexts/useAppActions';
import type { Language } from '../contexts/LanguageContext';
import translations from '../translations';

function Toolbar() {
  const theme = useTheme();
  const language = useLanguage();
  const { toggleTheme, changeLanguage } = useAppActions();

  const languages: Language[] = ['en', 'it', 'es'];

  // ... rest of the component stays the same
}
```

Apply the same pattern to `GreetingCard.tsx` and `Page.tsx`.

**Key concepts introduced:**

1. **Custom Hooks**: A function starting with `use` that wraps `useContext`. This is the recommended pattern in production React apps.
2. **Abstraction**: Consumers don't need to know which context object holds the theme — they just call `useTheme()`.
3. **Single Import**: `import useTheme from '../contexts/useTheme'` vs two imports.

**Python parallel:**
This is like creating helper functions around `ContextVar`:
```python
def get_current_theme() -> str:
    return theme_var.get()

# Instead of everywhere doing: theme_var.get()
# You do: get_current_theme()
```

---

### Step 10: Context Reads from the Nearest Provider

One powerful feature of context is that a consumer reads the value from the **closest matching provider** above it in the tree. This means you can **override** context locally for a subtree.

**10.1 — Add a "local override" section to `src/components/Page.tsx`:**

```typescript
import Toolbar from './Toolbar';
import GreetingCard from './GreetingCard';
import useTheme from '../contexts/useTheme';
import ThemeContext from '../contexts/ThemeContext';

function Page() {
  const theme = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f0f23' : '#f5f5f5',
      transition: 'background-color 0.3s',
    }}>
      <Toolbar />
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <GreetingCard />

        {/* Local override: force light theme for this card only */}
        <div style={{ marginTop: '24px' }}>
          <p style={{
            color: theme === 'dark' ? '#888' : '#666',
            fontSize: '12px',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Nested provider override (always light):
          </p>
          <ThemeContext value="light">
            <GreetingCard />
          </ThemeContext>
        </div>
      </div>
    </div>
  );
}

export default Page;
```

**10.2 — Run the app and observe**

```bash
npm run dev
```

Now you see **two greeting cards**:
- The top card respects the global theme toggle (dark/light).
- The bottom card is **always light** — because it's wrapped in `<ThemeContext value="light">`, which overrides the provider from `AppProviders`.

Toggle the theme and watch: the top card changes, the bottom card stays light.

**Key concept — Nearest Provider Rule:**
```
<ThemeContext value="dark">        ← Outer provider
  <Page>                           ← reads "dark"
    <GreetingCard />               ← reads "dark"
    <ThemeContext value="light">   ← Inner provider (override)
      <GreetingCard />             ← reads "light" (nearest!)
    </ThemeContext>
  </Page>
</ThemeContext>
```

This is how libraries like React Router and UI component libraries implement nested themes, scoped translations, and other local overrides.

**Python parallel:**
This is like Python's scoping rules — a local variable shadows an outer one:
```python
theme = 'dark'  # outer scope

def render_section():
    theme = 'light'  # shadows outer theme
    render_card(theme)  # uses 'light'
```

---

## Final Project Structure

After completing all steps, your project should look like this:

```
src/
├── contexts/
│   ├── ThemeContext.ts          # createContext for theme
│   ├── LanguageContext.ts       # createContext for language
│   ├── AppProviders.tsx         # Custom provider component (state + all providers)
│   ├── useTheme.ts             # Custom hook for theme
│   ├── useLanguage.ts          # Custom hook for language
│   └── useAppActions.ts        # Custom hook for actions
├── components/
│   ├── HelloWorld.tsx           # Original starter (can be kept or removed)
│   ├── HelloWorld.scss
│   ├── Page.tsx                 # Layout with nested provider demo
│   ├── Toolbar.tsx              # Theme toggle + language selector
│   ├── GreetingCard.tsx         # Card container
│   └── Greeting.tsx             # Heading that uses both contexts
├── translations.ts              # Translation strings
├── App.tsx                      # Clean root: just <AppProviders><Page /></AppProviders>
├── index.css                    # Global styles
└── main.tsx                     # Entry point
```

---

## Key Takeaways

### Context API Cheat Sheet

| Step | API | Purpose |
|------|-----|---------|
| Create | `createContext<T>(default)` | Define a new context channel |
| Provide | `<MyContext value={val}>` | Broadcast a value to descendants |
| Consume | `useContext(MyContext)` | Read the nearest provider's value |
| Override | Nest another `<MyContext value={...}>` | Locally change the value for a subtree |

### For Python Developers

| React Concept | Python Equivalent |
|---------------|-------------------|
| `createContext(default)` | `ContextVar('name', default=val)` |
| `<Context value={val}>` | `context_var.set(val)` |
| `useContext(Context)` | `context_var.get()` |
| Custom Provider component | Middleware that sets request attributes |
| Custom hook (`useTheme`) | Helper function (`get_current_theme()`) |
| Nearest Provider rule | Variable shadowing / local scope |

### When to Use Context

**Good use cases:**
- Theming (light/dark mode)
- Current authenticated user
- Locale / language preference
- Routing information
- UI state that many components need (sidebar open/closed)

**Before reaching for Context, consider:**
1. **Just passing props** — If only 1-2 levels deep, props are simpler and more explicit.
2. **Passing JSX as `children`** — Sometimes restructuring components eliminates the need for prop drilling entirely.

### React Mental Model for Context

1. **Context is not global state** — It's scoped to a subtree (everything inside the Provider).
2. **Multiple contexts are fine** — Use separate contexts for unrelated data.
3. **Nearest provider wins** — Enables local overrides without affecting the rest of the app.
4. **Custom hooks are the interface** — Consumers shouldn't need to know about context objects.
5. **Separate reads from writes** — Use one context for data, another for actions.

---

## Next Steps

Now that you understand Context, you're ready for:
1. **Extracting State Logic into a Reducer** — Combine `useReducer` with Context for complex state management
2. **Scaling Up with Reducer and Context** — The full production pattern for state management in React
3. **React.memo and Context** — Learn how to prevent unnecessary re-renders when context values change

---

## Additional Resources

- [React Docs: Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React Docs: Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with React 19 + TypeScript + Vite**
