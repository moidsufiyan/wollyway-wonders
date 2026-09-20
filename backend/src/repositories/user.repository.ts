import { User, IUser } from '../models/user.model.js';
import { FilterQuery, SortOrder, Types } from 'mongoose';

export class UserRepository {
  /**
   * Retrieves a paginated list of customers (role: 'user').
   */
  async findAdminCustomers(
    filter: FilterQuery<IUser>,
    skip: number,
    limit: number,
    sort: Record<string, SortOrder>
  ): Promise<IUser[]> {
    return User.find({ ...filter, role: 'customer' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password -__v -resetPasswordToken -resetPasswordExpire')
      .lean<IUser[]>()
      .exec();
  }

  /**
   * Counts total customers matching a filter.
   */
  async countAdminCustomers(filter: FilterQuery<IUser>): Promise<number> {
    return User.countDocuments({ ...filter, role: 'customer' });
  }

  /**
   * Retrieves a single customer by ID.
   */
  async findAdminCustomerById(id: Types.ObjectId | string): Promise<IUser | null> {
    return User.findOne({ _id: id, role: 'customer' })
      .select('-password -__v -resetPasswordToken -resetPasswordExpire')
      .lean<IUser>()
      .exec();
  }

  /**
   * Deactivates a user and scrubs their PII atomically.
   */
  async deactivateUser(id: Types.ObjectId | string): Promise<IUser | null> {
    return User.findOneAndUpdate(
      { _id: id, role: 'customer' },
      {
        $set: {
          status: 'deactivated',
          name: 'Deactivated User',
          email: `deactivated_${id.toString()}@wollyway.com`,
          phone: null,
          addresses: [],
          cart: [],
          wishlist: [],
        },
      },
      { new: true }
    )
      .select('-password -__v -resetPasswordToken -resetPasswordExpire')
      .lean<IUser>()
      .exec();
  }

  /**
   * Updates a user's status atomically (active/suspended).
   */
  async updateStatus(
    id: Types.ObjectId | string,
    status: 'active' | 'suspended'
  ): Promise<IUser | null> {
    return User.findOneAndUpdate({ _id: id, role: 'customer' }, { $set: { status } }, { new: true })
      .select('-password -__v -resetPasswordToken -resetPasswordExpire')
      .lean<IUser>()
      .exec();
  }
}

export const userRepository = new UserRepository();
