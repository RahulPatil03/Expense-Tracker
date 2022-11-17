import { createContext, useContext, useReducer } from "react";

const MyContext = createContext(null);

const initialState = {
    user: null
};

function myReducer(state, action) {
    switch (action.type) {
        case 'login': {
            return { ...state, user: action.user };
        }
        case 'logout': {
            return { ...state, user: null };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export function MyContextProvider({ children }) {
    const reducer = useReducer(myReducer, initialState);

    return (
        <MyContext.Provider value={reducer}>
            {children}
        </MyContext.Provider>
    );
}

export function useMyContext() {
    return useContext(MyContext);
}