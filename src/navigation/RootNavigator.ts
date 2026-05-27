export type AuthStackParams = {
  Splash: undefined;
  Language: undefined;
  RoleSelect: undefined;
  PhoneEntry: undefined;
  OTPVerify: { phone: string; role?: string } | undefined;
  FarmerRegister: { phone: string } | undefined;
};
