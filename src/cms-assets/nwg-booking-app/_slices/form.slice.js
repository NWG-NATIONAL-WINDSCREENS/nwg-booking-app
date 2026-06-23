import { createSlice } from '@reduxjs/toolkit';

const name = 'form';
const initialState = createInitialState();
const extraReducers = createExtraReducers();

const slice = createSlice({
  name,
  initialState,
  reducers: createReducers,
  extraReducers: () => {
    extraReducers();
  },
});

function createInitialState() {
  return {
    steps: [
      {
        id: 3,
        name: 'Let’s assess your damage',
        status: 'current',
      },
      { id: 4, name: 'How would you like to pay', status: 'upcoming' },
      { id: 5, name: 'Schedule your appointment', status: 'upcoming' },
      { id: 6, name: 'Your Details', status: 'upcoming' },
      { id: 7, name: 'Booking Confirmed', status: 'upcoming' },
    ],

    current_step: 0,
    // steps: [
    //   {
    //     id: 3,
    //     name: 'Step 1 - Contact & Damage Assessment',
    //     status: 'complete',
    //   },
    //   {
    //     id: 4,
    //     name: 'Step 2 - How would you like to pay',
    //     status: 'complete',
    //   },
    //   {
    //     id: 5,
    //     name: 'Step 3 - Schedule your appointment',
    //     status: 'current',
    //   },
    //   { id: 6, name: 'Step 4 - Your Details', status: 'upcoming' },
    //   { id: 7, name: 'Step 5 - Quote Confirmation', status: 'upcoming' },
    // ],
    //
    // current_step: 5,
  };
}

function createReducers() {
  return {
    incrementFormCurrentStep: (state) => {
      window.parent.postMessage({ type: 'scrollTop' }, '*');

      const newStep = state.current_step + 1;
      state.current_step = newStep;

      state.steps = state.steps.map((step) => ({
        ...step,
        status:
          step.id < newStep
            ? 'complete'
            : step.id === newStep
              ? newStep === 7
                ? 'complete'
                : 'current'
              : 'upcoming',
      }));
    },
    setFormCurrentStep: (state, action) => {
      window.parent.postMessage({ type: 'scrollTop' }, '*');

      const newStep = action.payload;
      state.steps = state.steps.map((step) => ({
        ...step,
        status:
          step.id < newStep
            ? 'complete'
            : step.id === newStep
              ? newStep === 7
                ? 'complete'
                : 'current'
              : 'upcoming',
      }));

      state.current_step = newStep;
    },
  };
}

function createExtraReducers() {
  return () => {
    // Define extra reducers when needed
  };
}

export const formReducer = slice.reducer;
export const { incrementFormCurrentStep, setFormCurrentStep, updateForm } =
  slice.actions;
