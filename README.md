# React Tutorial with TypeScript

A hands-on introduction to core React concepts using TypeScript. This tutorial builds upon a simple Hello World component to demonstrate essential React patterns and best practices.

## Table of Contents

1. [Passing Props to a Component](#1-passing-props-to-a-component)
2. [Conditional Rendering](#2-conditional-rendering)
3. [Rendering Lists](#3-rendering-lists)
4. [Keeping Components Pure](#4-keeping-components-pure)
5. [Your UI as a Tree](#5-your-ui-as-a-tree)

---

## 1. Passing Props to a Component

Props are the way React components communicate. They allow parent components to pass data to their children, making components reusable and flexible.

### Basic Props with TypeScript

Let's enhance our HelloWorld component to accept props:

```tsx
// src/components/HelloWorld.tsx
import './HelloWorld.scss';

interface HelloWorldProps {
  name: string;
  age?: number; // Optional prop
}

const HelloWorld = ({ name, age = 18 }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
};

export default HelloWorld;
```

```tsx
// src/App.tsx
import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <>
      <HelloWorld name="Alice" age={25} />
      <HelloWorld name="Bob" />
    </>
  );
};

export default App;
```

### Key Concepts

**TypeScript Interface**: Define prop types with an interface for type safety.

**Default Values**: Use `age = 18` to provide fallback values for optional props.

**Destructuring**: Extract props directly in the function parameters for cleaner code.

### Passing Complex Objects

Props can be any JavaScript value - objects, arrays, or even functions:

```tsx
interface Person {
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface UserCardProps {
  person: Person;
  size?: number;
}

const UserCard = ({ person, size = 100 }: UserCardProps) => {
  return (
    <div className="user-card">
      {person.avatar && (
        <img
          src={person.avatar}
          alt={`${person.firstName} ${person.lastName}`}
          width={size}
          height={size}
        />
      )}
      <h2>{person.firstName} {person.lastName}</h2>
    </div>
  );
};
```

### The Children Prop

The special `children` prop allows you to pass JSX content between component tags:

```tsx
interface CardProps {
  children: React.ReactNode;
  title?: string;
}

const Card = ({ children, title }: CardProps) => {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

// Usage
const App = () => {
  return (
    <Card title="Welcome">
      <HelloWorld name="World" />
      <p>This is additional content inside the card.</p>
    </Card>
  );
};
```

### Important Rules

- **Props are immutable**: Never modify props directly. Treat them as read-only.
- **Type safety**: Always define interfaces for your props in TypeScript.
- **Optional props**: Use `?` for optional properties and provide defaults when sensible.

---

## 2. Conditional Rendering

Conditional rendering lets you display different UI based on certain conditions. React uses JavaScript's native control flow.

### Using If Statements

```tsx
interface WelcomeMessageProps {
  isLoggedIn: boolean;
  username?: string;
}

const WelcomeMessage = ({ isLoggedIn, username }: WelcomeMessageProps) => {
  if (isLoggedIn && username) {
    return <h1>Welcome back, {username}!</h1>;
  }
  return <h1>Please sign in.</h1>;
};
```

### Ternary Operator

Use for inline conditional expressions:

```tsx
interface StatusBadgeProps {
  isActive: boolean;
}

const StatusBadge = ({ isActive }: StatusBadgeProps) => {
  return (
    <span className={isActive ? 'badge-active' : 'badge-inactive'}>
      {isActive ? '✅ Active' : '❌ Inactive'}
    </span>
  );
};
```

### Logical AND Operator

Render something only when a condition is true:

```tsx
interface NotificationProps {
  messageCount: number;
}

const Notification = ({ messageCount }: NotificationProps) => {
  return (
    <div>
      <h2>Inbox</h2>
      {messageCount > 0 && (
        <p>You have {messageCount} unread messages</p>
      )}
    </div>
  );
};
```

**Warning**: Don't put numbers directly on the left of `&&`:

```tsx
// ❌ BAD: Will render "0" when count is 0
{messageCount && <p>Messages</p>}

// ✅ GOOD: Renders nothing when count is 0
{messageCount > 0 && <p>Messages</p>}
```

### Conditionally Assigning JSX to Variables

For complex conditional logic:

```tsx
interface TodoItemProps {
  task: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

const TodoItem = ({ task, isCompleted, priority }: TodoItemProps) => {
  let taskContent: React.ReactNode = task;

  if (isCompleted) {
    taskContent = <del>{task} ✅</del>;
  } else if (priority === 'high') {
    taskContent = <strong>{task} 🔥</strong>;
  }

  return <li className={`todo-${priority}`}>{taskContent}</li>;
};
```

### Returning Null

Components can return `null` to render nothing:

```tsx
interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) {
    return null; // Render nothing
  }

  return (
    <div className="error">
      <p>Error: {error}</p>
    </div>
  );
};
```

---

## 3. Rendering Lists

Displaying collections of data is a common pattern in React. Use JavaScript's `map()` and `filter()` methods to transform arrays into JSX.

### Basic List Rendering

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  const listItems = users.map(user => (
    <li key={user.id}>
      <strong>{user.name}</strong> - {user.email}
    </li>
  ));

  return <ul>{listItems}</ul>;
};

// Usage
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

<UserList users={users} />
```

### Filtering Lists

Combine `filter()` with `map()` to show specific items:

```tsx
interface Product {
  id: number;
  name: string;
  category: 'electronics' | 'clothing' | 'food';
  price: number;
  inStock: boolean;
}

interface ProductListProps {
  products: Product[];
  categoryFilter?: string;
}

const ProductList = ({ products, categoryFilter }: ProductListProps) => {
  const filteredProducts = categoryFilter
    ? products.filter(p => p.category === categoryFilter && p.inStock)
    : products.filter(p => p.inStock);

  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
};
```

### Understanding Keys

**Keys are critical** - they tell React which array item corresponds to which component.

```tsx
interface TodoProps {
  todos: Array<{ id: string; text: string; done: boolean }>;
}

const TodoList = ({ todos }: TodoProps) => {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}> {/* ✅ Use stable, unique ID */}
          <input type="checkbox" checked={todo.done} />
          {todo.text}
        </li>
      ))}
    </ul>
  );
};
```

### Key Rules

**✅ DO:**
- Use database IDs or stable unique identifiers
- Ensure keys are unique among siblings
- Keep keys stable across re-renders

**❌ DON'T:**
- Use array indices as keys (unless the list never reorders)
- Generate keys with `Math.random()` during render
- Change keys between renders

```tsx
// ❌ BAD: Using index as key
{items.map((item, index) => <li key={index}>{item}</li>)}

