import { RequestHandler } from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import { UserModel } from "../../model/user.model";
import { userRegisterSchema } from "../../utils/validation";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const validatedUserDetails = await userRegisterSchema.validateAsync(
      req.body
    );

    const ifUserExist = await UserModel.findOne({
      email: validatedUserDetails.email,
    });

    if (ifUserExist) throw new createError.Conflict("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      validatedUserDetails.password,
      salt
    );

    validatedUserDetails.password = hashedPassword;

    const newUser = new UserModel(validatedUserDetails);
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};