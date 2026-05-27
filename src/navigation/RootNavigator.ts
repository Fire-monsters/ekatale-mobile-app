export type AuthStackParams = {
  Splash: undefined;
  Language: undefined;
  RoleSelect: undefined;
  PhoneEntry: undefined;
  OTPVerify: { phone: string; countryCode: string; role?: string };
  FarmerRegister: { phone: string } | undefined;
};

export type FarmerStackParams = {
  Dashboard: undefined;
  FarmerDashboard: undefined;
  ListProduce: undefined;
  ListProducePhotos: { listingDraftId: string };
  MyListings: undefined;
  ListingDetail: { listingId: string };
  PriceCheck: undefined;
  PaymentHistory: undefined;
  TransportTracker: { jobId?: string } | undefined;
  AIAdvisor: undefined;
  Notifications: undefined;
  FarmerProfile: undefined;
};