// ❌ BAD: Generating random keys
{items.map(item => <li key={Math.random()}>{item}</li>)}

// ✅ GOOD: Using stable IDs
{items.map(item => <li key={item.id}>{item}</li>)}
```

### Rendering Multiple Elements per Item

Use React Fragments when each list item needs multiple elements:

```tsx
import { Fragment } from 'react';

interface Person {
  id: number;
  name: string;
  bio: string;
}

interface PeopleListProps {
  people: Person[];
}

const PeopleList = ({ people }: PeopleListProps) => {
  return (
    <>
      {people.map(person => (
        <Fragment key={person.id}>
          <h2>{person.name}</h2>
          <p>{person.bio}</p>
          <hr />
        </Fragment>
      ))}
    </>
  );
};
```

---

## 4. Keeping Components Pure

Pure components are predictable, testable, and optimizable. A pure function always returns the same output for the same input and doesn't modify external state.

### What is a Pure Component?

```tsx
// ✅ Pure: Same props always produce same JSX
interface RecipeProps {
  drinkers: number;
}

const Recipe = ({ drinkers }: RecipeProps) => {
  return (
    <ol>
      <li>Boil {drinkers} cups of water.</li>
      <li>Add {drinkers} spoons of tea and {0.5 * drinkers} spoons of spice.</li>
      <li>Add {0.5 * drinkers} cups of milk to boil and sugar to taste.</li>
    </ol>
  );
};
```

Every time you call `<Recipe drinkers={2} />`, you get the same JSX output.

### Impure Components (Avoid These)

```tsx
// ❌ IMPURE: Modifies external variable
let guestCount = 0;

