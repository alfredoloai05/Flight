export type LoginResp = { access: string; refresh: string };
export type MeResp = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
};
