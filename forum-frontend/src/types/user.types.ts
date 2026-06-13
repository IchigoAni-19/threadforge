/**
 * User profile returned by GET /api/users/me.
 * Backend returns Mongoose document shape with `_id`.
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  credits: number;
}

/** Full response data from GET /api/users/me */
export interface MeResponseData {
  profile: UserProfile;
  credits: number;
}
