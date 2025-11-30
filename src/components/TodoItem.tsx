import React from "react";
import { IonItem, IonLabel, IonCheckbox, IonButton } from "@ionic/react";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: any;
  onToggle: (t: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <IonItem>
      <IonCheckbox
        slot="start"
        checked={todo.completed}
        onIonChange={() => onToggle(todo)}
      />
      <IonLabel>{todo.title}</IonLabel>
      <IonButton slot="end" color="danger" onClick={() => onDelete(todo.id)}>
        Delete
      </IonButton>
    </IonItem>
  );
}
