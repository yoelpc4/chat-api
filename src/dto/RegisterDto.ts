import { Expose } from 'class-transformer'

export default class RegisterDto {
  @Expose()
  username!: string

  @Expose()
  password!: string

  @Expose()
  passwordConfirmation!: string
}
