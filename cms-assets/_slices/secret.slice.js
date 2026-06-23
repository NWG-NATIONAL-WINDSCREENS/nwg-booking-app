import { createSlice } from '@reduxjs/toolkit';

const name = 'secret';
const initialState = createInitialState();

const slice = createSlice({
  name,
  initialState,
  reducers: createReducers,
});

function createInitialState() {
  return {
    token: null,
    secrets: {
      client_id: null,
      client_secret: null,
      grant_type: null,
      google_maps_api_key: null,
      signing_secret: null,
    },
  };
}

function createReducers() {
  return {
    setSecrets(state, action) {
      state.secrets = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
  };
}

// function createExtraReducers() {
//   return (builder) => {
//     builder.addMatcher(
//       sessionAPI.endpoints.createSession.matchPending,
//       () => {},
//     );
//     builder.addMatcher(
//       sessionAPI.endpoints.createSession.matchFulfilled,
//       (state, action) => {
//         console.log('Token set', action.payload);
//         const token = action.payload?.token;
//         if (token) {
//           state.token = token;
//         }
//       },
//     );
//     builder.addMatcher(
//       sessionAPI.endpoints.createSession.matchRejected,
//       () => {},
//     );
//   };
// }

export const secretReducer = slice.reducer;
export const { setSecrets, setToken, clearToken } = slice.actions;
