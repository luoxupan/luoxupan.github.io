export const initialState = {
  city: [
    { name: 'bj' },
    { name: 'hz' },
  ],
} as any;

export function reducer(state: any, action: any) {
  switch (action.type) {
    case 'CITY':
      return { ...state, city: action.data };
    default:
      return state;
      // throw new Error();
  }
}
