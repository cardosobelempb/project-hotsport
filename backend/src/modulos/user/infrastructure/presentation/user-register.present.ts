import { Either } from "@/core";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserAlreadyExistsError } from "../../domain/errors/UserAlreadyExistsError";

export type UserRegisterPresenter = Either<
  UserAlreadyExistsError,
  {
    user: UserEntity;
  }
>;
