export type LoginResp = { access: string; refresh: string };
export type MeResp = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};
