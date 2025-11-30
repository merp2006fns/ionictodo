import React, { useState } from "react";
import { pb } from "../pocketbase";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonToast,
} from "@ionic/react";

import { useIonRouter } from "@ionic/react";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const router = useIonRouter();

  const handleRegister = async () => {
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
      });

      await pb.collection("users").authWithPassword(email, password);

      router.push("/todos", "forward");
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: err.message || JSON.stringify(err) });
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
            <IonInput
              value={name}
              onIonChange={(e) => setName(String(e.detail.value))}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              value={email}
              onIonChange={(e) => setEmail(String(e.detail.value))}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(String(e.detail.value))}
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={handleRegister}>
          Create account
        </IonButton>

        <IonButton fill="clear" onClick={() => router.push("/login", "back")}>
          Already have an account? Login
        </IonButton>

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

export default Register;
