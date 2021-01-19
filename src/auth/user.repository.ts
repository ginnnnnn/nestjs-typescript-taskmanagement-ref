import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    const user = new User();
    const salt = await bcrypt.genSalt();
    user.salt = salt;
    user.username = username;
    user.password = await this.hashPassword(password, salt);
    try {
      await user.save();
    } catch (err) {
      if (err.code == '23505') {
        //dupilcate username
        throw new ConflictException('Username already exist');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const found = await this.findOne({ username });
    if (found && (await found.validatePassword(password))) {
      return username;
    } else {
      return null;
    }
  }
}
