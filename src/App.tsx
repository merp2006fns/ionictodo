import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import { useAuth } from './auth';

const PrivateRoute: React.FC<{ component: React.FC; path: string; exact?: boolean }> = ({
  component: Component,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={() =>
        user ? <Component /> : <Redirect to="/login" />
      }
    />
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>

          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <PrivateRoute exact path="/todos" component={Todos} />

          <Route exact path="/">
            <Redirect to="/todos" />
          </Route>

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
