# Ionic React + PocketBase — Todos CRUD with Auth

This project contains a minimal Ionic React app that uses PocketBase for authentication (register / login) and a simple Todos CRUD. Below are the key files to copy into a new Ionic React project.

---

## Project structure (suggested)

```
ionic-pb-todos/
├─ package.json
├─ public/
├─ src/
│  ├─ index.tsx
│  ├─ App.tsx
│  ├─ pocketbase.ts
│  ├─ auth.tsx
│  ├─ pages/
│  │  ├─ Login.tsx
│  │  ├─ Register.tsx
│  │  └─ Todos.tsx
│  └─ components/
│     └─ TodoItem.tsx
└─ README.md
```

---

## package.json (minimal)

```json
{
  "name": "ionic-pb-todos",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@ionic/react": "^7.0.0",
    "@ionic/react-router": "^7.0.0",
    "pocketbase": "^0.9.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router": "6.14.1",
    "react-router-dom": "6.14.1"
  },
  "scripts": {
    "start": "ionic serve",
    "build": "ionic build"
  }
}
```

---

## src/pocketbase.ts

```ts
import PocketBase from 'pocketbase';

// CHANGE: replace with your PocketBase URL (including port)
// Example: http://192.168.1.42:8090
export const POCKETBASE_URL = process.env.REACT_APP_PB_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// automatically persist authStore across reloads (optional)
pb.autoCancellation(false);
```

---

## src/auth.tsx (Auth Context)

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from './pocketbase';

type User = any;

const AuthContext = createContext({
  user: null as User | null,
  setUser: (u: User | null) => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(pb.authStore.model ?? null);

  useEffect(() => {
    // subscribe to auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model ?? null);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      pb.authStore.clear();
      setUser(null);
    } catch (err) {
      console.error('logout error', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## src/index.tsx

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { IonApp, setupIonicReact } from '@ionic/react';
import { AuthProvider } from './auth';
import App from './App';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <IonApp>
      <AuthProvider>
        <App />
      </AuthProvider>
    </IonApp>
  </React.StrictMode>
);
```

---

## src/App.tsx

```tsx
import React from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import { useAuth } from './auth';

const PrivateRoute: React.FC<{children: JSX.Element}> = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <IonReactRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<PrivateRoute><Todos /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/todos" replace />} />
      </Routes>
    </IonReactRouter>
  );
};

export default App;
```

---

## src/pages/Register.tsx

```tsx
import React, { useState } from 'react';
import { pb } from '../pocketbase';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonList, IonToast } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [toast, setToast] = useState<{show: boolean; msg: string}>({show:false,msg:''});
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password, name });
      // sign in immediately
      await pb.collection('users').authWithPassword(email, password);
      navigate('/todos');
    } catch (err: any) {
      console.error(err);
      setToast({show:true,msg: err.message || JSON.stringify(err)});
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(String(e.detail.value))} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput value={email} onIonChange={e => setEmail(String(e.detail.value))} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput type="password" value={password} onIonChange={e => setPassword(String(e.detail.value))} />
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={handleRegister}>Create account</IonButton>
        <IonButton fill="clear" onClick={() => navigate('/login')}>Already have an account? Login</IonButton>
        <IonToast isOpen={toast.show} message={toast.msg} duration={3000} onDidDismiss={() => setToast({show:false,msg:''})} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
```

---

## src/pages/Login.tsx

```tsx
import React, { useState } from 'react';
import { pb } from '../pocketbase';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonList, IonToast } from '@ionic/react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{show: boolean; msg: string}>({show:false,msg:''});
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await pb.collection('users').authWithPassword(email, password);
      navigate('/todos');
    } catch (err: any) {
      console.error(err);
      setToast({show:true,msg: err.message || JSON.stringify(err)});
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput value={email} onIonChange={e => setEmail(String(e.detail.value))} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput type="password" value={password} onIonChange={e => setPassword(String(e.detail.value))} />
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={handleLogin}>Login</IonButton>
        <IonButton fill="clear" onClick={() => navigate('/register')}>Create account</IonButton>
        <IonToast isOpen={toast.show} message={toast.msg} duration={3000} onDidDismiss={() => setToast({show:false,msg:''})} />
      </IonContent>
    </IonPage>
  );
};