const Cup = () => {
  guestCount = guestCount + 1; // Side effect during render!
  return <h2>Tea cup for guest #{guestCount}</h2>;
};

// This will produce inconsistent results
```

**Why is this bad?** Calling the component multiple times produces different outputs, breaking React's assumptions.

### The Pure Alternative

```tsx
// ✅ PURE: Use props instead
interface CupProps {
  guest: number;
}

const Cup = ({ guest }: CupProps) => {
  return <h2>Tea cup for guest #{guest}</h2>;
};

const TeaSet = () => {
  return (
    <>
      <Cup guest={1} />
      <Cup guest={2} />
      <Cup guest={3} />
    </>
  );
};
```

### Local Mutation is Safe

It's OK to change variables you created **during the same render**:

```tsx
const TeaGathering = () => {
  const cups: JSX.Element[] = []; // Created locally

  for (let i = 1; i <= 12; i++) {
    cups.push(<Cup key={i} guest={i} />); // Safe to mutate
  }

  return <>{cups}</>;
};
```

This is called "local mutation" - it's your component's "little secret" because nothing outside the component can observe it.

### Where Side Effects Belong

**Event Handlers**: Side effects belong in functions that respond to user actions:

```tsx
import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    setCount(count + 1); // ✅ Side effect in event handler
    console.log('Clicked!'); // ✅ Side effects OK here
  };

  return <button onClick={handleClick}>Count: {count}</button>;
};
```

**useEffect Hook**: For side effects that can't happen during rendering:

```tsx
import { useEffect, useState } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Side effect runs after render
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []); // Empty array = run once on mount

  return <div>{data ?? 'Loading...'}</div>;
};
```

### Why Purity Matters

- **Performance**: React can skip re-rendering pure components safely
- **Server-Side Rendering**: Same component can serve many requests
- **Debugging**: Predictable behavior makes bugs easier to find
- **React Features**: Features like `memo()` rely on purity

### Detecting Impurity with Strict Mode

React's Strict Mode calls components twice in development to expose impure code:

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Pure components work fine when called twice. Impure components will show bugs.

### Best Practices

**✅ DO:**
- Treat props, state, and context as read-only
- Use `setState` to update state
- Put side effects in event handlers or `useEffect`
- Create new objects/arrays instead of mutating existing ones

**❌ DON'T:**
- Modify variables that existed before rendering
- Change props directly
- Mutate DOM during render
- Make network requests during render (use `useEffect` instead)

---

## 5. Your UI as a Tree

React models your UI as a tree structure. Understanding this helps you debug performance issues, optimize rendering, and reason about your app's architecture.

### The Render Tree

The render tree shows the relationship between React components during a single render.

**Example Structure:**

```
App (root component)
├── HelloWorld
├── UserList
│   ├── UserCard
│   └── UserCard
└── Footer
    └── Copyright
```

**In Code:**

```tsx
// App.tsx - Root Component
import HelloWorld from './components/HelloWorld';
import UserList from './components/UserList';
import Footer from './components/Footer';

const App = () => {
  return (
    <>
      <HelloWorld name="World" />
      <UserList users={users} />
      <Footer />
    </>
  );
};
```

```tsx
// UserList.tsx - Branch Component
import UserCard from './UserCard';

interface User {
  id: number;
  name: string;
}

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} /> {/* Child components */}
      ))}
    </div>
  );
};
```

```tsx
// UserCard.tsx - Leaf Component
interface UserCardProps {
  user: { id: number; name: string };
}

const UserCard = ({ user }: UserCardProps) => {
  return <div className="user-card">{user.name}</div>;
};
```

### Key Characteristics of Render Trees

- **Nodes are components**: Each node represents a React component (not HTML elements)
- **Dynamic**: Changes with conditional rendering
- **Shows data flow**: Props flow from parent to child (top to bottom)

**Top-level components** (near the root):
- Affect performance of all children beneath them
- Often the most complex
- Example: `App`, `Dashboard`, `Layout`

**Leaf components** (at the bottom):
- Have no children
- Often re-render frequently
- Example: `Button`, `Icon`, `Label`

### Conditional Rendering Affects the Tree

```tsx
interface DashboardProps {
  isLoggedIn: boolean;
}

