export const initialState = {
  city: [
    { name: 'bj' },
    { name: 'hz' },
  ],
} as any;

export function reducer(state: any, action: any) {
  switch (action.type) {
    case 'update':
      return { ...state, ...action.data };
    default:
      return state;
      // throw new Error();
  }
}