export default Login;
```

---

## src/components/TodoItem.tsx

```tsx
import React from 'react';
import { IonItem, IonLabel, IonCheckbox, IonButton } from '@ionic/react';

export default function TodoItem({todo, onToggle, onDelete}:{todo:any,onToggle:(t:any)=>void,onDelete:(id:string)=>void}){
  return (
    <IonItem>
      <IonCheckbox slot="start" checked={todo.completed} onIonChange={() => onToggle(todo)} />
      <IonLabel>{todo.title}</IonLabel>
      <IonButton slot="end" color="danger" onClick={() => onDelete(todo.id)}>Delete</IonButton>
    </IonItem>
  );
}
```

---

## src/pages/Todos.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { pb } from '../pocketbase';
import { useAuth } from '../auth';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput, IonButton, IonLabel, IonToast, IonButtons } from '@ionic/react';
import TodoItem from '../components/TodoItem';

const Todos: React.FC = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [toast, setToast] = useState<{show:boolean; msg:string}>({show:false,msg:''});

  const fetchTodos = async () => {
    try {
      const res = await pb.collection('todos').getList(1, 50, { filter: `owner = "${pb.authStore.model?.id}"` });
      setTodos(res.items);
    } catch (err:any) {
      console.error(err);
      setToast({show:true,msg:String(err.message || JSON.stringify(err))});
    }
  };

  useEffect(() => {
    fetchTodos();

    // optional: realtime subscription
    const unsubscribe = pb.collection('todos').subscribe('*', (e) => {
      // simple: refetch on any change
      fetchTodos();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await pb.collection('todos').create({ title, completed: false, owner: pb.authStore.model?.id });
      setTitle('');
      fetchTodos();
    } catch (err:any) {
      console.error(err);
      setToast({show:true,msg:String(err.message || JSON.stringify(err))});
    }
  };

  const handleToggle = async (todo:any) => {
    try {
      await pb.collection('todos').update(todo.id, { completed: !todo.completed });
      fetchTodos();
    } catch (err:any) {
      console.error(err);
    }
  };

  const handleDelete = async (id:string) => {
    try {
      await pb.collection('todos').delete(id);
      fetchTodos();
    } catch (err:any) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Todos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => { logout(); }}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{marginBottom:16}}>
          <IonInput placeholder="New todo" value={title} onIonChange={(e:any)=>setTitle(e.target.value)} />
          <IonButton expand="block" onClick={handleCreate} style={{marginTop:8}}>Add</IonButton>
        </div>

        <IonList>
          {todos.map(t => (
            <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </IonList>

        <IonToast isOpen={toast.show} message={toast.msg} duration={3000} onDidDismiss={() => setToast({show:false,msg:''})} />
      </IonContent>
    </IonPage>
  );
};

export default Todos;
```

---

## PocketBase setup (server side)

1. Download PocketBase from https://pocketbase.io (choose your OS). Unzip and run.

2. Start the server so it is accessible from other devices on your local network:

```bash
# run on the machine where pocketbase binary is located
./pocketbase serve --http 0.0.0.0:8090
```

`0.0.0.0` makes it listen on all interfaces. To access from phone or other PC, use your host machine IP, e.g. `http://192.168.1.42:8090`.

3. In the PocketBase admin UI (open `http://localhost:8090/_/` on the host machine or `http://<HOST_IP>:8090/_/` from another device while the server is running), create a `todos` collection with fields:

- `title` (text, required)
- `completed` (bool, default false)
- `owner` (text) — store user's ID (or use the built-in `owner` relation via PocketBase record owners)

Make sure the `users` collection (built-in) allows signup — or create manual users.

4. Set CORS if needed in pocketbase config or run locally for development. PocketBase dev server allows cross-origin from local `ionic serve`.

---

## Env vars

Use `REACT_APP_PB_URL` to change the PocketBase URL in development.

Example (mac/linux):

```bash
REACT_APP_PB_URL=http://192.168.1.42:8090 npm start
```

---

## Notes & improvements

- This example is minimal and focuses on clarity. For production:
  - Secure routes & validation.
  - Use ownership rules in PocketBase (record owners) and server-side permissions.
  - Store only owner id and use PocketBase's record-level permissions.
  - Improve error handling and UI polish.

---

## License

MIT