const Dashboard = ({ isLoggedIn }: DashboardProps) => {
  if (!isLoggedIn) {
    return <LoginForm />; // Different tree structure
  }

  return (
    <>
      <Header />
      <Sidebar />
      <MainContent />
    </>
  );
};
```

**Render tree when `isLoggedIn = false`:**
```
Dashboard
└── LoginForm
```

**Render tree when `isLoggedIn = true`:**
```
Dashboard
├── Header
├── Sidebar
└── MainContent
```

### The Module Dependency Tree

This tree represents how your code files import each other.

**Example Structure:**

```
App.tsx (entry point)
├── HelloWorld.tsx
├── UserList.tsx
│   ├── UserCard.tsx
│   └── types.ts
└── Footer.tsx
    └── Copyright.tsx
```

**In Code:**

```tsx
// App.tsx - Root module
import HelloWorld from './components/HelloWorld'; // Dependency
import UserList from './components/UserList';     // Dependency
import Footer from './components/Footer';         // Dependency

const App = () => {
  return (
    <>
      <HelloWorld name="World" />
      <UserList users={[]} />
      <Footer />
    </>
  );
};
```

```tsx
// UserList.tsx
import UserCard from './UserCard';        // Dependency
import { User } from './types';           // Non-component dependency

const UserList = ({ users }: { users: User[] }) => {
  return (
    <>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </>
  );
};
```

### Differences Between the Trees

| Aspect | Render Tree | Module Dependency Tree |
|--------|-------------|----------------------|
| **Nodes** | React components | Modules (files) |
| **Shows** | Component relationships | Import statements |
| **Includes** | Only components | Components + utilities + data |
| **Dynamic** | Changes per render | Static |
| **Used by** | React (rendering) | Bundlers (webpack, vite) |

### Practical Applications

**Render Tree helps with:**
- Debugging which components re-render
- Understanding component hierarchy
- Identifying performance bottlenecks
- Optimizing with `React.memo()`

**Module Dependency Tree helps with:**
- Bundle size optimization
- Code splitting strategies
- Identifying circular dependencies
- Understanding import costs

### Visualizing Your App's Tree

```tsx
// Complex nested structure
const App = () => {
  return (
    <Layout>                          {/* Level 1 */}
      <Header>                        {/* Level 2 */}
        <Logo />                      {/* Level 3 */}
        <Navigation />                {/* Level 3 */}
      </Header>
      <Main>                          {/* Level 2 */}
        <Sidebar>                     {/* Level 3 */}
          <Menu />                    {/* Level 4 */}
        </Sidebar>
        <Content>                     {/* Level 3 */}
          <Article />                 {/* Level 4 */}
          <Comments>                  {/* Level 4 */}
            <Comment />               {/* Level 5 */}
            <Comment />               {/* Level 5 */}
          </Comments>
        </Content>
      </Main>
      <Footer />                      {/* Level 2 */}
    </Layout>
  );
};
```

**Mental Model**: Think of your app as a tree where:
- **Root** = Your main App component
- **Branches** = Container/layout components
- **Leaves** = Presentational components

---

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Start modifying [src/App.tsx](src/App.tsx) and [src/components/HelloWorld.tsx](src/components/HelloWorld.tsx) to experiment with these concepts!

---

## Additional Resources

- [React Official Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Summary

This tutorial covered five fundamental React concepts:

1. **Props**: Pass data between components with TypeScript interfaces
2. **Conditional Rendering**: Display different UI based on conditions using JavaScript control flow
3. **Rendering Lists**: Use `map()` and `filter()` with proper keys to display collections
4. **Component Purity**: Keep components predictable by avoiding side effects during render
5. **UI as a Tree**: Understand how React models your component hierarchy and module dependencies

Master these concepts and you'll have a solid foundation for building React applications with TypeScript.
