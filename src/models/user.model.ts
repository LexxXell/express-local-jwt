import { Model, model, Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUser {
  username: string;
  password: string;
  refresh_token: string;
}

export interface IUserModel extends Model<IUser> {
  isValidPassword(password: string): Promise<boolean>;
  isValidRefreshToken(refresh_token: string): Promise<boolean>;
}

export const UserSchema = new Schema<IUser, IUserModel>({
  username: { type: 'string', required: true, unique: true },
  password: { type: 'string', required: true },
  refresh_token: { type: 'string', required: true },
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('refresh_token')) {
    this.refresh_token = await bcrypt.hash(this.refresh_token, 10);
  }
  next();
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.isValidRefreshToken = async function (refresh_token: string) {
  return await bcrypt.compare(refresh_token, this.refresh_token);
};

export const UserModel = model<IUser & IUserModel>('User', UserSchema);
