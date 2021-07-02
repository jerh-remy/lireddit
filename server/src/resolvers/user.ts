import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
@InputType()
class UsernamePasswordInputFields {
  @Field()
  username!: string;
  @Field()
  password!: string;
}

@ObjectType()
class FieldError {
  @Field()
  field!: string;
  @Field()
  message!: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInputFields,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length of username must be greater than 2",
          },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "Length of password must be greater than 3",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    console.log({ hashedPassword });
    const user = em.create(User, {
      username: options.username.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      console.log(error.message);
      // duplicate username error
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "This username has already been taken",
            },
          ],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInputFields,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username.toLowerCase(),
    });

    if (!user) {
      return {
        errors: [{ field: "username", message: "Username does not exist." }],
      };
    }
    const validPassword = await argon2.verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [{ field: "password", message: "Incorrect password." }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
