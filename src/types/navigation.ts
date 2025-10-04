export type UserStackParamList = {
  index: undefined;
  'drink/[id]': { id: string };
  cart: undefined;
  checkout: undefined;
};

export type AdminStackParamList = {
  login: undefined;
  index: undefined;
};

export type RootStackParamList = {
  index: undefined;
  '(user)': undefined;
  '(admin)': undefined;
  '+not-found': undefined;
};
