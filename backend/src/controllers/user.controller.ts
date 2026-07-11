import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import { Types } from 'mongoose';
import { IAddress } from '../models/user.model.js';

// GET /api/v1/users/profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    const { name, phone, avatar, preferences } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/addresses
export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users/addresses
export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    // Business soft limit: Max 5 saved addresses
    if (user.addresses.length >= 5) {
      return next(
        new AppError('Maximum limit of 5 saved addresses reached', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const addressData: Partial<IAddress> = {
      _id: new Types.ObjectId(),
      ...req.body,
    };

    user.addresses.push(addressData as IAddress);
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/users/addresses/:id
export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    const { id } = req.params;
    const address = user.addresses.find((addr) => addr._id.toString() === id);

    if (!address) {
      return next(new AppError('Address not found', HTTP_STATUS.NOT_FOUND));
    }

    // Update keys
    Object.assign(address, req.body);

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/addresses/:id
export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('No authenticated user found', HTTP_STATUS.UNAUTHORIZED));
    }

    const { id } = req.params;
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === id);

    if (addressIndex === -1) {
      return next(new AppError('Address not found', HTTP_STATUS.NOT_FOUND));
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};
