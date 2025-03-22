import User, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const defaultUserImage = "/public/users/user_default.png";

interface TokenPayload extends JwtPayload {
  _id: string;
  random: string;
}

// Generate tokens (Access & Refresh)
function generateTokens(user: IUser) {
  const random = Math.floor(Math.random() * 1000000);

  const accessToken = jwt.sign(
    { _id: user._id, random },
    process.env.TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    }
  );

  if (!process.env.TOKEN_SECRET) throw new Error("TOKEN_SECRET is not defined");
  const refreshToken = jwt.sign(
    { _id: user._id, random },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );

  return { accessToken, refreshToken };
}

// Verify token function
export const verifyToken = async (
  token: string,
  tokenSecret: string
): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, tokenSecret, (err, payload) => {
      if (err) {
        reject(err);
      }
      resolve(payload as TokenPayload);
    });
  });
};

// Validate refresh token
const validateRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET is not defined");
  }
  const payload = await verifyToken(refreshToken, process.env.TOKEN_SECRET);
  const user = await User.findById(payload._id);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
    user.refreshToken = [];
    await user.save();
    throw new Error("Invalid refresh token");
  }
  return user;
};

// Register user
const register = async ({
  name,
  email,
  password,
  profileImage,
  ...rest
}: {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  city?: string;
  gender?: "Male" | "Female" | "Other";
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    profileImage: profileImage || defaultUserImage,
    ...rest,
  });

  const tokens = generateTokens(user);

  // Save refreshToken to DB
  user.refreshToken = [tokens.refreshToken];
  await user.save();

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

// Google Signin
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignin = async (credential: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google Token");
  }

  let user = await User.findOne({ email: payload.email });
  let firstTimeLogin = false;

  if (!user) {
    user = await User.create({
      name: payload.name || "Google User",
      email: payload.email,
      password: "google-signin",
      profileImage: payload.picture || defaultUserImage,
      refreshToken: [],
      isGoogleUser: true,
    });
    firstTimeLogin = true;
  }

  const tokens = await generateTokens(user);

  // Clear old tokens & save only new one
  user.refreshToken = [tokens.refreshToken];
  await user.save();

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    firstTimeLogin,
  };
};

// Login user
const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await User.findOne({ email: email });
  if (!user) throw new Error("Incorrect email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect email or password");

  const tokens = await generateTokens(user);

  // Clear old tokens & save only new one
  user.refreshToken = [tokens.refreshToken];
  await user.save();

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

// Logout user
const logout = async (refreshToken: string) => {
  const user = await validateRefreshToken(refreshToken);
  user.refreshToken = (user.refreshToken || []).filter(
    (token) => token !== refreshToken
  );
  await user.save();
};

// Refresh token
const refresh = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("Refresh token is required");

  const user = await validateRefreshToken(refreshToken);

  // Remove old refresh token
  user.refreshToken = (user.refreshToken || []).filter(
    (token) => token !== refreshToken
  );

  const tokens = await generateTokens(user);

  // Save new refresh token
  user.refreshToken.push(tokens.refreshToken);
  await user.save();

  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};

export default { register, login, logout, refresh, googleSignin };
