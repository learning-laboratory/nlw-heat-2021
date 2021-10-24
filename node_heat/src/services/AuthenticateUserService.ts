import axios from "axios";
import prismaClient from "../prisma/index";
import { sign } from "jsonwebtoken";

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    const accessTokenUrl = process.env.GITHUB_ACESS_TOKEN_URL;
    const userUrl = process.env.GITHUB_USER_URL;

    const { data: accessTokenResponse } =
      await axios.post<IAccessTokenResponse>(accessTokenUrl, null, {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      });

    const response = await axios.get<IUserResponse>(userUrl, {
      headers: {
        authorization: `Bearer ${accessTokenResponse.access_token}`,
      },
    });

    const { id, login, avatar_url, name } = response.data;
    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login: login,
          avatar_url: avatar_url,
          name: name,
        },
      });
    }

    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.JSON_WEB_TOKEN_SECRET,
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );
    return { token, user };
    
  }
}

export { AuthenticateUserService };
