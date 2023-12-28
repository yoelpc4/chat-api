import { Expose } from 'class-transformer'

export default class LoginDto {
  @Expose()
  username!: string

  @Expose()
  password!: string
}
