import React, { useEffect, useState } from "react";
import { pb } from "../pocketbase";
import { useAuth } from "../auth";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonToast,
  IonButtons,
} from "@ionic/react";
import TodoItem from "../components/TodoItem";

const Todos: React.FC = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const fetchTodos = async () => {
    try {
      const res = await pb
        .collection("todos")
        .getList(1, 50, { filter: `owner = "${pb.authStore.record?.id}"` });
      setTodos(res.items);
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: String(err.message || JSON.stringify(err)) });
    }
  };

  useEffect(() => {
    fetchTodos();

    let unsubscribe: any;

    const subscribe = async () => {
      unsubscribe = await pb.collection("todos").subscribe("*", (e) => {
        fetchTodos();
      });
    };

    subscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await pb
        .collection("todos")
        .create({ title, completed: false, owner: pb.authStore.model?.id });
      setTitle("");
      fetchTodos();
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: String(err.message || JSON.stringify(err)) });
    }
  };

  const handleToggle = async (todo: any) => {
    try {
      await pb
        .collection("todos")
        .update(todo.id, { completed: !todo.completed });
      fetchTodos();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection("todos").delete(id);
      fetchTodos();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Todos</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                logout();
              }}
            >
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ marginBottom: 16 }}>
          <IonInput
            placeholder="New todo"
            value={title}
            onIonChange={(e: any) => setTitle(e.target.value)}
          />
          <IonButton
            expand="block"
            onClick={handleCreate}
            style={{ marginTop: 8 }}
          >
            Add
          </IonButton>
        </div>

        <IonList>
          {todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </IonList>

        <IonToast
          isOpen={toast.show}
          message={toast.msg}
          duration={3000}
          onDidDismiss={() => setToast({ show: false, msg: "" })}
        />
      </IonContent>
    </IonPage>
  );
};

export default Todos;
