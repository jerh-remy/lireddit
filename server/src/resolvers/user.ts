import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class UsernamePasswordInputFields {
  @Field()
  username!: string;
  @Field()
  password!: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  posts(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(() => String)
  register(
    @Arg("options") options: UsernamePasswordInputFields,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const user = em.create(User, {
      username: options.username,
      password: options.password,
    });
    return true;
  }
}
