import { createContext, useContext } from 'react';

export const UserContext = createContext({
  userData: null,
    setUserData: () => {} 
});

export const useUserContext = () => useContext(UserContext);
