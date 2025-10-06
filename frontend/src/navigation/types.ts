export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Signup: undefined;
    EmailVerification: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
};

export type MainTabParamList = {
    Feed: undefined;
    Profile: undefined;
    Upload: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
  };