export type LoginPayload = {
  username: string;
  password: string;
};

export interface LoginResponseType {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetData: number; 
}

export interface LoginData {
  profile: Profile;
  token: string;
}

export interface Profile {
  id: string; 
  login_name: string; 
  user_code?: string | null; 
  phone?: string | null;
  password: string;
  fname?: string | null; 
  reg_number?: string | null; 
  email?: string | null; 
  lastname?: string | null; 
  firstname?: string | null; 
  school_id?: number | null; 
  school_name?: string | null;
  img?: string | null; 
  expired_date?: string | null; 
  expired?: number | null; 
  ugroup?: number | null; 
  personId?: string | null; 
  ebarimtNum?: string | null;
}
